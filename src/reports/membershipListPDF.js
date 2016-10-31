/* global pdfMake */
import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'printMembers:saga');
import fs from 'fs';
// import db from 'services/bookingsDB';
import {getSubsStatus} from '../utilities/subsStatus';

import XDate from 'xdate';
logit('enviromnent', process.env)

// Get the logo - couldn't get referencing the file directly working.
var logo;
fs.readFile(process.env.PWD+'/assets/steds-logo.jpg',  'base64', (err, data)=>{
  if (err)logit('get logo', err);
  else {
    logo = 'data:image/jpeg;base64,'+data;

  }
});

const columns = [
    {width: 75, field: 'name',      title: 'Name',   },
    {width: 10, field: 'subs',      title: '£',   },
    // {width: 10, field: 'memberStatus',   title: 'St' ,   },
    {width: 'auto', field: 'address',   title: 'Address' ,   },
    {width: 55, field: 'phone',     title: 'Phone'   ,   },
    {width: 15, field: 'memNo',     title: 'No'    ,     style: {alignment: 'right'}},
    {width: 135, field: 'email',     title: 'Email'   ,   },
    {width: 57, field: 'mobile',    title: 'Mobile'  ,   },
    {width: 125, field: 'nextOfKin', title: 'Next of Kin' ,     style: {alignment: 'center'}},
    {width: 62, field: 'medical',   title: 'Medical' ,     style: {alignment: 'center'}}];

function showSubs(mem){
  const statusMap = {Member: '', HLM: 'hlm', Guest: 'gst', '?': ''};
  const subsMap = {OK:{color: 'green'}, due: {color: 'orange', bold: true}, late: {color: 'red', bold: true}};
  let stat = statusMap[mem.memberStatus||'?'];
  if (stat !== '') return stat;
  let subs = getSubsStatus(mem);
  return {text: `'${mem.subscription ? parseInt(mem.subscription)%100:16}`,
    ...subsMap[subs.status]};
}
export function membershipListReport(members){
  // const subsMap = {ok:{'✓'}, due: '?', late: '✘'};
  let fmtMem = {};
  logit('bildPDF', members)
  let data = members.map((mem)=>{
    fmtMem = {...mem,
      memNo: mem._id.substr(1),
      // name: {columns: [mem.lastName+", "+mem.firstName, {text: statusMap[mem.memberStatus||'?'], alignment: 'right', fontSize: 6 }]},
      name: mem.lastName+", "+mem.firstName,
      // memberStatus: statusMap[mem.memberStatus||'?'],
      address: (mem.address||'').replace("\n", ", "),
      subs: showSubs(mem),
    };
    // let subs = getSubsStatus(mem);
    // fmtMem.subs = {text: `'${mem.subscription ? parseInt(mem.subscription)%100:16}`,
    //   ...subsMap[subs.status]};
    // fmtMem.subs = subsMap[subs.status];
    return columns.map((col)=>col.style ? {text: fmtMem[col.field], ...col.style} : fmtMem[col.field]);
  });

  const headers = columns.map((col)=>({text: col.title, style: 'tableHeader', ...(col.style||{})}));

  let dd = {
    pageSize: 'A4',

    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: 'landscape',

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [ 10, 37, 10, 40 ],

    footer: (currentPage, pageCount) =>{
      return {
        columns: [
          (new XDate().toString('yyyy-MM-dd HH:mm')),
          { text: `page ${currentPage.toString()} of ${pageCount}`, alignment: 'right' }
        ],
        margin: [ 10, 4, 10, 2 ]
      };
    },
    header: ()=>(
      {columns: [
        { image: logo, fit: [30, 30]},
        { text: 'St.Edwards Fellwalkers: Membership', style: 'header'},
        ''
      ], margin: [ 10, 2, 10, 4 ]}
    ),
    content: [

      {
        style: 'tableExample',
        table: {
          widths: columns.map((col)=>col.width),
          headerRows: 1,
          body: [
            headers,
            ...data,
          ]
        },
        layout: 'lightHorizontalLines'

      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'black'
      }
    },
    defaultStyle: {
      fontSize: 8,
      // alignment: 'justify'
    }

  }

  fs.writeFile('tempPDF.json', JSON.stringify(dd));
  logit('pdfMake', pdfMake)
  pdfMake.createPdf(dd).download('membersList.pdf');
  // pdfMake.createPdf(dd).getBuffer((result)=>{
  //   fs.writeFile('temp.pdf', result, "MacRomanEncoding");
  //
  // });
}
