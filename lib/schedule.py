import copy
import datetime
from time import mktime
import json as simplejson
import webapp2 as webapp

from copilot_dev.lib import business, send_emails
from copilot_dev.lib.api_handler import webmethod, ApiHandler
from copilot_dev.lib.auth import auth_or_session, auth

from  app.data import ScheduleAvailability, Booking, InteractionRecord, CoUser,Business
from copilot_dev.lib.util import js_time, json_args, gql_to_raw, model_to_dict

__author__ = 'alex'
#NOTE: Alex is dumb

#Date Constants
tm_year = 0
tm_mon = 1
tm_mday = 2
tm_hour = 3
tm_min = 4
tm_sec = 5
tm_wday = 6
tm_yday = 7
tm_isdst = 0

# HERE I MAKE IT SO
# All time stored in the database, or passed into an interface, shall be passed in milliseconds

class ScheduleApi(ApiHandler):

    @webmethod
    @auth()
    def add_availability(self, user, business_id, day, start, end):
        if end < start:
            return {"error": "you can't end before you start"}

        if not user:

            return {"error": "FUCK OFF CHEATY"}
        # TODO: make sure the user has authourity over the business

        new_availability = ScheduleAvailability(
            business_id = business_id,
            day = day,
            start_time = start,
            end_time = end
        )

        new_availability.put()
        return {"success": True}
    @webmethod
    @auth()
    def edit_availability(self, user, opening_id, day = None, start = None, end = None, **kwargs ):
        if end < start:
            return {"error": "You can't end before you start"}
        if not user:
            return {"error": "FUCK OFF CHEATY"}
        oldie = ScheduleAvailability.get(opening_id)
        # TODO: PERMISSIONS, and null check
        if day: oldie.day = day
        if start: oldie.start_time = start
        if end: oldie.end_time = end
        oldie.put()
        return {"success": "yay"}

    @webmethod
    @auth()
    def delete_availability(self, user, opening_id):
        if not user:

            return { "error": True}
        # TODO: MOAR PERMISSIONS.  ALL OF THE PERMISSIONS
        ScheduleAvailability.get(opening_id).delete()
        return{"success": True}

    @webmethod
    @auth()
    def get_schedule(self, user, business_id):
        if not user:
            return
        # TODO: not permissions...Just kidding, it IS permissions
        db = ScheduleAvailability.gql("WHERE business_id = :1", business_id)
        ret = gql_to_raw(db)
        return ret

    @webmethod
    @auth_or_session
    def add_booking(self, user, business_id, start, end, user_with=None):
        if end < start:
            return {"error": "what are you doing? You can't end before you start"}
        new_booking = self.add_booking_code(user, business_id, start, end, user_with)
        return model_to_dict(new_booking)

    def add_booking_code(self, user, business_id, start, end, user_with):
        if user_with:
            # Make sure they are allowed to propose to this user
            if not business.user_owns_business(user.user_id(), business_id):
                return {"error": "not your business bro"}
            user_with = CoUser.get(user_with)
            if not user_with:
                return {"error":"that guy does not exist"}

            interaction = InteractionRecord.gql("WHERE business_id = :1 AND user = :2", business_id, user_with).get()

            if not interaction:
                return {"error":"You have no reason to talk to that user"}
            user = user_with
            contractor = True
            client = False
        else:
            contractor = False
            client = True
            need_to_create_this = InteractionRecord.guaranteed_get(business_id, user)

        new_booking = Booking(
            user = user,
            business_id = business_id,
            start_time = start,
            end_time = end,
            approved_by_customer = client,
            approved_by_contractor = contractor
        )
        new_booking.put()

        send_emails.booking_created(user, business_id, start, end, user_with)

        return new_booking

    @webmethod
    @auth_or_session
    def delete_booking(self, user, booking_id):
        booking = Booking.get(booking_id)
        if not booking:
            return {"error": "No such booking"}
        if str(booking.user.key()) == str(user.key()):
            booking.delete()
            return {"success": True}
        elif business.user_owns_business(user.user_id(), booking.business_id):
            booking.delete()
            return {"success": True}
        else:
            return {"error": "insufficient permissions"}

    @webmethod
    @auth_or_session
    def approve_booking(self, user, booking_id):
        booking = Booking.get(booking_id)
        if not booking:
            return {"error": "No such booking"}
        if str(booking.user.key()) == str(user.key()):
            booking.approved_by_customer = True
            booking.put()
            return model_to_dict(booking)
        if business.user_owns_business(user.user_id(), booking.business_id):
            booking.approved_by_contractor = True
            booking.put()
            return model_to_dict(booking)
        return {"error": "Insufficient permissions"}


    @webmethod
    @auth_or_session
    def get_bookings(self, user, business_id, user_id=None):
        # My intuition tells me that this is bad design
        # My laziness told it to shut up
        if user_id:
            if not business.user_owns_business(user.user_id(), business_id):
                return {"error": "You don't own that business"}

            # At this point, permissions are good
            user = CoUser.get(user_id)

        if not user:
            return []

        bookings = Booking.gql("WHERE user = :1 AND business_id = :2", user, business_id)
        return gql_to_raw(bookings)

    @webmethod
    @auth_or_session
    def edit_booking(self,user, business_id, booking_id, start, end):
        booking = Booking.get(booking_id)
        that_biz = Business.get(business_id)
        if end < start:
            return {"error": "what are you doing?  You can't end before you start"}
        if not booking or not that_biz or not ( booking.user == user or that_biz.owner == user):
            return {"error": "not allowed"}

        if booking.user == user:
            booking.approved_by_customer = True
            booking.approved_by_contractor = False
        else:
            booking.approved_by_contractor = True
            booking.approved_by_customer = False

        booking.start_time = start
        booking.end_time = end
        booking.put()
        return {"success": db.to_dict()}

    @webmethod
    def get_availability(self, business_id, starting=None, until=None):
        # TODO: add a minimum appt length
        if not starting:
            starting = js_time()
        if not until:
            until = starting + (7*24*60*60*1000)

        available = ScheduleAvailability.gql("WHERE business_id = :1", business_id)
        booked = Booking.gql("WHERE business_id = :1", business_id)

        el_booking = NextMunger()
        el_available = NextMunger()

        for availability in available:
            el_available.add(WeeklyEvent(availability))
        for booking in booked:
            el_booking.add(SingleEvent(booking))

        ret_arr = []
        def maybe_append(el):
            # Just to make sure that we don't send tiny openings.
            # This will be better fixed in the future with better data integrity TODO: do that - AH
            # pulled this number out of what the bugs look like
            if el["end"] - el["start"] > 100000\
            and el["start"] < until:
                ret_arr.append(el)


        cursor = starting
        while cursor < until and el_available.next(cursor):
            next_available = el_available.next(cursor)
            next_book = el_booking.next(cursor)
            if next_book and next_book["start"]<next_available["start"]:
                cursor = next_book["end"] + 1 # + 1 is an extra ms just in case something broke with equal values in the algorithm
            elif next_book and next_book["start"] < next_available["end"]:
                augment = next_available
                augment["end"] = next_book["start"]
                if augment["end"] != augment["start"]:
                    maybe_append(augment)
                cursor = next_book["end"] + 1
            else:
                if next_available["end"] != next_available["start"]:
                    maybe_append(next_available)
                cursor = next_available["end"] + 1

        return ret_arr


