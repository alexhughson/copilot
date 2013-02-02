import string


import json
import webapp2
import cousers, messages, business
from app.data import CoUser
from auth import auth
import trello
from app import data
import os, re, datetime, time
from copilot_dev.lib.util import gql_to_raw, strip_html
from math import floor
import copy

AUTH_LOGIN_URI = "/auth/login"
DEFAULT_PAGE = "/"

class Respond(webapp2.RequestHandler):
    """Control class for all authentication based pages.  Takes nothing, returns
    either a page or redirects the user upon validating data"""
    
    def get(self, page):
        pass

    def post(self, page):
        response = getattr(self, page)()
        
#        try:
#            response = getattr(self, page)()
#        except:
#            error = log_error("Unknown request type %s" % page, "BAD_AJAX_REQUEST")
#            response = {"error": error}

        self.response.out.write(json.dumps(response))
        
    def pass_to_log_error(self):
        message = "JS - %s" % (self.request.get("message"),)
        code = "JS_%s"%(self.request.get("code"),)
        log_error(message, code)
        return {"error": None}

    @auth(False)
    def get_current_user(self, user):
        """AJAX request to get the current user details"""

        if user:
            output = {"user": cousers.to_json(user)}
            user_businesses = business.get_businesses(user)
            output["business"] = []
            if user_businesses.count() > 0:
                for biz in user_businesses:
                    output["business"].append(biz.to_json())



            user.timezone = int(self.request.get("timezone"))
            user.put()

        else:
            return authentication_error()
        return output

    @auth(False)
    def send_message(self, user):
        body = self.request.get("message")
        subject = self.request.get("subject")
        to = CoUser.get(self.request.get("to"))

        msg = messages.send_message(to = to, sender = user, body = body, subject = subject)
        return {"SENT": True, "TO": msg.to.name}

    @auth(False)
    def get_message_count(self, user):
        #Check to see if the boolean is true or not
        if not user:
            return authentication_error()
        
        unread = self.request.get("unread_only") == "true"
        return {"count": messages.get_messages(unread_only = unread).count()}

    def get_mustache_templates(self):
        paths = ["templates/inside/mustache/", "templates/listings/mustache/"]
        output = {}

        for path in paths:
            listing = os.listdir(path)
            for filename in listing:
                try:
                    file_contents = open(path + filename, "r").read()
                except:
                    error = log_error("Could not open file for reading - %s%s" % (path, filename), "CANT_READ_MUSTACHE_FILE")
                    file_contents = {"error": error}
                output[filename] = file_contents

        return output
        
    @auth(False)
    def edit_business(self, user):
        if not user:
            return authentication_error()
        
        key = self.request.get("existing_key");
        if len(key) > 0:
            biz = business.Business.get(key)
        else:
            biz = business.create_business()

        required_vals = ["full_name", "short_name", "country", "province", "city", "does"]
        for val in required_vals:
            if self.request.get(val) == "":
                err = log_error("Attempt to edit business without providing enough information", "JAVASCRIPT_VALIDATION_FAIL")
                return {"error": err}

        biz.full_name = self.request.get("full_name")
        biz.short_name = self.request.get("short_name")
        biz.country = self.request.get("country")
        biz.province = self.request.get("province")
        biz.city = self.request.get("city")
        biz.street = self.request.get("street")
        biz.does = self.request.get("does")
        
        biz.put()
        
        return biz.to_json()
        
    @auth(False)
    def change_default_business(self, user):
        if not user:
            return authentication_error()
            
        new_business = self.request.get("new_business")

        if not business.Business.get(new_business):
            err = log_error("Unable to find a business by the key %s" % (new_business,), "CHANGE_DEFAULT_BUSINESS_AJAX_NO_BUSINESS_FOUND")
            return {"error":err}

        user.default_business = new_business
        user.put()
        return {"success": True}

    def check_url_available(self):
        biz = business.Business.get( self.request.get("business") )
        url = self.request.get("url")
        
        existing = business.BusinessPage.all().filter("url =", url).get()

        if existing and existing.business.key() != biz.key():
            return {"available": False}
            
        return {"available": True}
    
    @auth(False)
    def change_minisite(self, user):
        if not user:
            return authentication_error()

        biz = business.Business.get( self.request.get("business") )
        
        if biz.owner.key() != user.key():
            err = log_error("User %s attempted to edit business page for %s" % (str(user.key()), str(biz.key())), "ATTEMPT_EDIT_BUSINESS_NOT_OWNED")
            return {"error": True}

        business_page = business.BusinessPage.all().filter("business =", biz).get()

        if not business_page:
            business_page = business.BusinessPage(
                business = biz,
                url = None
            )

        action = self.request.get("action")
        if action == "get_data":
            return business_page.to_json()

        if not self.check_url_available()["available"]:
            err = log_error("User submitted an attempted business site for url %s with business %s when the url already exsists." % (self.request.get("url"), self.request.get("business")), "ATTEMPT_CHANGE_URL_ALREADY_EXISTS_AJAX" )
            return {"error": True}


        url = self.request.get("url")
        if not re.search('^\w*$', url):
            err = log_error("User %s attempted to change to a bad url %s"%(str(user.key()), url ))

        business_page.url = url
        business_page.about_me = self.request.get("about_me")
        business_page.about_business = self.request.get("about_business")
        business_page.schedule_summary = self.request.get("schedule_summary")
        business_page.phone = self.request.get("phone")
        business_page.email = self.request.get("email")
        business_page.toggle(self.request.get("enabled"))
        
        business_page.put()
        return business_page.get_summary()

    @auth(False)
    def enable_disable_minisite(self):
        if not user:
            return authentication_error()

        page = self.request.get("url")

        if page.owner.key() != user.key():
            err = log_error("User %s attempted to edit business page for %s" % (str(user.key()), str(biz.key())), "ATTEMPT_EDIT_BUSINESS_NOT_OWNED")
            return {"error": True}

        page.toggle()

        return {"success": True}

    def get_business_page(self):
        url = self.request.get("page")
        page = business.BusinessPage.all().filter("url =", url).get()
        if page:
            output = page.to_json()
            output["about_me"] = strip_html(output["about_me"])
            output["about_business"] = strip_html(output["about_business"])
            output["schedule_summary"] = strip_html(output["schedule_summary"])

            return output
        return False

    @auth(False)
    def request_custom_domain(self, user):
        if not user:
            return authentication_error()

        biz = business.Business.get( self.request.get("business") )
        if not biz:
            err = log_error("User submitted request for custom domain but business key did not come across with it", "CUSTOM_DOMAIN_BUSINESS_NO_EXIST")
            return {"error": True}

        description = "Request from user \n \n %s \n \n for business \n \n %s \n \n Get back to them at \n \n %s" % (str(user.key()), str(biz.key()) , user.email)

        list = trello.get_trello_domains_list()
        card =list.add_card( self.request.get("domain"), description )
        if card:
            recipients = [
                "Josh Stabback <josh@contractorcopilot.com>",
                "Alex Hughson <alex@contractorcopilot.com>",
                "James Rimmer <james@contractorcopilot.com>"
            ]
            mail.send_mail("Notifications <notifications@contractorcopilot.com>", recipients, "New card", "%s - %s" % (self.request.get("domain"), description) )

            return "true"
        else:
            err = log_error("Cannot add card to trello list", "CANT_ADD_DOMAIN_TRELLO_CARD")
            return {"error": True}

    @auth(False)
    def request_publicization(self, user):
        if not user:
            return authentication_error()

        biz = business.Business.get( self.request.get("business") )
        if not biz:
            err = log_error("User submitted request for publication but business key did not come across with it", "PUBLICATION_BUSINESS_NO_EXIST")
            return {"error": True}

        description = "Request from user \n \n %s" \
                      " \n \n for business \n \n %s " \
                      "\n \n Get back to them at \n \n %s" \
                      "\n \n Included information: \n \n " \
                      "Email: %s \n \n" \
                      "Phone: %s \n \n" \
                      "Country: %s \n \n" \
                      "Province: %s \n \n" \
                      "City: %s \n \n" \
                      "Street: %s \n \n" \
                      "Description: \n \n%s \n \n" \
                      "Tax Number: \n \n %s"%(str(user.key()), str(biz.key()) , user.email,
                                            self.request.get("email"), self.request.get("phone"),
                                            self.request.get("country"), self.request.get("province"),
                                            self.request.get("city"), self.request.get("street"),
                                            self.request.get("description"), self.request.get("tax_number"))

        list = trello.get_trello_publication_list()
        card =list.add_card( biz.short_name, description )

        if card:
            recipients = [
                "Josh Stabback <josh@contractorcopilot.com>",
                "Alex Hughson <alex@contractorcopilot.com>",
                "James Rimmer <james@contractorcopilot.com>"
            ]
            mail.send_mail("Notifications <notifications@contractorcopilot.com>", recipients, "New card", "%s - %s" %(self.request.get("domain"), description) )

            return "true"
        else:
            err = log_error("Cannot add card to trello list", "CANT_ADD_PBLICIZATION_TRELLO_CARD")
            return {"error": True}

    @auth(False)
    def request_advertising(self, user):
        if not user:
            return authentication_error()

        biz = business.Business.get( self.request.get("business") )
        if not biz:
            err = log_error("User submitted request for advertising but business key did not come across with it", "ADVERTISING_BUSINESS_NO_EXIST")
            return {"error": True}

        description = "Request from user \n \n %s"\
                      " \n \n for business \n \n %s "\
                      "\n \n Get back to them at \n \n %s"\
                      "\n \n Included information: \n \n "\
                      "Country: %s \n \n"\
                      "Province: %s \n \n"\
                      "City: %s \n \n"\
                      "Street: %s \n \n"\
                      "Ad Methods: \n \n%s \n \n"\
                      "Budget: \n \n %s"\
                      "Notes: \n \n %s" %(str(user.key()), str(biz.key()) , user.email,
                            self.request.get("country"), self.request.get("province"),
                            self.request.get("city"), self.request.get("street"),
                            ", ".join(self.request.get_all("ad_methods[]")), self.request.get("budget"),
                            self.request.get("notes"))

        list = trello.get_trello_advertising_list()
        card =list.add_card( biz.short_name, description )

        if card:
            recipients = [
                "Josh Stabback <josh@contractorcopilot.com>",
                "Alex Hughson <alex@contractorcopilot.com>",
                "James Rimmer <james@contractorcopilot.com>"
            ]
            mail.send_mail("Notifications <notifications@contractorcopilot.com>", recipients, "New card", "%s - %s" % (self.request.get("domain"), description) )

            return "true"
        else:
            err = log_error("Cannot add card to trello list", "CANT_ADD_ADVERTISING_TRELLO_CARD")
            return {"error": True}

    def log_listing_view(self):
        page_hash = self.request.get("hash")
        is_new_visit = (self.request.get("first_visit") == "true")
        biz = self.request.get("business")

        new_log = ListingLog(date = int(time.time()), hash = page_hash, is_new_visit = is_new_visit, business = biz)
        new_log.put()
        return True

    @auth(False)
    def get_page_hits(self, user):
        if not user:
            return authentication_error()
        biz = self.request.get("business")

        day_length = 24 * 60 * 60 * 1000
        now = time.time()

        hits_query = data.ListingLog.all()\
                                    .filter("business =", biz)\
                                    .filter("date >", int(time.time()) - day_length * 60)\
                                    .order("-date")

        hits = hits_query.fetch(limit=hits_query.count())
        big_mofuckin_data = gql_to_raw(hits)

        hash_types = {}
        for this_data in big_mofuckin_data:
            hash_types[this_data["hash"]] = ''

        output = {}
        dummy_day = {"hashes": {}, "total": 0, "visitors": 0}
        for hash in hash_types:
            dummy_day["hashes"][hash] = 0

        for day in range(61):
            output[day] = copy.deepcopy(dummy_day)


        for this_data in big_mofuckin_data:
            days_ago = floor((now - this_data["date"]) / day_length)
            output[days_ago]["total"] +=1
            output[days_ago]["hashes"][this_data["hash"]] +=1
            if this_data["is_new_visit"]:
                output[days_ago]["visitors"] += 1

        return output




def authentication_error():
    """Returns a basic auth error if user is not logged in"""
    err = log_error("No user logged in, attempted to access AJAX function while not authenticated", "AJAX_NO_USER")
    return {"error": True}
