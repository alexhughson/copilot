var Credit = (function () {
    var self = {};

    var credit_server = "http://localhost:8080/credit_api/";

    self.arg_map = {
        card_owner:"trnCardOwner",
        card_number:"trnCardNumber",
        card_cvd:"trnCardCvd",
        exp_month:"trnExpMonth",
        exp_year:"trnExpYear",
        email_address:"ordEmailAddress",
        phone_number:"ordPhoneNumber",
        address_1:"ordAddress1",
        address_2:"ordAddress2",
        city:"ordCity",
        province:"ordProvince",
        country:"ordCountry",
        postal_code:"ordPostalCode",
        profile_id:"profile_id"}; // What a hack, me

    self.arg_unmap = {};
    $.each(self.arg_map, function (i, e) {
        self.arg_unmap[e] = i;
    });

    self.get_cards = function (cb) {
        var method = "get_cards";

        $.post(credit_server + method, {}, function (res) {
            cb(res);
        });
    };

    /* I changed the names from the api names, because I am a dangerous criminal */
    self.add_card = function (card_properties, cb) {
        var method = "add_card";


        var request_data = {};
        var has_all_data = true;
        $.each(self.arg_map, function (i, e) {
            if (!card_properties[i]) {

                has_all_data = false;
            } else {
                request_data[e] = card_properties[i];
            }

        });

        var request_body = JSON.stringify(request_data);
        // Careful to make sure this never goes into the params part of the address
        $.post(credit_server + method, request_body, function (res) {
            cb(res);
        });
    };

    self.change_card = function (card_properties, cb) {
        return;

    }

    return self;
})();

function $credit_card(on_save) {

    var $ret = $(ich.cc_entry());
    bring_to_life();

    return $ret;

    function bring_to_life() {

        $ret.find(".submit").bind("click", function(e) {
            e.preventDefault();
            $ret.find("input").focusout().keyup();
            var first_error = $ret.find(".error:first");
            if(first_error.length == 0){
                submission_data = $ret.serializeObject();

                Credit.add_card(submission_data, on_save ? on_save : function () {
                });
            } else {
                $("html").animate(
                    {
                        scrollTop: $(".error:first").offset().top
                    }, 300);
            }

        });
    }
}

function $card_list() {

    var $ret = $(ich.cc_list());
    var card_elements = {};
    bring_to_life();

    return $ret;

    function bring_to_life() {
        $ret.refresh = refresh;
        refresh();
    }

    function refresh() {
        Credit.get_cards(draw_cards);
        function draw_cards(cards) {
            $.each(cards, function (i, e) {
                var card_el;
                if (card_elements[ e.key_name ]) {
                    card_el = card_elements[ e.key_name ];
                } else {
                    card_elements[e.key_name] = card_el = $card_data(card_changed);
                    $ret.append(card_el);
                }
                card_el.set_data(e);
            });
        }
    }

    // Called when a card in the list changes
    function card_changed() {
        refresh();

    }
}

function $card_data(on_change) {
    var $ret = $("<div></div>");

    var editing = false;
    $ret.set_data = function (info) {
        if (!editing) {
            draw(info);
        }

    };
    return $ret;

    function draw(data) {
        $ret.html(ich.cc_list_entry(data));
        $ret.find(".edit").click(function () {

            function done_change() {
                editing = false;
                on_change();
            }

            editing = true;
            var edit_form = $edit_form(data, done_change);
            $ret.html(edit_form);
        });


    }
}

function $edit_form(starting_data, on_save) {
    //render
    $ret = $credit_card(on_save);
    come_alive();

    return $ret;

    function come_alive() {
        // This right here, is REALLY BAD CODE
        // Incidentaly, it is where key_name gets transformed back into profile_id.
        // TODO: fix this god damn data flow
        var $hidden_profile_id = $("<input name='profile_id' type='hidden' value='" + starting_data.key_name + "' />");
        $ret.append($hidden_profile_id);

        // Remember that this data will be keyed in a database way.  I am dumb
        $.each(starting_data.last_save, function (i, e) {
            $ret.find("#" + Credit.arg_unmap[i]).val(e)
        });

        var error_fields = starting_data.change_response.errorFields.split(",");
        $.each(error_fields, function (i, e) {
            $ret.find("#" + Credit.arg_unmap[e]).parent().addClass("error");
        });


    }
}

function is_valid_card_number(num){
    //This function test if a number is theoretically valid.  Essentially, if the card number is even then you double
    //every odd number and subtract 9 if the result is greater than 10.  If the card is odd, you do the same but with
    //every even number.  If the card is valid then the result will be divisible by 10.  As a shortcut, just don't double
    //the last one and work backwards.
    var num_array = String(num).split("");
    var card_length = num_array.length;
    if(card_length > 19 || num == ""){
        return false;
    }
    var checksum_total = 0;
    var should_double = true;
    var this_num = 0;

    for(var i = 0; i < card_length; i++){
        should_double = !should_double;
        this_num = parseInt( num_array.pop() );
        if(should_double){
            this_num = this_num * 2;
            if(this_num > 9){
                this_num = this_num - 9;
            }
        }

        checksum_total += this_num;
    }

    if(checksum_total % 10 == 0){
        return true;
    } else {
        return false;
    }
}