import webapp2
import json
from copilot_dev.lib import util

__author__ = 'alex'

def webmethod(fn):
    fn.is_method = True
    return fn

class ApiHandler(webapp2.RequestHandler):
    def post(self, method):
        method = getattr(self, method)
        if method and method.is_method:

            try:
                args = json.loads( self.request.body)
            except:
                args = {}

            args = util.asciify_dict(args)

            ret = method(**args)

            if ret == "None":

                ret = {"message": 'executed'}

            if "error" in ret:
                self.response.set_status(500)
                ## Do something special here eventually
            self.response.headers["Content-Type"] = "application/json"
            self.response.out.write(json.dumps( ret ))
