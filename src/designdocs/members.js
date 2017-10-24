/* global emit */

module.exports = {
     _id: '_design/members',
      views: {
        byMobile: {
          map(doc) {
            if(doc.type == 'member' && doc.mobile) {
              var mobile = doc.mobile.replace(/[ -]+/, '');
              if (/^\d+$/.test(mobile)){
                var role = doc.admin ? 2 : (doc.committee ? 1 : 0 );
                emit(mobile, {firstName: doc.firstName, lastName: doc.lastName, role: role});                 
              }
            }
          }
        },
        allMailList: {
          map(doc) {
            if(doc.type == 'member' && doc.email && doc.email.indexOf('@')>0) {
              var role = doc.admin ? 2 : (doc.committee ? 1 : 0 );
              emit(doc.email, {firstName: doc.firstName, lastName: doc.lastName, role: role});
            }
          }
        },
        committeeMailList: {
          map(doc) {
            if(doc.type == 'member' && doc.committee && doc.email && doc.email.indexOf('@')>0) {
              emit(doc.email, {firstName: doc.firstName, lastName: doc.lastName});
            }
          }
        },
        testMailList: {
          map(doc) {
            if(doc.type == 'member' && doc.testMail && doc.email && doc.email.indexOf('@')>0) {
              emit(doc.email, {firstName: doc.firstName, lastName: doc.lastName});
            }
          }
        }
      }
 };



 // module.exports = ddoc;
