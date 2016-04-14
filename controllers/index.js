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
        console.log("MESSAGE POST: " + JSON.stringify(req.body));
        
        var messaging_events = req.body.entry[0].messaging;
        
        for (var i = 0; i < messaging_events.length; i++) {
            var event = messaging_events[i];
            var sender = event.sender.id;
  
            if (event.postback) {
              var text = JSON.stringify(event.postback);
              sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
              continue;
            }
            
            if (event.message && event.message.text) {
                var text = event.message.text;
                
                if (text === 'Generic') {
                    sendGenericMessage(sender);
                    continue;
                }
                
                sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
            }
        }
        res.sendStatus(200);
    });  

    function sendTextMessage(sender, text) {
        var messageData = {text:text};
        sendRequest(sender, messageData);
    }
    
    function sendGenericMessage(sender) {
      var messageData = {
          "attachment": {
          "type": "template",
          "payload": {
              "template_type": "generic",
              "elements": [{
              "title": "First card",
              "subtitle": "Element #1 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
              "buttons": [{
                  "type": "web_url",
                  "url": "https://www.messenger.com/",
                  "title": "Web url"
              }, {
                  "type": "postback",
                  "title": "Postback",
                  "payload": "Payload for first element in a generic bubble",
              }],
              },{
              "title": "Second card",
              "subtitle": "Element #2 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
              "buttons": [{
                  "type": "postback",
                  "title": "Postback",
                  "payload": "Payload for second element in a generic bubble",
              }],
              }]
          }
          }
      };
      
      sendRequest(sender, messageData);
    }
    
    function sendRequest(sender, messageData) {
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
