# ~/github/couchdb-backup/couchdb-backup.sh -b -H nicholware.com -d bookings -f bookings.json
cat 2016-12-09prod.json | couchrestore --url http://127.0.0.1:5984 --db bookings
