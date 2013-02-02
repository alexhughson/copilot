var Schedule = (function() {
    var self = {};

    var api = "/api/schedule/";

    self.get_openings = function( business_id, starting_from, cb){
        $.post(api + "get_availability", JSON.stringify({business_id: business_id}), function ( res ) {
            cb(res);
        })
    };

    self.add_booking = function( business_id, start, end, cb) {
        $.post(api + "add_booking", JSON.stringify(arguments), function ( res ) {

        })

    };

    return self;
})();

function $appt_booker(business_id) {

    var $ret = ich.appt_booker();

    var current_day_booking = null;

    var starting_time = (new Date()).getTime();
    var starting_points = [];
    var last_opening = null;
    var errors = 0;
    bring_to_life();

    return $ret;

    function bring_to_life(){
        draw_openings();
        $ret.find(".sooner").click(earlier_availabilities);
        $ret.find(".later").click(later_availabilities);
        $ret.bind("book_appointment", book_appointment);
    }

    function book_appointment(e){
        e.stopPropagation();
        var $zoom = $ret.find(".zoom_booker");
        var new_booking = {};
        var start_time = $.timePicker($zoom.find(".start_time")).getTime();
        var end_time = $.timePicker($zoom.find(".end_time")).getTime();
        new_booking.start = Util.copy_time_from_date(current_day_booking,start_time).getTime();
        new_booking.end = Util.copy_time_from_date(current_day_booking, end_time).getTime();
        new_booking.business_id = business_id;
        $.post("/api/schedule/add_booking",JSON.stringify(new_booking), function (ret) {
            // OH GOD YOU HAVE CREATED A BOOKING AND I AM IN SO DEEP
            // SET UI TO SAY ONE EXISTS
            // PROPAGATE AN EXCITING NEW EVENT
            $ret.trigger("new_booking", ret);
            draw_openings();
        })
    }

    function earlier_availabilities(){
        if (starting_points.length > 0 ) {
            starting_time = starting_points.pop();
            draw_openings();
        }
    }
    function later_availabilities() {
        starting_points.push(starting_time);
        starting_time += 7*ONE_DAY;
        starting_time -= new Date(starting_time).getDay() * ONE_DAY;
        var TO_MIDNIGHT = new Date(starting_time);
        TO_MIDNIGHT.setHours(0,0,0,0);
        starting_time = TO_MIDNIGHT.getTime();
        draw_openings();
    }

    function draw_openings() {
        throb_mode();

        var now = new Date(starting_time);

        var until_when = new Date(now);
        until_when.setHours(0,0,0,0);

        var until_when_ms = until_when.getTime() + ((6 - until_when.getDay()) * ONE_DAY);
        Util.call_api("/api/schedule/get_availability",{business_id:business_id,starting:starting_time,until:until_when_ms},got_availabilities);

    }

    function got_availabilities(schedule) {
        if ( schedule.length == 0 ) {
            errors++;
            if(errors > 2){
                error_mode();
            } else {

                later_availabilities();
            }
            return;
        }
        var section = $ret.find(".avb");
        section.html("");

        var days = [];
        for(var i = 0; i < 7; i++){
            days[i] = {appointments: new Array()};
        }

        $.each(schedule, function(i, appointment) {

            var day_of_week = new Date(appointment.start).getDay();

            days[day_of_week].appointments.push({start_time: undefined, end_time: undefined});
            days[day_of_week].appointments[ days[day_of_week].appointments.length - 1].start_time = new Date(appointment.start);
            days[day_of_week].appointments[ days[day_of_week].appointments.length - 1].end_time = new Date(appointment.end);

        });

        //Get the text for the week
        var days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var months = ['January','February','March','April','May','June','July', 'August','September','October','November','December'];
        var day_of_week = new Date(starting_time);
        var start_month, start_day, end_month, end_day;

        day_of_week.setTime(day_of_week.getTime() - (day_of_week.getDay() * 24 * 60 * 60 * 1000));
        start_month = months[day_of_week.getMonth()];
        start_day = day_of_week.getDate();

        day_of_week.setTime(day_of_week.getTime() + 7 * 24 * 60 * 60 * 1000);
        end_month = months[day_of_week.getMonth()];
        end_day = day_of_week.getDate();

        var week_text = start_month + " " + start_day + " to ";
        if(start_month != end_month){
            week_text += end_month + " ";
        }
        week_text += end_day;
        $ret.find("#week_date").text(week_text);
        //Place the text

        $.each(days, function(i, day){
             days[i].day = days_of_week[i];
        });

        var pass_obj = {days: days};
        var $schedule = ich.weekly_schedule(pass_obj);

        Util.format_time_tags($schedule);

        $schedule.find(".scheduler_day_appointment").bind("click", function(e){
            //Storing data in the HTML, whatup TODO remove this
            time_book_mode(
               {
                   start: parseInt($(this).attr("start_time")),
                   end: parseInt($(this).attr("end_time"))
               }
           );
        });
        section.append( $schedule );

        find_mode();

    }

    function $timeslot(data) {
        var rendery = {}
        rendery.start = (new Date(data.start)).toString();
        rendery.end = (new Date(data.end)).toString();
        var $el = ich.timeslot(rendery);
        $el.click(function(){
            time_book_mode(data);
        });

        return $el;
    }

    function time_book_mode( which_slot ) {

        current_day_booking = new Date(which_slot.start);
        book_mode();
        var $zoom = $ret.find(".zoom_booker");

        var day_string = Util.format_date(new Date(which_slot.start), true);
        $zoom.find(".day").html(day_string);
        var timepicker_opts = {
            startTime : new Date(which_slot.start),
            endTime: new Date(which_slot.end),
            show24Hours : false,
            step: 15
        };
        $zoom.find(".start_time").timePicker(timepicker_opts);
        $zoom.find(".end_time").timePicker(timepicker_opts);
        // TODO: Make this set based on a default duration
        $.timePicker($zoom.find(".start_time")).setTime(new Date(which_slot.start));
        $.timePicker($zoom.find(".end_time")).setTime(new Date(which_slot.end));
    }

    function throb_mode() {
        $ret.find(".zoom_booker, .error").fadeOut();
        $ret.find(".find_date").fadeTo("normal", .5);
        $ret.find(".throbber").show();
    }
    function find_mode() {
        $ret.find(".throb, .zoom_booker, .error,").fadeOut();
        $ret.find(".find_date").stop(false, true).fadeIn().fadeTo("normal", 1);
    }
    function book_mode() {
        $("#silly_or_breaker").fadeOut();
        $("#send_message_button").text("Book appointment");
        $("#send_message_leader").text("Add a message");
        $ret.find(".zoom_booker").stop().fadeIn();
    }
    function error_mode() {
        $ret.find(".throb, .zoom_booker, .error, .find_date").fadeOut();
        $ret.find(".error").show();
    }
    function hide_erethang() {
        $ret.find(".throb, .zoom_booker, .error, .find_date").fadeOut();
    }
}

