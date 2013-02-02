/**
 * Created with PyCharm.
 * User: alex
 * Date: 4/26/12
 * Time: 3:47 PM
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function (){
    Util.load_templates(BOOT)
});

function BOOT () {
    $("body").append($contact_us())
}