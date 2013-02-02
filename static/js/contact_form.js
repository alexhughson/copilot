/**
 * Created by PyCharm.
 * User: alex
 * Date: 4/18/12
 * Time: 3:35 PM
 * To change this template use File | Settings | File Templates.
 */

function $contact_us() {
    var $ret = ich.contact_us();
    var visible;
    var email;
    monkey_jetpack();
    return $ret;
    function monkey_jetpack() {

        $ret.find(".interface").hide();


        $ret.find(".submit").click(send_message);
        $ret.find(".header").click(toggle_visible);
    }


    function send_message(){

        var msg = $ret.find(".contact_message").val();
        var email = $ret.find(".email").val();
        Util.call_api("/api/user/contact_us",{email:email, message: msg}, function () {
            $ret.find(".interface").slideUp("slow");
        });
    }

    function got_email(){
        email = true;
    }

    function toggle_visible(){
        $ret.find(".interface").slideToggle("slow");
    }

}
