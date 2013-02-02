
import time, auth, cousers
from app.data import CoUser

def get_messages(to = cousers.get_current_user(), limit = None, send_date_start = None, send_date_end = None, unread_only = False):
    
    results = Messages.all()
    results.filter("to =", to)

    #TODO return to fill out filters once messages are being sent.
    if limit:
        pass

    if send_date_start:
        pass
        
    if send_date_end:
        pass
    
    if unread_only == True:
        results.filter("read =", not unread_only)
        
    return results

def send_message(to, body, send_date = time.time(), sender = cousers.get_current_user(), subject = None):
    #msg = Messages(to, sender, body, send_date, subject)
    #msg.put()
    return ""#msg
    
"""class Messages(db.Model):
    to = db.ReferenceProperty(CoUser, collection_name = "recipient_set")
    
    sender = db.ReferenceProperty(CoUser, collection_name = "sender_set")
    send_date = db.IntegerProperty()
    
    body = db.StringProperty()
    subject = db.StringProperty()
    
    read = db.BooleanProperty()
    read_date = db.IntegerProperty()
    
    def __init__(self, to, sender, body, send_date = time.time(), subject = None):
        db.Model.__init__(self)
        self.to = to
        self.sender = sender
        self.send_date = int(send_date)
        self.body = body
        if not subject:
            if len(body) > 140:
                subject = body[0:137] + "..."
            else:
                subject = body
        self.subject = subject
        self.read = False
        self.read_date = 0
        
    def mark_read(self):
        self.read = True
        if not self.read_date:
            self.read_date = time.time()
        self.put()
        
    def get_message(self):
        return {
            "subject": self.subject,
            "body": self.body
        }
        
    def is_read(self):
        return self.read
"""