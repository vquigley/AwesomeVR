'use strict';

var request = require('request');
var IndexModel = require('../models/index');
var util = require('util');

module.exports = function (router) {
  router.get('/', serveIndexPage);  
  router.get('/api/messenger', verifyService); 
  router.post('/api/messenger', handleMessengerPost);  
  
  var model = new IndexModel();
  var verifyToken = "I_R_BABOON";
  var pageToken = "CAAG8bjhblYkBAM7HjhTS2KcmjaSlrlcce80adJ9JUFC4BpDKTCBMIC1i3vKhzF5ScbeZBtyWAD4lI76J24UZBF76mKNNsK4Bqt6oIFxoyCtxgUCCKGTzWO3htRCZAd4soZAVhYQyKD4V52MASPtwFDR13cjSu4b4SIqJfYyP5nWhfhwG5YKoRn9dFTYz6q2gJaLCTxGbugZDZD";
  
  function serveIndexPage(req, res) {
    res.render('index', model);
  }
  
  function verifyService(req, res) {
    if (req.query['hub.verify_token'] === verifyToken) {
        return res.send(req.query['hub.challenge']);
    }
    return res.send('Error, wrong validation token');
  }
  
  function handleMessengerPost(req, res) { 
    console.log("MESSAGE POST: " + JSON.stringify(req.body));
    
    var messaging_events = req.body.entry[0].messaging;
    
    for (var i = 0; i < messaging_events.length; i++) {
      var event = messaging_events[i];
      var sender = event.sender.id;

      if (event.postback) {
        handlePostBack(event, sender);
        continue;
      }
      
      if (event.message && event.message.text) {
        handleMessage(event, sender);
        continue;
      }
    }
    
    res.sendStatus(200);
  }
  
  function handlePostBack(event, sender) {
    var text = JSON.stringify(event.postback);
    sendTextMessage(sender, "Postback received: " + text.substring(0, 200));
  }

  function handleMessage(event, sender) {
    var text = event.message.text;
            
    if (text === 'Generic') {
      return sendGenericMessage(sender);
    }
    
    if (text.toLowerCase().includes("hello") ||
        text.toLowerCase().includes("hi")){
      return greet(sender);
    }
    
    if (text.toLowerCase().includes("picture")) {
      return showProfilePicture(sender);
    }
    
    if (text.toLowerCase().includes("favourite")) {
      return sendImage(sender, "http://www.nasa.gov/images/content/690958main_p1237a1.jpg");
    }
    
    sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
  }
  
  function greet(sender) {
    return getUserInfo(sender, function(body) {
      sendTextMessage(sender, util.format("Hello %s %s. How are you?", body.first_name, body.last_name));
    });
  }
  
  function showProfilePicture(sender) {
    return getUserInfo(sender, function(body) {
      //sendTextMessage(sender, body.first_name + " you have an interesting profile picture.");
      sendImage(sender, body.profile_pic);
    });
  }
  
  function sendImage(sender, img_url) {
    var messageData = {
        "attachment":{
          "type":"image",
          "payload":{
            "url":img_url
          }
        }
      }
    
    request({
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
  
  function getUserInfo(sender, callback) {
    var url = "https://graph.facebook.com/v2.6/"+ sender + "?fields=first_name,last_name,profile_pic&access_token=" + pageToken;
    console.log("User Info: " + url);
    request(
      {
        url: url,
        method: 'GET',
        json:true
      }, 
      function(error, response, body) {
        if (error) {
            return console.log('Error sending message: ', error);
        } else if (response.body.error) {
            return console.log('Error: ', response.body.error);
        }
        console.log(response);
        console.log(body);
        callback(body);
      }
    );
  }

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
          "elements": [
            {
              "title": "First card",
              "subtitle": "Element #1 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
              "buttons": [
                {
                  "type": "web_url",
                  "url": "https://www.messenger.com/",
                  "title": "Web url"
                }, 
                {
                  "type": "postback",
                  "title": "Postback",
                  "payload": "Payload for first element in a generic bubble",
                }
              ],
            },
            {
              "title": "Second card",
              "subtitle": "Element #2 of an hscroll",
              "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
              "buttons": [{
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for second element in a generic bubble",
              }],
            }
          ]
        }
      }
    };
    
    sendRequest(sender, messageData);
  }
  
  function sendRequest(sender, messageData) {
    request({
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
