import PDFDocument from 'pdfkit'
import XDate from 'xdate';
import fs from 'fs'
import {getSubsStatus} from '../utilities/subsStatus';
// import Logit from '../factories/logit.js';
// var logit = Logit('color:yellow; background:black;', 'printPayments:report');
var logit =(...args)=>console.log(...args)
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
  logit('want to mkdir', docs)
  fs.mkdirSync(docs);
}
let docname = docs+'/membersList.pdf';
logit('name', {docname})

// import db from 'services/bookingsDB';

export function membershipListReport(members){
  const columns = [
    {atts: { align: 'left', width: 75}, field: 'name',      title: 'Name',   },
    {atts: { align: 'center', width: 20}, field: 'subs',      title: '£',   },
    //atts: { align: 'left',  {width: 10}, field: 'memberStatus',   title: 'St' ,   },
    {atts: { align: 'left', width: 135}, field: 'address',   title: 'Address' ,   },
    {atts: { align: 'left', width: 55}, field: 'phone',     title: 'Phone'   ,   },
    {atts: { align: 'right', width: 20}, field: 'memNo',     title: 'No'    ,gap: 5 },
    {atts: { align: 'left', width: 135}, field: 'email',     title: 'Email'   ,   },
    {atts: { align: 'left', width: 57}, field: 'mobile',    title: 'Mobile'  ,   },
    {atts: { align: 'center', width: 125}, field: 'nextOfKin', title: 'Next of Kin' , },
    {atts: {continued: false, align: 'center', width: 62}, field: 'medical',   title: 'Medical' , }
  ];
  const normal = 'Times-Roman';
  const bold = 'Times-Bold';
  const margin = 30;

  function showSubs(mem){
    const defAtts = { align: 'center', width: 20};
    const statusMap = {Member: '', HLM: 'hlm', Guest: 'gst', '?': ''};
    const subsMap = {OK:{fillColor: 'green'}, due: {fillColor: 'orange', font: bold}, late: {fillColor: 'red', font: bold}};
    let stat = statusMap[mem.memberStatus||'?'];
    if (stat !== '') return [stat, defAtts];

    let subs = getSubsStatus(mem);
    stat = `'${mem.subscription ? parseInt(mem.subscription)%100:16}`;
    return [stat, {...defAtts, ...subsMap[subs.status]}];
  }

  const factor = 1.14
  columns.forEach((col)=>{col.atts.width = col.atts.width*factor; })

  var doc = new PDFDocument({size: 'A4', layout: 'landscape', margins: {top:20, bottom: 20, left:margin, right: margin}, autoFirstPage: false});
  doc.pipe(fs.createWriteStream(docname) )


  logit('env', process.env)
  var currentPage = 0, pageCount = Math.ceil(members.length/16);
  const dFS = 9;
  // const nameH = 12.6, gapH = 8.1;
  const lineH = doc.fontSize(dFS).currentLineHeight();
  // const colW = pWidth/2 - margin - 20;
  const nameH = doc.fontSize(14).currentLineHeight()
  // const detailH = doc.fontSize(12).currentLineHeight()
  const gapH = doc.fontSize(9).currentLineHeight()
  let x, y, x1, y1, y2;

  const timestamp = new XDate().toString('yyyy-MM-dd HH:mm');

  doc.on('pageAdded', ()=>{
    currentPage += 1
    doc.image(process.env.PWD+'/assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continue: true})
    doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Payments Due', 30, 30+(20-nameH)/2, {align:'center'});
    doc.font(normal).fontSize(9).text(timestamp,30,40-gapH*1.0, {align: 'right'})
    doc.font(normal).fontSize(9).text(`page ${currentPage.toString()} of ${pageCount}`,30,40+gapH*0, {align: 'right'})
    doc.fontSize(dFS).text('', margin, 60);
    x=doc.x; y=doc.y;
    doc.font(bold);
    columns.forEach((col)=>{
      doc.text(col.title, x, y, col.atts)
      // logit('head', {x,y, col, w:doc.widthOfString(col.title)})
      x += col.atts.width + (col.gap||0);
    });
    doc.font(normal).fontSize(9).text('', margin, doc.y);
    // doc.underline(margin, doc.y+gapH*0.4, pWidth-2*margin, 0.1, {fillColor: 'red', strokeColor: 'green'})
    x=doc.x; y=doc.y;
    y1 = y; y2 = y;

  });

  doc.addPage();
  doc.font(normal)
  const pWidth = doc.page.width;
  const pHeight = doc.page.Height;

  // const subsMap = {ok:{'✓'}, due: '?', late: '✘'};
  let fmtMem = {};
  x1 = doc.x;
  y1 = doc.y;
  y2 = y1;
  members.forEach((mem,i)=>{
    if (i > 0 && i%16 === 0)doc.addPage();
    let [text, atts] = showSubs(mem);
    columns[1].atts = atts;
    fmtMem = {...mem,
      memNo: mem._id.substr(1),
      // name: {columns: [mem.lastName+", "+mem.firstName, {text: statusMap[mem.memberStatus||'?'], alignment: 'right', fontSize: 6 }]},
      name: mem.lastName+", "+mem.firstName,
      // memberStatus: statusMap[mem.memberStatus||'?'],
      // address: (mem.address||''),
      address: (mem.address||'').replace("\n", ", "),
      subs: text,};
    // columns.forEach((col)=>doc.text(fmtMem[col.field], col.atts));
    doc.underline(margin, y1+gapH*0.4, pWidth-2*margin, 0.1, {color: 'lightgrey', strokeWidth: 8, dash: 4})
    y1 += gapH;
    x=x1; y=y1; y2 = y+20;
    columns.forEach((col)=>{
      doc.fontSize(dFS).text(fmtMem[col.field], x, y, col.atts)
      y2 = Math.max(y2, doc.y)
      x += col.atts.width + (col.gap||0);
    });
    y1 = y2;
    y1 += gapH*0.3;
  });
  doc.end()
}
