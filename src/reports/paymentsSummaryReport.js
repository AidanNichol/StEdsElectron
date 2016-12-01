import PDFDocument from 'pdfkit'
import fs from 'fs'
import XDate from 'xdate';
import jetpack from 'fs-jetpack';

const home =process.env.HOME || process.env.HOMEPATH;
console.log('home', home)
const margin=30;
const calcLineHeights = (doc)=>{
  const h14 = doc.fontSize(14).text( ' ', margin, 80).y - 80;
  const h12 = doc.fontSize(12).text( ' ', margin, 80).y - 80;
  // const h9 = doc.fontSize(9).text( ' ', margin, 80).y - 80;
  return [h14, h12, h12/4]
}


const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';

// import db from 'services/bookingsDB';

export function paymentsSummaryReport(payload){
  const homefs = jetpack.cwd(home);
  let documents;
  if (homefs.exists('Documents')) documents = homefs.cwd('Documents');
  if (homefs.exists('My Documents')) documents = homefs.cwd('My Documents');
  const docs = documents.dir('StEdwards').dir('PaymentSummary').cwd()
  console.log(homefs.cwd(), documents.cwd(), docs)

  let docname = `${docs}/paymentSummary-${payload.startDate.substr(0, 16).replace(/:/g, '.')}.pdf`;
  // let docname = `${docs}/paymentSummary-${payload.startDate.substr(0, 16).replace(/:/g, '.')}.pdf`;
  console.log('name', {docname})
  const margin = 30;
  var doc = new PDFDocument({size: 'A4', margins: {top:20, bottom: 20, left:margin, right: margin}, autoFirstPage: false});
  doc.pipe(fs.createWriteStream(docname) )
  var title = 'St.Edwards Fellwalkers: Payments Summary';
  doc.on('pageAdded', ()=>{
    const height14 = doc.fontSize(14).currentLineHeight()
    const height4 = doc.fontSize(4).currentLineHeight()

    doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continued: true})
    doc.font(bold).fontSize(14).text(title, 30, 30+(20-height14)/2, {align:'center'});
    doc.font(normal).fontSize(9).text((new XDate().toString('yyyy-MM-dd HH:mm')),30,30+(20-height4)/2, {align: 'right'})
    // doc.fontSize(14).text(`${payload.startDispDate} to ${payload.endDispDate}`, 30, 30+(20+height14)/2, {align: 'center'})
    doc.fontSize(14).text(`${payload.startDate} to ${payload.endDate}`, 30, 30+(20+height14)/2, {align: 'center'})
});

  reportBody(payload, doc);
  doc.end();
  return docname.substr(home.length+1);
}

