$(document).ready(function () {
    Util.log_ajax(1);
    Util.load_templates(function () {
        Util.log_ajax(-1);
    });

    Util.log_ajax(1);
    var url_parts = window.location.pathname.split("/");
    page = url_parts[url_parts.length - 1];
    $.post("../ajax/get_business_page", {page:page}, function (data) {
        data = $.parseJSON(data);
        PageData.load_data(data);
        Util.log_ajax(-1);
    });
});

function all_data_loaded() {
    $("body").append($contact_us())
    window.addEventListener('hashchange', Util.change_hash, false);
    if(location.hash != ""){
        ViewController.build_from_hash();
    } else {
        ViewController.build_view("home");
    }

}

function validate_form(){
    form =$("#new_card");

    fields = form.children(".field");

    fields.each(function(index, elem){
        validate_elem(elem);
    });
}

function log_view(){
    if(window.is_first_visit == undefined){
        is_first_visit = true;
    } else {
        is_first_visit = false;
    }

    var data_to_log = {
        hash: document.location.hash.substr(1),
        first_visit: is_first_visit,
        business: PageData.business.key
    };
    $.post("/ajax/log_listing_view", data_to_log);
}