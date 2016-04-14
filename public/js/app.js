/*global requirejs:true*/
'use strict';


requirejs.config({
    mainConfigFile: 'js/requireConf.js'
});


require(['./main'], function () {

    var app = {
        initialize: function () {
        }
    };

    app.initialize();

});
