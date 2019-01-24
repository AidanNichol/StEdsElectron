#!/usr/bin/env node
const debug = require('debug');
let db = require('bookingsDB')();
const jetpack = require('fs-jetpack');
// let R = require('ramda');
const PDFDocument = require('pdfkit');
const { drawSVG } = require('../../reports/extract-svg-path');
const { creditsOwedReport } = require('../../reports/creditsReport2');

const Conf = require('conf');
import {WS, MS, AS, PS} from 'StEdsStore';

const settings = new Conf({
  // projectName: 'StEdsBookings',
  // configName: 'StEdsBooking',
  // cwd: '~/Documents/StEdwards',
});

console.log(settings.get());
console.log(settings.store);

debug.enable('*, -pouchdb*');
var logit = debug('updates');
logit.log = console.log.bind(console);
logit.debug = console.debug.bind(console);
console.log('logit enabled:', logit.enabled);

logit.debug('debug');
const fs = require('fs');
const XDate = require('xdate');

const home = process.env.HOME || process.env.HOMEPATH;
logit('home', home);

const init = async () => {
  logit('monitorLoading', 'start');
  await PS.init(db);
  await Promise.all([MS.init(db), AS.init(db), WS.init(db)]);
  logit('monitorLoading', 'loaded');
  const homefs = jetpack.cwd(home);
  let documents;
  if (homefs.exists('Documents')) documents = homefs.cwd('Documents');
  if (homefs.exists('My Documents')) documents = homefs.cwd('My Documents');
  const docs = documents
    .dir('StEdwards')
    .dir('PaymentSummary')
    .cwd();
  logit('testCreditsReport2');
  logit('', homefs.cwd(), documents.cwd(), docs);

  let docname = docs + '/testCreditsReport.pdf';
  logit('name', { docname });
  const marginH = 30;
  const marginV = 20;

  var doc = new PDFDocument({
    size: 'A4',
    margins: { top: marginV, bottom: marginV, left: marginH, right: marginH },
    autoFirstPage: false,
  });
  doc.pipe(fs.createWriteStream(docname));
  const normal = 'Times-Roman';
  const bold = 'Times-Bold';
  let title;
  doc.on('pageAdded', () => {
    const height14 = doc.fontSize(14).currentLineHeight();
    const height4 = doc.fontSize(4).currentLineHeight();
    drawSVG(doc, 48, 28, 0.2, 'St_EdwardsLogoSimple');
    doc
      .font(bold)
      .fontSize(14)
      .text(title, 30, marginV + (20 - height14) / 2, { align: 'center' });
    doc
      .font(normal)
      .fontSize(9)
      .text(new XDate().toString('yyyy-MM-dd HH:mm'), 30, marginV + (20 - height4) / 2, {
        align: 'right',
      });
  });
  title = 'St.Edwards Fellwalkers: Credits & Payments';
  doc.addPage();
  const yStart = creditsOwedReport(doc);
  // paymentsDueReport(doc, yStart);
  // // title = 'St.Edwards Fellwalkers: Credits Owed';
  doc.end();

  console.log('\n\n\ndone😀');
  // let oldest = {};
};

init().catch(error => {
  console.log(error.stack);
});
