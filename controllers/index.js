'use strict';

var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();

    router.get('/', function (req, res) {
        res.render('index', model);
    });
    
    router.get('/api/messenger', function (req, res) {
        if (req.query['hub.verify_token'] === 'I_R_BABOON') {
            res.send(req.query['hub.challenge']);
        }
        res.send('Error, wrong validation token');
    });
    
};
