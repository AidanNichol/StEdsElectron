import PDFDocument from 'pdfkit'
import {busListReport} from './busListPDF2'
import {paymentsDueReport} from './paymentsReport2'
import fs from 'fs'
import XDate from 'xdate';

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
const normal = 'Times-Roman';
const bold = 'Times-Bold';

// import db from 'services/bookingsDB';

export function summaryReport(payload, state){
  let docs = home+'/Documents';
  if (!isDirSync(docs)) {
    docs = home+'/My Documents';
    if (!isDirSync(docs)) docs = home;
  }
  docs = docs+'/StEdwards'
  if (!isDirSync(docs)) {
    logit('want to mkdir', docs)
    fs.mkdirSync(docs);
  }
  let docname = docs+'/busSummary.pdf';
  logit('name', {docname})
  const margin = 30;
  var doc = new PDFDocument({size: 'A4', margins: {top:20, bottom: 20, left:margin, right: margin}, autoFirstPage: false});
  doc.pipe(fs.createWriteStream(docname) )
  var title = 'St.Edwards Fellwalkers: Bus Lists';
  doc.on('pageAdded', ()=>{
    const height14 = doc.fontSize(14).currentLineHeight()
    const height4 = doc.fontSize(4).currentLineHeight()

    doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continued: true})
    doc.font(bold).fontSize(14).text(title, 30, 30+(20-height14)/2, {align:'center'});
    doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-height4)/2, {align: 'right'})
  });
  busListReport(doc, state);
  title = 'St.Edwards Fellwalkers: Payments Due';
  paymentsDueReport(doc, state);
  doc.end();
  return docname.substr(home.length+1);
}
