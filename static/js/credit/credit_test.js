Boot.add(boot);

var UI = {};

function boot () {
        UI.card_list = $card_list();
        UI.entry_form = $credit_card(refresh_list);
        $("#new_card").html(UI.entry_form);
  //      Credit.get_cards( draw_cards );
  // 
//        $("#add_card").click( add_card );
        $("#your_cards").html(UI.card_list);
        

        
}

function refresh_list() {
        UI.card_list.refresh();
}


function draw_cards( card_list ) {

        $.each(card_list, function( i, e) {
                $("body").append( JSON.stringify( e ));
        });

}

function add_card() {
        var card_properties = $("#new_card").serializeObject();
        
        Credit.add_card(card_properties, function( res ) {

        });

}