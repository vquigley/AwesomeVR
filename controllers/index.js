'use strict';

var IndexModel = require('../models/index');


module.exports = function (router) {

    var model = new IndexModel();
    
    router.get('/', function (req, res) {
        res.render('index', model);
    });
    
    var token = "I_R_BABOON";
    
    router.get('/api/messenger', function (req, res) {
        if (req.query['hub.verify_token'] === token) {
            res.send(req.query['hub.challenge']);
        }
        res.send('Error, wrong validation token');
    });
    
    router.post('/api/messenger', function (req, res) {
        console.log(JSON.stringify(req.body));
        var messaging_events = req.body.entry[0].messaging;
        for (i = 0; i < messaging_events.length; i++) {
            event = messaging_events[i];
            sender = event.sender.id;
            if (event.message && event.message.text) {
            text = event.message.text;
             sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
            }
        }
        res.sendStatus(200);
    });  

    function sendTextMessage(sender, text) {
        messageData = {
            text:text
        }
        request(
            {
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:token},
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
