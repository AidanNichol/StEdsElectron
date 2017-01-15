import Logit from '../factories/logit.js';
import R from 'ramda';
var logit = Logit('color:yellow; background:black;', 'walkDayBookingSheet:report');
import AS from 'mobx/AccountsStore';
import WS from 'mobx/WalksStore';
import MS from 'mobx/MembersStore';
// import DS from 'mobx/DateStore';
var noWalks;
function gatherData(){
  logit('stores', {AS, WS})
  if (!WS.loaded || !MS.loaded || !AS.loaded)return [];
  const walkIds = WS.bookableWalksId();
  noWalks = walkIds.length;
  const walkIdsIndex = R.fromPairs(walkIds.map((val , i)=>[val, i]))
  const walkId = walkIds[0];
  logit('walkIds', {walkId, walkIds, walkIdsIndex}, WS)
  var walkers = new Map();
  WS.walks.get(walkId).bookings.entries()
    .filter(([, booking])=>/^[BC]$/.test(booking.status))
    .map(([id, ])=>[id, {}])
    .map(([memId, data])=>{
      const member = MS.members.get(memId)
      data.accountId = member.accountId;
      const account = AS.accounts.get(data.accountId)
      data.sortname = account.sortname;
      const members = new Map();
      account.members.map(memId=>{
        const mData = {memId}
        const member = MS.members.get(memId)
        mData.name = member.firstName;
        mData.bkng = R.repeat('-', walkIds.length)
        return [memId, mData]
      })
      .sort(cmpName)
      .forEach(([memId, mData])=>{
        members.set(memId, mData)
      })
      data.members = members;
      const status = account.accountStatus;
      if (status.balance < 0) data.debt = status.balance;
      if (status.balance > 0) data.credit = status.balance;
      return [memId, data]
    })
    .sort(cmpAccName)
    .map(([id, data])=>walkers.set(data.accountId, data));
  // let {accs} = AS.getAllDebts;
  walkers.forEach((account, accId)=>{
    account.members.forEach((memData, memId)=>{
      walkIds.forEach((walkId, i)=>{
        // logit('gather', memId, walkId, WS)
        let status = (WS.walks.get(walkId).bookings.get(memId) || {}).status || '-';
        status = (status[1] === 'X' ? '-' : status)
        memData.bkng[i] = status;
      })
    })
    const status = AS.accounts.get(accId).accountStatus;
    if (status.balance < 0){
      const debts = status.debt;
      debts.forEach(debt=>{
        account.members.get(debt.memId).bkng[walkIdsIndex[debt.walkId]] = 'P';
      })
      logit('debt', debts)
    }
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
export function walkDayBookingSheet(doc){
  const bMap = gatherData();
  logit('bMap', bMap)
  if (bMap.size === 0)return;
  doc.addPage()
  doc.font(normal)
  const walkCodes =   WS.bookableWalksId().map(walkId=>{
    let venue = WS.walks.get(walkId).venue;
    venue = venue.split(/[ -]/, 2)[0];
    venue = venue[0]+venue.substr(1).replace(/[aeiou]/ig, '');
    if (venue.length > 4)venue = venue.substr(0,2)+venue.substr(-2);
    return venue;
  });
  logit('walkCodes', {walkCodes})
  const margin = 30;
  const marginV = 20;
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth/2 - margin - 10;
  const gutter = 12, indent= 20;
  const firstY = 50;
  const r = 3;
  const fontHeight = calcLineHeights(doc);
  const szH = 12, szD=12
  const nameH = fontHeight[szH], detailH = fontHeight[szD], gapH = fontHeight[5]
  const bkWidth = 20;
  let x,y;
  const bxW = colW+8, bxH = nameH;
  const headBox = `h ${bxW-2*r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH-r}  h -${bxW} v -${bxH-r} a ${r},${r} 0 0 1 ${r},${-r} Z`
  y= firstY;
  // y= yOff;
  x=margin;
  logit('bMap values', bMap.values())
  bMap.forEach((data) => {
    // logit('acc', data)
    // logit('payment', data.sortname, {y:doc.y, calcY, data});
    // if (i=== bal)doc.text('', pWidth/2+20, yOff);
    let accHeight = 4 + nameH +  detailH*data.members.size;
    if (pHeight - y - marginV - accHeight+4<= 0) {
      console.log()
      x = pWidth-margin - colW;
      // y = yPostSumm
      y = firstY;
      if (x + colW>pWidth ){
        y= firstY;
        x = margin;
        doc.addPage();
      }
    }
    const dY = detailH*(1+(data.members.size-1)*0.5)+1.5
    const dX=20;
    const dWD = 50;
    // doc.rectAnnotation(x-4,y-4, colW+8, accHeight-1)
    //
    // Print the account header
    //
    const boxPt = 2;
    doc.path(`M ${x-2+r},${y-boxPt} ${headBox}`).lineWidth(1)
      .fillOpacity(0.8)
      .fillAndStroke("#ccc", "#888");
    doc.roundedRect(x-2,y-boxPt, bxW, accHeight-3, r).stroke("#888")
    //
    const boxOff = 5, boxWidth=50, moneyWidth = 15;
    if (data.debt){
      doc.roundedRect(x+boxOff,y+dY-2, boxWidth+2, detailH-2, r).fillAndStroke("#f88", "#800")
      doc.fillColor("black").fontSize(szD-2)
        .text(`£${Math.abs(data.debt)}`,x+boxOff, y+dY, {align: 'right', width: moneyWidth})
        .text('Owed', x+boxOff+moneyWidth+5, y+dY);
    }
    if (data.credit){
      doc.roundedRect(x+boxOff,y+dY-2, boxWidth+2, detailH-2, r).fillAndStroke("#cfe", "#484")
      doc.fillColor('blue').fontSize(szD-2)
        .text(`£${Math.abs(data.credit)}`,x+boxOff, y+dY, {align: 'right', width: moneyWidth})
        .text('Credit', x+boxOff+moneyWidth+5, y+dY);
    }
    doc.roundedRect(x+boxOff+boxWidth+50,y+dY-2, moneyWidth, detailH-2, r).stroke("#888")
    doc.fillColor('black').fontSize(szD-2)
      .text('Paid ',x+boxOff+boxWidth+30, y+dY)
    doc.fillColor('black').font(normal).fontSize(szH).text(data.sortname, x, y);
    walkCodes.forEach((code, i)=>{
      doc.font(normal).fontSize(8).text(code, x+colW - bkWidth*(noWalks-i), y+2, {align: 'center', width: bkWidth})
    })
    y += nameH;
    //
    // Print Member name
    //
    doc.fontSize(szD);
    data.members.forEach((mData)=>{
      // logit('mdata', mData)
      if (data.members.size > 1){
        doc.font(italic).fontSize(10).text(mData.name, x, y, {align: 'right', width: colW - bkWidth*noWalks - 4})

      }
      //
      // Print walk Booking for member
      //
      mData.bkng.forEach((bkng, i)=>{
        if (i===0 &&  !/^[BP]$/.test(bkng))bkng='Blank';
        if (bkng === '-')bkng = 'Chk'

        doc.opacity(i===0&&bkng!=='P'? 0.4 : 1)
            .image(`${__dirname}/../assets/icon-${bkng}.jpg`, x+colW - bkWidth*(noWalks-i-0.5) - detailH*0.4, y, { height: detailH*.8})

        // doc.font(normal).fontSize(szD).text(bkng, x+colW - bkWidth*(noWalks-i), y)

        // doc.font(normal).fontSize(szD).text(bkng.text, x+77, y)
        // .font(italic).fontSize(10).text(bkng.name||' ', doc.x, y)
      } );
      y += detailH;

    })
    y += gapH;
  });
}
var coll = new Intl.Collator();
const cmpAccName = (a, b)=>coll.compare(a[1].sortname, b[1].sortname);
const cmpName = (a, b)=>coll.compare(a.name, b.name);
