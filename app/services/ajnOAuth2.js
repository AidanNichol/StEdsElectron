'use strict';

import hello from './hello';
var services = ['google', 'microsoft', 'facebook'],
    activeService, getProfileData;

var online = function(session) {
  var currentTime = (new Date()).getTime() / 1000;
  return session && session.access_token && session.expires > currentTime;
};
// function login(service){
//   hello(service).login({response_type: 'code', scope: 'email'}, function() {
//     getProfileData(service, 'callback')
//       .then(logit('login'))
//       .then(Actions.NewUserAuthenticated)
//       .catch(function(err) {logit('error', err);});
//     // console.debug('You are signed in to '+service);
//   });
// }
// function scloginDF (){Actions.NewUserAuthenticated({name: 'Daniel', provider: 'shortcut', email: 'dannyfoster27@icloud.com', thumbnail: ''}); }
// function scloginHP (){Actions.NewUserAuthenticated({name: 'Harry', provider: 'shortcut', email: 'harry@hogwarts.ac.uk', thumbnail: ''}); }
// function scloginTWN(){Actions.NewUserAuthenticated({name: 'Tim', provider: 'shortcut', email: 'tim@nicholware.co.uk', thumbnail: ''}); }
// function scloginSS (){Actions.NewUserAuthenticated({name: 'Sandy', provider: 'shortcut', email: 'sandysandy48@hotmail.co.uk', thumbnail: ''}); }
// function scloginJVD(){Actions.NewUserAuthenticated({name: 'Val', provider: 'shortcut', email: 'jimandval@jvdavis.plus.com', thumbnail: ''}); }
console.log('hello', hello);

hello.init(
  {
    google: '820492871633-gvn3s19kr3mr3suaamu8qra81csuhb2o.apps.googleusercontent.com',
    facebook: '1581467885435610',
    windows: '000000004414ED38', 
  },
  {
    redirect_uri: 'http://localhost:8080',
    oauth_proxy: 'https://auth-server.herokuapp.com/proxy'
  }
);
export default hello;
