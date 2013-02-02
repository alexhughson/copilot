import webapp2
from copilot_dev.lib import consts

import cousers

import  re
from app.data import CoUser

AUTH_LOGIN_URI = "/auth/google_login"
DEFAULT_PAGE = "/"

def auth(required=None):
    """Creates an authentication decorator.  Takes a single argument named 
    'required', returns into the function the user object named as 'user'.  If 
    no logged in user and required, redirects to the login page with an auto
    redirect back to the requested page"""

    def auth_decorator(fn, required=required):
        def check_auth(self, *args, **kwargs):
            user = cousers.get_current_user()
            if user:
                return fn(self, user=user, *args, **kwargs)
            elif required:
                forward_to = self.request.url
                self.redirect(clean_redirect(AUTH_LOGIN_URI + "?forward_to=" + forward_to))
                return False
            else:
                return fn(self, user=None, *args, **kwargs)

        return check_auth

    return auth_decorator


def auth_or_session(fn):
    @auth()
    def check_for_user_or_create_session(self, user, *args, **kwargs):
        if not user:
            # Create session
            sess = gaesessions.get_current_session()
            user_id = sess.get("user_id", None)
            if user_id == None:
                new_user = CoUser()
                new_user.put()
                sess["user_id"] = new_user.user_id()
                return fn(self, user=new_user, *args, **kwargs)
            else:
                old_user = CoUser.get(user_id)
                return fn(self, user=old_user, *args, **kwargs)
        else:
            return fn(self, user=user, *args, **kwargs)

    return check_for_user_or_create_session


class Authenticate(webapp2.RequestHandler):
    """Control class for all authentication based pages.  Takes nothing, returns
    either a page or redirects the user upon validating data"""

    def get(self, page):
        self.class_map = {
            "logout": self.google_logout,
            "google_return": self.receive_from_google,
            "google_login": self.google_login
        }
        if self.class_map[page]:
            return self.class_map[page]()

        self.redirect(clean_redirect(DEFAULT_PAGE))

    def post(self, page):
        self.class_map = {
            "get_current_user": self.get_current_user
        }
        if self.class_map[page]:
            return self.class_map[page]()

        return "balls"

    #POST functions-------------------------------------------------------------
    def get_current_user(self):
        """AJAX request to get the current user details"""
        user = cousers.get_current_user()
        self.response.out.write(cousers.to_json(user))


    #GET functions--------------------------------------------------------------
    def google_login(self):
        forward_to = self.request.get("forward_to")
        if forward_to:
            forward_to = clean_redirect(forward_to)
        else:
            forward_to = DEFAULT_PAGE

        google_login_url = users.create_login_url(forward_to)
        self.redirect(google_login_url)

    def receive_from_google(self):
        """Page called after logging in through Google"""

        forward_to = self.request.get("forward_to")
        if not forward_to:
            forward_to = DEFAULT_PAGE

        user = cousers.get_current_user()
        if not user:
            self.redirect(AUTH_LOGIN_URI)

        self.redirect(clean_redirect(forward_to))

    @auth(False)
    def google_logout(self, user):
        """Redirects the user to Googles logout link then back to the default page"""
        if user:
            logout_url = cousers.create_logout_url(user, DEFAULT_PAGE)
            self.redirect(logout_url)
        else:
            clean_redirect(DEFAULT_PAGE)


def clean_redirect(url):
    """Security class.  Call for all redirects based on GET requests.  Compares
    the redirect against valid REGEX patterns.  Takes the redirect url, returns
    the same url if valid or a redirect to an error page if not valid."""
    return url
    valid_redirects = ["^"+consts.APP_ADDRESS+"/" ] #, "^http://(.*\.)contractorcopilot.com", "^/"]
    for pattern in valid_redirects:

        if re.match(pattern, url):
            return url

    return consts.APP_ADDRESS + "error/bad_redirect?redirect=" + url
