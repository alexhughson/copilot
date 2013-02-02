
if( !console ) {
        console = {
                log: function(){},
                dir: function(){}
        };
} 

if( !console.log ) console.log = function(){};
if( !console.dir ) console.dir = function(){};