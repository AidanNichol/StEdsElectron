/* jshint quotmark: false */
import { connect } from 'react-redux';
import {getAllDebts, getWalkLogsByDate, getAccountLogByDateAndType} from '../containers/PaymentsFunctions'
import {saveSummary} from 'ducks/paymentssummary-duck.js';
// import {setPage} from 'ducks/router-duck.js';
import {getLogTime} from 'utilities/DateUtilities.js';
import XDate from 'xdate';
import fs from 'fs'

import React from 'react';
import {Panel} from 'components/utility/AJNPanel'
import TooltipButton from 'components/utility/TooltipButton.js';
// import TooltipContent from '../utility/TooltipContent.js';
import {Icon} from 'ducks/walksDuck'
// import {Lock} from 'ducks/lock-duck'

import Logit from 'factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Summary');


const AccLogRec = ({log})=>{return (
    <div className='walk-detail'>{log.dispDate} <span>£{log.amount}</span>  {log.text && ` [${log.text}] `}<span className="name">{log.name}</span> </div>
  )}

const BkngLogRec = ({log})=>(
    <div className='walk-detail'>{log.dispDate}<Icon type={log.req} width="16"/>  <span>{log.amount}</span>{log.text&&log.text!=='' && ` [${log.text}] `}<span className="name">{log.name}</span> </div>
  )


function Payments({doc, bankMoney}){

    logit('payments', doc);
    var {aLogs, bLogs, tots,
    closingDebt, closingCredit,
    openingDebt, openingCredit, startDispDate, endDispDate} = doc;
    var calcNew = {debt: openingDebt, credit: openingCredit};
    logit('calcNew', calcNew)

    const AccLineTot = ({title, factor='', item, className=''}) =>{
      // logit('AccLineTot', {title, factor, amount: tots[item]&&tots[item][1], item, tots})
      if (!tots[item])return null;
      return (<div className={"line detail "+className}><div className="title">{title.replace(/ /g, ' ')} ({tots[item][0]})</div><div className="value">{factor}£<span>{tots[item][1]}</span></div></div>)
    }
    const AccLine = ({title, factor='', item, opt, className=''}) =>{
      if (opt && item <=0 )return null;
      // logit('AccLine', {title, factor, item})
      return (<div className={"line "+className} ><div className="title">{title.replace(/ /g, ' ')}</div><div className="value">{factor}£<span>{item}</span></div></div>)
    }

    // const creditsUsed = openingCredit + (tots.BX ? tots.BX[1] : 0) + (tots.CX ? tots.CX[1] : 0) - (tots.PC ? tots.PC[1] : 0) - closingCredit;
    const creditsUsed = openingCredit - closingCredit;
    const netBookings = (tots.B ? tots.B[1] : 0) + (tots.C ? tots.C[1] : 0)
                      - (tots.BX ? tots.BX[1] : 0) - (tots.CX ? tots.CX[1] : 0);
    const netCashAndCheques =  (tots.P ? tots.P[1] : 0) - (tots.PC ? tots.PC[1] : 0)
    const netBACS = (tots.PB ? tots.PB[1] : 0) - (tots.PBC ? tots.PBC[1] : 0)
    const netPayments = netCashAndCheques + netBACS;
    const calcDebt = openingDebt + netBookings - netPayments - creditsUsed;
    // logit('creditsUsed', creditsUsed)
    var title = (<h4>Payments Made</h4>);
    return (
    <Panel className="payments-summary" header={title} style={{margin:20}} >
      {startDispDate ||'?? ??? ??:??'} to {endDispDate}
      <section>
      <div className="summary grid">
          <div>
            <AccLine title="Opening Credit" item={openingCredit}/>
          </div>
          <div>
            <AccLine title="Opening Debt" item={openingDebt}/>
          </div>
          <div>&nbsp; </div>
          <div>
            <AccLineTot factor='' title="Bus Bookings Made" item='B'/>
            <AccLineTot factor='' title="Car Bookings Made" item='C'/>
            <AccLineTot factor='-' title="Bus Bookings Cancelled" item='BX'/>
            <AccLineTot factor='-' title="Car Bookings Cancelled" item='CX'/>
            <AccLineTot factor='-' title="Bus Cancelled (no credit)" item='BL'/>
            <AccLineTot factor='-' title="Car Cancelled (no credit)" item='CL'/>
            <AccLine factor='+' title="Net Bookings" item={netBookings}/>
            <AccLineTot factor='' title="Payments Received" item='P'/>
            <AccLineTot factor='' title="Payments Received(BACS)" item='PB'/>
            <AccLineTot factor='-' title="Payments Refunded" item='PC'/>
            <AccLineTot factor='-' title="Payments Refunded(BACS)" item='PBC'/>
            <AccLine factor='-' title="Net Payments" item={netPayments}/>
          </div>
          <div>
          {/* <CreditUsed/> */}
            <AccLine factor='－' opt title="Net Credit Used" item={creditsUsed}/>
            <AccLine factor='+' opt title="Net Credit Issused" item={-creditsUsed}/>
          </div>
          <div>
            <AccLine factor='-' opt title="Net Credit Used" item={creditsUsed}/>
            <AccLine factor='+' opt title="Net Credit Issued" item={-creditsUsed}/>
          </div>
          <div>
            <AccLine title="Closing Credit" item={closingCredit}/>
          </div>
          <div>
            <AccLine title="Closing Debt" item={-closingDebt}/>
            {-closingDebt!==calcDebt && <AccLine title="Calculated Closing Debt" className="error" item={calcDebt}/>}
          </div>
          <div>&nbsp;</div>
          <div className="block" >
              <AccLine title="Cash & Cheques to Bank" className="bank" item={netCashAndCheques}/>
          </div>
      </div>
      <div className="buttons">
      <TooltipButton icon="bank" onClick={()=>{bankMoney(doc)}} tiptext="Bank the money and start new period" visible/>

      </div>
      </section>
      <div className="all-debts">
        {/* <Lock /> */}
        <div>
        {
          aLogs.map((log,i) => {return <AccLogRec {...{log, i}} key={'logAcc'+i} />})
        }
        </div>
        <div>
        {
          bLogs.map((log, i) => {return <BkngLogRec {...{log, i}} key={'logBkng'+i} />})
        }
        </div>
      </div>
    </Panel>
  )

}

