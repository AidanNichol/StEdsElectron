const margin = 30;

import Logit from 'logit';
var logit = Logit(__filename);

import {format} from 'date-fns';
import {WS} from 'StEdsStore';
const _today = format(new Date(), "'W'yyyy-MM-dd");
logit('env', process.env);
logit('dirname', __dirname);

const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';
const calcLineHeights = doc => {
  const height14 = doc.fontSize(14).text(' ', margin, 80).y - 80;
  const height12 = doc.fontSize(12).text(' ', margin, 80).y - 80;
  const height9 = doc.fontSize(9).text(' ', margin, 80).y - 80;
  const height4 = doc.fontSize(4).text(' ', margin, 80).y - 80;
  // const height9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  return { height14, height12, height9, height4 };
};

export function busListReport(doc) {
  doc.addPage();
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const gutter = 20;
  const { height14, height12, height4, height9 } = calcLineHeights(doc);
  // const height14 = doc.fontSize(14).currentLineHeight()

  const getData = (doc, data, text, showNumber, colW, x, y) => {
    if (data.length === 0) return y;
    if (text.length > 0) {
      doc.fontSize(12).text(text, x, y);
      y += height12;
    }

    data.forEach((bkng, i) => {
      const annotate = bkng.annotation && bkng.annotation !== '';
      const number = showNumber ? i + 1 + ' ' : '';
      doc
        .fillColor('black')
        .font(normal)
        .fontSize(12);
      doc.text(`${number}${bkng.name}`, x, y, { lineBreak: !bkng.guest });
      if (bkng.guest) {
        let x1 = doc.x;
        let y1 = doc.y;
        logit(' guest x & y', { x, y, x1, y1 });
        doc.font(normal).fontSize(8);
        doc
          .circle(x1 + 6, y1 + 5, 5)
          .lineWidth(3)
          .fillOpacity(0.8);
        doc.fill('blue');
        doc.fillColor('white').text(`G`, x1 + 3, y1 + 2);
        doc
          .fontSize(12)
          .fillColor('black')
          .text('');
      }
      if (annotate) {
        doc
          .fontSize(9)
          .font(italic)
          .fillColor('blue')
          .text(bkng.annotation, { align: 'right', width: colW });
        y += height9;
      }
      doc.fontSize(12).fillColor('black');
      // y = doc.y;
      y += height12;
    });

    return y;
  };

  let x, y;
  logit('state', { WS: WS, env: process.env, __dirname });
  x = doc.x;
  y = doc.y;
  logit('x,y', { x, y });
  let noCols = WS.bookableWalksId.length;
  noCols = 4;
  const colW = (pWidth - 2 * margin - (noCols - 1) * gutter) / noCols;
  let col = 0;
  WS.bookableWalksId.filter(walkId => walkId >= _today).forEach(walkId => {
    let walk = WS.walks.get(walkId);
    let dispDate = format(new Date(walk.walkDate), 'dd MMM');
    let venue = walk.venue.replace(/\(.*\)/, '');
    logit(walkId, { walk, dispDate, venue });
    let busBookings = walk.busBookings;
    let carBookings = walk.carBookings;
    let waitlist = walk.waitingList;
    let noAnnotations = [...busBookings, ...carBookings, ...waitlist].reduce(
      (tot, bkng) => tot + (bkng.annotation && bkng.annotation !== '' ? 1 : 0),
      0,
    );
    logit('noAnnotations', noAnnotations);
    let noLines =
      busBookings.length +
      1 +
      (carBookings.length ? carBookings.length + 1 : 0) +
      (waitlist.length ? waitlist.length + 1 : 0);
    const spaceNeeded = noLines * height12 + noAnnotations * 6.408;
    const spaceRemaining = pHeight - height4 - 80 - margin;
    const colsNeeded = spaceRemaining < spaceNeeded ? 2 : 1;
    logit(
      'col calcs',
      busBookings.length,
      carBookings.length,
      waitlist.length,
      noLines,
      spaceNeeded,
      spaceRemaining,
      colsNeeded,
    );
    // position of start of print for this walk
    if (col + colsNeeded > noCols) {
      doc.addPage();
      col = 0;
    }
    let x = margin + col * (colW + gutter);
    let y = 60;
    doc.text('', x, 60, { width: colW });
    doc
      .font(bold)
      .fontSize(14)
      .text(venue, x, y, { width: colW })
      .fontSize(9)
      .text(` (${dispDate})`, x, y, { align: 'right', width: colW });
    y = 60 + height14;
    let noBkngs = busBookings.length;
    y = getData(doc, busBookings, '', false, colW, x, y);
    if (walk.capacity - noBkngs > 0) {
      y += 3;
      doc.fontSize(12).text(`+${walk.capacity - noBkngs} available `, x, y, {
        align: 'center',
        width: colW,
      });
      doc.rectAnnotation(x, y - 4, colW, height12 + 4);
      y += height12;
    }
    if (colsNeeded > 1) {
      col += 1;
      x = margin + col * (colW + gutter);
      y = 60 + height14;
    }
    y = getData(doc, carBookings, '===== Cars =====', false, colW, x, y);
    y = getData(doc, waitlist, '= Waiting List =', true, colW, x, y);
    col += 1;
  });
  // doc.off('pageAdded')
}
