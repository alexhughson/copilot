"""

from google.appengine.ext import db
from lib.util import JsonProperty

class CoUser(db.Model):
    A user object.  Can be logged in with a Google account or a custom
        username / password
    email = db.StringProperty()
    name = db.StringProperty()
    registered_date = db.IntegerProperty()
    email_verified = db.BooleanProperty()
    registered_with_google = db.BooleanProperty()
    google_user = db.UserProperty()
    default_business = db.StringProperty() #I'd really like this to be a reference, but circular references are a bitch.                                                                 soon... I shall make them MY bitch
    # For compatibility, the methods, pushed around
    # this is gon need fixin
    timezone = db.IntegerProperty(default = 0)
    def user_id(self):
        return str(self.key())


# This needs to exist so that getting customer lists
# does not loop over absolutely everything in the database
class InteractionRecord(db.Model):
    business_id = db.StringProperty()
    user = db.ReferenceProperty(CoUser)
    @classmethod
    def guaranteed_get(cls, business_id, user):
        getter = cls.gql("WHERE business_id = :1 AND user = :2", business_id, user).get()
        if not getter:
            getter = cls(
                business_id = business_id,
                user = user
            )
            getter.put()
        return getter


class CCProfile(db.Model):
    user_id = db.StringProperty() #Parent
    profile_id = db.StringProperty() #ID
    last_save = JsonProperty()  # Data posted down, should not have CC number or CVD, used to modify
    pending_fetch = db.StringProperty()
    fetched_data = JsonProperty()
    validated = db.BooleanProperty()
    change_response = JsonProperty()
    pending_change = db.StringProperty() #trnOrdNumber for the most recent change. "" for unnchanging

class CCTransaction(db.Model):
    profile_id = db.StringProperty() #Parent
    order_number = db.StringProperty() #ID
    successful = db.BooleanProperty()
    completed = db.BooleanProperty()

class Payment(db.Model):
    from_user = db.ReferenceProperty(CoUser)
    transaction = db.ReferenceProperty(CCTransaction)
    amount = db.FloatProperty()
    business_id = db.StringProperty()
    when = db.IntegerProperty()

class ReservedPayment(db.Model):
    from_user = db.ReferenceProperty(CoUser)
    transaction = db.ReferenceProperty(CCTransaction)
    amount = db.FloatProperty()
    called_on = db.BooleanProperty()
    completion = db.ReferenceProperty(Payment)
    when = db.IntegerProperty()

class PublicationMethods(db.Model):
    name = db.StringProperty()
    requires = db.StringListProperty()
    url = db.StringProperty()
    url_to_add = db.StringProperty()

class ScheduleAvailability(db.Model):
    business_id = db.StringProperty()
    day = db.IntegerProperty() # Deprecated
    start_time = db.IntegerProperty() #earliest time, then iterates weekly
    end_time = db.IntegerProperty()

class Booking(db.Model):
    user = db.ReferenceProperty(CoUser)
    business_id = db.StringProperty()
    start_time = db.IntegerProperty() # ALL TIME
    end_time = db.IntegerProperty()
    approved_by_contractor = db.BooleanProperty()
    approved_by_customer = db.BooleanProperty()

class Solicitation(db.Model):
    interaction = db.ReferenceProperty(InteractionRecord)
    from_contractor = db.BooleanProperty()
    when = db.IntegerProperty()
    message = db.TextProperty()

class Bill(db.Model):
    interaction = db.ReferenceProperty(InteractionRecord)
    amount = db.FloatProperty()
    when = db.IntegerProperty()
    #reserve = db.ReferenceProperty(ReservedPayment)
    called_on = db.BooleanProperty()
    paid = db.BooleanProperty()
    payment = db.ReferenceProperty(Payment)

# Created when a verification email is sent
class EmailVerification(db.Model):
    code = db.StringProperty()
    user = db.ReferenceProperty(CoUser)

class ListingLog(db.Model):
    hash = db.StringProperty()
    is_new_visit = db.BooleanProperty()
    date = db.IntegerProperty()
    business = db.StringProperty()

class EmailMessageResponder(db.Model):
    response_address = db.StringProperty()
    sent_to = db.StringProperty()
    business_id = db.StringProperty()
    sending_user = db.ReferenceProperty(CoUser)
    receiving_user = db.StringProperty()

class JunkMail(db.Model):
    message = db.TextProperty()
    to = db.StringProperty()
    by = db.StringProperty()

class OnePageId(db.Model):
    email = db.StringProperty()
    id = db.StringProperty()

class OnePageLogin(db.Model):
    active = db.BooleanProperty()
    auth_key = db.StringProperty()
    uid = db.StringProperty()"""