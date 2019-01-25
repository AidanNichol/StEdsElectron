import PDFDocument from 'pdfkit';
import { drawSVG } from './extract-svg-path';
import { busListReport } from './busListPDF';
import { paymentsDueReport } from './paymentsReport2';
import { creditsOwedReport } from './creditsReport2';
import { walkDayBookingSheet } from './walkDayBookingSheet';
import { shell } from 'electron';
import fs from 'fs';
import {format} from 'date-fns';

import Logit from 'logit';
var logit = Logit(__filename);

const home = process.env.HOME || process.env.HOMEPATH;
logit('home', home);
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

export function summaryReport(printFull) {
  let docs = home + '/Documents';
  if (!isDirSync(docs)) {
    docs = home + '/My Documents';
    if (!isDirSync(docs)) docs = home;
  }
  docs = docs + '/StEdwards';
  if (!isDirSync(docs)) {
    logit('want to mkdir', docs);
    fs.mkdirSync(docs);
  }
  let docname = docs + '/busSummary.pdf';
  logit('name', { docname });
  const marginH = 30;
  const marginV = 20;

  var doc = new PDFDocument({
    size: 'A4',
    margins: { top: marginV, bottom: marginV, left: marginH, right: marginH },
    autoFirstPage: false,
  });
  doc.pipe(fs.createWriteStream(docname));
  doc.on('pageAdded', () => {
    const height14 = doc.fontSize(14).currentLineHeight();
    const height4 = doc.fontSize(4).currentLineHeight();

    // doc.image(__dirname+'/../assets/steds-logo.jpg', 30, marginV, {fit: [20, 20], continued: true})
    drawSVG(doc, 48, 28, 0.2, 'St_EdwardsLogoSimple');
    doc
      .font(bold)
      .fontSize(14)
      .text(title, 30, marginV + (20 - height14) / 2, { align: 'center' });
    doc
      .font(normal)
      .fontSize(9)
      .text(format(new Date(), 'yyyy-MM-dd HH:mm'), 30, marginV + (20 - height4) / 2, {
        align: 'right',
      });
  });
  title = 'St.Edwards Fellwalkers: ' + (printFull ? 'Full List' : ' Walk Day List');
  walkDayBookingSheet(doc, printFull);
  var title = 'St.Edwards Fellwalkers: Bus Lists';
  busListReport(doc);
  title = 'St.Edwards Fellwalkers: Credits & Payments';
  const yStart = creditsOwedReport(doc);
  paymentsDueReport(doc, yStart);
  // // title = 'St.Edwards Fellwalkers: Credits Owed';
  doc.end();
  setTimeout(() => {
    logit('about to shell', docname);
    let ret = shell.openItem(docname);
    logit('shell says', ret);
  }, 2000);
  return docname.substr(home.length + 1);
}
