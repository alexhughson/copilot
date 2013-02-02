

from copilot_dev.lib import util, business, send_emails
from copilot_dev.lib.api_handler import ApiHandler, webmethod
from copilot_dev.lib.auth import auth, auth_or_session
from app.data import InteractionRecord, Booking, Solicitation, CoUser
from copilot_dev.lib.util import gql_to_raw, js_time, model_to_dict

__author__ = 'alex'

class ContactApi(ApiHandler):

    @webmethod
    @auth()
    def get_clients(self, user, business_id):
        # This is the fun one
        # Going to need some caching
        user_id = user.user_id()
        if not user or not business.user_owns_business(user.user_id(), business_id):
            return {"error": "not allowed"}
        the_real_deal = InteractionRecord.gql("WHERE business_id = :1", business_id)
        ret = []
        # This is so that all of the user's data comes through
        for i in the_real_deal:
            ret.append(model_to_dict(i.user))

        return ret

    @webmethod
    @auth_or_session
    def send(self, user, business_id, message, user_id=None):
        """ Used by users to send queries to businesses
        """
        return send_message_code(user, business_id, message, user_id)




    @webmethod
    @auth()
    def respond(self, user, business_id, user_to, message):
        """ Used by businesses to respond to user queries
        """
        if not business.user_owns_business(user.user_id(), business_id):
            return {"error": "NOT ALLOWED DOG"}
        interaction = InteractionRecord.get(business_id, user_to)
        if not interaction:
            return {"error": "You cannot contact that user"}
        senderoo = Solicitation(
            interaction = interaction,
            from_contractor=True,
            when = js_time(),
            message = message
        )
        senderoo.put()
        # TODO: tell everyone again
        return model_to_dict(senderoo)


    ## I do not think this is used
    @webmethod
    @auth()
    def get_client_messages(self, user, business_id, client_id):
        if not user or not business.user_owns_business(user.user_id(), business_id):
            return {"error": "permissions"}
        interaction = InteractionRecord.gql("WHERE business_id = :1 AND user = :2", business_id, Key(client_id)).get()

        if not interaction:
            return []

        messages = Solicitation.gql("WHERE interaction = :1 ORDER BY when", interaction)
        return gql_to_raw(messages)

    @webmethod
    @auth_or_session
    def get_messages(self, user, business_id, user_id = None):
        if user_id:
            if not business.user_owns_business(user.user_id(), business_id):
                return {"error": "You do not own that business"}
            user = CoUser.get(user_id)
            if not user:
                return {"error": "What are you doing?"}

        interaction = InteractionRecord.gql("WHERE business_id = :1 AND user = :2", business_id, user).get()
        if not interaction:
            return []
        messages = Solicitation.gql("WHERE interaction = :1 ORDER BY when", interaction)
        return gql_to_raw(messages)




def send_message_code(user, business_id, message, user_id):
    recv_user = None
    if user_id:
        if not business.user_owns_business(user.user_id(), business_id):
            return {"error": "You don't own that business"}
        recv_user = CoUser.get(user_id)
        if not recv_user:
            return {"error": "no such user"}
        interaction = InteractionRecord.gql("WHERE business_id = :1 AND user = :2", business_id, recv_user).get()
        if not interaction:
            return {"error": "no reason to talk to that person"}
        contractor = True
    else:
        interaction = InteractionRecord.guaranteed_get(business_id, user)
        contractor = False
    senderoo = Solicitation(
        interaction = interaction,
        from_contractor = contractor,
        when = js_time(),
        message = message
    )

    senderoo.put()

    send_emails.message_recieved(user, business_id,recv_user, message)

    return model_to_dict(senderoo)