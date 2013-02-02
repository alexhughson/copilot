

import time
from copilot_dev.lib import consts
from app.data import CoUser
from copilot_dev.lib.util import random_string


# AWWWW SHIT, all these methods were pulled out of the CoUser database thingie.
# This is why the first arg is always called self
from app import users

def register_with_google(self, user):
    if not user:
        return False
    self.google_user = user
    self.name = user.nickname()
    self.registered_with_google = True
    self.registered_date = int(time.time())
    self.email = user.email()
    self.default_business = None
    self.put()

def save(self):
    self.put()

def to_json(self):
    json = {
		"key": str(self.key()),
        "email": self.email,
        "user_name": self.name,
        "registered_date": self.registered_date,
        "default_business": self.default_business
    }
    return json

def create_logout_url(self, forward_to, ):
    if self.registered_with_google:
        return users.create_logout_url(forward_to)

    else:
        pass
        #Logout if they're not a google user

def user_id(self):
    return str(self.key())

def set_default_business(self, new_default):
    self.default_business = new_default.key

#DEAD - AH
def check_email(self):
    return
    if self.email_verified:
        return
    auth_code = random_string(100)

    user_confirmation_url = consts.APP_ADDRESS + "link_login/go?code=" + auth_code

    verifyer = EmailVerification(
        user = self,
        code = auth_code
    )
    verifyer.put()

    sender = "Contractor Copilot <alex@contractorcopilot.com>"
    reciever = self.email
    message = "To confirm your email, click this link <a href='" + user_confirmation_url + "'>THIS ONE</a>"
    subject = "Confirm E-Mail"

    #mail.send_mail(sender, reciever, subject, message)
    return


def get_current_user():
    """Return a CoUser object of the currently logged in user"""
    #Try Google first
    user = users.get_current_user()
    if user:
        # TODO: not key on emails - dems not unique
        query = db.GqlQuery("SELECT * FROM CoUser WHERE email = :email", email=user.email())
        if not query.count():
            return create_user_from_google(user)
        if query.count() == 1:
            couser = query.get()
            return couser
        if query.count() > 2:
            #Shit broke.  TODO integrity testing
            pass


def create_user_from_google(user):
    couser = CoUser()
    register_with_google(couser, user)
    return couser
