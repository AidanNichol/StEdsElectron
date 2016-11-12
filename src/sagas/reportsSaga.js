import React from 'react';
import TooltipButton from '../components/utility/TooltipButton';
import {connect} from 'react-redux';
import Logit from '../factories/logit.js';
var logit = Logit('color:yellow; background:black;', 'reports:saga');
// import fs from 'fs';
// import {actions} from '../ducks/memberslist-duck';
import{membershipListReport} from '../reports/membershipListPDF2';
import{summaryReport} from '../reports/summaryReport';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

import { take, select, put, call } from 'redux-saga/effects';
logit('enviromnent', process.env)

//----------------------------------------------------------
//      sagas
//----------------------------------------------------------

const pdfmap = {
  'busList': summaryReport,
  'memberslist': membershipListReport,
  'buslist/Print': summaryReport,
  'members/list/print': membershipListReport,
  'payments/print': summaryReport,
  'PRINT_REQUEST': '',
};
export default function* reportsSaga(){


  while(true){ // eslint-disable-line no-constant-condition
    let action = yield take(Object.keys(pdfmap));
    // if (action.payload) fs.writeFileSync('/www/sites/StEdsElectron/temp.json', JSON.stringify(action.payload));
    let report = pdfmap[action.report] || pdfmap[action.type];
    logit('take', {action})
    yield put({type: 'PRINT_STARTED'})
    let state = yield(select((state)=>state));
    let name = yield(call(report, action.payload, state ));
    yield call(delay, 1000);
    yield put({type: 'PRINT_FINISHED', name})
    logit('PDF', {name, action});
    yield call(delay, 5000);
    yield put({type: 'PRINT_CLEAR'})
  }
}

//----------------------------------------------------------
//      components
//----------------------------------------------------------

const Print = ({printing, reportName, tiptext, report, payload, ...props})=>{
  let icon = printing ? 'spin' : "Printer";
  if (reportName && reportName!==''){
    icon='Yes_check';
    tiptext='Printed saved as '+reportName;
  }
  logit('TooltipButton', {printing, icon, reportName, tiptext, props})
  return ( <TooltipButton {...props} tiptext={tiptext} icon={icon} iconStyle={{width: 40}}/> )
}
const mapStateToProps = (state, {className='', report, payload, ...rest})=>({
  className: 'report '+className,
  printing: state.controller.printing,
  reportName: state.controller.reportName,
  ...rest,
})
function mapDispatchToProps(dispatch, {report, payload}) {
  return {
    onClick: ()=> dispatch({type:'PRINT_REQUEST', report, payload}),
  }
}
export const PrintButton = connect(mapStateToProps, mapDispatchToProps)(Print)
