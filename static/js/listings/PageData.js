var PageData = (function () {
    var self = {}

    self.load_data = function (data) {
        for (var key in data) {
            self[key] = data[key];
        }

        self.about_me_leader = self.about_me.split("\n")[0];
        self.about_business_leader = self.about_business.split("\n")[0];
        self.schedule_summary_leader = self.schedule_summary.split("\n")[0];

        self.about_me = self.about_me.split("\n").join("</p><p>");
        self.about_business = self.about_business.split("\n").join("</p><p>");
        self.schedule_summary = self.schedule_summary.split("\n").join("</p><p>");

        self.phone = Util.format_phonenumber(self.phone)

        self.business.page.get_url = function(){
            if(self.business.page.custom_url){
                return self.business.page.custom_url;
            } else {
                return "localhost:8080/listings/" + self.business.page.url
            }
        }
    }

    self.get_google_maps_link = function () {
        arr = [self.business.country, self.business.province, self.business.city, self.business.street];
        return Util.build_google_map_url(arr);
    }

    self.get_big_business_address_url = function () {
        arr = [self.business.country, self.business.province, self.business.city, self.business.street];
        return Util.build_static_google_map(arr, 600, 350);
    }
    self.get_small_business_address_url = function () {
        arr = [self.business.country, self.business.province, self.business.city, self.business.street];
        return Util.build_static_google_map(arr, 250, 250);
    }
    return self;
})();
