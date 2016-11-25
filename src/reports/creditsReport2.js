import Logit from '../factories/logit.js';
import fs from 'fs';
import svg2png from 'svg2png'
var logit = Logit('color:yellow; background:black;', 'printCredits:report');

const calcLineHeights = (doc)=>{
  const h14 = doc.fontSize(14).text( ' ', margin, 80).y - 80;
  const h12 = doc.fontSize(12).text( ' ', margin, 80).y - 80;
  // const h9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  return [h14, h12, h12/4]
}

const margin = 30;

// import db from 'services/bookingsDB';
import {getAllDebts} from '../components/containers/PaymentsFunctions';
const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';

logit('env', process.env)
logit('dirname', __dirname)
let icons = {};
export function creditsOwedReport(doc, state){
  doc.addPage()
  doc.font(normal)
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth/2 - margin - 20;
  // const nameH = doc.fontSize(14).currentLineHeight()*1.24
  // const detailH = doc.fontSize(12).currentLineHeight()*1.24
  // const gapH = doc.fontSize(9).currentLineHeight()*1.24
  const [nameH, detailH, gapH] = calcLineHeights(doc);

  const getPng = (req)=>{
    if (!icons[req]){
      let buffer = fs.readFileSync(`${__dirname}/../assets/icon-${req}.svg`)
      icons[req] = svg2png(buffer, {height: detailH});
    }
    return icons[req];
  }

  const balanceCols = (credits)=>{
    let sizes = credits.map((data)=>nameH+gapH+(data.logs.length - data.lastZeroPoint)*detailH);
    logit('sizes', sizes)
    let tot = 0;
    let sumSizes = sizes.map((item)=>{let st = tot;tot+=item; return st})
    logit('sumSizes', {sumSizes, tot})
    let i = sumSizes.findIndex((item)=>item >= tot/2)
    if (Math.max(sumSizes[i], tot - sumSizes[i]) > Math.max(sumSizes[i-1], tot - sumSizes[i-1]))i = i - 1;
    let x = sumSizes[i]
    logit('balanceCols', {i, tot:tot/2, x})
    const space = Math.max(x, tot-x)
    return [i, space];
  };

  let x,y;
  // doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continue: true})
  // doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Payments Due', 30, 30+(20-nameH)/2, {align:'center'});
  // doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-gapH)/2, {align: 'right'})
   x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  let { credits} = getAllDebts(state);
  logit('credits', credits);
  let [bal, space] = balanceCols(credits);
  const yOff = pHeight - space - margin - detailH;
  logit('yOff', {space, pHeight, margin})
  doc.text('', margin, yOff);
  logit('credits', credits)
  y=60
  // Credits Subheading
  doc.font(bold).fontSize(16).text('Credits', 0, y, {align: 'center', width: pWidth});
  doc.rectAnnotation(margin,y-4, pWidth - 2*margin, 18)
  let maxY = 78;
  y= 78;
  credits.forEach((data, i) => {
    logit('payment', data.accName, data);

    if (i=== bal){
      x = pWidth/2+20
      y = 78
    }
    doc.font(normal).fontSize(14).text(data.accName, x, y)
    doc.text(`£${data.balance}`, x, y, {align: 'right', width: colW});
    doc.fontSize(12);
    y += nameH
    data.logs.slice(data.lastZeroPoint+1).forEach((log)=>{
      doc.font(normal).fontSize(12)
          .text(log.dispDate, x, y)
          .image(`${__dirname}/../assets/icon-${log.req}.jpg`, x+67, y-3, { height: detailH*.9})
          .text(log.text, x+77, y);
      log.req !== 'P' && doc.font(italic).fontSize(10).text(log.name||' ', doc.x, y);
      y += detailH
    });
    y+=gapH;
    maxY = Math.max(y, maxY)
    // doc.fontSize(9).text(' ');
  });
  return maxY
}