import fs from 'fs'
import{membershipListReport} from '../src/reports/membershipListPDF2';
// const data = JSON.parse(fs.readFileSync('/www/sites/StEdsElectron/tests/memberList.json'));
const data = JSON.parse(fs.readFileSync('./tests/memberList.json'));
membershipListReport(data)
