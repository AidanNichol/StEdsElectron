
const margin = 30;

import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'printBuslists:report');
// import db from 'services/bookingsDB';

import XDate from 'xdate';
logit('env', process.env)

// import db from 'services/bookingsDB';
import {getBusBookings, getCarBookings, getWaitingList} from '../components/containers/buslists-container';

const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';


const getData = (doc, data, text, showNumber, colW)=>{
  if (data.length === 0)return 0;
  if (text.length > 0)doc.fontSize(12).text(text);
  doc.fontSize(12);
  data.forEach((bkng, i)=> {
    doc.font(normal).fontSize(12).text(`${showNumber ? i+' ':''}${bkng.name}`, {width: colW, continued: true})
    doc.font(italic).text(bkng.annotation||' ')
    // doc.fontSize(12).text(`${showNumber ? i+' ':''}${bkng.name}`, {continued: true, width: colW})
    // .fontSize(9).text(`${bkng.annotation||' '}`, {align: 'right', width: colW})
    doc.fontSize(12)
  })
  return data.length;
}

export function busListReport(doc, state){
  doc.addPage()
  const pWidth = doc.page.width;
  // const pHeight = doc.page.Height;
  const gutter = 20
  const nameH = doc.fontSize(14).currentLineHeight()
  // const detailH = doc.fontSize(12).currentLineHeight()
  const gapH = doc.fontSize(9).currentLineHeight()
  let x,y;
logit('state', state, process.env);
  doc.image(process.env.PWD+'/assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continued: true})
  doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Bus Lists', 30, 30+(20-nameH)/2, {align:'center'});
  doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-gapH)/2, {align: 'right'})
  x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  const noCols = state.walks.bookable.length;
  const colW = (pWidth-2*margin -(noCols-1)*gutter)/noCols;
  state.walks.bookable.forEach((walkId, i)=>{
    let x = margin+i*(colW+gutter);
    logit('x', {i, noCols,colW, margin, pWidth, gutter})
    doc.text('', x, 60, {width: colW});
    let walk = state.walks.list[walkId];
    let dispDate = new XDate(walk.walkDate).toString('dd MMM');
    let venue = walk.venue.replace(/\(.*\)/, '');
    logit(walkId, {x, walk, dispDate, venue})
    doc.font(bold)
    doc.fontSize(14).text(venue, {continued:true, bold:true, width: colW}).fontSize(9).text(` (${dispDate})`, {align:'right', width: colW});
    doc.font(normal).text(' ')
    const noBkngs = getData(doc, getBusBookings(state, walkId), '', false, colW);
    doc.fontSize(4).text(' ')
    x=doc.x; y=doc.y;
    doc.fontSize(12).text(`+${walk.capacity - noBkngs} available `, {align:'center', width: colW});
    let y2 = doc.y;
    doc.rectAnnotation(x,y-4, colW, y2-y+4)
    getData(doc, getCarBookings(state, walkId), '===== Cars =====', false, colW);
    getData(doc, getWaitingList(state, walkId), '= Waiting List =', true, colW);
  });


}