class NextMunger():
    def __init__(self):
        self.generators = []

    def add(self, new_next_generator):
        self.generators.append(new_next_generator)

    def next(self, after_time):
        ret = None
        for gen in self.generators:
            genned = gen.next(after_time)

            if genned and ( not ret or genned["start"] < ret["start"]):
                ret = genned
        return ret



class SingleEvent():
    def __init__(self, data):
        self._data = data

    def next(self, after_time):
        if self._data.start_time > after_time:
            after_time = self._data.start_time
        if self._data.end_time > after_time:
            return {
                "start": after_time,
                "end": self._data.end_time
            }
        else:
            return None


class WeeklyEvent():
    def __init__(self, availability):

        self.start = datetime.datetime.fromtimestamp( availability.start_time / 1000)
        self.end = datetime.datetime.fromtimestamp( availability.end_time / 1000)

    def next(self, after_time):
        after_time /=  1000
        working_date = datetime.datetime.fromtimestamp(after_time)
        ret = self._next(working_date)
        for key in ret.keys():
            ret[key] = int(mktime(ret[key].timetuple()) * 1000)
        return ret

    def _next(self, working_date):

        proposed_end = self.end
        proposed_start = self.start
        while 1:
            if proposed_start > working_date:
                return {
                "start": proposed_start,
                "end": proposed_end
                }
            elif proposed_end > working_date:
                return{
                "start": working_date,
                "end": proposed_end
                }
            else:
                proposed_end += datetime.timedelta(days=7)
                proposed_start += datetime.timedelta(days=7)




