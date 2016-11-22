import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'printPayments:report');


const margin = 30;

// import db from 'services/bookingsDB';
import {getAllDebts} from '../components/containers/PaymentsFunctions';
const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';
const calcLineHeights = (doc)=>{
  const h14 = doc.fontSize(14).text( ' ', margin, 80).y - 80;
  const h12 = doc.fontSize(12).text( ' ', margin, 80).y - 80;
  // const h9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  return [h14, h12, h12/4]
}

// import XDate from 'xdate';
logit('env', process.env)
logit('dirname', __dirname)
export function paymentsDueReport(doc, state, yStart){
  // doc.addPage()
  doc.font(normal)
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth/2 - margin - 20;
  // const nameH = doc.fontSize(14).currentLineHeight()*1.24
  // const detailH = doc.fontSize(12).currentLineHeight()*1.0185;
  // logit('factor12',11/doc.fontSize(12).currentLineHeight());
  // const gapH = doc.fontSize(9).currentLineHeight()*1.24
  const [nameH, detailH, gapH] = calcLineHeights(doc);

  let sizes;
  const balanceCols = (debts)=>{
    sizes = debts.map((data)=>data.size = nameH+gapH+data.debt.length*detailH);
    logit('sizes', sizes)
    let tot = 0;
    let relStartY = sizes.map((item)=>{let st = tot;tot+=item; return st})
    logit('relStartY', {relStartY, tot})
    let i = relStartY.findIndex((item)=>item >= tot/2)
    if (Math.max(relStartY[i], tot - relStartY[i]) > Math.max(relStartY[i-1], tot - relStartY[i-1]))i = i - 1;
    let y = relStartY[i]
    logit('balanceCols', {i, tot:tot/2, y})
    const space = Math.max(y, tot-y)
    return [i, space];
  };

  let x,y;
  // doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continue: true})
  // doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Payments Due', 30, 30+(20-nameH)/2, {align:'center'});
  // doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-gapH)/2, {align: 'right'})
   x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  let {debts} = getAllDebts(state);

  debts.forEach((data, i) =>{
    debts[i].debt = data.debt.filter((bkng)=>bkng.outstanding);
  })

  let [bal, space] = balanceCols(debts);
  const yOff = pHeight - space - margin - detailH ;
  logit('yOff', {space, pHeight, margin, yOff, yStart})
  if (yStart+18 >yOff) doc.addPage()
  let calcY = yOff;
  doc.text('', margin, yOff);
  logit('debts', debts)
  // Credits Subheading
  y = yOff -18;
  doc.font(bold).fontSize(16).text('Payments', 0, y, {align: 'center', width: pWidth});
  doc.rectAnnotation(margin,y-4, pWidth - 2*margin, 18)

  y= yOff;
  x=margin;

  debts.forEach((data, i) => {
    logit('payment', data.accName, {y:doc.y, calcY, data});
    // if (i=== bal)doc.text('', pWidth/2+20, yOff);
    if (i=== bal){
      x = pWidth/2+20
      y = yOff
    }

    doc.font(normal).fontSize(14).text(data.accName, x, y).text(`£${-data.balance}`,x, y, {align: 'right', width: colW});
    y += nameH
    doc.fontSize(12);
    data.debt.filter((bkng)=>bkng.outstanding).forEach((bkng)=>{
      doc.font(normal).fontSize(12).text(bkng.dispDate, x, y)
      .image(`./assets/icon-${bkng.req}.jpg`, x+67, y-3, { height: detailH*.9})
      doc.font(normal).fontSize(12).text(bkng.text, x+77, y)
      .font(italic).fontSize(10).text(bkng.name||' ', doc.x, y)
      y += detailH;
    } );
    y += gapH;
  });
}
