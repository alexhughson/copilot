from datetime import datetime, timedelta
import email


from copilot_dev.lib import consts

from app.data import EmailMessageResponder,  Business
from copilot_dev.lib.util import random_string
import copilot_dev.templates

__author__ = 'alex'

def message_recieved(user, business_id, sent_to, message):
    resp_addr = "messaging-" + random_string(10) + "@contractorcopilot.appspotmail.com"

    if sent_to:
        target = sent_to.email
    else:
        ze_biz = Business.get(business_id)
        target = ze_biz.owner.email


    receiver = None
    if sent_to:
        receiver = sent_to.user_id()

    responder = EmailMessageResponder(
        response_address = resp_addr,
        sent_to = target,
        business_id = business_id,
        sending_user = user,
        receiving_user = receiver
    )
    responder.put()

    message_body = consts.REPLY_ABOVE_THIS_LINE + "\n \n" + message
    if user.name:
        subject_line = user.name
    else:
        subject_line = user.email

    subject_line += " has sent you a message"


    mail.send_mail(
        sender= email.utils.formataddr(("Contractor Copilot",resp_addr)),
        to = target,
        subject = subject_line,
        body = message_body,

    )

def booking_created(user, business_id, start, end, user_with):
    if user_with:
        verifier = EmailVerification.gql("WHERE user = :1", user_with)
        if not verifier:
            code = random_string(30)
            verifier = EmailVerification(
                code = code,
                user = user_with
            )
            verifier.put()

        href = consts.APP_ADDRESS + "link_login/login?code=" + verifier.code
        send_to = user_with.email
        timezone = user.timezone

    else:
        href = consts.APP_ADDRESS + "user/home#manage_customers" ## TODO: get the right target for this
        ze_biz = Business.get(business_id)
        send_to = ze_biz.owner.email
        timezone = ze_biz.owner.timezone

    timezone = timedelta(minutes = timezone) # TODO: de-hack timezones

    vars = {
        "reply_above_line" : consts.REPLY_ABOVE_THIS_LINE,
        "login_link" : href,
        "booking_date": (datetime.fromtimestamp(start / 1000) -timezone ).date().strftime("%a, %b %d"),
        "start_time" : (datetime.fromtimestamp(start/ 1000) -timezone).time().strftime("%l:%M %p"),
        "end_time": (datetime.fromtimestamp(end/1000)-timezone).time().strftime("%l:%M %p")
    }

    resp_addr = "messaging-" + random_string(10) + "@contractorcopilot.appspotmail.com"
    receiver = None
    if user_with:
        receiver = user_with.user_id()
    responder = EmailMessageResponder(
        response_address = resp_addr,
        sent_to = send_to,
        business_id = business_id,
        sending_user = user,
        receiving_user = receiver
    )

    responder.put()
    message = templates.template.render("booking_email.html", vars)

    title = "You have recieved a Booking request"
    named_addr = email.utils.formataddr(("Contractor Copilot", resp_addr))
    mail.send_mail(
        sender = named_addr,
        to = send_to,
        subject = title,
        body = message
    )


