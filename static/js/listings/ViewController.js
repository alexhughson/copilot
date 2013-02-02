var ViewController = (function () {
    var self = {};
    var views = {
        home:build_home,
        about:build_about_me,
        business:build_about_business,
        schedule:build_schedule,
        contact:build_contact,
        pay: build_pay,
        thankyou: build_thank_you,
        cancel: build_cancel

    };

    self.clear = function () {
        $("#content_here").empty();
    };

    self.build_view = function (view) {
        if (view in views) {
            log_view();
            Util.change_hash(view);
            ViewController.clear();
            views[view]();
        }
    };

    self.place_view = function (constructed_view) {

        for (var i = 0; i <= constructed_view.length; i++) {
            $("#content_here").append($(constructed_view[i]));
        }
    };

    self.build_from_hash = function () {
        var view = location.hash.substr(1);
        if (view in views) {
            self.build_view(view);
        } else {
            self.build_view("default");
        }

    };

    function build_contact() {
        var contact = ich.full_contact(PageData);

        self.place_view([contact]);
    }

    function build_schedule() {
        var contact_col = ich.contact_column_small(PageData);

        var main_col = ich.schedule(PageData);

        main_col.find("#place_scheduler_here").append($TRANSACTOR(PageData.business.key));

        self.place_view([main_col, contact_col]);
    }

    function build_about_business() {
        var main_col = ich.about_business(PageData);
        var contact_col = ich.contact_column_small(PageData);

        self.place_view([main_col, contact_col]);
    }

    function build_about_me() {
        var main_col = ich.about_me(PageData);
        var contact_col = ich.contact_column_small(PageData);

        self.place_view([main_col, contact_col]);
    }

    function build_home() {
        var main_col = ich.home_splash(PageData);
        var contact_col = ich.contact_column_small(PageData);

        self.place_view([main_col, contact_col]);
    }

    function build_pay() {
        var page = ich.temporary_payment(PageData);
        page.find("#customer_name").bind("focusout", function(){
            var cx_name = $(this).val();
            var name_parts = cx_name.split(" ");
            if(name_parts.length < 2){
                $(this).parent().addClass("error");
                return false;
            }
            $(this).parent().removeClass("error");

            $("input[name='ap_fname']").val(name_parts[0]);
            $("input[name='ap_lname']").val(name_parts[1]);
        });

        page.find("#customer_email").bind("focusout", function(){
            if($(this).val() == ""){
                $(this).parent().addClass("error");
            } else {
                $(this).parent().removeClass("error");
            }
        });

        page.find("#customer_email_confirm").bind("focusout", function(){
            if($(this).val() != $("#customer_email").val()){
                $(this).parent().addClass("error");
            } else {
                $(this).parent().removeClass("error");
            }
        });

        page.find("#payment_amount").bind("focusout", function(){
            var amt = parseFloat($(this).val());
            if(isNaN(amt)){
                amt = 0;
            }
            if(amt < 10){
                $(this).parent().addClass("error");
            } else {
                $(this).parent().removeClass("error");
            }
        });

        self.place_view([page]);
        $("#payment_form").submit(function(e){
            $(this).find("input").focusout();
            if($(this).find(".error").length > 0){
                return false;
            } else {
                return true;
            }
        });
    }

    function build_book() {
        var list = $card_list();

        var entry = $credit_card(list.refresh);

        entry.find("input").bind("focusout", function(e){
            var val = $(this).val();
            if(val == ""){
                $(this).parent().addClass("error");
            }
        });

        entry.find("input").bind("keyup", function(e){
            var val = $(this).val();
            if(val != ""){
                $(this).parent().removeClass("error");
            }
        });

        entry.find("#card_number").unbind().bind("focusout", function(e){
            var val = $(this).val();
            if(!is_valid_card_number(val)){
                $(this).parent().addClass("error");
            }
        }).bind("keyup", function(){
            var val = $(this).val();
            if(is_valid_card_number(val)){
                $(this).parent().removeClass("error");
            }
        });

        entry.find("#exp_month").bind("focusout", function(){
            var val = parseInt( $(this).val() );
            if(val > 12 && !isNaN(val)){
                val = 12; //This can be improved
                $(this).val(val);
            }
        });

        entry.find("#exp_year", "#exp_month").bind("focusout", function(){
            var val = $(this).val();
            if(val != ""){
                if(val.length < 2){
                    val = "0" + val;
                }
                $(this).val(val);
            }
        });

        entry.find("#card_number, #phone_number", "#exp_month", "#exp_year", "#card_cvd").bind("keyup", function(e){
            $this = $(this);
            if($(this).val() != ""){
                $this.val( $this.val().match(/[0-9]/g).join("") );
            }
        });

        entry.find("#add_card")

        self.place_view([entry, list]);
    }

    function build_thank_you(){
        var main_col = ich.listing_payment_thank_you();
        var contact_col = ich.contact_column_small(PageData);

        self.place_view([main_col, contact_col]);
    }

    function build_cancel(){
        var main_col = ich.listing_payment_cancel();
        var contact_col = ich.contact_column_small(PageData);

        self.place_view([main_col, contact_col]);
    }

    return self;
})();
