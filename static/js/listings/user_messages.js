
/**
 * Created by PyCharm.
 * User: alex
 * Date: 4/8/12
 * Time: 8:50 PM
 * To change this template use File | Settings | File Templates.
 */

function $user_messages(business_id, user_id) {
    var $ret = ich.user_messages();
    destroy_all_humans();
    return $ret;

    function destroy_all_humans() {
        get_messages();
        $ret.bind("refresh", get_messages)
    }

    function get_messages() {
        args = {business_id:business_id};
        if(user_id) args.user_id = user_id;
        Util.call_api("/api/contact/get_messages", {business_id: business_id, user_id: user_id}, render_messages);
    }
    function render_messages( all_messages ) {
        $ret.find(".messages").html("");
        if(all_messages.length > 0) {
            $.each(all_messages, function(i,e){
                var new_message = ich.communication(e);
                new_message.find("time").text(
                    function(){
                        var js_time = parseInt($(this).text());

                        js_time = new Date(js_time);

                        js_time.setTime( js_time.getTime() );//+ js_time.getTimezoneOffset() );

                        return Util.format_date(js_time);
                    }
                )
                $ret.find(".messages").append(new_message);
            });
            $ret.show();

        } else {
            $ret.hide();
        }
    }
}


function $message_sender(business_id, user_id){  // user_id sneakily implies that this is a contractor
    var $ret = ich.send_message();

    if(user_id){
        $ret.find("[hide_on='contractor']").hide();
    }
    unleash_the_virus();
    return $ret;
    function unleash_the_virus() {
        $ret.find("#send_message_button").click(send);
    }
    function send(e) {
        e.preventDefault();

        var message = $ret.find(".message").val();
        var args = {
            message: message,
            business_id: business_id
        };
        if ( user_id ) args.user_id = user_id;
        if(message != ""){
            Util.call_api("/api/contact/send",args, message_sent);
        }

        // TODO: Sending Notification
    }

    function message_sent(ret) {
        $ret.trigger("message_sent", ret);
        $ret.find(".message").val("");
    }
}