const path = require('path');
let { mailgunConf } = require(path.resolve(process.cwd(), './config.js'));
var mailgun = require('mailgun-js')(mailgunConf);
var data = {
  from: 'Aidan Nichol <aidan@mg.nicholware.co.uk>',
  to: 'aidan@nicholware.co.uk',
  //   cc: 'baz@example.com',
  //   bcc: 'bar@example.com',
  subject: 'Complex',
  text: 'Testing some Mailgun awesomness!',
  html:
    '<html>HTML version of the body<h2>Moffat</h2><p>Paraagraph cv.xcvxcvxcv ds dssd <b>bold</b></p></html>',
};

mailgun.messages().send(data, function(error, body) {
  console.log(body);
});