function mapDispatchToProps(dispatch) {
  return {
    bankMoney: (doc)=>dispatch(saveSummary(doc)),
  };
}

const mapStateToProps = function(state) {
  var startDate, endDate, openingCredit=0, openingDebt=0;

  // endDate = '2016-11-04T23:00:00';startDate = '2016-10-01T00:00:00';
  // startDate = '2016-11-04T23:00:00'; endDate = '2016-11-06T23:00:00'; openingCredit=72; openingDebt=268;
  // startDate = '2016-11-06T23:00:00'; endDate = '2016-11-18T09:00:00'; openingCredit=72; openingDebt=212;
  // startDate = '2016-11-18T09:00:00'; endDate = '2016-11-21T09:00:00'; openingCredit=56; openingDebt=140;
  // startDate = '2016-11-21T09:00:00'; endDate = '2016-12-01T09:27:24'; openingCredit=40; openingDebt=96;
  // startDate = '2016-12-01T09:27:24'; openingCredit=52; openingDebt=112;
// const endDates = {
//   ['2016-11-06T23:00:00']: '2016-11-18T09:00:00',
//   ['2016-11-18T09:00:00']: '2016-11-21T09:00:00',
//   ['2016-11-21T09:00']: '2016-12-01T09:27:24',}
  startDate = state.paymentsSummary.lastPaymentsBanked;
  endDate = state.paymentsSummary.paymentsLogsLimit;
  openingCredit = state.paymentsSummary.openingCredit;
  openingDebt = -state.paymentsSummary.openingDebt;
  logit('range data', {startDate, endDate,openingCredit, openingDebt})
  if (!endDate)endDate = getLogTime();
  const {credits, debts} = getAllDebts(state);

  var aLogs = getAccountLogByDateAndType(state, startDate, endDate, 'P');
  var bLogs = getWalkLogsByDate(state, startDate, endDate);
  var tots = [...bLogs, ...aLogs].reduce((tot, lg)=>{
    if (!tot[lg.req])tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += lg.amount;
    return tot;
  }, {});

  var doc ={
    closingCredit: credits.reduce((sum, item)=>sum+item.balance, 0),
    closingDebt: debts.reduce((sum, item)=>sum+item.balance, 0),
    openingCredit,
    openingDebt,
    aLogs, bLogs, tots,
    endDate, startDate,
    startDispDate: startDate && (new XDate(startDate).toString('dd MMM HH:mm')),
    endDispDate: (new XDate(endDate).toString('dd MMM HH:mm')),
    type: 'paymentSummary',
    _id: 'BP'+endDate.substr(0, 16),
  }
  logit('logs doc', doc, __dirname);
  fs.writeFileSync(`${__dirname}/../../../tests/paymentsFrom${startDate.substr(0,16).replace(/:/g, '.')}.json`, JSON.stringify(doc))
  return { doc };
}
export default connect(mapStateToProps, mapDispatchToProps)(Payments);
