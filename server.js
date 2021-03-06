 /******************************************************
 * PLEASE DO NOT EDIT THIS FILE
 * the verification process may break
 * ***************************************************/

'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var moment = require('moment');

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// Fill the Json response with data from the moment object.
function fillJson(jsonObj, moment, unixFormat, naturalFormat){
    jsonObj.unix = parseInt(moment.format(unixFormat));
    jsonObj.natural = moment.format(naturalFormat);
}

/*
* This route catch the param from the user.
* 1 : Try to parse it as a unix timestamp.
* 2 : Try to parse it as a natural format ('MMMM DD, YYYY')
*/
app.route('/:timestamp').get(function(req, res){
  var naturalFormat = 'MMMM DD, YYYY';
  var unixFormat = 'X';
  var userInput = req.params.timestamp;
  // Try to create a moment from a timestamp
  var resultFromTimeStamp = moment.unix(userInput);
  var jsonRes = { "unix": null, "natural": null};
  if(resultFromTimeStamp.isValid()){
    fillJson(jsonRes, resultFromTimeStamp, unixFormat, naturalFormat);
  }else{
    var resultFromNatural = moment(userInput, naturalFormat);
    if(resultFromNatural.isValid()){
      fillJson(jsonRes, resultFromNatural, unixFormat, naturalFormat);
    }
  }
  res.type('json').send(jsonRes);
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

var port = process.env.PORT | 8080;

app.listen(port, function () {
  console.log('Node.js listening on port ' + port);
});

