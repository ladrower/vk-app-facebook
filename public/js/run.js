$(document).ready(function(){
    (function(){
        var run = function()
        {
            VK.init(function() {
                // API initialization succeeded
                FB.init();
            }, function(){
                // API initialization failed
                try{
                    console.log('API initialization failed');
                } catch(e){}
                setTimeout(function()
                {
                    run();
                }, 100);
            });
        }
        
        try{
            run();
        } catch(e){
            alert("Unable to run application. "+e);
        }
    })();
});