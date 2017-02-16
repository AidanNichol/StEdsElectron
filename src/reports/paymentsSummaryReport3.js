import PDFDocument from 'pdfkit'
import fs from 'fs'
import XDate from 'xdate';
import jetpack from 'fs-jetpack';

import Logit from '../factories/logit.js';
import {toJS, observable, action, autorun} from 'mobx';
import R from 'ramda';
import {union, flattenDeep, fromPairs} from 'lodash';
var logit = Logit('color:yellow; background:black;', 'paymentSummary:report');
const home =process.env.HOME || process.env.HOMEPATH;

import AS from 'mobx/AccountsStore';
import WS from 'mobx/WalksStore';
import MS from 'mobx/MembersStore';
// import DS from 'mobx/DateStore';

const pCntrl = {endY:0, col:0};


// const noWalks = WS.bookableWalksId.length;
const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';
const calcLineHeights = (doc)=>{
  return [1,1,2,3,4,5,6, 7,8,9,10,11,12,13,14].map(sz=>{
    return doc.fontSize(sz).text( ' ', 20, 80).y - 80;
  })
}

// import XDate from 'xdate';
logit('env', process.env)
logit('dirname', __dirname)
const makeHeadBox = (bxW, bxH, r)=>`h ${bxW-2*r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH-r}  h -${bxW} v -${bxH-r} a ${r},${r} 0 0 1 ${r},${-r} Z`


export function paymentsSummaryReport3(payload, printFull){
  const homefs = jetpack.cwd(home);
  let documents;
  if (homefs.exists('Documents')) documents = homefs.cwd('Documents');
  if (homefs.exists('My Documents')) documents = homefs.cwd('My Documents');
  const docs = documents.dir('StEdwards').dir('PaymentSummary').cwd()
  logit('payload', payload);
  logit('',homefs.cwd(), documents.cwd(), docs)

  let docname = `${docs}/paymentSummary3-${payload.startDate.substr(0, 16).replace(/:/g, '.')}.pdf`;
  // let docname = `${docs}/paymentSummary-${payload.startDate.substr(0, 16).replace(/:/g, '.')}.pdf`;
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

  reportBody(payload, printFull, doc);
  doc.end();
  return docname.substr(home.length+1);
}

