var User = (function () {
    var self = {};

    self.load_data = function (user_data) {

        for (var i in user_data.user) {
            self[i] = user_data.user[i];
        }
        if (user_data.business) {
            self.business = user_data.business;
        }

        if (self.business && self.business.length > 0) {
            self.change_selected_business(self.default_business, true);
        }

        self.bind_page_url_function();
    };

    self.bind_page_url_function = function(){
        for (var i in self.business) {
            if (self.business[i].page != false) {
                self.business[i].page["get_url_link"] = function () {
                    if (self.custom_url) {
                        return self.custom_url;
                    } else {
                        return "../listings/" + this.url;
                    }
                }
            }
        }
    }

    self.change_selected_business = function (key, no_update) {
        for (i = 0; i < self.business.length; i++) {
            self.business[i]["selected"] = false;
        }
        if (key) {
            index = Util.get_index_by_property(self.business, "key", key);
            if (!(index in self.business)) {
                index = 0;
            }
            self.business[ index ].selected = true;

        } else {
            self.business[0].selected = true;
        }

        if (!no_update) {
            ViewController.build_view("profile");
        }

    }
    
    self.get_selected_business = function(key){
        if(key == undefined || key == false){
            key = false
        } else {
            key = true
        }
        for(i = 0; i < self.business.length; i++){
            if(self.business[i]["selected"] == true){
                if(!key){
                    return self.business[i];
                } else {
                    return i;
                }
            }
        }
        return false;
    }

    self.add_or_replace_business = function (biz) {
        for (i = 0; i < self.business.length; i++) {
            if (self.business[i].key == biz.key) {
                self.business.splice(i, 1);
            }
        }

        self.business.push(biz);
        self.change_selected_business(biz.key, true);
    }
    return self;
})();
