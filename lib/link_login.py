"""

from google.appengine.ext import webapp
from lib import gaesessions
from lib.data import EmailVerification
from templates.template import render

__author__ = 'alex'

class LinkLogin(webapp.RequestHandler):

    Pages to handle creating sessions and verifying accounts based on links in emails


    def get(self, method):

        methods = {
            "login": self.login
        }

        methods[method]()

    def validate_email(self):
        code = self.request.get("code")
        verify = EmailVerification.gql("WHERE code = :1", code).get()
        worked = False
        if verify:
            verify.user.email_verified = True
            verify.user.put()
            worked = True
            sess = gaesessions.get_current_session()
            sess["user_id"] = verify.user.user_id()
            redirect = self.request.get("redirect")
            if redirect:
                self.redirect(redirect)
            else:
                self.response.out.write(render("email_verified.html"))



"""