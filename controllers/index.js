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
    var payload = typeof event.postback.payload === 'string' ? JSON.parse(event.postback.payload) : event.postback.payload;
    console.log("Postback payload: " + JSON.stringify(payload));
    if (payload.type === "order") {
      return sendOrderConfirmation(sender, payload.value);
    }
    
    if (payload.type === "confirm") {
      return getUserInfo(sender, function(body) {
        return sendReceipt(sender, body.first_name + " " + body.last_name);
      });
    }
    
    if (payload.type === "cancel") {
      return sendTextMessage(sender, "Canceled order or " +  payload.value);
    }
    
    console.log("Unhandled");
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
    
    if (text.toLowerCase().includes("available")) {
      return sendAvailableWares(sender);
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
      };
    
    sendRequest(sender, messageData);
  }
  
  function sendOrderConfirmation(sender, productId) {
    console.log("sendOrderConfirmation");
    var messageData = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Please confirm you would like to order the " + productId + ":",
          "buttons":[
            {
              "type":"postback",
              "title":"Confirm",
              "payload":JSON.stringify({
                      'type':'confirm',
                      'value':productId
                  })
            },
            {
              "type":"postback",
              "title":"Cancel",
              "payload":JSON.stringify({
                      'type':'cancel',
                      'value':productId
                  })
            }
          ]
        }
      }
    };
    
    sendRequest(sender, messageData);
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
  
  function sendReceipt(sender, name) {
    var messageData = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"receipt",
          "recipient_name":name,
          "order_number":Math.random(),
          "currency":"USD",
          "payment_method":"Visa 2345",        
          "order_url":"http://awesome-vr.herokuapp.com/order?order_id=123456",
          "timestamp":"1428444852", 
          "elements":[
            {
              "title":"Oculus Rift",
              "subtitle":"Oculus is making it possible to experience anything, anywhere, through the power of virtual reality.",
              "quantity":1,
              "price":500,
              "currency":"USD",
              "image_url":"https://dbvc4uanumi2d.cloudfront.net/cdn/4.5.24/wp-content/themes/oculus/img/order/dk2-product.jpg"
            },
            {
              "title":"Classic Gray T-Shirt",
              "subtitle":"100% Soft and Luxurious Cotton",
              "quantity":1,
              "price":25,
              "currency":"USD",
              "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
            }
          ],
          "address":{
            "street_1":"1 Hacker Way",
            "street_2":"",
            "city":"Menlo Park",
            "postal_code":"94025",
            "state":"CA",
            "country":"US"
          },
          "summary":{
            "subtotal":525,
            "shipping_cost":5,
            "total_tax":70,
            "total_cost":600
          },
          "adjustments":[
            {
              "name":"New Customer Discount",
              "amount":20
            },
            {
              "name":"$10 Off Coupon",
              "amount":10
            }
          ]
        }
      }
    };
    
    sendRequest(sender, messageData);
  }
  
  function sendAvailableWares(sender) {
    var messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Oculus Rift",
              "subtitle": "Oculus is making it possible to experience anything, anywhere, through the power of virtual reality. Visit to learn more about Gear VR and Oculus Rift.",
              "image_url": "https://dbvc4uanumi2d.cloudfront.net/cdn/4.5.24/wp-content/themes/oculus/img/order/dk2-product.jpg",
              "buttons": [
                {
                  "type": "web_url",
                  "url": "https://www.oculus.com/",
                  "title": "Visit"
                }, 
                {
                  "type": "postback",
                  "title": "Order",
                  "payload": JSON.stringify({
                      'type':'order',
                      'value':'rift'
                  }),
                }
              ],
            },
            {
              "title": "HTC Vive",
              "subtitle": "Order Vive today and get Tilt Brush, Fantastic Contraption, and Job Simulator FREE.",
              "image_url": "https://www.htcvive.com/managed-assets/shared/desktop/vive/product-family-steamlogo.png",
              "buttons": [
                {
                  "type": "web_url",
                  "url": "https://www.htcvive.com/",
                  "title": "Visit"
                }, 
                {
                  "type": "postback",
                  "title": "Order",
                  "payload": JSON.stringify({
                      'type':'order',
                      'value':'vive'
                  }),
                }
              ],
            },
          ]
        }
      }
    };
    
    sendRequest(sender, messageData);
  }
  
  function sendRequest(sender, messageData) {
    console.log("sendRequest");
    console.log("sender: " + sender);
    console.log("messageData: " + JSON.stringify(messageData));
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
