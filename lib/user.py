import json as simplejson

import webapp2 as webapp
from copilot_dev.lib import cousers, trello
from copilot_dev.lib.api_handler import ApiHandler, webmethod
from copilot_dev.lib.auth import auth_or_session


__author__ = 'alex'
# API for user
class UserApi(ApiHandler):

    @webmethod
    @auth_or_session
    def get_email(self, user):
        ret = {
            "success" : (user.email is not None),
            "email" : user.email,
            "on_google" : user.registered_with_google
        }
        return ret
    @webmethod
    @auth_or_session
    def set_email(self, user, email):
        """
        TODO:  This should check for an existing user with the same email
        If one exists, merge them.
        TODO:  Require google for money, or come up with better security
        TODO:  Reject the set if somebody with the same email has google
        """
        if mail.is_email_valid(email):
            user.email = email
            #cousers.check_email(user)
            user.put()
            return {"success":True}
        else:
            return {"success": False, "error": "Bad Email"}

    @webmethod
    def get_google_login_url(self, return_url):
        return {"url": users.create_login_url(return_url)}

    @webmethod
    def contact_us(self, email, message):
        desc = "Message from " + email + " \n" + message
        list = trello.get_trello_feedback_list()
        card = list.add_card(email, desc)
        return {}

    @webmethod
    @auth_or_session
    def log_out(self):
        ses = gaesessions.get_current_session()
        ses["user_id"] = None
