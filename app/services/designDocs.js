const ddoc = {
 bookings: {
   language: 'javascript',
   views: {
     walks: {
       map: function (doc) {
         if (doc.type === 'walk') emit(doc._id, doc);
       }
     },
     members: {
       map: function(doc) {
         if (doc.type === 'member') emit(doc._id, doc);
       }
     },
     accounts: {
       map: function(doc) {
         if (doc.type === 'account') emit(doc._id, doc);
       }
     },
   }
 }
};
export default ddoc;
