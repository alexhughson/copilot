/**
 * Created by PyCharm.
 * User: alex
 * Date: 4/3/12
 * Time: 3:14 PM
 * To change this template use File | Settings | File Templates.
 */

function $customer_list(business_id) {
    var $ret = $("<ul class='menu customer_list' id='customer_list'></ul>");
    LIVE();
    return $ret;
    function LIVE () {
        Util.call_api("/api/contact/get_clients", {business_id: business_id}, got_client_list);
    }
    function got_client_list(clients){
        if ( clients.length == 0 ) {
            $ret.trigger("no_customers");
        }
        $ret.html("");
        var first = true;
        $.each(clients, function ( i,e) {
            var $client = ich.client(e);

            $client.click(function() {
                $ret.trigger("customer_selected", e.key);
                remove_selected_formatting();
                $client.children("a").addClass("selected");
            });

            $ret.append($client);
        });
        $ret.find("a:first").click();
    }
    function remove_selected_formatting(){
        $ret.find(".selected").removeClass("selected");
    }
}