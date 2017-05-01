import PDFDocument from "pdfkit";
import fs from "fs";
import XDate from "xdate";
import jetpack from "fs-jetpack";
import { drawSVG } from "reports/extract-svg-path";

import Logit from "../factories/logit.js";
var logit = Logit("color:yellow; background:black;", "paymentSummary:report");
const home = process.env.HOME || process.env.HOMEPATH;

import WS from "mobx/WalksStore";
import MS from "mobx/MembersStore";

const normal = "Times-Roman";
const bold = "Times-Bold";
// const italic = 'Times-Italic';
const calcLineHeights = doc => {
  return [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(sz => {
    return doc.fontSize(sz).text(" ", 20, 80).y - 80;
  });
};

// import XDate from 'xdate';
logit("env", process.env);
logit("dirname", __dirname);

export function paymentsSummaryReport3(payload, lastWalk) {
  const printFull = true;
  const homefs = jetpack.cwd(home);
  let documents;
  if (homefs.exists("Documents")) documents = homefs.cwd("Documents");
  if (homefs.exists("My Documents")) documents = homefs.cwd("My Documents");
  const docs = documents.dir("StEdwards").dir("PaymentSummary").cwd();
  logit("paymentsSummaryReport3", { payload, lastWalk });
  logit("", homefs.cwd(), documents.cwd(), docs);

  let docname = `${docs}/paymentSummary-${payload.startDate
    .substr(0, 16)
    .replace(/:/g, ".")}.pdf`;
  // let docname = `${docs}/paymentSummary-${payload.startDate.substr(0, 16).replace(/:/g, '.')}.pdf`;
  const margin = 30;
  var doc = new PDFDocument({
    size: "A4",
    margins: { top: 20, bottom: 20, left: margin, right: margin },
    autoFirstPage: false
  });
  doc.pipe(fs.createWriteStream(docname));
  doc.registerFont(
    "ArialNarrow-Bold",
    `${__dirname}/../fonts/system/Arial Narrow Bold.ttf`
  );
  doc.registerFont(
    "TimesNewRomanPS-BoldMT",
    `${__dirname}/../fonts/system/Times New Roman Bold.ttf`
  );

  var title = "St.Edwards Fellwalkers: Payments Summary";
  doc.on("pageAdded", () => {
    const height14 = doc.fontSize(14).currentLineHeight();
    const height4 = doc.fontSize(4).currentLineHeight();
    const fmtDate = dat => new XDate(dat).toString("ddd dd MMM");
    // doc.rect(0, 0, 80,15).stroke('red');
    // doc.rect(0, 0, 80,20).stroke('blue');
    // doc.rect(0, 0, 30,30).stroke('blue');
    // doc.rect(0, 0, 40,40).stroke('blue');
    // doc.rect(0, 0, 50,50).stroke('blue');
    // doc.rect(0, 0, 60,60).stroke('blue');
    // doc.rect(0, 0, 70,70).stroke('blue');
    // doc.rect(0, 0, 75,75).stroke('red');
    drawSVG(doc, 50, 35, 0.25, "St_EdwardsLogoSimple");
    // doc.image(__dirname+'/../assets/steds-logo.jpg', 30, 30, {fit: [20, 20], continued: true})
    doc
      .font(bold)
      .fontSize(14)
      .text(title, 30, 30 + (20 - height14) / 2, { align: "center" });
    doc
      .font(normal)
      .fontSize(9)
      .text(
        new XDate().toString("yyyy-MM-dd HH:mm"),
        30,
        30 + (20 - height4) / 2,
        { align: "right" }
      );
    // doc.fontSize(14).text(`${payload.startDispDate} to ${payload.endDispDate}`, 30, 30+(20+height14)/2, {align: 'center'})
    doc
      .fontSize(14)
      .text(
        `${fmtDate(payload.startDate)} to ${fmtDate(payload.endDate)}`,
        30,
        30 + (20 + height14) / 2,
        { align: "center" }
      );
  });

  reportBody(payload, printFull, doc, lastWalk);
  doc.end();
  return docname.substr(home.length + 1);
}

function prepareData(payload, printFull) {
  const walkIds = new Set(WS.openWalks.map(walk => walk._id));
  const openWalks = new Set(WS.openWalks.map(walk => walk._id));
  const accData = [];
  let addToCredit = false;
  payload.accounts
    .filter(acc => acc.activeThisPeriod && (printFull || acc.paymentsMade > 0))
    // .filter(acc=>acc.accId === 'A1049')
    .forEach(acc => {
      // logit("account", acc.accName, acc);
      const { paymentsMade, accId, available, accName } = acc;
      const grid = {};
      acc.logs
        .filter(log => log.type === "W" && log.activeThisPeriod)
        .filter(
          log => (log.paid && log.paid.P > 0) || (printFull && !log.ignore)
        )
        .forEach(log => {
          walkIds.add(log.walkId);
          if (!openWalks.has(log.walkId)) log.late = true;
          if (!grid[log.memId])
            grid[log.memId] = {
              name: MS.members.get(log.memId).fullNameR,
              bkngs: []
            };
          grid[log.memId].bkngs.push(log);
        });
      const memIds = Object.keys(grid).sort(
        (a, b) => grid[a].name > grid[b].name
      );
      if (available.P) addToCredit = true;
      accData.push({
        paymentsMade,
        accId,
        accName,
        memIds,
        addToCredit: available.P,
        grid
      });
    });
  const walkIndex = new Map(
    Array.from(walkIds).sort((a, b) => a > b).map((id, i) => [id, { index: i }])
  );
  walkIndex.forEach((data, walkId) => {
    data.name =
      WS.walks.get(walkId).names.code +
      " " +
      new XDate(walkId.substr(1)).toString("dd MMM");
  });
  return { accData, walkIndex, addToCredit };
}

export function reportBody(payload, printFull, doc, lastWalk) {
  const tots = payload.tots;
  const netCashAndCheques =
    (tots.P ? tots.P[1] : 0) - (tots.PC ? tots.PC[1] : 0);

  const { walkIndex, accData, addToCredit } = prepareData(payload, printFull);
  const noWalks = walkIndex.size;
  doc.addPage();

  const margin = 30;
  const marginV = 20;
  const pWidth = doc.page.width;
  const pHeight = doc.page.height;
  const colW = pWidth / 2 - margin - 10;
  const colHeadY = 70;
  const r = 3;
  const fontHeight = calcLineHeights(doc);
  const szD = 11;
  const detailH = fontHeight[szD];
  const gapH = fontHeight[3];
  const bkWidth = 23;
  const bxW = colW + 8;
  const paidCol = addToCredit ? -2.5 : -1.5;
  let x, y;
  let col = 0;
  const setEndY = (endY, printHeading = false) => {
    if (pHeight - marginV - endY - 1 <= 0) {
      x = pWidth - margin - colW;
      y = colHeadY;
      col = (col + 1) % 2;

      if (col === 0) {
        x = margin;
        doc.addPage();
      }
      if (printHeading) {
        y = printColumnHeading(x, y, walkIndex);
      }
    }
  };

  const printColumnHeading = (x, y, walks) => {
    // header for walk names(codes)
    const nbsp = "\u00A0";

    const boxPt = 2;
    const szH = 9;
    const ht = 3 * fontHeight[szH] + boxPt;
    const printCell = (i, text) => {
      const x1 = x + colW - bkWidth * (noWalks - i);
      doc
        .font(normal)
        .fontSize(szH)
        .fillColor("black")
        .text(text, x1, y + 1, { align: "center", width: bkWidth });
      doc.moveTo(x1, y - boxPt).lineTo(x1, y - boxPt + ht).stroke("#888");
    };
    doc.roundedRect(x - 2, y - boxPt, bxW, ht, r).fillAndStroke("#ccc", "#888");
    printCell(paidCol, nbsp + nbsp + nbsp + " Paid ");
    if (addToCredit) printCell(-1, "Add to Crdt");
    walks.forEach(walk => {
      const i = walk.index;
      printCell(i, walk.name);
    });
    return doc.y + 4;
  };
  // routines for printing individual components
  const printAccountHeader = (x, y, ht) => {
    const boxPt = 2;
    doc.roundedRect(x - 2, y - boxPt, bxW, ht, r).stroke("#888");
    const drawBar = (x, y, i) => {
      const x1 = x + colW - bkWidth * (noWalks - i);
      doc.moveTo(x1, y - boxPt).lineTo(x1, y - boxPt + ht).stroke("#ccc");
    };
    if (addToCredit) drawBar(x, y, -1);
    drawBar(x, y, paidCol);
    walkIndex.forEach(walk => {
      const i = walk.index;
      drawBar(x, y, i);
    });
  };
  const showMoney = (
    x,
    y,
    dY,
    value,
    text,
    rectFill,
    rectStroke,
    textColor
  ) => {
    const boxWidth = 20, moneyWidth = 15;
    const boxOff = (1.5 * bkWidth - boxWidth) / 2;
    const x1 = x + colW - bkWidth * (noWalks - paidCol);
    doc
      .roundedRect(x1 + boxOff, y + dY - 1, boxWidth, detailH - 2, r)
      .fillAndStroke(rectFill, rectStroke);
    doc
      .fillColor(textColor)
      .fontSize(szD - 2)
      .text(`£${Math.abs(value)}`, x1 + boxOff, y + dY, {
        align: "right",
        width: moneyWidth
      });
  };

  const printWalkIcon = (x, y, log) => {
    const i = walkIndex.get(log.walkId).index;
    const x1 = x + colW - bkWidth * (noWalks - i - 0.5) - detailH * 0.4;
    const x2 = x + colW - bkWidth * (noWalks - i);
    const bkng = log.req;
    if (log.late)
      doc
        .opacity(0.2)
        .rect(x2, y - 1, bkWidth, detailH)
        .fill("yellow")
        .opacity(1);
    let icon;
    const xtra = {};
    if (log.owing === 0 && log.paid) {
      if (log.paid.P > 0) {
        icon = `check-${bkng}`;
      } else {
        if (log.paid.T > 0) icon = `icon-T`;
        if (log.paid["+"] > 0) icon = `icon-Cr`;
        xtra.fill = bkng === "B" ? "green" : "blue";
      }
    } else icon = `icon-${bkng}`;
    // if (log.memId==='M1158')logit('icon', log.paid, icon);
    if (log.owing !== 0 && log.owing !== log.amount)
      xtra.fill = bkng === "B" ? "#84C784" : "#5b5bf2";
    // if (log.memId==='M1049')logit('text', log, xtra);
    drawSVG(doc, x1, y - 1, 0.5, icon, xtra);

    if (log.owing > 0 && log.paid) {
      let text = "";
      if (log.paid.P > 0) text += ` £${log.paid.P}`;
      else if (log.paid.T > 0) text += ` T${log.paid.T}`;
      else if (log.paid["+"] > 0) text += ` Cr${log.paid["+"]}`;
      if (text !== "") {
        doc
          .fontSize(szD - 3)
          .text(text, x2 - 1, y + 5, { width: bkWidth, align: "right" });
      }
      // if (log.memId==='M1049')logit('text', log.paid, text);
    }
  };
  doc.font(normal);

  logit("walkIndex", { walkIndex });
  y = colHeadY;
  x = margin;
  y = printColumnHeading(x, y, walkIndex);
  setEndY(y);
  // y= yOff;
  accData.forEach(acc => {
    const { paymentsMade, memIds, addToCredit, grid } = acc;
    // logit('account', acc.accName);
    // console.log(prettyFormat(acc));
    let accHeight = 2 + detailH * memIds.length;
    const dY = detailH * ((memIds.length - 1) * 0.5) + 1;
    setEndY(y + accHeight);
    printAccountHeader(x, y, accHeight);
    var startY = y;

    memIds.forEach(memId => {
      const { name, bkngs } = grid[memId];
      doc.fontSize(szD).fillColor("black").text(name, x, y);
      bkngs.forEach(log => printWalkIcon(x, y, log));
      y += detailH;
    });
    if (addToCredit) {
      doc
        .fontSize(szD)
        .text(
          `£${addToCredit}`,
          x + colW - bkWidth * (noWalks + 1 - 0.5) - detailH * 0.4,
          startY + dY,
          { height: detailH * 0.8 }
        );
    }
    if (paymentsMade > 0)
      showMoney(x, startY, dY, paymentsMade, "Paid", "#cfe", "#484", "blue");
    y = startY + accHeight;
    y += gapH;
  });
  const lwW = colW * 0.7;
  const lwH = (lastWalk ? 6 : 0) * fontHeight[11];
  setEndY(y + fontHeight[12] + lwH + 8);
  doc
    .font(bold)
    .fontSize(12)
    .fillColor("black")
    .text("Cash & Cheques to Bank", x, y)
    .text(`£${netCashAndCheques}`, x, y, { width: colW, align: "right" });

  y += fontHeight[12] + 8;
  logit("lastWalk", lastWalk);
  const makeHeadBox = (bxW, bxH, r) =>
    `h ${bxW - 2 * r} a ${r},${r} 0 0 1 ${r},${r} v ${bxH - r}  h -${bxW} v -${bxH - r} a ${r},${r} 0 0 1 ${r},${-r} Z`;

  if (lastWalk) {
    x += 45;
    const headBox = makeHeadBox(lwW, fontHeight[11], r);

    const boxPt = 2;
    doc
      .path(`M ${x - 2 + r},${y - boxPt} ${headBox}`)
      .lineWidth(1)
      .fillOpacity(0.8)
      .fillAndStroke("#ccc", "#888");
    doc.roundedRect(x - 2, y - boxPt, lwW, lwH, r).stroke("#888");

    const opts = { width: lwW - 5, align: "right" };
    const fee = lastWalk.fee;
    const total =
      (lastWalk.totals.C * 0.5 + lastWalk.totals.B + lastWalk.totals.BL) * fee;
    doc.font(normal).fontSize(11).fillColor("black");
    doc.text(`Last Walk: `, x, y);
    doc
      .font(bold)
      .text(` ${lastWalk.date}  ${lastWalk.venue}`, x + 50, y, {
        width: lwW - 50,
        height: fontHeight[11],
        ellipsis: true
      })
      .font(normal);
    y += fontHeight[11] + 4;
    doc.text(`Bus Bookings (${lastWalk.totals.B})`, x, y);
    doc.text(`£${lastWalk.totals.B * fee}  `, x, y, opts);
    y += fontHeight[11];
    doc.text(`Bus Late Cancellation (${lastWalk.totals.BL})`, x, y);
    doc.text(`£${lastWalk.totals.BL * fee}  `, x, y, opts);
    y += fontHeight[11];
    doc.text(`Car Bookings (${lastWalk.totals.C})`, x, y);
    doc.text(`£${lastWalk.totals.C * fee * 0.5}  `, x, y, opts);
    y += fontHeight[11] + 4;
    doc.text(`Total Income`, x, y);
    doc.font(bold).text(`£${total}`, x, y, opts);
  }

  // drawSVG(doc, x+colW/2, y+colW/2, 0.5, 'St_EdwardsLogoSimple');
  // drawSVG(doc, x+colW/2, y+colW/2, 0.5, 'St_EdwardsLogo');
}
