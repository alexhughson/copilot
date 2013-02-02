(function($) {

    // Serializes a form into an object
    // Field names are keys, values are values
    $.fn.serializeObject = function () {
        var serialized_arr = this.serializeArray();
        var ret = {};
        $.each(serialized_arr, function( i, e ) {
            ret[e.name] = e.value;
        });
        return ret;
    };

    // A bind for when enter is pressed.  Because using submit is for chumps
    $.fn.enter = function( callback ) {
        this.bind("keyup", function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if ( code == 13 ) {
                callback(e);
            }
        });
    };

})(jQuery);