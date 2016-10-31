import fs from 'fs'
import{membershipListReport} from '../src/reports/membershipListPDF2';
const data = JSON.parse(fs.readFileSync('/www/sites/StEdsElectron/temp.json'));
membershipListReport(data)
