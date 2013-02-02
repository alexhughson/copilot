
import webapp2
from copilot_dev.templates import template
import data

import os, random

class Test(webapp2.RequestHandler):
        
    def get(self, page):
        if page == "load_test_data":
            load_test_data()

def load_test_data():
    test_data = {
        "PublicationMethods": [
                {
                "name": "YellowPages.ca",
                "requires": ["Name", "Business Name", "Email", "Address", "Phone Number", "Business Type", "GST/HST Number"],
                "url": "http://www.yellowpages.ca",
                "url_to_add": "http://360.yellowpages.ca/en/?utm_source=ypca&utm_medium=link&utm_campaign=folfooteren"
            },
                {
                "name": "CanPages.ca",
                "requires": ["Business Name", "Address", "Phone Number", "Business Type"],
                "url": "http://www.canpages.ca",
                "url_to_add": "http://www1.canpages.ca/olc/lookup.faces"
            },
                {
                "name": "ZipLeaf.ca",
                "requires": ["Name", "Business Name", "Email", "Address", "Phone Number", "Description", "Business Type"],
                "url": "http://www.zipleaf.ca",
                "url_to_add": "https://manage2.zipleaf.com/Create-Listing?source=ca"
            },
                {
                "name": "411.ca",
                "requires": ["Name", "Company Name", "Email", "Address", "Phone Number"],
                "url": "http://www.411.ca",
                "url_to_add": "http://www.411.ca/ov"
            },
                {
                "name": "CdnPages.ca",
                "requires": ["Business Name", "Address", "Phone Number", "Business Type"],
                "url": "http://www.cdnpages.ca",
                "url_to_    add": "http://www.cdnpages.ca/listing.aspx"
            },
                {
                "name": "Google Maps",
                "requires": ["Business Name", "Address", "Business Type"],
                "url": "http://maps.google.com",
                "url_to_add": "http://www.google.com/local/add/g?hl=en-US&gl=CA#phonelookup"
            }
        ]
    }

    for data_type in test_data:
        this_class = getattr(data, data_type)

        for entry in test_data[data_type]:
            new_entry = this_class()
            for key in entry:
                print key
                setattr(new_entry, key, entry[key])
            new_entry.put()