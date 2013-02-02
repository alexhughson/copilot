

import cousers
import time, auth
from app.data import CoUser, Business, BusinessPage

# TODO: MVC-ify this code, oh god

# TODO: Make sure this default argument is actually smart
# TODO: Make alex actually smart
from copilot_dev.lib.log_error import log_error

def get_businesses(owner = cousers.get_current_user(), limit = None):
    results = Business.all()
    results.filter("owner =", owner)
    
    if limit:
        results.filter("limit", limit)
    
    return results

def create_business():
    owner = cousers.get_current_user()
    new_business = Business(owner = owner, registered_date = int(time.time()))
    new_business.put()
    return new_business
"""
class Business(db.Model):
    full_name = db.StringProperty()
    short_name = db.StringProperty()
    owner = db.ReferenceProperty(CoUser)
    registered_date = db.IntegerProperty()
    
    country = db.StringProperty()
    province = db.StringProperty()
    city = db.StringProperty()
    street = db.StringProperty()
    
    does = db.StringProperty()

    def to_json(self):
        return {
            "full_name": self.full_name,
            "short_name": self.short_name,
            "registered_date": self.registered_date,
            "country": self.country,
            "province": self.province,
            "city": self.city,
            "street": self.street,
            "does": self.does,
            "key": str(self.key()),
            "owner": cousers.to_json(self.owner),
            "page": self.get_page_summary()
        }

    def get_page_summary(self):
        ""Finds if this business has a linked page.  If so, returns the summary of that page.  If not, returns False.""
        page = BusinessPage.all().filter("business =", self).get()
        if page:
            page_summary = page.get_summary()
            return page_summary

        return False


class BusinessPage(db.Model):
    ""Holds all data relating to a page.  If requested to_json, will dump all data.  get_summary is recommended for administrativ
    tasks.""

    business = db.ReferenceProperty(Business)

    url = db.StringProperty()
    custom_url = db.StringProperty()
    about_me = db.TextProperty()
    about_business = db.TextProperty()
    schedule_summary = db.TextProperty()
    email = db.StringProperty()
    phone = db.StringProperty()
    enabled = db.BooleanProperty()
    paid_until = db.IntegerProperty()


    def get_summary(self):
        return {
            "url": self.url,
            "enabled": self.enabled,
            "custom_url": self.custom_url,
            "is_paid": (self.paid_until > time.time()),
            "paid_until": self.paid_until
        }

    def to_json(self):
        return {
            "business": self.business.to_json(),
            "url": self.url,
            "about_me": self.about_me,
            "about_business": self.about_business,
            "schedule_summary": self.schedule_summary,
            "phone": self.phone,
            "email": self.email,
            "enabled": self.enabled,
            "custom_url": self.custom_url,
            "paid_until": self.paid_until,
            "is_paid": (self.paid_until > time.time())
        }
    
    def update(self, new_data):
        #TODO Security concerns?
        for prop in new_data:
            if prop == business:
                self.business.load_data(new_data.prop)
            else:
                try:
                    self[prop] = new_data[prop]
                except:
                    err = log_error("Trouble updating a BusinessPage object.  Property '{0}' containing value '{1}' was not accepted.", "UPDATE_BUSINESSPAGE_FAIL")
                    return {"error": err}
        
        self.put()

    def toggle(self, enable = None):
        if enable==None:
            self.enabled = not self.enabled
            return True
        self.enabled = (enable == "True")
        return True
"""

def get_page(url, enabled_only):
    if not url:
        return False

    page = BusinessPage.all().filter("url =", url)

    if enabled_only:
        page = page.filter("enabled =", True)

    return page.get()


def user_owns_business(user_id, business_id):
    biz = Business.get(business_id)
    if not biz:
        return False

    if str(biz.owner.key()) == user_id:
        return True
    else:
        return False