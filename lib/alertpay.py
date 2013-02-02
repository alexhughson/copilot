
import urllib2
import webapp2

class AlertPay(webapp2.RequestHandler):
    def post(self):
        token = self.request.get("token")
        ipn_address = "https://sandbox.alertpay.com/sandbox/IPN2.ashx"
        raw_post_data = {"token": token}
        post_data = urllib2.urlencode(raw_post_data)
        request = urllib2.Request(ipn_address, post_data)
        response = urllib2.urlopen(request)
        response_text = response.read()

        print response_text
