
function create_guiders(){
    guiders.createGuider({
        buttons: [{name: "Yes, please!", onclick: function(){
            guiders.next();
            _kmq.push(['record', 'New user tutorial opt in']);
        } }, {name: "No thanks", onclick: function(){
            guiders.hideAll();
            _kmq.push(['record', 'New user tutorial opt out']);
        }}],
        description: "Would you like a really quick tutorial on how everything works?",
        id: "new_user",
        next: "new_user_accept_tutorial",
        overlay: true,
        title: "Hey, it looks like you're new here!",
        onShow: function(){
            _kmq.push(['record', 'New user tutorial launched']);
        }
    });

    guiders.createGuider({
        buttons: [{name: "Sounds good!", onclick: function(){
            $("#create_edit_business").bind("tapOrClick", function(){
                window.setTimeout(function(){
                    guiders.show("main_guider_script_0");
                }, 250);
            });
            guiders.hideAll();
        }}],
        description: "The first thing we're going to do is get a bit of information about your business.  Fill out as much as you can then hit the 'Create Business button at the bottom.",
        id: "new_user_accept_tutorial",
        title: "Glad we can help!",
        overlay: true,
        width: 450
    });

    var main_guider_script = [
        {
            title: "Welcome to Copilot!",
            description: "We'll guide you through the basic overlay now.  There are about 8 popups and it should take about a minute."
        },
        {
            title: "Multiple business management",
            description: "Most people only ever have one business with us, but if you'd like to create another you're more than welcome.  Select which business you'd like to use here and add more using the button below.",
            attachTo: "#business_switcher",
            position: 3
        },
        {
            title: "Make changes to your business",
            description: "If you'd like to make any changes to your business, you can go back to the edit screen with this button.",
            attachTo: "#profile_button_edit_business",
            position: 2
        },
        {
            title: "Your own business website (you should start here!)",
            description: "We make a website for every business you create with us.  Set it up with the edit button below or check out who's visiting with the stats button.",
            attachTo: "#profile_button_manage_minisite",
            position: 2
        },
        {
            title: "Manage your schedule",
            description: "You've got a scheduler as part of your website.  Tell us when you're available and we'll schedule people in.",
            attachTo: "#profile_button_edit_schedule",
            position: 2
        },
        {
            title: "Want more customers?",
            description: "We'll publish it to make sure people can find it online, or advertise it in your city to make sure people know who you are.",
            attachTo: "#profile_advertise_section",
            position: 12
        },
        {
            title: "Lost?",
            description: "Just click here to go back to your profile.",
            attachTo: "#link_back_to_profile",
            position: 6
        },
        {
            title: "Miss something?",
            description: "Miss something?  This tutorial is always available from the help button in the top right.  Of course, don't hesitate to contact us at help@contractorcopilot.com at any time.",
            attachTo: "#help_link",
            position: 7
        }
    ];

    for(var i = 0; i < main_guider_script.length; i++){
        var this_guider = main_guider_script[i];
        this_guider.id = "main_guider_script_" + i;
        this_guider.overlay = true;
        if(i == main_guider_script.length - 1){
            this_guider.buttons = [{name: "Get started!", onclick: guiders.hideAll}]
        } else {
            this_guider.next = "main_guider_script_" + (i+1);
            this_guider.buttons = [{name: "Next"}];
        }
        guiders.createGuider(this_guider);
    }

    guiders.createGuider({
        attachTo: ("#business_switcher"),
        buttons: [{name: "Next"}],
        description: "Most people only ever have one business with us, but if you'd like to create another you're more than welcome.  Select which business you'd like to use here and add more using the button below.",
        id: "main_tutorial_start",
        title: "You've registered your business with us!",
        position: 2
    });

}