export function reportBody(payload, printFull, doc){
  doc.addPage();

  const margin = 30;
  const marginV = 20;
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth/2 - margin - 10;
  const colHeadY = 80;
  const r = 3;
  const fontHeight = calcLineHeights(doc);
  const szH = 10, szD=11
  const nameH = fontHeight[szH], detailH = fontHeight[szD], gapH = fontHeight[3]
  const bkWidth = 23;
  const bxW = colW+8, bxH = nameH;
  const boxOff = 5, boxWidth=50, moneyWidth = 15;
  let x,y;
  let col = 0;
  const setEndY = (endY)=>{
      if (pHeight - marginV - endY-1<= 0) {
        x = pWidth-margin - colW;
        y = colHeadY;
        col = (col + 1)%2;

        if (col === 0){
          x = margin;
          doc.addPage();
        }

    }
  }
// routines for printing individual components
  const printAccountHeader = (x, y, ht, name)=>{
    const boxPt = 2;
    doc.path(`M ${x-2+r},${y-boxPt} ${headBox}`).lineWidth(1)
      // .fillOpacity(0.8)
      .fillAndStroke("#ccc", "#888");
    doc.roundedRect(x-2,y-boxPt, bxW, ht, r).stroke("#888")
    doc.fillColor('black').font(normal).fontSize(szH).text(name, x, y);

  };
  const showMoney = (x, y, dY, value, text, rectFill, rectStroke, textColor)=>{
    doc.roundedRect(x+boxOff,y+dY-2, boxWidth, detailH-2, r).fillAndStroke(rectFill, rectStroke)
    doc.fillColor(textColor).fontSize(szD-2)
    .text(`£${Math.abs(value)}`,x+boxOff, y+dY, {align: 'right', width: moneyWidth})
    .text(text, x+boxOff+moneyWidth+5, y+dY);

  }
  const printWalkCodes = (x, y, xtra, wlks )=>{
    const noXtra = xtra.length;
    const noWalks = noXtra + wlks.length;
    // header for walk names(codes)
    [...xtra, ...wlks].forEach((code, i)=>{
      var opacity = i<noXtra || (!printFull && i===noXtra) ? 0.4 : 1;
      opacity = 1;
      doc.font(normal).opacity(opacity).fontSize(8).text(code, x+colW - bkWidth*(noWalks-i), y+2, {align: 'center', width: bkWidth})
    })
  };
  doc.font(normal)
  const walknames =  [];
  const walkIndex = {};
  WS.openWalks.forEach((walk, i)=>{
    walkIndex[walk._id] = i;
    walknames[i] = walk.names;
  });


  logit('walknames', {walknames, walkIndex})
  // const headBox = `h ${bxW-2*r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH-r}  h -${bxW} v -${bxH-r} a ${r},${r} 0 0 1 ${r},${-r} Z`
  const headBox = makeHeadBox(bxW, bxH, r)
  y= colHeadY;
  setEndY(y);
  // y= yOff;
  x=margin;
  let accHeight =  2 + nameH +  detailH;

  payload.accounts
    .filter(acc=>acc.activeThisPeriod && (printFull || acc.paymentsMade > 0))
    // .filter(acc=>acc.accId === 'A1049')
    .forEach(acc=>{
      // logit('account', acc);
      const grid = {};
      acc.logs.filter(log=>log.type==='W' && log.activeThisPeriod )
        .filter((log)=>(log.paid && log.paid.P > 0) || printFull)
        .forEach(log=>{
          if (!grid[log.memId])grid[log.memId] = {name: log.getMember().firstName, xtra: [], bkngs: R.times(()=>null, walknames.length)}
          if (walkIndex[log.walkId] !== undefined) grid[log.memId].bkngs[walkIndex[log.walkId]] = log;
          else grid[log.memId].xtra.push(log);
        });
      // logit('grid', grid, Object.keys(grid));
      Object.values(grid).forEach((mem)=>{
        // const mem = grid[memId];
          setEndY(y+accHeight);

          var startY = y;
          const dY = detailH+1
          const xtra = [];
          printAccountHeader(x, y, accHeight, acc.accName);
          printWalkCodes(x, y, xtra, walknames.map(nm=>nm.code));
          const noWalks = walknames.length;
          if (acc.paymentsMade > 0)showMoney(x, y, dY, acc.paymentsMade, 'Paid', "#cfe", "#484", 'blue');
          if (AS.accounts.get(acc.accId).members.size > 1){
            doc.font(italic).fontSize(szD-2).fillColor('black')
              .text(mem.name, x, y, {align: 'right', width: colW - bkWidth*noWalks - 4})

          }
          y += nameH;
          //
          // Print Member name
          //
          doc.fontSize(szD);
          mem.bkngs.forEach((log, i)=>{
            if (log === null) return;
            const bkng = log.req;
            var opacity = 1;
            // var opacity = (!printFull && i===0)&&bkng!=='P'? 0.4 : 1;
            // if (bkng === 'W') opacity = 0.3;
            let icon;
            if (!log.paid)logit('no paid', log);
            if (log.owing === 0 && log.paid && log.paid.P > 0)icon = 'Yes_check';
            else icon = `icon-${bkng}`;
            doc.opacity(opacity)
              .image(`${__dirname}/../assets/${icon}.jpg`, x+colW - bkWidth*(noWalks-i-0.5) - detailH*0.4, y, { height: detailH*.8})


          } );

            y += detailH;

          y = startY + accHeight;
          y += gapH;

        })
      })
}
var coll = new Intl.Collator();
const cmpAccName = (a, b)=>coll.compare(a[1].sortname, b[1].sortname);
const cmpDat = (a, b)=>coll.compare(a.dat, b.dat);
