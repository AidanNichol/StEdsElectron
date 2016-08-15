var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');
var http = require('http');
var PouchDB = require('pouchdb');
var appdb = require('express-pouchdb')({
  mode: 'fullCouchDB',
  overrideMode: {
    include: ['routes/fauxton']
  }
});
// when not specifying PouchDB as an argument to the main function, you
// need to specify it like this before requests are routed to ``app``
appdb.setPouchDB(PouchDB);

var proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true
});
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');

var config = require('./config.js');
var Lockit = require('lockit');

var app = express();
var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');
var fs = require('fs')

app.use(express.static(publicPath));
app.use(cookieParser());
app.use(cookieSession({
  secret: 'your secret here'
}));

var lockit = new Lockit(config);

app.use(lockit.router);
// var Signup = require('lockit-signup');
// var lockitUtils = require('lockit-utils');

// var db = lockitUtils.getDatabase(config);
// var adapter = require(db.adapter)(config);


// // create new Signup instance
// var signup = new Signup(config, adapter);

// // use signup.router with your app
// app.use(signup.router);
// // you now have all the routes like /login, /signup, etc.
// // and you can listen on events. For example 'signup'
// lockit.on('signup', function(user, res) {
//   console.log('a new user signed up');
//   res.send('Welcome!');   // set signup.handleResponse to 'false' for this to work
// });
var sendSPA = function (req, res) {
  res.type('html');
  res.send(fs.readFileSync(path.resolve(__dirname, 'public', 'index.html')).toString());
};

app.get('/bookings*', sendSPA);
app.get('/payments', sendSPA);
app.get('/buslists*', sendSPA);
app.get('/bulkadd*', sendSPA);
app.get('/walks*', sendSPA);
app.get('/membersList*', sendSPA);

// app.get('/message*', sendSPA);
app.get('/steds*', function (req, res) {
  res.type('html');
  res.send(fs.readFileSync(path.resolve(__dirname, 'public', 'index.html')).toString());
});


// app.use('/db', require('express-pouchdb')(PouchDB));
app.use('/db', appdb);

if (!isProduction) {

  var bundle = require('./server/bundle.js');
  bundle();
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://127.0.0.1:3001'
    });
  });
  // app.all('/socket.io*', function (req, res) {
  app.all('/sock*', function (req, res) {
    proxy.web(req, res, {
      target: 'http://127.0.0.1:3001'
    });
  });


  // proxy.on('error', function(e) {
  proxy.on('error', function() {
    // Just catch it
  });

  // We need to use basic HTTP service to proxy
  // websocket requests from webpack
  var server = http.createServer(app);

  server.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
  });

  // server.listen(port, function () {
  //   console.log('Server running on port ' + port);
  // });

} else {

  // And run the server
  // app.listen(port, function () {
  //   console.log('Server running on port ' + port);
  // });

}
app.listen(port, function () {
  console.log('Server running on port ' + port);
});
