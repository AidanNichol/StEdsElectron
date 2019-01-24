/* global emit */
module.exports = {
     _id: '_design/members',
      views: {
        byMobile: {
          map(doc) {
            if(doc.type == 'member' && doc.mobile) {
              var mobile = doc.mobile.replace(/[ -]+/, '');
              if (/^\d+$/.test(mobile)){
                emit(mobile, {firstName: doc.firstName, lastName: doc.lastName, mobile: mobile, roles: doc.roles||''});                 
              }
            }
          }
        },
        allMailList: {
          map(doc) {
            if(doc.type == 'member' && doc.email && doc.email.indexOf('@')>0) {
              emit(doc.email, {firstName: doc.firstName, lastName: doc.lastName, roles: doc.roles||'', email:doc.email});
            }
          }
        },
        committeeMailList: {
          map(doc) {
            if ((doc.roles||'').toLowerCase().indexOf('committee')>-1){
              if(doc.type == 'member'  && doc.email && doc.email.indexOf('@')>0) {
                emit(doc.email, {firstName: doc.firstName, lastName: doc.lastName, email:doc.email});
              }
            }
          }
        },
        testMailList: {
          map(doc) {
            if ((doc.roles||'').toLowerCase().indexOf('tester')>-1){
              if(doc.type == 'member' && doc.email && doc.email.indexOf('@')>0) {
                emit(doc.email, {firstName: doc.firstName, lastName: doc.lastName, email:doc.email});
              }
            }
          }
        }
      }
 };



 // module.exports = ddoc;
