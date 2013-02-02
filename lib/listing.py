import os
import webapp2
from copilot_dev.templates import template
from copilot_dev.lib.auth import auth
from copilot_dev.lib.log_error import log_error
from copilot_dev.lib import business, cousers

class Listing(webapp2.RequestHandler):
        
    def get(self, page):
        #Check to see if the requested page is linked to any  business
        page = page.lower()
        all_pages = business.BusinessPage.all()
        this_page = all_pages.filter("url =", page).filter("enabled =", True).get()

        if not this_page:
            self.redirect("/")
            return False
            
        return self.fetch_page( this_page )

    def post(self, page):
        pass
    
    @auth(False)
    def fetch_page(self, business_page, user):
        template_vars = business_page.to_json()

        template_vars["user"] = cousers.to_json(user) if user else {}
        self.response.headers["Content-Type"] = "text/html"
        landing_template = os.path.join(os.path.dirname(__file__), "..", "templates", "listings/base_listing.html")
        self.response.out.write( webapp.template.render(landing_template, template_vars))

