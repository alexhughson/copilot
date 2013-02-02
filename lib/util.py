import string
import random
import json

import time, re



def random_string(length):
    d = [random.choice(string.lowercase + string.digits) for x in xrange(length)]
    return "".join(d)

def strip_html(str):
    pattern = re.compile('<[^<]+?>')
    output = pattern.sub("", str)

    return output

def json_args(fn):
    """
    Takes a json body to a request, and puts it in the arguments
    BECAUSE WE CAN
    This absolutely needs to be done better, but fuck it for now
    """
    def dec(self, *args, **kwargs):
        try:
            loaded_args = json.loads(self.request.body)
            loaded_args = asciify_dict(loaded_args)
        except:
            # Sometimes, there will be nothing there
            # this will be a sad time, for all of us
            loaded_args = {}

        total_args = dict(kwargs.items() + loaded_args.items())

        return fn(self, *args, **total_args)

    return dec


def asciify_dict(inDict):
    ret = {}
    for key in inDict.keys():
        new_key = key.encode("ascii", "ignore")
        ret[new_key] = inDict[key]

    return ret


def gql_to_raw(query_obj):
    result = []
    for entry in query_obj:
        result.append(datastore_to_raw(entry))

    return result


## TODO: Make this work for JsonProperty.  Cool
def datastore_to_raw(datastore_obj):
    ret = db.to_dict( datastore_obj)
    for key in ret:
        if isinstance(ret[key], db.Key):
            ret[key] = str(ret[key])
        if isinstance(ret[key], users.User):
            ret[key] = ret[key].user_id()
    ret["key"] = str(datastore_obj.key())
    return ret

#guyz, this name is totes better
def model_to_dict(datastore_obj):
    return datastore_to_raw(datastore_obj)





def task_add( address, data=None, backend=None):
    """
    Wrapper to add a task to the task queue, so that there is one place to trigger use of backends

    """
    args = {
        "url": address,
        "payload": data,
        "method": "POST"
    }

    if backend and False:  ## During debugging, don't backend actually
        backend_address = backends.get_hostname(backend)
        args["target"] = backend_address

    taskqueue.add(**args)

def js_time():
    return int(time.time()*1000)


                               
