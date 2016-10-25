import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'printPayments:report');


const margin = 30;

// import db from 'services/bookingsDB';
import {getAllDebts} from '../components/containers/PaymentsFunctions';
const normal = 'Times-Roman';
const bold = 'Times-Bold';

import XDate from 'xdate';
logit('env', process.env)

export function paymentsDueReport(doc, state){
  doc.addPage()
  doc.font(normal)
  const pWidth = doc.page.width;
  // const pHeight = doc.page.Height;
  const colW = pWidth/2 - margin - 20;
  const nameH = doc.fontSize(14).currentLineHeight()
  const detailH = doc.fontSize(12).currentLineHeight()
  const gapH = doc.fontSize(9).currentLineHeight()

  const balanceCols = (debts)=>{
    let sizes = debts.map((data)=>nameH+gapH+data.debt.length*detailH);
    logit('sizes', sizes)
    let tot = 0;
    let sumSizes = sizes.map((item)=>{let st = tot;tot+=item; return st})
    logit('sumSizes', sumSizes)
    let i = sumSizes.findIndex((item)=>item >= tot/2)
    logit('balanceCols', {i, tot:tot/2, x:sumSizes[i]})
    return i;
  };

  let x,y;
  doc.image(process.env.PWD+'/assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continue: true})
  doc.font(bold).fontSize(14).text('St.Edwards Fellwalkers: Payments Due', 30, 30+(20-nameH)/2, {align:'center'});
  doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-gapH)/2, {align: 'right'})
  doc.text('', margin, 60);
   x=doc.x; y=doc.y;
  logit('x,y', {x,y})
  let debts = getAllDebts(state);
  let bal = balanceCols(debts);
  logit('debts', debts)
  debts.forEach((data, i) => {
    console.log('payment', data);
    if (i=== bal)doc.text('', pWidth/2+20, 60);
    doc.fontSize(14).text(data.accName, {continued:true, width: colW}).text(`£${-data.balance}`,{align: 'right', width: colW});
    doc.fontSize(12);
    data.debt.forEach((bkng)=>
      doc.text(`${bkng.dispDate} ${bkng.text}`)
    );
    doc.fontSize(9).text(' ');
  });
}
