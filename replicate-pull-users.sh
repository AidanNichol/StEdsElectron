curl -vX POST http://aidan:admin@127.0.0.1:5984/_replicate \
     -d '{"source":"http://aidan:Fw57kUbxCAjH@nicholware.com:5984/_users","target”:”_users"}' \
     -H "Content-Type:application/json"
