import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'printPayments:report');


const margin = 30;

// import db from 'services/bookingsDB';
import {getAllDebts} from '../components/containers/PaymentsFunctions';
const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';

import XDate from 'xdate';
logit('env', process.env)
logit('dirname', __dirname)
export function paymentsDueReport(doc, state){
  doc.addPage()
  doc.font(normal)
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth/2 - margin - 20;
  const nameH = doc.fontSize(14).currentLineHeight()
  const detailH = doc.fontSize(12).currentLineHeight()
  const gapH = doc.fontSize(9).currentLineHeight()

  const balanceCols = (debts)=>{
    let sizes = debts.map((data)=>nameH+gapH+data.debt.length*detailH);
    logit('sizes', sizes)
    let tot = 0;
    let sumSizes = sizes.map((item)=>{let st = tot;tot+=item; return st})
    logit('sumSizes', {sumSizes, tot})
    let i = sumSizes.findIndex((item)=>item >= tot/2)
    let x = sumSizes[i]
    logit('balanceCols', {i, tot:tot/2, x})
    const space = Math.max(x, tot-x)
    return [i, space];
  };

  let x,y;
  doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continue: true})
  doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Payments Due', 30, 30+(20-nameH)/2, {align:'center'});
  doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-gapH)/2, {align: 'right'})
   x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  let debts = getAllDebts(state);
  let [bal, space] = balanceCols(debts);
  const yOff = pHeight - space - margin - detailH;
  logit('yOff', {space, pHeight, margin})
  doc.text('', margin, yOff);
  logit('debts', debts)
  debts.forEach((data, i) => {
    console.log('payment', data);
    if (i=== bal)doc.text('', pWidth/2+20, yOff);
    doc.fontSize(14).text(data.accName, {continued:true, width: colW}).text(`£${-data.balance}`,{align: 'right', width: colW});
    doc.fontSize(12);
    data.debt.filter((bkng)=>bkng.outstanding).forEach((bkng)=>
      doc.font(normal).fontSize(12).text(`${bkng.dispDate} ${bkng.text}`, {continued:true}).font(italic).fontSize(10).text(bkng.name||' ')
    );
    doc.fontSize(9).text(' ');
  });
}
