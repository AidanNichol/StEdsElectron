/* global pdfMake */
import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'printMembers:saga');
import fs from 'fs';
// import db from 'services/bookingsDB';
import {getBusBookings, getCarBookings, getWaitingList} from '../components/containers/buslists-container';

import XDate from 'xdate';
import { call, put, take, select } from 'redux-saga/effects';
logit('enviromnent', process.env)

// Get the logo - couldn't get referencing the file directly working.
var logo;
fs.readFile(process.env.PWD+'/assets/steds-logo.jpg',  'base64', (err, data)=>{
  if (err)logit('get logo', err);
  else {
    logo = 'data:image/jpeg;base64,'+data;

  }
});

export default function* printBuslistSaga(){


  while(true){ // eslint-disable-line no-constant-condition
    let action = yield take('buslist/Print');
    let state = yield(select((state)=>state));
    let pdf = buildPDF( state );
    logit('PDF', {pdf, action});
  }
}

const getData = (table, data, text, showNumber)=>{
  if (data.length === 0)return;
  if (text.length > 0)table.push({text, style: 'subheader'});
  data.forEach((bkng, i)=> {
    table.push({text: `${showNumber ? i+' ':''}${bkng.name}${bkng.annotation||''}`})
  })
}

function buildPDF(state){
  let walks = state.walks.bookable.map((walkId)=>{
    let table = [];
    let walk = state.walks.list[walkId];
    let dispDate = new XDate(walk.walkDate).toString('dd MMM');
    let venue = walk.venue.replace(/\(.*\)/, '');
    table.push({text: [venue, {text: ` (${dispDate})`, fontSize: 9}], style: 'header'});
    // table.push({text: dispDate, style: 'header'});
    // table.push({text: venue, style: 'header'});
    getData(table, getBusBookings(state, walkId), '', false);
    getData(table, getCarBookings(state, walkId), 'Cars', false);
    getData(table, getWaitingList(state, walkId), 'Waiting List', true);
    return table;
  });
  logit('bildPDF', walks)


  let dd = {
    pageSize: 'A4',

    // by default we use portrait, you can change it to landscape if you wish
    pageOrientation: 'portrait',

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins: [ 10, 37, 10, 40 ],

    header: ()=>(
      {columns: [
        { width: 100, image: logo, fit: [20, 20]},
        { width: '*', text: 'St.Edwards Fellwalkers: Bus Lists', style: 'header', alignment: 'center'},
        {width: 100, text:(new XDate().toString('yyyy-MM-dd HH:mm')), alignment: 'right', fontSize: 9}
      ], margin: [ 10, 2, 10, 4 ]}
    ),
    content: [
      {columns: walks}
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 2]
      },
      subheader: {
        fontSize: 12,
        bold: true,
        color: 'blue',
        fillColor: '#ff0000',
        margin: [0, 2, 0, 2],
        underline: true,
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
      fontSize: 12,
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
