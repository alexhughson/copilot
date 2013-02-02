import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

from lib import home, auth, dashboard, ajax, listing, test, alertpay
from lib.contact import ContactApi
from lib.creditcards.notification_node import CCNotificationNode
from lib.creditcards.web_api import CCAPI
from lib.link_login import LinkLogin
from lib.schedule import ScheduleApi
from lib.user import UserApi

logging.debug("started")

appmap = [
    ("/auth/(.*)", auth.Authenticate),
    ("/user/(.*)", dashboard.Dashboard),
    ("/link_login/(.*)", LinkLogin),
    ("/api/credit/(.*)", CCAPI),
    ("/api/schedule/(.*)", ScheduleApi),
    ("/api/user/(.*)", UserApi),
    ("/api/contact/(.*)", ContactApi),
    ("/ajax/(.*)", ajax.Respond),
    ("/alertpay_ipn_response_wharblgarble", alertpay.AlertPay),
    ("/listings/(.*)", listing.Listing),
    ("/c/(.*)", listing.Listing),
    ("/test/(.*)", test.Test),
    ("/(.*)" , home.Home)
    ]

app = webapp.WSGIApplication(
        appmap,
        debug=True)

def main():
    run_wsgi_app(app)

if __name__ == "__main__":
    main()

