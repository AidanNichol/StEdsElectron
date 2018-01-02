import { drawSVG } from 'reports/extract-svg-path';
import Logit from 'factories/logit.js';
var logit = Logit(__filename);
import AS from 'mobx/AccountsStore';

const calcLineHeights = doc => {
  const h14 = doc.fontSize(14).text(' ', margin, 80).y - 80;
  const h12 = doc.fontSize(12).text(' ', margin, 80).y - 80;
  // const h9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  return [h14, h12, h12 / 4];
};

const margin = 30;

// import db from 'services/bookingsDB';
// import {getAllDebts} from '../components/containers/PaymentsFunctions';
const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';

logit('env', process.env);
logit('dirname', __dirname);
// let icons = {};
export function creditsOwedReport(doc) {
  doc.addPage();
  doc.font(normal);
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth / 2 - margin - 20;
  // const nameH = doc.fontSize(14).currentLineHeight()*1.24
  // const detailH = doc.fontSize(12).currentLineHeight()*1.24
  // const gapH = doc.fontSize(9).currentLineHeight()*1.24
  const [nameH, detailH, gapH] = calcLineHeights(doc);
  logit('heights', { nameH, detailH, gapH });

  const balanceCols = credits => {
    let sizes = credits.map(data => nameH + gapH + data.logs.length * detailH);
    logit('sizes', sizes);
    let tot = 0;
    let sumSizes = sizes.map(item => {
      let st = tot;
      tot += item;
      return st;
    });
    logit('sumSizes', { sumSizes, tot });
    let i = sumSizes.findIndex(item => item >= tot / 2);
    if (
      Math.max(sumSizes[i], tot - sumSizes[i]) >
      Math.max(sumSizes[i - 1], tot - sumSizes[i - 1])
    )
      i = i - 1;
    let x = sumSizes[i];
    logit('balanceCols', { i, tot: tot / 2, x });
    const space = Math.max(x, tot - x);
    return [i, space];
  };

  let x, y;
  x = doc.x;
  y = doc.y;
  logit('x,y', { x, y });
  let { credits } = AS.allDebts;
  credits = credits.map(acc => {
    let logs = [];
    for (let log of acc.logs.reverse()) {
      if (log.balance === 0) break;
      logs.unshift(log);
    }
    acc.logs = logs;
    return acc;
  });
  logit('credits', credits);
  let [bal, space] = balanceCols(credits);
  const yOff = pHeight - space - margin - detailH;
  logit('yOff', { space, pHeight, margin });
  doc.text('', margin, yOff);
  logit('credits', credits);
  y = 60;
  // Credits Subheading
  doc
    .font(bold)
    .fontSize(16)
    .text('Credits', 0, y, { align: 'center', width: pWidth });
  doc.rectAnnotation(margin, y - 4, pWidth - 2 * margin, 18);
  let maxY = 78;
  y = 78;
  credits.forEach((data, i) => {
    logit('credit', data.accName, data);

    if (i === bal) {
      maxY = y;
      x = pWidth / 2 + 20;
      y = 78;
    }
    doc
      .font(normal)
      .fontSize(14)
      .text(data.accName, x, y);
    doc.text(`£${data.balance}`, x, y, { align: 'right', width: colW });
    doc.fontSize(12);
    y += nameH;
    data.logs.forEach(log => {
      doc.save();
      doc
        .font(normal)
        .fontSize(12)
        .text(log.dispDate, x, y);
      drawSVG(doc, x + 66, y - 3, 0.5, `icon-${log.req}`);
      // doc.image(`${__dirname}/../assets/icon-${log.req}.jpg`, x+67, y-3, { height: detailH*.9})
      doc.text(log.text, x + 81, y, { continued: true });
      doc
        .font(italic)
        .fontSize(10)
        .text(log.req !== 'P' ? (log.name ? ` [${log.name}]` : ' ') : ' ');
      doc
        .fillColor('#888')
        .text(`£${-log.amount}`, x, y, { align: 'right', width: colW });
      doc.restore();
      y += detailH;
    });
    y += gapH;
    // doc.fontSize(9).text(' ');
  });
  logit('space', { y, maxY, space });
  maxY = Math.max(y, maxY);
  return maxY;
}
