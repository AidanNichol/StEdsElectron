import fs from 'fs'
import{paymentsSummaryReport} from '../app/reports/paymentsSummaryReport';
// const data = JSON.parse(fs.readFileSync('/www/sites/StEdsElectron/tests/memberList.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsSummary2016-11-06T23.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsSummary2016-11-18T09.00.json'));
// const data = JSON.parse(fs.readFileSync('./tests/paymentsSummary2016-11-21T09.00.json'));
const data = JSON.parse(fs.readFileSync('./tests/paymentsFrom2016-11-21T09.00.json'));
paymentsSummaryReport(data)