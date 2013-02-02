import webapp2
from copilot_dev.templates import template
from copilot_dev.lib.auth import auth
import os

class Dashboard(webapp2.RequestHandler):
    def get(self, page):
        self.class_map = {
            "home": self.show_home,
            "credit_test": self.credit_test
        }
        if page in self.class_map:
            return self.class_map[page]()
        self.redirect("/")

    def post(self, page):
        pass

    @auth(True)
    def show_home(self, user):
        template_vars = {
            "user": user
        }

        self.response.headers["Content-Type"] = "text/html"
        landing_template = template.render("inside/base.html", template_vars)
        self.response.out.write(landing_template)

    def credit_test(self):
        self.response.headers["Content-Type"] = "text/html"
        self.response.out.write(template.render("credit_test.html"))


