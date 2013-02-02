import email
import logging
import string
from google.appengine.ext import webapp
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler
from google.appengine.ext.webapp.util import run_wsgi_app
from lib import consts, contact
from lib.business import Business
from lib.data import EmailMessageResponder, JunkMail, CoUser
import logging
__author__ = 'alex'

class EmailHandler(InboundMailHandler):
    def receive(self, message):

        ## If this fails, I honestly don't know how this function got called
        ### Keep in mind that it just takes the first address, and is an angry son of a gun
        actual_sender = email.utils.parseaddr(message.sender)[1]
        actual_address = email.utils.getaddresses(message.original.get_all("to", []))[0][1]

        logging.error(actual_address)
        bodies = message.bodies("text/plain")
        (body, payload) = list(bodies)[0]
        payload = payload.payload

        lines = string.split(payload, "\n")

        concat = []
        flag = False
        for line in lines:
            if not flag and string.find(line, consts.REPLY_ABOVE_THIS_LINE) == -1:
                concat.append(line)
            else:
                flag = True
                # fuck it, we will loop through EVERYTHING

        # Get rid of everything going back, including the first line with content that is before the reply above
        back = -1
        while string.strip(concat[back]) == "":
            back -= 1
        back -= 1
        concat = concat[0:back]
        final_message = "\n".join(concat)

        # I swear to god, if there is more than one of these
        director = EmailMessageResponder.gql("WHERE response_address = :1 AND sent_to = :2", actual_address, actual_sender).get()
        if not director:
            # I assume this will be useful for debugging
            junk = JunkMail(
                message=final_message,
                by=actual_sender,
                to=actual_address
            )
            junk.put()
            return
        if director.receiving_user:
            # This is a response to the biz

            authd_to_send = CoUser.get(director.receiving_user)
            target = None

        else:
            authd_to_send = Business.get(director.business_id).owner
            target = director.sending_user.user_id()

        # Spin it all around
        contact.send_message_code(
            authd_to_send,
            director.business_id,
            final_message,
            target
        )

        # WOOOOOOOOOOO

application = webapp.WSGIApplication([EmailHandler.mapping()], debug=True)

run_wsgi_app(application)