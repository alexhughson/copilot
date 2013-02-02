import webapp2
from copilot_dev.templates import template
import os
class Home(webapp2.RequestHandler):
    def get(self, page):

        self.class_map = {
            "what_we_do": "outside/what_we_do.html",
            "contact_us": "outside/contact_us.html",
            "privacy_policy": "outside/privacy_policy.html",
            "terms_of_service": "outside/terms_of_service.html",

        }
        if page in self.class_map:
            self.response.out.write( template.render(self.class_map[page]) )
        else:
            self.response.out.write( template.render("outside/base_home.html") )

