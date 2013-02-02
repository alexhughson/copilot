import logging


def log_error(message = "No message passed", code = "INIT_NO_CODE"):
    """Returns a json standardized error response and creates a log of the error
    using GAE's logging service"""
    
    message = message
    code = code
    log_message = "[{0}] - {1}".format(code, message)
    logging.critical(log_message)
    return # booooooo
    err = Error()
    err.set_error(message, code)
    
    return {
        "message": message,
        "code": code
        }
        
"""class Error(db.Model):
    message = db.StringProperty()
    code = db.StringProperty()
    
    def set_error(self, message, code):
        self.message = message
        self.code = code
        self.put()
"""