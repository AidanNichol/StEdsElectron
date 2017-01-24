# ~/github/couchdb-backup/couchdb-backup.sh -b -H nicholware.com -d bookings -f bookings.json
cat ./backup/2017-01-24prod.json | couchrestore --url http://127.0.0.1:5984 --db devbookings
