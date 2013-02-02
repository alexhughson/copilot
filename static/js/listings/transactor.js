/**
 * Created by PyCharm.
 * User: alex
 * Date: 3/27/12
 * Time: 2:57 PM
 * To change this template use File | Settings | File Templates.
 */
/*
    The TRANSACTOR

    A control to allow customers to interact with contractors

    Untimately, it will be refactored out, as the components get better at being able to talk to each other
    for the moment though, it is go.

    */

function $TRANSACTOR(business_id) {
    var $ret = ich.transactor();
    zombify();
    return $ret;
    function zombify() {
        var login_control = $user_login();

        //login_control.bind("logged_in", we_gots_a_dude);
        $ret.append(login_control);

        var $sender = $message_sender(business_id);
        var $booker = $appt_booker(business_id);
        var $messages = $user_messages(business_id);
        var $bookings = $booking_list(business_id);

        $sender.bind("message_sent", function() {
            $messages.trigger("refresh");
        });
        $booker.bind("new_booking", function () {
            $bookings.trigger("refresh");
        });

        $ret.prepend($booker);
        $ret.append($sender);
        $ret.find("#send_message_button").bind("click", function(){
            login_control.triggerHandler("submit")
            $booker.triggerHandler("book_appointment");
        });

        $ret.append($messages);
        $ret.append($bookings);
    }
}