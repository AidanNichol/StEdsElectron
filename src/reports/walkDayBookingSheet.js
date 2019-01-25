import Logit from 'logit';
import { toJS } from 'mobx';
import R from 'ramda';
import { drawSVG } from './extract-svg-path';
import { union, flattenDeep, fromPairs } from 'lodash';
var logit = Logit(__filename);
import {WS, MS, AS} from 'StEdsStore';

function walkDaySet() {
  const walkId = WS.bookableWalksId[0];
  const memIds = WS.walks
    .get(walkId)
    .bookingsEntries.filter(([, booking]) => /^[BCW]$/.test(booking.status))
    .map(([memId]) => memId);
  logit('walkDaySet', memIds);
  return memIds;
}
const cmpNo = (a, b) => parseInt(a.substr(1)) - parseInt(b.substr(1));

function fullSet() {
  const walkIds = WS.recentWalksId;
  logit('recentWalks', walkIds);
  var memIds = [];
  walkIds.forEach(walkId => {
    const bookingsKeys = WS.walks.get(walkId).bookingsKeys;
    // logit('fullset', walkId, bookings.keys().length, bookings.keys().sort(cmpNo))
    memIds = union(memIds, bookingsKeys.sort(cmpNo));
  });
  const bal = AS.allAccountsStatus.filter(acc => acc.balance !== 0).map(acc => {
    const account = AS.accounts.get(acc.accId) || {};
    return toJS(account.members);
  });
  logit('fullset bal:', bal);
  memIds = union(memIds, flattenDeep(bal));
  logit('fullset memIds:', memIds.sort(cmpNo));
  return memIds;
}

function gatherData(memberSet, printFull) {
  logit('stores', { AS, WS });
  if (!WS.loaded || !MS.loaded || !AS.loaded) return [];
  const walkIds = WS.bookableWalksId;
  const walkIdsIndex = R.fromPairs(walkIds.map((val, i) => [val, i]));
  const walkId = walkIds[0];
  logit('memberSet', memberSet.length, memberSet.sort(cmpNo));
  logit('walkIds', { walkId, walkIds, walkIdsIndex }, WS);
  // const accs = WS.walks.get(walkId).bookings.entries()
  //   .filter(([, booking])=>/^[BCW]$/.test(booking.status))
  //   .map(([memId, ])=>{
  const accs = memberSet
    .map(memId => {
      const accId = MS.members.get(memId).accountId;
      const account = AS.accounts.get(accId);
      let data = account.accountFrame;
      data.xtra = [];
      const status = account.accountStatus;
      if (status.balance < 0) data.debt = status.balance;
      if (status.balance > 0) data.credit = status.balance;
      return [accId, data];
    })
    .sort(cmpAccName);

  var walkers = new Map(accs); // this gets rid of any duplicate accounts in the list
  var reserveList = [];
  walkers.forEach((data, accId) => {
    let reserve = !printFull;
    data.members.forEach((memData, memId) => {
      let bkng = R.repeat('-', walkIds.length);
      walkIds.forEach((walkId, i) => {
        // logit('gather', memId, walkId, WS)
        let status = (WS.walks.get(walkId).bookings.get(memId) || {}).status || 'Chk';
        if (i === 0 && status !== 'W' && status !== 'Chk') reserve = false;
        status = status[1] === 'X' ? 'Chk' : status;
        // if (!printFull && status === 'Chk') status = 'Blank';
        bkng[i] = status;
      });
      memData.xtra = [];
      memData.bkng = bkng;
    });

    // get details of old walks still unpaid
    const status = AS.accounts.get(accId).accountStatusNew;
    if (status.balance < 0) {
      const debts = status.debt;
      debts.forEach(debt => {
        if (debt.outstanding) {
          let member = data.members.get(debt.memId);
          if (walkIdsIndex[debt.walkId] !== undefined) {
            member.bkng[walkIdsIndex[debt.walkId]] = 'P';
          } else {
            // let code = WS.walks.get([debt.walkId]).code;
            let www = WS.walks.get(debt.walkId);
            let code;
            if (www) code = www.code;
            else {
              logit('debt???', debt.walkId, debt, WS.walks.entries);
              code = '????';
            }
            let i = data.xtra.indexOf(code);
            if (i < 0) {
              data.xtra.push(code);
              i = data.xtra.length - 1;
            }
            member.xtra[i] = 'P';
          }
        }
      });
    }
    if (data.xtra.length > 0) logit('xtra walks', data, status);
    if (reserve) {
      logit('On reserve list', data);
      reserveList.push(accId);
    }
    logit('On reserve list', data);
  });
  reserveList.forEach(accId => {
    const rec = walkers.get(accId);
    walkers.delete(accId);
    walkers.set(accId, rec);
  });

  return walkers;
}

