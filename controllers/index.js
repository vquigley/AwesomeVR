'use strict';
var request = require('request');

var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();
    
    var verifyToken = "I_R_BABOON";
    var pageToken = "CAAG8bjhblYkBAM7HjhTS2KcmjaSlrlcce80adJ9JUFC4BpDKTCBMIC1i3vKhzF5ScbeZBtyWAD4lI76J24UZBF76mKNNsK4Bqt6oIFxoyCtxgUCCKGTzWO3htRCZAd4soZAVhYQyKD4V52MASPtwFDR13cjSu4b4SIqJfYyP5nWhfhwG5YKoRn9dFTYz6q2gJaLCTxGbugZDZD";
        
    router.get('/', function (req, res) {
        res.render('index', model);
    });
    
    router.get('/api/messenger', function (req, res) {
        if (req.query['hub.verify_token'] === verifyToken) {
            res.send(req.query['hub.challenge']);
        }
        res.send('Error, wrong validation token');
    });
    
    router.post('/api/messenger', function (req, res) {

        var messaging_events = req.body.entry[0].messaging;
        
        for (var i = 0; i < messaging_events.length; i++) {
            var event = messaging_events[i];
            var sender = event.sender.id;
            if (event.message && event.message.text) {
                var text = event.message.text;
                sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
            }
        }
        res.sendStatus(200);
    });  

    function sendTextMessage(sender, text) {
        var messageData = {text:text};
        
        request(
            {
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:pageToken},
                method: 'POST',
                json: {
                    recipient: {id:sender},
                    message: messageData,
                }
            }, 
            function(error, response, body) {
                if (error) {
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            }
        );
    }
};
