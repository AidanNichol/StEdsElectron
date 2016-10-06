// database settings for CouchDB
exports.db = 'http://127.0.0.1:5984/test';
// default settings
exports.emailType = 'nodemailer-sendgrid-transport';
exports.emailSettings = {
  service: 'sendgrid',
  auth: {
    user: 'AidanNichol',
    pass: 'XXXXXXX'
  }
};
