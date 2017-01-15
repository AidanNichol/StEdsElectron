import fs from 'fs'
import{paymentsSummaryReport} from '../app/reports/paymentsSummaryReport2';
// const data = JSON.parse(fs.readFileSync('/www/sites/StEdsElectron/tests/memberList.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsSummary2016-11-06T23.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsSummary2016-11-18T09.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsSummary2016-11-21T09.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsFrom2016-11-21T09.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsFrom2016-12-16T12.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsFrom2017-01-05T15.00.json'));
const data = JSON.parse(fs.readFileSync('./tests/paymentsFrom2017-01-09T19.03.json'));
paymentsSummaryReport(data)
