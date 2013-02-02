/*
    a Control to make people login, and call a callback if they have some sort of email
As I was writing this, the code just kept getting awfuler and awfuler
Probably it will work though
TODO: Quick refactor, after it is tested
The google part can go, if need be
    */

function $user_login(offer_google) {
    var $ret = ich.user_login();
    var el_email = "";
    live();
    return $ret;

    function live(){
        throb(true);
        Util.call_api("/api/user/get_email", {}, function ( email ){
            throb(false);
            el_email = email.email;
            set_email_havingness(email.success);
            set_google_havingness(email.on_google);
        });

        $ret.find(".input_form input").enter(submit_email);
        $ret.find("#new_email_button").click(submit_email);
        $ret.bind("submit", submit_email);
        function submit_email(e) {
            if ( e ) e.preventDefault();
            var new_email = $ret.find(".input_form input").val();
            if (new_email.trim().length > 0) {
                throb(true);
                Util.call_api("/api/user/set_email", {email:new_email}, function (ret ) {
                    throb(false)
                    if ( ret && ret.success ) {
                        el_email = new_email;
                        set_email_havingness(true);


                    }
                })
            }
        }
    }
    function throb(really) {
        if( really ) {
            $ret.find(".input_form, .user_data, .yay_google, .google_login").hide();
            $ret.find(".throb").show();
        }else {
            $ret.find(".throb").hide();
        }
    }


    function set_email_havingness(how_haved){

        if ( how_haved ) {
            $ret.trigger("logged_in");  // TELL EVERYONE
            $ret.find(".input_form").hide();
            $ret.find(".user_data")
                .show();
            $ret.find(".user_email")
                .text(el_email);
        } else {
            $ret.find(".input_form").show();
            $ret.find(".user_data").hide();

        }
    }

    function set_google_havingness(how_haved) {
        if (!offer_google) return;
        if ( how_haved ) {
            $ret.find(".yay_google").show();
            $ret.find(".google_login").hide();
        } else {
            $ret.find(".yay_google").hide();
            $ret.find(".google_login")
                .show()
                .html($google_login_button());
        }
    }
}

function $google_login_button() {
    var $ret = ich.google_button();
    go_go_gadget();
    return $ret;
    function go_go_gadget() {
        $ret.find(".login_link").hide();
        var addr = window.location.pathname;
        Util.call_api("/api/user/get_google_login_url", {return_url:addr}, function (ret) {
            $ret.find(".login_link").attr("href", ret.url).show();
            $ret.find(".thinking").hide();
        } )
    }
}