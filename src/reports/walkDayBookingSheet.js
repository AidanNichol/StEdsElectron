import Logit from '../factories/logit.js';
import R from 'ramda';
var logit = Logit('color:yellow; background:black;', 'walkDayBookingSheet:report');
import AS from 'mobx/AccountsStore';
import WS from 'mobx/WalksStore';
import MS from 'mobx/MembersStore';
// import DS from 'mobx/DateStore';
function gatherData(){
  logit('stores', {AS, WS})
  if (!WS.loaded || !MS.loaded || !AS.loaded)return [];
  const walkIds = WS.bookableWalksId();
  const walkIdsIndex = R.fromPairs(walkIds.map((val , i)=>[val, i]))
  const walkId = walkIds[0];
  logit('walkIds', {walkId, walkIds, walkIdsIndex}, WS)
  const accs = WS.walks.get(walkId).bookings.entries()
    .filter(([, booking])=>/^[BCW]$/.test(booking.status))
    .map(([memId, ])=>{
      const accId = MS.members.get(memId).accountId;
      const account = AS.accounts.get(accId);
      let data = account.accountFrame;
      data.xtra = [];
      const status = account.accountStatus;
      if (status.balance < 0) data.debt = status.balance;
      if (status.balance > 0) data.credit = status.balance;
      return [accId, data]
    })
    .sort(cmpAccName);
  // let {accs} = AS.getAllDebts;
  var walkers = new Map(accs);
  walkers.forEach((data, accId)=>{
    data.members.forEach((memData, memId)=>{
      let bkng = R.repeat('-', walkIds.length)
      walkIds.forEach((walkId, i)=>{
        // logit('gather', memId, walkId, WS)
        let status = (WS.walks.get(walkId).bookings.get(memId) || {}).status || '-';
        status = (status[1] === 'X' ? '-' : status)
        bkng[i] = status;
      })
      memData.xtra = [];
      memData.bkng = bkng;
    })
    const status = AS.accounts.get(accId).accountStatus;
    if (status.balance < 0){
      const debts = status.debt;
      debts.forEach(debt=>{
        if (debt.outstanding){
          let member = data.members.get(debt.memId);
          if (walkIdsIndex[debt.walkId] !== undefined){
            member.bkng[walkIdsIndex[debt.walkId]] = 'P';
          } else {
            let code = WS.walks.get([debt.walkId]).code;
            let i = data.xtra.indexOf(code);
            if (i < 0){
              data.xtra.push(code);
              i = data.xtra.length - 1;
            }
            member.xtra[i] = 'P';
          }
        }
      })
    }
    if (data.xtra.length > 0)logit('xtra walks', data, status)
  })

  return walkers;
}
// const noWalks = WS.bookableWalksId().length;
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
export function walkDayBookingSheet(doc){
  const bMap = gatherData();
  logit('bMap', bMap)
  if (bMap.size === 0)return;
  doc.addPage()
  doc.font(normal)
  const walknames =   WS.bookableWalksId().map(walkId=>{
    return WS.walks.get(walkId).names;
    // let venue = WS.walks.get(walkId).venue;
    // let shortname = venue.split(/[ -]/, 2)[0];
    // let code = shortname[0]+shortname.substr(1).replace(/[aeiou]/ig, '');
    // if (code.length > 4)code = code.substr(0,2)+code.substr(-2);
    // return {venue, shortname, code};
  });
  const walkAvailability = WS.bookableWalksId().slice(1).map(walkId=>{
    return WS.walks.get(walkId).bookingTotals;
  });
  logit('walknames', {walknames, walkAvailability})
  const margin = 30;
  const marginV = 20;
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth/2 - margin - 10;
  const colHeadY = 50;
  const r = 3;
  const fontHeight = calcLineHeights(doc);
  const szH = 10, szD=11
  const nameH = fontHeight[szH], detailH = fontHeight[szD], gapH = fontHeight[3]
  const bkWidth = 23;
  let x,y;
  const bxW = colW+8, bxH = nameH;
  // const headBox = `h ${bxW-2*r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH-r}  h -${bxW} v -${bxH-r} a ${r},${r} 0 0 1 ${r},${-r} Z`
  const headBox = makeHeadBox(bxW, bxH, r)
  y= colHeadY;
  // y= yOff;
  x=margin;
  logit('bMap values', bMap.values())
  bMap.forEach((data) => {
    // logit('acc', data)
    // logit('payment', data.sortname, {y:doc.y, calcY, data});
    // if (i=== bal)doc.text('', pWidth/2+20, yOff);
    let accHeight =  2 + nameH +  detailH*data.members.size;
    if (pHeight - y - marginV - accHeight-1<= 0) {
      console.log()
      x = pWidth-margin - colW;
      // y = yPostSumm
      y = colHeadY;
      if (x + colW>pWidth ){
        y= colHeadY;
        x = margin;
        doc.addPage();
      }
    }
    var startY = y;
    const dY = detailH*(1+(data.members.size-1)*0.5)+1
    //
    // Print the account header
    //
    const boxPt = 2;
    doc.path(`M ${x-2+r},${y-boxPt} ${headBox}`).lineWidth(1)
      .fillOpacity(0.8)
      .fillAndStroke("#ccc", "#888");
    doc.roundedRect(x-2,y-boxPt, bxW, accHeight, r).stroke("#888")
    //
    const boxOff = 5, boxWidth=50, moneyWidth = 15;
    if (data.debt){
      doc.roundedRect(x+boxOff,y+dY-2, boxWidth, detailH-2, r).fillAndStroke("#f88", "#800")
      doc.fillColor("black").fontSize(szD-2)
        .text(`£${Math.abs(data.debt)}`,x+boxOff, y+dY, {align: 'right', width: moneyWidth})
        .text('Owed', x+boxOff+moneyWidth+5, y+dY);
    }
    if (data.credit){
      doc.roundedRect(x+boxOff,y+dY-2, boxWidth, detailH-2, r).fillAndStroke("#cfe", "#484")
      doc.fillColor('blue').fontSize(szD-2)
        .text(`£${Math.abs(data.credit)}`,x+boxOff, y+dY, {align: 'right', width: moneyWidth})
        .text('Credit', x+boxOff+moneyWidth+5, y+dY);
    }
    doc.roundedRect(x+boxOff+boxWidth+30,y+dY-2, moneyWidth, detailH-2, r).stroke("#888")
    doc.fillColor('black').fontSize(szD-2)
      .text('Paid ',x+boxOff+boxWidth+10, y+dY)
    doc.fillColor('black').font(normal).fontSize(szH).text(data.sortname, x, y);
    let noXtra = data.xtra.length;
    let noWalks = noXtra + walknames.length;
    let walkNms = [...data.xtra, ...walknames.map(nm=>nm.code)]
    walkNms.forEach((code, i)=>{
      doc.font(normal).opacity(i<=noXtra? 0.4 : 1).fontSize(8).text(code, x+colW - bkWidth*(noWalks-i), y+2, {align: 'center', width: bkWidth})
    })
    y += nameH;
    //
    // Print Member name
    //
    doc.fontSize(szD);
    data.members.forEach((mData)=>{
      // logit('mdata', mData)
      if (data.members.size > 1){
        doc.font(italic).fontSize(szD-2).text(mData.name, x, y, {align: 'right', width: colW - bkWidth*noWalks - 4})

      }
      //
      // Print walk Booking for member
      //
      let bkngX = [...mData.xtra, ...mData.bkng]
      bkngX.forEach((bkng, i)=>{
        if (i<=noXtra &&  !/^[BP]$/.test(bkng))bkng='Blank';
        if (bkng === '-')bkng = 'Chk'

        doc.opacity(i===0&&bkng!=='P'? 0.4 : 1)
            .image(`${__dirname}/../assets/icon-${bkng}.jpg`, x+colW - bkWidth*(noWalks-i-0.5) - detailH*0.4, y, { height: detailH*.8})

        // doc.font(normal).fontSize(szD).text(bkng, x+colW - bkWidth*(noWalks-i), y)

        // doc.font(normal).fontSize(szD).text(bkng.text, x+77, y)
        // .font(italic).fontSize(10).text(bkng.name||' ', doc.x, y)
      } );
      y += detailH;

    })
    y = startY + accHeight;
    y += gapH;
  });

  const gap = 10;
  const sz = (bxW+gap)/walkAvailability.length;
  const iw = detailH*.6;
  const bw = iw+2;
  const aHeadBox = makeHeadBox(sz-gap+2, detailH, r)
  y = pHeight - marginV - (detailH + 4*bw + 6)
  walkAvailability.forEach(({free, display}, i)=>{
    const name = walknames[i+1].shortname;
    const x1 = x + sz*i
    logit('avail', {x1, sz,iw,bw,gap})
    doc.path(`M ${x1-2+r},${y-2} ${aHeadBox}`).lineWidth(1)
      .fillOpacity(0.8)
      .fillAndStroke("#ccc", "#888");
    doc.roundedRect(x1-2,y-2, sz-gap+2, detailH + 4*bw + 6, r).stroke("#888")
    doc.fillColor('black').text(name, x1, y).text(display, x1, y, {align: 'right', width: sz-gap - 4})
    for(let j = 0; j < 20; j++){
      var y1 = y + detailH + Math.floor(j/5)*bw;
      doc.image(`${__dirname}/../assets/icon-${j<free ? 'Chk' : 'Wchk'}.jpg`, x1+(j%5)*bw, y1, { height: iw})
    }
  })
}
var coll = new Intl.Collator();
const cmpAccName = (a, b)=>coll.compare(a[1].sortname, b[1].sortname);
