
const margin = 30;

import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'printBuslists:report');
// import db from 'services/bookingsDB';
import XDate from 'xdate';
const _today = new XDate().toString('Wyyyy-MM-dd')
logit('env', process.env)
logit('dirname', __dirname)

// import db from 'services/bookingsDB';
import {getBusBookings, getCarBookings, getWaitingList} from '../components/containers/buslists-container';

const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';


const getData = (doc, data, text, showNumber, colW)=>{
  if (data.length === 0)return 0;
  if (text.length > 0)doc.fontSize(12).text(text);
  const y0 = doc.y;
  doc.fontSize(12);
  data.forEach((bkng, i)=> {
    const annotate = bkng.annotation && bkng.annotation !== '';
    doc.font(normal).fontSize(12).text(`${showNumber ? i+' ':''}${bkng.name}`, {width: colW, continued: annotate})
    // doc.font(italic).fillColor('blue').text(bkng.annotation||' ').fillColor('black')
    // doc.fontSize(12).text(`${showNumber ? i+' ':''}${bkng.name}`, {continued: true, width: colW})
    if (bkng.annotation && bkng.annotation !== '')
      doc.fontSize(9).font(italic).fillColor('blue').text(`${bkng.annotation||' '}`, {align: 'right', width: colW}).fillColor('black')
    doc.fontSize(12).text('')
  })
  logit ('height12', doc.fontSize(12).currentLineHeight())
  let y = doc.y
  logit('zzz', { y, av: (y- y0)/data.length})
  return data.length;
}

export function busListReport(doc, state){
  doc.on('pageAdded', ()=>{
    const height14 = doc.fontSize(14).currentLineHeight()
    const height4 = doc.fontSize(4).currentLineHeight()
    const height9 = doc.fontSize(9).currentLineHeight()

    doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continued: true})
    doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Bus Lists', 30, 30+(20-height14)/2, {align:'center'});
    doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-height9)/2, {align: 'right'})
    doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-height4)/2, {align: 'right'})
  });  doc.addPage()
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const gutter = 20
  const height14 = doc.fontSize(14).currentLineHeight()
  logit ('14 point', height14)
  var height12 = doc.fontSize(12).currentLineHeight()
  logit ('12 point', height12, height12*1.22, 13.392/height12)
  height12 *= 1.24;
  var height4 = doc.fontSize(4).currentLineHeight()
  logit ('4 point', height4, height4*1.19, 4.4/height4)
  height4 *= 1.24;
  var height9 = doc.fontSize(9).currentLineHeight()
  logit ('9 point', height9, height12*1.19, 13.2/height12)
  height9 *= 1.24;
  let x,y;
logit('state', {state, env: process.env, __dirname});
  x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  let noCols = state.walks.bookable.length;
  noCols = 4;
  const colW = (pWidth-2*margin -(noCols-1)*gutter)/noCols;
  let col = 0;
  state.walks.bookable.filter((walkId)=>walkId > _today).forEach((walkId, i)=>{
    let walk = state.walks.list[walkId];
    let dispDate = new XDate(walk.walkDate).toString('dd MMM');
    let venue = walk.venue.replace(/\(.*\)/, '');
    logit(walkId, {x, walk, dispDate, venue})
    let busBookings = getBusBookings(state, walkId);
    let carBookings = getCarBookings(state, walkId);
    let waitlist = getWaitingList(state, walkId);
    let noAnnotations = [...busBookings, ...carBookings, ...waitlist].reduce((tot, bkng)=>tot+(bkng.annotation && bkng.annotation!=='' ? 1 : 0), 0)
    logit ('noAnnotations', noAnnotations)
    let noLines = busBookings.length + 1 + (carBookings.length ? carBookings.length+1 : 0) + (waitlist.length ? waitlist.length+1 : 0)
    const spaceNeeded = (noLines * height12 + noAnnotations*6.408);
    const spaceRemaining = pHeight - height4 - 80 - margin;
    const colsNeeded = (spaceRemaining  < spaceNeeded ? 2 : 1);
    // position of start of print for this walk
    if (col + colsNeeded > noCols){
      doc.addPage();
      col = 0;
    }
    let x = margin+col*(colW+gutter);
    doc.text('', x, 60, {width: colW});
    logit('x', {i, y: doc.y, noCols,colW, margin, pWidth, gutter, noLines, colsNeeded, height14, height4, height12, spaceRemaining, spaceNeeded})
    doc.font(bold)
    doc.fontSize(14).text(venue, {continued:true, bold:true, width: colW}).fontSize(9).text(` (${dispDate})`, {align:'right', width: colW});
    doc.font(normal).text(' ')
    doc.text('', x, 80, {width: colW});
    logit('y after heading', doc.y, 60+height14 + height4 )
    const noBkngs = getData(doc, busBookings, '', false, colW);
    doc.fontSize(4).text(' ')
    logit('y after buslist', doc.y, 80+height4 + busBookings.length * height12)
    x=doc.x; y=doc.y;
    doc.fontSize(12).text(`+${walk.capacity - noBkngs} available `, {align:'center', width: colW});
    let y2 = doc.y;
    doc.rectAnnotation(x,y-4, colW, y2-y+4)
    logit('y after available', doc.y, 80 + height4 + (busBookings.length + 1) * height12, {y, y2})
    if (colsNeeded>1){
      col += 1
      let x = margin+col*(colW+gutter);
      doc.text('', x, 80, {width: colW});
    }
    getData(doc, carBookings, '===== Cars =====', false, colW);
    getData(doc, waitlist, '= Waiting List =', true, colW);
    col += 1;
  });


}
