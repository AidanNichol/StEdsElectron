import PDFDocument from 'pdfkit'
import {busListReport} from './busListPDF2'
import {paymentsDueReport} from './paymentsReport2'
import fs from 'fs'
import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'printPayments:report');

const home =process.env.HOME || process.env.HOMEPATH;
logit('home', home)
function isDirSync(aPath) {
  try {
    return fs.statSync(aPath).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
}
let docs = home+'/Documents';
if (!isDirSync(docs)) {
  docs = home+'/My Documents';
  if (!isDirSync(docs)) docs = home;
}
docs = docs+'/StEdwards'
if (!isDirSync(docs)) {
  fs.mkdirSync(docs);
}
let docname = docs+'/busSummary.pdf';
logit('name', {docname})
const margin = 30;
var doc = new PDFDocument({size: 'A4', margins: {top:20, bottom: 20, left:margin, right: margin}, autoFirstPage: false});
doc.pipe(fs.createWriteStream(docname) )

// import db from 'services/bookingsDB';

export function summaryReport(payload, state){

  busListReport(doc, state);
  paymentsDueReport(doc, state);
  doc.end();
}
