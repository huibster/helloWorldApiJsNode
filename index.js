/*
* Primairy file for the API
*
*/

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// instantiate http server
var serverHttp = http.createServer(function(req,res){
  unifiedServer(req,res);
});

// start the server port 3000
serverHttp.listen(config.httpPort,function(){
  console.log('the server is listening op port '+config.httpPort+' now, in envoriment '+config.envName+ ' mode');
});

/*
// instantiate https server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var serverHttps = https.createServer(httpsServerOptions,function(req,res){
  unifiedServer(req,res);
});

// start the server port 3000
serverHttps.listen(config.httpsPort,function(){
  console.log('the server is listening op port '+config.httpsPort+' now, in envoriment '+config.envName+ ' mode');
});
*/



// server logic
var unifiedServer = function(req,res){

  // Get url
  var parsedUrl = url.parse(req.url,true);

  // Get path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$|/g,'');

  // get the query string as an object
  var queryStringObject = parsedUrl.query;

  // GEt HTTP method
  var method = req.method.toLowerCase();

  // get the header as a object
  var headers = req.headers

  // get the paylpad
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  // var ipClient = req.connection.remoteAddress;
  // console.log(ipClient);

  req.on('data',function(data){
    buffer += decoder.write(data);
  });

  req.on('end',function(){
    buffer += decoder.end();

    // handler check
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // construct data object
    var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
    };

    // rout the request
    chosenHandler(data,function(statusCode,payload){
      // use default status code or handler status statusCode
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      payload = typeof(payload) == 'object' ? payload : {};

      // convert oject to string
      var payloadString = JSON.stringify(payload);

      // return response
      res.setHeader('Content','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('return\n',statusCode,payloadString);
    });

  });
};

// define handlers
var handlers = {};

handlers.hello = function(data,callback){
    callback(200,{'message':'Hello back!'});
};

handlers.ping = function(data,callback){
    callback(200);
};

handlers.notFound = function(data,callback){
  callback(404);
};

// define request router
var router = {
  'ping' : handlers.ping,
  'hello' : handlers.hello,
};