// const noWalks = WS.bookableWalksId.length;
const normal = 'Times-Roman';
const bold = 'Times-Bold';
const italic = 'Times-Italic';
const calcLineHeights = doc => {
  return [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(sz => {
    return doc.fontSize(sz).text(' ', 20, 80).y - 80;
  });
};
const calcCharWidths = doc => {
  let res = {};
  Array.from(' -0123456789()').forEach(chr => {
    res[chr] =
      doc.fontSize(11).text(chr, 20, 80, { continued: true, lineBreak: false }).x - 20;
    logit('calcCharWidths', doc.x, doc.y);
  });
  logit('charWidth', res);
  return res;
};
logit('env', process.env);
logit('dirname', __dirname);
const makeHeadBox = (bxW, bxH, r) =>
  `h ${bxW - 2 * r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH - r}  h -${bxW} v -${bxH -
    r} a ${r},${r} 0 0 1 ${r},${-r} Z`;

export function walkDayBookingSheet(doc, printFull) {
  doc.addPage();

  const margin = 30;
  const marginV = 20;
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth / 2 - margin - 10;
  const colHeadY = 55;
  const r = 3;
  const fontHeight = calcLineHeights(doc);
  // const charWidth = calcCharWidths(doc);
  // logit('charWidth', charWidth);
  const szH = 10,
    szD = 11;
  const nameH = fontHeight[szH],
    detailH = fontHeight[szD],
    gapH = fontHeight[3];
  const bkWidth = 23;
  const bxW = colW + 8,
    bxH = nameH;
  const boxOff = 5,
    boxWidth = 50,
    moneyWidth = 15;
  let x, y;
  let col = 0;

  const setEndY = endY => {
    if (pHeight - marginV - endY - 1 <= 0) {
      x = pWidth - margin - colW;
      y = colHeadY;
      col = (col + 1) % 2;

      if (col === 0) {
        x = margin;
        doc.addPage();
      }
    }
  };
  // routines for printing individual components
  const printAccountHeader = (x, y, ht, name) => {
    const boxPt = 2;
    doc
      .path(`M ${x - 2 + r},${y - boxPt} ${headBox}`)
      .lineWidth(1)
      .fillOpacity(0.8)
      .fillAndStroke('#ccc', '#888');
    doc.roundedRect(x - 2, y - boxPt, bxW, ht, r).stroke('#888');
    doc
      .fillColor('black')
      .font(normal)
      .fontSize(szH)
      .text(name, x, y);
  };
  const showMoney = (x, y, dY, value, text, rectFill, rectStroke, textColor) => {
    doc
      .roundedRect(x + boxOff, y + dY - 2, boxWidth, detailH - 2, r)
      .fillAndStroke(rectFill, rectStroke);
    doc
      .fillColor(textColor)
      .fontSize(szD - 2)
      .text(`£${Math.abs(value)}`, x + boxOff, y + dY, {
        align: 'right',
        width: moneyWidth,
      })
      .text(text, x + boxOff + moneyWidth + 5, y + dY);
  };
  const printWalkCodes = (x, y, xtra, wlks) => {
    const noXtra = xtra.length;
    const noWalks = noXtra + wlks.length;
    // header for walk names(codes)
    [...xtra, ...wlks].forEach((code, i) => {
      const opacity = i < noXtra || (!printFull && i === noXtra) ? 0.4 : 1;

      doc
        .font(normal)
        .opacity(opacity)
        .fontSize(8)
        .text(code, x + colW - bkWidth * (noWalks - i), y + 2, {
          align: 'center',
          width: bkWidth,
        });
    });
  };
  const printPaidBox = (x, y, dY) => {
    doc
      .roundedRect(x + boxOff + boxWidth + 30, y + dY - 2, moneyWidth, detailH - 2, r)
      .stroke('#888');
    doc
      .fillColor('black')
      .fontSize(szD - 2)
      .text('Paid ', x + boxOff + boxWidth + 10, y + dY);
  };
  const memberSet = printFull ? fullSet() : walkDaySet();
  const bMap = gatherData(memberSet, printFull);
  logit('bMap', printFull, bMap);
  if (bMap.size === 0) return;
  doc.font(normal);
  const walknames = WS.bookableWalksId.map(walkId => {
    return WS.walks.get(walkId).names;
  });

  const waitingLists = WS.bookableWalksId.map(walkId => {
    // const wl = WS.walks.get(walkId).waitingList;
    // logit('WL', wl);
    const data = WS.walks.get(walkId).waitingList.map((bkng, i) => {
      // logit('map waitlist', walkId, bkng, i)
      return [bkng.memId, i + 1];
    });
    return fromPairs(data);
  });
  const walkAvailability = WS.bookableWalksId.map(walkId => {
    return WS.walks.get(walkId).bookingTotals;
  });
  logit('walknames', { walknames, walkAvailability, waitingLists });
  // const headBox = `h ${bxW-2*r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH-r}  h -${bxW} v -${bxH-r} a ${r},${r} 0 0 1 ${r},${-r} Z`
  const headBox = makeHeadBox(bxW, bxH, r);
  y = colHeadY;
  setEndY(y);
  // y= yOff;
  x = margin;
  logit('bMap values', bMap.values());
  bMap.forEach(data => {
    let accHeight = 2 + nameH + detailH * data.members.size;
    setEndY(y + accHeight);

    var startY = y;
    const dY = detailH * (1 + (data.members.size - 1) * 0.5) + 1;

    printAccountHeader(x, y, accHeight, data.sortname);
    if (data.debt) showMoney(x, y, dY, data.debt, 'Owed', '#f88', '#800', 'black');
    if (data.credit) showMoney(x, y, dY, data.credit, 'Credit', '#cfe', '#484', 'blue');
    printPaidBox(x, y, dY);

    printWalkCodes(x, y, data.xtra, walknames.map(nm => nm.code));

    y += nameH;
    //
    // Print Member name
    //
    doc.fontSize(szD);
    data.members.forEach(mData => {
      // logit('mdata', mData)
      let bkngX = [...mData.xtra, ...mData.bkng];
      const noWalks = bkngX.length;
      const noXtra = mData.xtra.length;
      if (data.members.size > 1) {
        doc
          .font(italic)
          .fontSize(szD - 2)
          .fillColor('black')
          .text(mData.name, x, y, {
            align: 'right',
            width: colW - bkWidth * noWalks - 4,
          });
      }
      //
      // Print walk Booking for member
      //
      bkngX.forEach((bkng, i) => {
        var opacity = !printFull && i === 0 && bkng !== 'P' ? 0.4 : 1;
        if (bkng === 'W') opacity = 0.1;
        doc.opacity(opacity);
        // .image(`${__dirname}/../assets/icon-${bkng}.jpg`, x+colW - bkWidth*(noWalks-i-0.5) - detailH*0.4, y, { height: detailH*.8})
        drawSVG(
          doc,
          x + colW - bkWidth * (noWalks - i - 0.5) - detailH * 0.4,
          y,
          0.4,
          `icon-${bkng}`,
        );

        if (bkng === 'W') {
          // logit('waitlist', i, mData.memId, noXtra, waitingLists);
          const no = waitingLists[i - noXtra][mData.memId];
          doc
            .font(bold)
            .opacity(1)
            .fontSize(szD - 2)
            .fillColor('red')
            .text(no, x + colW - bkWidth * (noWalks - i - 0.5) - detailH * 0.2, y + 2);
        }
      });
      y += detailH;
    });
    y = startY + accHeight;
    y += gapH;
  });

}
var coll = new Intl.Collator();
const cmpAccName = (a, b) => coll.compare(a[1].sortname, b[1].sortname);
// const cmpDat = (a, b)=>coll.compare(a.dat, b.dat);
