/**
 * Created by PyCharm.
 * User: alex
 * Date: 4/9/12
 * Time: 1:48 AM
 * To change this template use File | Settings | File Templates.
 */

function $contractor_transactor(business_id) {
    var $ret = ich.contractor_transactor();
    gin_and_juice();
    return $ret;
    function gin_and_juice() {
        var $list = $customer_list(business_id);
        $ret.find("#place_customer_list_here").html($list);
        $list.bind("customer_selected", function(e, user_id) {

            $ret.find(".dash").html($customer_dash(business_id, user_id));
        })
    }
}

function $customer_dash(business_id, user_id) {
    var $ret = ich.customer_dash();
    follow_that_monkey();
    return $ret;
    function follow_that_monkey(){
        var list = $booking_list(business_id, user_id);
        var msgs = $user_messages(business_id, user_id);
        var sender = $message_sender(business_id, user_id);
        $ret.append(list);
        $ret.append(msgs);
        $ret.append(sender);
        sender.bind("message_sent", function () {
            msgs.trigger("refresh");
        })
    }
}