curl -vX POST http://127.0.0.1:5984/_replicate \
     -d '{"source":"http://nicholware.com:5984/bookings","target":"bookings"}' \
     -H "Content-Type:application/json"
