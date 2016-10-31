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

function showSubs(mem){
  const statusMap = {Member: '', HLM: 'hlm', Guest: 'gst', '?': ''};
  const subsMap = {OK:{color: 'green'}, due: {color: 'orange', bold: true}, late: {color: 'red', bold: true}};
  let stat = statusMap[mem.memberStatus||'?'];
  if (stat !== '') return stat;
  let subs = getSubsStatus(mem);
  return {text: `'${mem.subscription ? parseInt(mem.subscription)%100:16}`,
  ...subsMap[subs.status]};
}
// import db from 'services/bookingsDB';

export function membershipListReport(members){
  const columns = [
    {atts: { align: 'left', width: 75}, field: 'name',      title: 'Name',   },
    {atts: { align: 'left', width: 10}, field: 'subs',      title: '£',   },
    //atts: { align: 'left',  {width: 10}, field: 'memberStatus',   title: 'St' ,   },
    {atts: { align: 'left', width: 135}, field: 'address',   title: 'Address' ,   },
    {atts: { align: 'left', width: 55}, field: 'phone',     title: 'Phone'   ,   },
    {atts: { align: 'right', width: 15}, field: 'memNo',     title: 'No'    , },
    {atts: { align: 'left', width: 135}, field: 'email',     title: 'Email'   ,   },
    {atts: { align: 'left', width: 57}, field: 'mobile',    title: 'Mobile'  ,   },
    {atts: { align: 'center', width: 125}, field: 'nextOfKin', title: 'Next of Kin' , },
    {atts: {continued: false, align: 'center', width: 62}, field: 'medical',   title: 'Medical' , }
  ];

  const margin = 30;
  var doc = new PDFDocument({size: 'A4', layout: 'landscape', margins: {top:20, bottom: 20, left:margin, right: margin}, autoFirstPage: false});
  doc.pipe(fs.createWriteStream(docname) )

  const normal = 'Times-Roman';
  const bold = 'Times-Bold';

  logit('env', process.env)
  doc.addPage();
  doc.font(normal)
  const pWidth = doc.page.width;
  const dFS = 9;
  // const pHeight = doc.page.Height;
  // const colW = pWidth/2 - margin - 20;
  const nameH = doc.fontSize(14).currentLineHeight()
  // const detailH = doc.fontSize(12).currentLineHeight()
  const gapH = doc.fontSize(9).currentLineHeight()
  var currentPage = 0, pageCount = 0;
  let x,y;
  const reqW = columns.reduce((tot, col)=>tot+col.atts.width, 0)
  const factor = (pWidth - 2*margin)/reqW
  logit('factor', {factor,pWidth, reqW})
  columns.forEach((col)=>{col.atts.width = col.atts.width*factor;

  })
  const timestamp = new XDate().toString('yyyy-MM-dd HH:mm');
  doc.on('pageAdded', ()=>{
    doc.image(process.env.PWD+'/assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continue: true})
    doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Payments Due', 30, 30+(20-nameH)/2, {align:'center'});
    doc.font(normal).fontSize(9).text(timestamp,30,30+(20-gapH)/2, {align: 'right'})
    doc.font(normal).fontSize(9).text(`page ${currentPage.toString()} of ${pageCount}`,30,30+(20-gapH), {align: 'right'})
    doc.fontSize(dFS).text('', margin, 60);
    x=doc.x; y=doc.y;

    columns.forEach((col)=>{
      doc.text(col.title, x, y, col.atts)
      // logit('head', {x,y, col, w:doc.widthOfString(col.title)})
      x += col.atts.width;
    });
    doc.fontSize(4).text('', margin, 60+gapH);
    x=doc.x; y=doc.y;
  });


  doc.addPage()

  // const subsMap = {ok:{'✓'}, due: '?', late: '✘'};
  let fmtMem = {};
  let x1 = doc.x;
  let y1 = doc.y;
  let y2 = y1;
  members.forEach((mem)=>{
    fmtMem = {...mem,
      memNo: mem._id.substr(1),
      // name: {columns: [mem.lastName+", "+mem.firstName, {text: statusMap[mem.memberStatus||'?'], alignment: 'right', fontSize: 6 }]},
      name: mem.lastName+", "+mem.firstName,
      // memberStatus: statusMap[mem.memberStatus||'?'],
      address: (mem.address||''),
      // address: (mem.address||'').replace("\n", ", "),
      subs: showSubs(mem),};
    // columns.forEach((col)=>doc.text(fmtMem[col.field], col.atts));
    x=x1; y=y1;
    columns.forEach((col)=>{
      doc.fontSize(dFS).text(fmtMem[col.field], x, y, col.atts)
      y2 = Math.max(y2, doc.y)
      x += col.atts.width;
    });
    y1 = y2;
  });
  doc.end()
}
