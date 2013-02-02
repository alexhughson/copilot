CHECK_MESSAGES_FREQUENCY = 30 * 1000; //30 seconds
MESSAGE_CHECK_INCREASE_PERCENT = 1.01

function ready_for_custom(){
    Util.log_ajax(1);
    $.post("../ajax/get_current_user", {timezone:(new Date()).getTimezoneOffset()}, function(data) {
        user_data = $.parseJSON(data);
        User.load_data(user_data);

        Util.log_ajax(-1);
    });
    
    Util.log_ajax(1);
    $.post("../ajax/get_mustache_templates", {}, function(data) {
        data = $.parseJSON(data);
        for(var template_name in data){
            var template = data[template_name];
            if (template.error == undefined) {
                ich.addTemplate(template_name, template);
            }
        }
        Util.log_ajax(-1);
    });
    
    check_for_new_messages();
}

function all_data_loaded(){
    _kmq.push(['identify', User.key]);
l
    set_bindings();
    create_guiders();
    $("body").append($contact_us());
    $("#user_name").text(User.email);

    if(User.business.length > 0){
        if(location.hash != ""){
            _kmq.push(['record', 'Landed on page from hash', {hash: location.hash}]);
            ViewController.build_from_hash();
        } else {
            _kmq.push(['record', 'Landed on page with no hash']);
            ViewController.build_view("profile");
        }
    } else {
        /*
         Probably a new user, TODO make an actual check here
         */
        _kmq.push(['record', 'Landed with 0 businesses']);
        ViewController.build_view("new_business");
        guiders.show("new_user");
    }
    
}

function set_bindings(){
    window.addEventListener('hashchange', Util.change_hash, false);


    links = $("#top-bar-menu").children("li");
    links.find("a:contains(Overview)").bind("tapOrClick", function(e){
        e.preventDefault();
        ViewController.build_view("profile");
    });
}

function check_for_new_messages(){
/*    $.post("../ajax/get_message_count", {unread_only: true}, function(data){
    
        data = $.parseJSON(data);
        unread_messages = data.count;
        if (unread_messages > 0){
            $("#user_notifications").text("Private Messages (" + unread_messages + ")");
            $("#user_new_items").text(unread_messages).show();
        } else {
            $("#user_new_items").hide();
            $("#user_notifications").text("Private Messages");
        }
        if (data.error == undefined){
            window.setTimeout(check_for_new_messages, CHECK_MESSAGES_FREQUENCY);
        }
    });
    CHECK_MESSAGES_FREQUENCY = CHECK_MESSAGES_FREQUENCY * MESSAGE_CHECK_INCREASE_PERCENT;*/
}

