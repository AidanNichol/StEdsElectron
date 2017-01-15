
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
const calcLineHeights = (doc)=>{
  const h14 = doc.fontSize(14).text( ' ', margin, 80).y - 80;
  const h12 = doc.fontSize(12).text( ' ', margin, 80).y - 80;
  const h9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  const h4 = doc.fontSize(4).text( ' ', margin, 80).y - 80;
  // const h9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  return [h14, h12, h9, h4]
}


export function busListReport(doc, state){
  doc.addPage()
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const gutter = 20
  const [height14, height12, height9, height4] = calcLineHeights(doc);
  // const height14 = doc.fontSize(14).currentLineHeight()

  const getData = (doc, data, text, showNumber, colW, x, y)=>{
    if (data.length === 0)return 0;
    if (text.length > 0){
      doc.fontSize(12).text(text, x, y)
      y += height12
    }

    data.forEach((bkng, i)=> {
      const annotate = bkng.annotation && bkng.annotation !== '';
      doc.font(normal).fontSize(12).text(`${showNumber ? i+' ':''}${bkng.name}`, x, y, {continue: annotate})
      if (annotate) {
        doc.fontSize(9).font(italic).fillColor('blue').text(`${bkng.annotation||' '}`, {align: 'right', width: colW}).fillColor('black')
      }
      y = doc.y;
    })


    return y;
  }

  let x,y;
  logit('state', {state, env: process.env, __dirname});
  x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  let noCols = state.walks.bookable.length;
  noCols = 4;
  const colW = (pWidth-2*margin -(noCols-1)*gutter)/noCols;
  let col = 0;
  state.walks.bookable.filter((walkId)=>walkId > _today).forEach((walkId)=>{
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
    let y = 60;
    doc.text('', x, 60, {width: colW});
    doc.font(bold).fontSize(14).text(venue, x, y, {width: colW})
      .fontSize(9).text(` (${dispDate})`, x, y, {align:'right', width: colW});
    y = 60 + height14;
    let noBkngs = busBookings.length;
    y = getData(doc, busBookings, '', false, colW, x, y);
    if (walk.capacity - noBkngs > 0){
      y += 3;
      doc.fontSize(12).text(`+${walk.capacity - noBkngs} available `, x, y, {align:'center', width: colW});
      doc.rectAnnotation(x,y-4, colW, height12+4)
      y += height12;
    }
    if (colsNeeded>1){
      col += 1
      x = margin+col*(colW+gutter);
      y = 60 + height14;
    }
    y = getData(doc, carBookings, '===== Cars =====', false, colW, x, y);
    y = getData(doc, waitlist, '= Waiting List =', true, colW, x, y);
    col += 1;
  });
  // doc.off('pageAdded')

}
