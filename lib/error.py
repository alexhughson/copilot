import webapp2
from copilot_dev.lib.oauth import users
from templates import template
from auth import auth
import os
from log_error import log_error

class Error(webapp2.RequestHandler):
    def get(self, page):

        self.class_map = {
            "bad_redirect": self.bad_redirect
        }
        if self.class_map[page]:
            return self.class_map[page]()

        self.redirect("/")

    @auth(False)
    def bad_redirect(self, user):
        template_vars = {
            "error": {
                "title": "Someone may be trying to trick you!",
                "explanation": "We've detected a funny looking request coming " \
                    "from your browser.  This happens either when someone is " \
                    "attempting to trick you, or we just may have messed up.  " \
                    "Either way, we've been notified and we'll look into it to " \
                    "make sure it doesn't happen again.  We're sorry for the error!",
                "details": "Attempted redirection to [%s]" % self.request.get("redirect")
                    
            },
            "user": user
        }
        log_error(template_vars.error.details, "XSS_ATTACK_DETECTED")
        self.response.headers["Content-Type"] = "text/html"
        landing_template = os.path.join(os.path.dirname(__file__), "..", "templates", "error.html")
        self.response.out.write( webapp.template.render(landing_template, template_vars))
