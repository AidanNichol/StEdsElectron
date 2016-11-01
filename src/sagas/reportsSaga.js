import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'reports:saga');
// import fs from 'fs';
// import {actions} from '../ducks/memberslist-duck';
import{membershipListReport} from '../reports/membershipListPDF2';
import{summaryReport} from '../reports/summaryReport';

import { take, select } from 'redux-saga/effects';
logit('enviromnent', process.env)

const pdfmap = {
  'buslist/Print': summaryReport,
  'members/list/print': membershipListReport,
  'payments/print': summaryReport,
};
export default function* reportsSaga(){


  while(true){ // eslint-disable-line no-constant-condition
    let action = yield take(Object.keys(pdfmap));
    // if (action.payload) fs.writeFileSync('/www/sites/StEdsElectron/temp.json', JSON.stringify(action.payload));

    logit('take', {action})
    let state = yield(select((state)=>state));
    let pdf = pdfmap[action.type]( action.payload, state );
    logit('PDF', {pdf, action});
  }
}
