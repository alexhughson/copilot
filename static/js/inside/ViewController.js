var ViewController = (function(){ 
    var self = {}; 
    var views = {
        "default": build_profile,
        profile: build_profile,
        edit_business: build_edit_business,
        new_business: build_new_business,
        change_minisite : build_change_minisite,
        custom_url: build_custom_url,
        publication: build_publication,
        advertising: build_advertising,
        edit_schedule: build_edit_schedule,
        manage_customers: build_manage_customers,
        minisite_reporting: build_minisite_reporting
    };
    var container = $("#main_content").children(".wrapper");


    
    self.clear = function(){
        container.empty();
    }
    
    self.build_view = function(view){
        if (view in views) {
            Util.change_hash(view);
            ViewController.clear();
            views[view]();
        }
    }
    
    self.place_view = function(constructed_view){
        for (var i = 0; i <= constructed_view.length; i++){
            container.append($(constructed_view[i]));
        }
        mbe.init.block();
        mbe.init.form.all()
    }
    
    self.build_from_hash = function(){
        var view = location.hash.substr(1);
        if(view in views){
            self.build_view(view);
        } else {
            self.build_view("default");
        }
        
    };
    
    function build_change_minisite (){

        var pass_obj = {
            action: "get_data", 
            business: User.get_selected_business().key            
        }
        
        $.post("../ajax/change_minisite", pass_obj, function(data){
            data = $.parseJSON(data);
            if(data.error){
                Util.show_message("We're having some issues...", "We can't seem to pull up the details of your custom page.  A notification has been sent to our development team and we'll get this fixed as soon as we can.  We're very sorry for the delay!", 2, 20000);
                ViewController.build_view("profile")
            } else {
                //Data returned and verified.
                var minisite = data;
                if(minisite.url){
                    _gaq.push(['_trackEvent', 'Edit minisite', 'Existing']);
                } else {
                    _gaq.push(['_trackEvent', 'Edit minisite', 'New']);
                }
                var minisite_page = ich.change_minisite( minisite );

                //Run validation on the URL (alphanumeric only)
                minisite_page.find("#new_url").bind("keyup", function(e){
                    if( $(this).val().length > 0 ){
                        $(this).val( 
                            $(this).val().substr(0,50).split(" ").join("_").match(/\w/g).join("").toLowerCase()
                            );
                    }
                    minisite_page.find("#copy_url_here").text( $(this).val() );
                    
                    if(window.validate_request){
                        clearTimeout(validate_request);
                    }

                    validate_request = window.setTimeout( function(){
                        pass_obj = {
                            url: $("#new_url").val(),
                            business: User.get_selected_business().key
                        }
                        
                        $.post("../ajax/check_url_available", pass_obj, function(data){
                            data = $.parseJSON(data);
                            if(data.available){
                                $("#new_url, #url_available").removeClass("error");
                                $("#url_available").text("URL available");
                            } else {
                                $("#new_url, #url_available").addClass("error");
                                $("#url_available").text("URL not available");
                            }
                        });
                    }, 500);
                    
                    
                }).keyup();
                
                minisite_page.find("a[function=help]").each(function(){
                    $(this).bind("tapOrClick", function(e){
                        e.preventDefault();

                        elem = $(this).parent().siblings("div:first");
                        if(elem.is(":visible")){
                            elem.slideUp("500");
                        } else {
                            elem.slideDown("500");
                        }
                    });
                });
                
                minisite_page.find("textarea").bind("keyup", function(){
                    if($(this).val() == ""){
                        $(this).addClass("error");
                    } else {
                        $(this).removeClass("error");
                    }
                }).keyup();

                
                minisite_page.find("#change_minisite_submit").bind("tapOrClick", function(e){
                    if($(".error").length > 0){
                        _gaq.push(['_trackEvent', 'Error', 'Cant edit minisite due to lack of info']);
                        Util.show_message("You've got some errors on the page", "You'll have to fix the red text before submitting.", 2);
                    } else {
                        pass_obj = {
                            action: "save_data",
                            business: User.get_selected_business().key,
                            url: $("#new_url").val(),
                            about_me: $("#about_me textarea").val(),
                            about_business: $("#about_business textarea").val(),
                            schedule_summary: $("#schedule_summary textarea").val(),
                            email:  $("#email").val(),
                            phone: Util.parse_phonenumber($("#phone").val()),
                            enabled: $("[name='enable_disable']:checked").val()
                        };
                        var script = "../ajax/change_minisite";

                        $.post(script, pass_obj, function(data){
                            data = $.parseJSON(data);
                            if(data.error){
                                Util.show_message("Oh dear...", "We've had an error. It's been recorded and we've got our team on it.  We're very sorry.", 3, 5000);                        
                            } else {
                                Util.show_message("Done!", "Your minisite has been filled out with your information.", 0, 5000);
                                User.business[ User.get_selected_business(true) ].page = data;
                                User.bind_page_url_function();
                                ViewController.build_view("profile");
                            }
                        })
                    }
                });
                
                self.place_view( minisite_page );
            }
        });

    }
    
    function build_new_business (){
        var new_business_setup = ich.edit_business({
            business: false,
            first_business: (User.business.length == 0)
        });
        
        new_business_setup = bind_new_edit_business(new_business_setup);

        self.place_view( new_business_setup );
    }
    
    function build_edit_business(){
        var business_to_edit = User.get_selected_business();

        edit_business_setup = ich.edit_business({
            business: business_to_edit
        });
        
        edit_business_setup.find("#edit_business_address_country").children("option:contains(" + business_to_edit.country + ")").attr("selected", "selected");

        edit_business_setup = bind_new_edit_business(edit_business_setup);

        self.place_view(edit_business_setup);
    }
    
    function bind_new_edit_business(edit_business_setup){
        edit_business_setup.find("#edit_business_name").bind("keyup", function(event){
            short_name_holder = $("#edit_business_short_name");
            if (short_name_holder.attr("custom") == ""){
                short_name_holder.val($(this).val().substr(0,30));
            } else {
            }
        });
        
        edit_business_setup.find("#edit_business_short_name").bind("keyup", function(event){
            $(this).attr("custom", "true");
            $(this).val($(this).val().substr(0,20));
        });
        
        edit_business_setup.find("#address_details").find("select,input").bind("change keyup", function(){
            
            var country = $("#edit_business_address_country option").filter(":selected").text();
            
            var province = $("#edit_business_address_province").val();
            var city = $("#edit_business_address_city").val();
            var street = $("#edit_business_address_street").val();

            var location = [];
            
            if(country != undefined && country != "None specified"){
                location.push(country);
                $("#edit_business_address_country").removeClass("error");
            } else {
                $("#edit_business_address_country").addClass("error");
            }
            
            if(province != undefined && province != ""){
                location.push(province);
                $("#edit_business_address_province").removeClass("error");
            } else {
                $("#edit_business_address_province").addClass("error");
            }
            
            if(city != undefined && city != ""){
                location.push(city);
                $("#edit_business_address_city").removeClass("error");
            } else {
                $("#edit_business_address_city").addClass("error");
            }
            
            if(street != undefined && street != ""){
                location.push(street);
            }
            
            var image_string = Util.build_static_google_map(location, "300", "300");


            if(window.validate_request){
                clearTimeout(validate_request);
            }
            validate_request = window.setTimeout( function(){
                $("#address_image").attr("src", image_string);
            }, 500);
        }).keyup();
        
        //We're using a timeout here as we can't actually filter and set visibility
        //until we can check the values, and we can't do that until it's placed.
        window.setTimeout(function(){
            edit_business_setup.find("#address_details").find("select").change();
        }, 500);

        edit_business_setup.find("#create_edit_business").bind("tapOrClick", function(e){
            e.preventDefault();

            var num_errors = $(".error").length;
            if(num_errors > 0){
                Util.show_message("Whoops", "There's still a couple fields left to fill out.  Everything surrounded in red still needs to be filled out.", 1, 4000);
                return false;
            }
            var edit_business = {
                existing_key: $("#edit_business_key").val(),
                full_name: $("#edit_business_name").val(),
                short_name: $("#edit_business_short_name").val(),
                country: $("#edit_business_address_country").children("option:selected").text(),
                province: $("#edit_business_address_province").val(),
                city: $("#edit_business_address_city").val(),
                street: $("#edit_business_address_street").val(),
                does: $("#edit_business_does").val()
            };
            var script = "../ajax/edit_business";
            $.post(script, edit_business, function(data){
                data = $.parseJSON(data);
                if (data.error) {
                    if (data.error.code == "JAVASCRIPT_VALIDATION_FAIL"){
                        Util.show_message("Whoops, we've had some bad info", "Not all the required data made it across to our servers.  Could you make sure all the fields are filled out?", 2, 5000);
                    } else if (data.error.code == "AJAX_NO_USER"){
                        Util.show_message("Oh dear...", "It looks like you've been logged out because of inactivity.  Could you refresh the page and re-enter the information?", 3, 5000);
                    } else if (data.error.code == "ATTEMPT_EDIT_BUSINESS_NOT_OWNED"){
                        Util.show_message("This business isn't yours!", "Did you log in from the same computer as someone else?  If so, you've been logged out of this session.  Refresh to login as yourself then try again.", 3, 5000);
                    }

                } else {
                    Util.show_message("Everything worked!", "Your business was created successfully.", 0, 5000);
                    User.add_or_replace_business(data);
                    ViewController.build_view("profile");
                }
           });
           
        });
        
        return edit_business_setup;
    }
    
    function build_profile (){
        if(User.business.length == 0){
            ViewController.build_view("new_business");
            return false;
        }
        profile = ich.profile({
            businesses: User.business
        });

        profile.find("#create_business").bind("tapOrClick", function(e){
            e.preventDefault();
            ViewController.build_view("new_business");
        });
        
        profile.find("#business_switcher li a").bind("tapOrClick", function(e){
            e.preventDefault();
            var this_key = $(this).attr("business_key");
            User.change_selected_business(this_key);
        });
        
        profile.find("#change_default_business").bind("tapOrClick", function(e){
            e.preventDefault();
            var this_key = $(this).attr("business_key");
            $.post("../ajax/change_default_business", {new_business: this_key}, function(data){
                data = $.parseJSON(data);
                if(data.error){
                    Util.show_message("Arg, we messed up", "We're having some difficulty updating your default business right now.  We've fired off an email to our IT team and we'll have this fixed ASAP.", 2);
                } else {
                    Util.show_message("All done!", "Next time you log in this will be your default business.", 0, 5000);
                }
            });
        });
        
        self.place_view( profile );
    }
    
    function build_custom_url (){
        var page = ich.custom_domain_pitch( User.get_selected_business() );

        page.find("#submit_domain").bind("tapOrClick", function(){
            if ($("#domain_name").val().length < 3){
                Util.show_message("Your domain name is too short", "Sorry, your domain name needs to be at least 3 characters long.", 1, 7000);
                return false
            }
            var pass_obj = {
               business: $("#business").val(),
               domain: $("#domain_name").val() + $("#tld option:selected").val()
            };

            var script = "../ajax/request_custom_domain";

            $.post(script, pass_obj, function(data){
                data = $.parseJSON(data);
                if(data.error){
                } else {
                }
            });
            Util.show_message("Your custom site is on the way!", "We got your message and are working towards filling it now.  We'll be in contact within 24 hours.", 0, 5000);
            ViewController.build_view("profile");
        });
        self.place_view( page )
    }

    function build_advertising (){
        var build_obj = {
            user: User,
            business: User.get_selected_business()
        };

        var page = ich.advertising( build_obj );

        page.find("#submit").bind("tapOrClick", function(){
            var advertising_methods = new Array();
            var $checks = $("input[type='checkbox']:checked");
            if($checks.length != 0){
                for(i=0; i < $checks.length; i++){
                    advertising_methods.push($($checks[i]).attr("ad_method"));
                }
            }
            var budget_box=$("input[name='budget']:checked");
            if(budget_box.length == 0){
                budget="?? (unselected)"
            } else {
                budget = budget_box.val();

            }

            var pass_obj = {
                business: $("#business").val(),
                country: $("#edit_business_address_country option:selected").val(),
                province: $("#edit_business_address_province").val(),
                city: $("#edit_business_address_city").val(),
                street: $("#edit_business_address_street").val(),
                ad_methods: advertising_methods,
                budget: budget,
                notes: $("#ad_notes").val()
            };
            var script = "../ajax/request_advertising";
            $.post(script, pass_obj, function(data){
                data = $.parseJSON(data);
                if(data.error){
                } else {
                }
            });
            Util.show_message("We'll start putting together a quote now.", "We're finding the best advertising solution based on the information you gave us.  We'll be in contact within 24 hours.", 0, 5000);
            ViewController.build_view("profile");
        });

        self.place_view( page );

    }

    function build_publication() {
        $.post("../ajax/get_business_page", {page: User.get_selected_business().page.url}, function(data){
            data = $.parseJSON(data);
            build_obj = {
                user: User,
                business: User.get_selected_business()
            };
            build_obj.business.page = data;

            page = ich.publication( build_obj );

            page.find("#business_description").bind("keyup", function(){
                len = $(this).val().length;
                $("#description_length span").text(len);
            });

            page.find("#submit").bind("tapOrClick", function(){
                var pass_obj = {
                    "business": $("#business").val(),
                    "email": $("#email").val(),
                    "phone": $("#phone_number").val(),
                    "country": $("#edit_business_address_country option:selected").val(),
                    "province": $("#edit_business_address_province").val(),
                    "city": $("#edit_business_address_city").val(),
                    "street": $("#edit_business_address_street").val(),
                    "description": $("#business_description").val(),
                    "tax_number": $("#tax_number").val()
                };

                for(var key in pass_obj){
                    if (pass_obj[key] == "" && key != "tax_number"){
                        Util.show_message("Missing information", "For publication we need all information except tax number to be filled out.", 2, 7000);
                        return false;
                    }
                }
                if(pass_obj.description.length < 250){
                    Util.show_message("Not a long enough description", "Sorry, your business description has to be at least 250 characters in length.  That's just a paragraph or two.", 2, 7000);
                    return false;
                }
                var script = "../ajax/request_publication";
                $.post(script, pass_obj, function(data){
                    data = $.parseJSON(data);

                    if(data.error){
                    } else {
                    }
                });
                Util.show_message("We're gathering publication information now.", "We'll be in contact within 24 hours.", 0, 5000);
                ViewController.build_view("profile");
            });
            window.setTimeout(function(){
                $("#business_description").keyup();
            }, 500);
            self.place_view( page )
        });


    }

    function build_edit_schedule (){
        var text_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        //Fetch this
        Util.call_api("/api/schedule/get_schedule", {business_id: User.get_selected_business().key}, function(appointments){

            var pass_data = {
                days: []
            };

            for(var i = 0; i < text_days.length; i++){
                pass_data.days[i] = {
                    day: text_days[i],
                    appointments: []
                }
            }
            var start_of_day = (new Date());
            start_of_day = start_of_day.setUTCHours(0,0,0,0);

            for(var i in appointments){
                appointments[i].start_time = new Date(appointments[i].start_time);
                appointments[i].end_time = new Date(appointments[i].end_time);
                appointments[i].day = (appointments[i].start_time.getDay() +6) %7;
                pass_data.days[appointments[i].day].appointments.push(appointments[i]);
            }

            //Shift the week so that Sunday is first, replace numbers with text
            var shifted_days = pass_data.days.splice(0, 6);

            pass_data.days = pass_data.days.concat(shifted_days);

            //Change mustach template to have inside templates
            pass_data.extra_master_class="grid";
            pass_data.extra_day_class="column grid-2";

            var page = ich.edit_weekly_schedule(pass_data);

            //Fix time stamps
            page.find("time").text( function(){
                var js_time = parseInt($(this).text());

                js_time = new Date(js_time);

                js_time.setTime( js_time.getTime() );//+ js_time.getTimezoneOffset() );

                return Util.format_time(js_time);

            });

            //Bind clicks on existing slots to editing
            page.find("#scheduler_day_appointment").bind("tapOrClick", function(){

            });

            page.find("#change_appointment div div input").bind("keyup", function(e){
                //Auto correct the time
                var pressed_key = e.keyCode ? e.keyCode : e.which;
                //Only correct if we're not pressing backspace, and 1 fucks shit up
                if(pressed_key != 8 && $(this).val() != "1"){
                    //Get a breakdown of the time parts
                    var cur_val = $(this).val();
                    var time_parts = cur_val.match(/[0-9]{1,2}/g);
                    if(time_parts){
                        if(time_parts[0] == "0"){
                            time_parts[0] = 12;
                        }
                        //If no minutes part, add an empty part to the array to get a : in
                        if(time_parts.length == 1){
                            time_parts[1] = "";
                        }
                        //If too many numbers, get rid of em
                        if(time_parts.length > 2){
                            time_parts.splice(2, 3);
                        }

                        //Fix for 24hour
                        while(time_parts[0] > 12){
                            time_parts[0] = time_parts[0] - 12;
                            var $selector = $(this).siblings("div").children("select");
                            $selector.children("option:last").attr("selected", "selected");
                            $.uniform.update($selector);
                        }
                        //Helper function for midnight/noon
                        if(time_parts[0] == 12){
                            if($(this).siblings("div").find("option:selected").val() == 0){
                                //Am
                                $(this).siblings(".select_helper").text("(That's at night)").show();
                                if($(this).attr("id") == "end_time") {
                                    time_parts[0] = "11";
                                    time_parts[1] = "59";
                                    $selector = $(this).siblings("div").children("select");
                                    $selector.find("option:last").attr("selected", "selected");
                                    $.uniform.update($selector);
                                    Util.show_message("The day ends at 11:59!", "If you're available into the wee hours, make a slot from 12:00am to whenever you'd like.  (By the way, you should really try to get some sleep!)", 1, 5000);
                                }
                            } else {
                                $(this).siblings(".select_helper").text("(That's around noon)").show();
                            }
                        } else {
                            $(this).siblings(".select_helper").hide();
                        }

                        while(time_parts[1] >= 60){
                            time_parts[1] = 59;
                        }


                        $(this).val(time_parts.join(":"));
                    }
                }
            });
            page.find("select").bind("change", function(){
                page.find("#change_appointment div div input").keyup();
            });
            page.find(".scheduler_day_appointment").bind("tapOrClick", function(){
                $("#change_appointment").children("legend").text("Change appointment slot");
                var id = $(this).attr("appointment_id");
                var apt = appointments[ Util.get_index_by_property(appointments, "key", id) ];

                $("#start_time").val( Util.format_time( apt.start_time )).keyup();
                $("#end_time").val( Util.format_time( apt.end_time )).keyup();

                if(apt.start_time.getHours() > 11){
                    $("#start_time_am_pm").children("option:last").attr("selected", "selected");
                } else {
                    $("#start_time_am_pm").children("option:first").attr("selected", "selected");
                }

                if(apt.end_time.getHours() > 11){
                    $("#end_time_am_pm").children("option:last").attr("selected", "selected");

                } else {
                    $("#end_time_am_pm").children("option:first").attr("selected", "selected");
                }

                $("#day_selector").val(apt.day);
                $.uniform.update("#start_time_am_pm");
                $.uniform.update("#end_time_am_pm");
                $.uniform.update("#day_selector");
                $("#delete_button").parent().parent().fadeIn(100);
                $("#save_button").attr("active_apt", apt.key);
            });

            page.find("#save_button").bind("tapOrClick", function(){
                //Get time values for the start and end times
                var ONE_DAY = 24 * 60 * 60 * 1000;
                // Moving the start one day ahead, so that the results are actually positive, and to maybe fix the timezone things
                var start_of_the_day = (new Date()).setUTCHours(0,0,0,0)
                var start_time = new Date();
                //start_time.setTime(/*start_time.getTimezoneOffset()*/ * 60 * 1000);
                var time_string = $("#start_time").val();
                var time_parts = time_string.split(":");
                var hours = parseInt(time_parts[0]) + (12 * parseInt($("#start_time_am_pm").val()));
                if(hours % 12 == 0){
                    hours = hours - 12; //Correct for 12 being a stupid time of day
                }
                start_time.setHours(hours);
                start_time.setMinutes(time_parts[1]);

                var end_time = new Date();
                //end_time.setTime(end_time.getTimezoneOffset() * 60 * 1000);
                time_string = $("#end_time").val();
                time_parts = time_string.split(":");
                hours = parseInt(time_parts[0]) + (12 * parseInt($("#end_time_am_pm").val()));
                end_time.setHours(hours);
                end_time.setMinutes(time_parts[1]);

                if(isNaN(start_time) || isNaN(end_time)){
                    Util.show_message("We're having a bit of difficulty with this one", "Are you sure you wrote in valid dates?  They must be in the format hh:mm (2:30)", 2, 7000);
                    return false;
                }
                if(end_time < start_time){
                    //...do we REALLY have to check for this?
                    Util.show_message("We're having a bit of difficulty with this one", "Your times seem to be backwards, you can't have your end time earlier than your start time.", 2, 7000);
                    return false;
                }
                var key = $(this).attr("active_apt");
                var day = parseInt($("#day_selector").val());
                var start = start_time.getTime();
                var end = end_time.getTime();
                var offset = (day - (start_time.getDay() + 6) % 7) * ONE_DAY;
                start += offset;
                end += offset;

                var pass_obj = {
                    start: start,
                    end: end,
                    day: parseInt($("#day_selector").val()),
                    business_id: User.get_selected_business().key
                };
                if(key != "" && key != undefined){
                    pass_obj.opening_id = key;
                    Util.call_api("/api/schedule/edit_availability", pass_obj, function(){ViewController.build_view("edit_schedule");});
                    Util.show_message("Updated appointment", "", 0, 2000);
                } else {
                    Util.call_api("/api/schedule/add_availability", pass_obj, function(){ViewController.build_view("edit_schedule");});
                    Util.show_message("Saved new appointment", "", 0, 2000);
                }
            });

            page.find("#delete_button").bind("tapOrClick", function(){
                 var pass_obj = {
                     opening_id: $("#save_button").attr("active_apt")
                 };
                if(pass_obj.opening_id != "" && pass_obj.opening_id != undefined){
                    Util.call_api("/api/schedule/delete_availability", pass_obj, function(){
                        ViewController.build_view("edit_schedule");
                    });
                }
                Util.show_message("Deleted", "", 0, 2000);

            });

/*
            page.find("input[type='button']").bind("tapOrClick", function(){
                $("#change_appointment").children("legend").text("New appointment slot");
                $("#delete_button").parent().parent().fadeOut(100);
                $(this).find("input").val("");
                $("#start_time_am_pm, #end_time_am_pm").val(0);
                $.uniform.update("#start_time_am_pm");
                $.uniform.update("#end_time_am_pm");
            });*/



            window.setTimeout(function(){
                page.find("#delete_button").parent().parent().hide();
            }, 100);
            self.place_view(page);
        });
    }

    function build_manage_customers() {
        var business_id = User.get_selected_business().key;
        var new_view = $contractor_transactor(business_id);
        new_view.bind("no_customers", function () {

            guiders.createGuider({
                buttons: [{name: "I'll be back!", onclick: function(){
                    ViewController.build_view("profile");
                    guiders.hideAll();
                }}],
                description: "This screen givesl you a way to manage customer bookings and messages.  It doesn't look like anyone has attempted to contact you yet, so it's pretty blank.  You'll get an email when someone does try to contact you and this page will have tons of useful info at that point.",
                id: "manage_customers_no_custoemrs",
                title: "Looks like no one has contacted you online yet",
                overlay: true,
                width: 450
            }).show();


        });
        self.place_view(new_view);
    }

    function build_minisite_reporting(){
        $.post("/ajax/get_page_hits", {business: User.get_selected_business().key}, function(data){
            data = $.parseJSON(data);
            var build_obj = {
                data: {
                    day: {},
                    last_day: {},
                    week: {},
                    last_week: {},
                    month: {},
                    last_month: {}
                },
                text: {
                    day: {},
                    week: {},
                    month: {},
                },
                change: {
                    day: {},
                    week: {},
                    month: {},
                }
            };

            build_obj.data.day = data[0];
            build_obj.data.last_day = data[1];

            build_obj.change.day["visitors"] = build_obj.data.day.visitors - build_obj.data.last_day.visitors;
            build_obj.change.day["total"] = build_obj.data.day.total - build_obj.data.last_day.total;

            if(build_obj.change.day.visitors > 0){
                build_obj.text.day["visitor-change-direction"] = "+"
            }

            if(build_obj.change.day.total > 0){
                build_obj.text.day["total-change-direction"] = "+"
            }

            var visitors = 0;
            var pages = 0;
            for(var i = 0; i < 7; i++){
                visitors += data[i].visitors;
                pages += data[i].total;
            }
            build_obj.data.week["visitors"] = visitors;
            build_obj.data.week["total"] = pages;

            visitors = 0;
            pages = 0;
            for(var i = 7; i < 14; i++){
                visitors += data[i].visitors;
                pages += data[i].total;
            }
            build_obj.data.last_week["visitors"] = visitors;
            build_obj.data.last_week["total"] = pages;

            build_obj.change.week["visitors"] = build_obj.data.week.visitors - build_obj.data.last_week.visitors;
            build_obj.change.week["total"] = build_obj.data.week.total - build_obj.data.last_week.total;

            if(build_obj.change.week.visitors > 0){
                build_obj.text.week["visitor-change-direction"] = "+"
            }

            if(build_obj.change.week.total > 0){
                build_obj.text.week["total-change-direction"] = "+"
            }
            
            visitors = 0;
            pages = 0;
            for(var i = 0; i < 29; i++){
                visitors += data[i].visitors;
                pages += data[i].total;
            }
            build_obj.data.month["visitors"] = visitors;
            build_obj.data.month["total"] = pages;

            visitors = 0;
            pages = 0;
            for(var i = 29; i < 60; i++){
                visitors += data[i].visitors;
                pages += data[i].total;
            }
            build_obj.data.last_month["visitors"] = visitors;
            build_obj.data.last_month["total"] = pages;

            build_obj.change.month["visitors"] = build_obj.data.month.visitors - build_obj.data.last_month.visitors;
            build_obj.change.month["total"] = build_obj.data.month.total - build_obj.data.last_month.total;

            if(build_obj.change.month.visitors > 0){
                build_obj.text.month["visitor-change-direction"] = "+"
            }

            if(build_obj.change.month.total > 0){
                build_obj.text.month["total-change-direction"] = "+"
            }
            
            page = ich.minisite_reporting(build_obj);

            self.place_view(page);
            mbe.init.tab.vertical();

        });

    }

    return self;
    })();
