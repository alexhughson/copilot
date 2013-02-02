var ONE_DAY = 24*60*60*1000;

var Util = (function(){
    var self = {}; 

    self.log_error = function(msg, code, show_error){
        if (msg == null){
            msg = "No message passed";
        }
        if (code == null){
            code = "INIT_NO_CODE";
        }
        if (show_error == null) {
            show_error = false;
        }
        error = {
            "message": msg,
            "code": code
        };
        $.post("../ajax/log_error", error);
    };
        

    
    self.show_message = function(title, msg, severity, timeout){
        var severity_level = Array();
        severity_level[0] = "success";
        severity_level[1] = "info";
        severity_level[2] = "warning";
        severity_level[3] = "error";
        if (severity == null) {
            severity = 1;
        }
        
        message_construction = {
            title: title,
            msg: msg,
            type: severity_level[severity]
        };
        new_message = ich.message(message_construction);
        $("#message_here")
            .append(new_message);
            
        if(timeout){
            window.setTimeout(function(){
                new_message.fadeOut(600, function(){
                    new_message.remove();
                });
            }, timeout);
        }
        
        mbe.init.message.big();
    };

    self.get_index_by_property = function(array, property, value){
        //Searches a multi-dimensional array for a properties value, returns first level index
        for(i=0; i<array.length; i++){

            if(array[i][property] == value){
                return i;
            }
        }
        return false;
    };

    self.log_ajax = function(direction){
        //For ajax calls at the start of a script.  Call twice per ajax request:
        //on initiation call with the argument 1, when you receive call again with
        //the argument -1.  Once all data is loaded will call function all_data_loaded()
        //which needs to exist on the custom script.
        if(this.counter == undefined){
            this.counter = 0;
        }

        this.counter = this.counter + direction;
        
        if (this.counter > 0){
            return false;
        }
        
        all_data_loaded();
    }
    self.change_hash = function(new_hash){
        //Call whenever you want to change the hash on the URL.  If called without
        //first updating the hash the program will assume that the hash was changed
        //by the user (back/forward buttons).  Function requires that a binding
        //is made     window.addEventListener('hashchange', Util.change_hash, false);
        if(typeof(new_hash) == "string"){
            self.old_hash = new_hash;
            location.hash = new_hash;
            _gaq.push(['_trackEvent', 'View Controller Change', new_hash, 'Requested']);
        } else {
            if(self.old_hash != location.hash.substr(1)){
                _gaq.push(['_trackEvent', 'View Controller Change', location.hash.substr(1), 'Back/Forward buttons']);
                ViewController.build_from_hash();
                self.old_hash = location.hash.substr(1);
            }
        }
    }
    
    self.build_google_map_url = function(location_arr){
        //BAD CODE I KNOW, TODO one google map interface.  MVP
        var zoom_arr = [0,3,4,12,16];
        
        zoom_level = 0;
        for(i = 0; i < location_arr.length; i++){
            if(location_arr[i] != "" && location_arr[i] != undefined){
                zoom_level++;
            }
        }
        
        var zoom_level = zoom_arr[zoom_level];
        location_string = location_arr.join("+");
        
        location_string = encodeURI(location_string);
        
        location_string = "http://maps.google.ca/maps?q=" + location_string + "&t=m&z=" + zoom_level;
        return location_string;
    }
    
    self.build_static_google_map = function(location_arr, width, height){
        var zoom_arr = [0,3,4,12,16];
        
        zoom_level = 0;
        for(i = 0; i < location_arr.length; i++){
            if(location_arr[i] != "" && location_arr[i] != undefined){
                zoom_level++;
            }
        }
        
        var zoom_level = zoom_arr[zoom_level];
        location_string = location_arr.join("+");
        
        location_string = encodeURI(location_string);

        
        if(zoom_level == zoom_arr[zoom_arr.length-1]){
            location_string +="&markers=color:blue%7Clabel:%7C" + location_string;
        }
        
        location_string = "http://maps.googleapis.com/maps/api/staticmap?center=" + location_string;
        
        location_string += "&zoom=" + zoom_level + "&sensor=false&maptype=roadmap&size=" + width + "x" + height;
        
        return location_string;
    };

    self.format_time = function(time){
        var output = "";
        var hours = parseInt(time.getHours());
        var minutes = time.getMinutes();
        var am_pm = "am";

        if(hours == 0){
            hours = 12;
        } else if (hours == 12) {
            am_pm = "pm";
        }else if (hours > 12) {
            hours = hours - 12;
            am_pm = "pm";
        }

        if(minutes < 10){
            minutes = "0" + minutes;
        }

        output = hours + ":" + minutes + " " + am_pm;
        return output;
	};

    self.format_date = function(date, no_time){

        var output = "";
        var days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var months = ['January','February','March','April','May','June','July', 'August','September','October','November','December'];
        if((new Date() - date) < 6*24*60*60*1000 && (new Date() - date) > 0 ){ //if less than 6 days ago
            output = days_of_week[date.getDay()];
        } else {
            output = months[date.getMonth()] + " " + date.getDate();
        }
        if(!no_time){
            output += " (" + self.format_time(date) + ")";
        }

        return output;
    }

    self.copy_time_from_date = function(start_date, copy_time_from) {
        start_date.setMilliseconds(copy_time_from.getMilliseconds());
        start_date.setMinutes(copy_time_from.getMinutes());
        start_date.setHours(copy_time_from.getHours());
        start_date.setSeconds(copy_time_from.getSeconds());
        return start_date;
    };

    self.call_api = function (method_addr, args, cb) {
        var body = JSON.stringify(args);
        $.post(method_addr, body, cb);
    };

    self.format_time_tags = function($elem){
        $elem.find("time").text(function(){
            var js_time = parseInt($(this).text());

            js_time = new Date(js_time);

            return Util.format_time(js_time);
        });
    };

    self.format_date_tags = function($elem){
        $elem.find("date").text(function(){
            var js_time = parseInt($(this).text());

            js_time = new Date(js_time);

            return Util.format_date(js_time, true);
        });
    };

    self.parse_phonenumber = function(number) {
        //TODO this should do something
        //Accepts x's for extensions
        return number;
    };

    self.format_phonenumber = function(number) {
        //TODO this should do something
        //Formats as (705) 300 4122
        return number;
    };

    self.load_templates = function(cb) {
        $.post("../ajax/get_mustache_templates", {}, function (data) {
            data = $.parseJSON(data);
            for (var template_name in data) {
                var template = data[template_name];
                if (template.error == undefined) {
                    ich.addTemplate(template_name, template);
                }
            }
            cb();
        });
    };
    
    return self;
})();

