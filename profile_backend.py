from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import backends
from google.appengine.api import urlfetch
from lib.creditcards import profile_backend
import logging

""" Backend to manage connections to credit card processor, allowing the main code to be responsive,
and dealing with the problem of too slow responses """

class TransactionStuff(webapp.RequestHandler):
    def get(self, page):
        return

appmap = [
    ("/backend/profile/(.*)", profile_backend.ProfileStuff),
    ("/backend/transaction/(.*)", TransactionStuff)
    ]

app = webapp.WSGIApplication(
    appmap,
    debug=True)

run_wsgi_app(app)