const reportBody = (payload, doc)=>{
  doc.addPage();
  doc.font(normal)

  const [nameH, detailH, gapH] = calcLineHeights(doc);

  const {
      closingCredit,
      closingDebt,
      openingCredit,
      openingDebt,
      aLogs, bLogs, tots,
    } = payload;
    const creditsUsed = openingCredit - closingCredit;
    const netBookings = (tots.B ? tots.B[1] : 0) + (tots.C ? tots.C[1] : 0)
                      - (tots.BX ? tots.BX[1] : 0) - (tots.CX ? tots.CX[1] : 0);
    const netCashAndCheques =  (tots.P ? tots.P[1] : 0) - (tots.PC ? tots.PC[1] : 0)
    const netBACS = (tots.PB ? tots.PB[1] : 0) - (tots.PBC ? tots.PBC[1] : 0)
    const netPayments = netCashAndCheques + netBACS;
    const calcDebt = openingDebt + netBookings - netPayments - creditsUsed;

    const pWidth = doc.page.width;
    const pHeight = doc.page.height;
    const boxPad = 6;
    var colW = (pWidth - 2* margin)/3;
    const gutter = 12, indent= 20;
    let x, yPostSumm, y=60,
        cX=margin+boxPad, dX= margin + colW +gutter,
        dW=2*colW - boxPad - gutter, cW=colW - boxPad - gutter;

    const AccLineTot = ({y, x, wd, title, factor='', item}) =>{
      if (!tots[item])return y;
      // console.log('AccLineTot', {item, tots});
      doc.fontSize(12).fillColor('blue').text(`${title} (${tots[item][0]})`, x + indent, y).text(`${factor}£${tots[item][1]}`, x, y, {width: wd - 2*indent, align: 'right'})
      return y+ detailH;
    }
    const AccLine = ({y,x,wd, title, font=normal, factor='', item, opt}) =>{
      if (opt && item <=0 )return y;
      doc.font(font).fontSize(12).fillColor('black').text(title, x, y).text(`${factor}£${item}`, x, y, {width: wd, align: 'right'})
      // if (x === dX)y += detailH + gapH;
      return y += (x === dX ? detailH + gapH : 0);
    }

    const printLogRec = (log, x, y)=>{
      doc.font(normal).fontSize(10).text(log.dispDate, x , y)
        .image(`${__dirname}/../assets/icon-${log.req}.jpg`, x+55, y-3, { height: detailH*.9})
        .fontSize(12).text(`${log.name} `, x+68 , y, {continued: true})
        .font(italic).fontSize(10).text(log.text? `[${log.text}] ` : '');
      doc.font(normal).fontSize(12).text(`£${log.amount}`, x, y, {width: colW, align:'right'})
      return y+detailH;
    }

    const printLog = (title, logs) => {
      y += 3;
      let yPostSumm = y;
      doc.fontSize(12).text(title, x, y, {align:'center', width: colW});
      doc.rectAnnotation(x,y-4, colW, detailH+4)
      y += detailH+4;

      logs.forEach((log) => {
        y = printLogRec (log, x, y)
        if (pHeight - y - margin -detailH<= 0) {
          x+= colW + gutter;
          y = yPostSumm
          if (x + colW>pWidth ){
            y= 60; yPostSumm = y
            x = margin;
            doc.addPage();
          }
        }
      });
      return ;
    }

    y += nameH+gapH;
    let y1 = y;
    y += gapH;
    y = AccLine({x:cX, y, wd: cW, title:"Opening Credit", item:openingCredit});
    y = AccLine({x:dX, y, wd: dW, title:"Opening Debt", item:openingDebt});
    y = AccLineTot({x:dX, y, wd: dW, factor:'', title:"Bus Bookings Made", item:'B'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'', title:"Car Bookings Made", item:'C'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'-', title:"Bus Bookings Cancelled", item:'BX'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'-', title:"Car Bookings Cancelled", item:'CX'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'-', title:"Bus Cancelled (no credit)", item:'BL'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'-', title:"Car Cancelled (no credit)", item:'CL'});
    y = AccLine({x:dX, y, wd: dW, factor:'+', title:"Net Bookings", item:netBookings});
    y = AccLineTot({x:dX, y, wd: dW, factor:'', title:"Payments Received", item:'P'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'', title:"Payments Received(BACS)", item:'PB'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'-', title:"Payments Refunded", item:'PC'});
    y = AccLineTot({x:dX, y, wd: dW, factor:'-', title:"Payments Refunded(BACS)", item:'PBC'});
    y = AccLine({x:dX, y, wd: dW, factor:'-', title:"Net Payments", item:netPayments});
    y = AccLine({x:cX, y, wd: cW, factor:'-', opt:true, title:"Net Credit Used", item:creditsUsed});
    y = AccLine({x:cX, y, wd: cW, factor:'+', opt:true, title:"Net Credit Issused", item:-creditsUsed});
    y = AccLine({x:dX, y, wd: dW, factor:'-', opt:true, title:"Net Credit Used", item:creditsUsed});
    y = AccLine({x:dX, y, wd: dW, factor:'+', opt:true, title:"Net Credit Issued", item:-creditsUsed});
    y = AccLine({x:cX, y, wd: cW, title:"Closing Credit", item:closingCredit});
    y = AccLine({x:dX, y, wd: dW, title:"Closing Debt", item:-closingDebt});
    if (-closingDebt !== calcDebt)
      y = AccLine({x:dX, y, wd: dW, title:"Calculated Closing Debt", item:calcDebt});
    y += gapH;
    y = AccLine({x:dX, y, wd: dW, font: bold, title:"Cash & Cheques to Bank", item:netCashAndCheques});

    doc.rectAnnotation(cX-6,y1-6, dX+dW-cX+2*6, y-y1+2*6+gapH);
    y += detailH
    x = margin;
    doc.font(normal).fontSize(12).text(' ');
    colW = (pWidth - 2* margin - gutter)/2;
    yPostSumm;

    printLog('Payments', aLogs)
    printLog('Bookings', bLogs)
  }
