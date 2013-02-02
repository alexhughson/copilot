/**
 * Created by PyCharm.
 * User: alex
 * Date: 4/8/12
 * Time: 9:46 PM
 * To change this template use File | Settings | File Templates.
 */

function $booking_list(business_id, user_id) {
    var $ret = ich.booking_list();
    hobbits_everywhere();
    return $ret;
    function hobbits_everywhere() {
        refresh();
        $ret.bind("changed", refresh);
    }
    function refresh() {
        var args = {business_id: business_id};
        if (user_id) args.user_id = user_id;
        Util.call_api("/api/schedule/get_bookings", args, got_bookings)
    }
    function got_bookings(bookings) {
        $ret.find(".bookings").html("");
        if(bookings.length > 0){
            $.each(bookings, function(i,e){
                var booking = $existing_booking(e, user_id?true:false);

                $ret.find(".bookings").append(booking);
            });
            $ret.show();
        } else {
            $ret.hide();
        }

    }
}

function $existing_booking(booking, for_contractor) {

    if ( for_contractor ){
        booking.approved = booking.approved_by_contractor;
        booking.other_party_approved = booking.approved_by_customer;
    }else {
        booking.approved = booking.approved_by_customer;
        booking.other_party_approved = booking.approved_by_contractor
    }

    var $ret = ich.existing_booking(booking);
    zero_to_sixty();
    return $ret;
    function zero_to_sixty() {
        $ret.find(".approve").click(function(e){
            e.preventDefault();
            approve();
        });
        $ret.find(".delete").click(function(e){
            e.preventDefault();
            delete_me();
        });
        Util.format_time_tags($ret);
        Util.format_date_tags($ret);
    }

    function approve() {
        Util.call_api("/api/schedule/approve_booking", {booking_id:booking.key}, function(ret) {
            $ret.trigger("changed",ret );
        })
    }

    function delete_me() {
        Util.call_api("/api/schedule/delete_booking", {booking_id:booking.key}, function (ret ) {
            $ret.remove();
        })
    }
}
