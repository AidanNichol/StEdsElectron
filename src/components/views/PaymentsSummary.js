/* jshint quotmark: false */
import { connect } from 'react-redux';
import {observer, inject} from 'mobx-react';
import mobx from 'mobx';
import {saveSummary} from 'ducks/paymentssummary-duck.js';
import {ShowRecipts} from 'components/views/paymentsMade';
import {paymentsSummaryReport} from 'reports/paymentsSummaryReport2'
// import {setPage} from 'ducks/router-duck.js';
import {getLogTime} from 'utilities/DateUtilities.js';
import {flatten, difference} from 'lodash'
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
    <div className='walk-detail'>{log.dispDate}<Icon type={log.req} width="16"/>  <span className="amount">£{Math.abs(log.amount)}</span> <span className="name">{log.name}</span> {log.text && ` [${log.text}] `} </div>
  )}

const BkngLogRec = ({log})=>(
    <div className='walk-detail'>{log.dispDate}<Icon type={log.req} width="16"/>  <span>{log.amount}</span>{log.text&&log.text!=='' && ` [${log.text}] `}<span className="name">{log.name}</span> </div>
  )


const Payments = observer(({doc, bankMoney})=>{

    logit('payments', doc, bankMoney);
    var {aLogs, bLogs, tots, payments,
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
    const netBACS = (tots.T ? tots.T[1] : 0) - (tots.TX ? tots.TX[1] : 0)
    const netCredit = (tots['+'] ? tots['+'][1] : 0) - (tots['+X'] ? tots['+X'][1] : 0)
    const netPayments = netCashAndCheques + netBACS+netCredit;
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
            <AccLineTot factor='' title="Payments Received(BACS)" item='T'/>
            <AccLineTot factor='-' title="Payments Refunded" item='PX'/>
            <AccLineTot factor='-' title="Payments Refunded(BACS)" item='TX'/>
            <AccLineTot factor='' title="Credits Awarded" item='+'/>
            <AccLineTot factor='-' title="Credits Removed" item='+X'/>
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
      {/* <div className="all-debts"> */}
      <ShowRecipts  logs={payments} showMemberBookings={()=>{}}/>
      {/* <div>
        {
        aLogs.map((log,i) => {return <AccLogRec {...{log, i}} key={'logAcc'+i} />})
        }
        </div>
        <div>
        {
        bLogs.map((log, i) => {return <BkngLogRec {...{log, i}} key={'logBkng'+i} />})
        }
      </div> */}
      {/* </div> */}
    </Panel>
  )

})

function mapDispatchToProps(dispatch) {
  return {
    bankMoney: (doc)=>dispatch(saveSummary(doc)),
  };
}


export const mapStoreToProps = function({AS}) {
  var openingCredit=AS.openingCredit,
      openingDebt=-AS.openingDebt,
      startDate = AS.lastPaymentsBanked,
      endDate = AS.paymentsLogsLimit || getLogTime();
  logit('range data', {startDate, endDate,openingCredit, openingDebt})
  const accountsStatus = mobx.toJS(AS.allAccountsStatus);
  // const filterCurrent = (type, logs)=>logs.filter(log=>log.type===type).filter(({dat})=> dat>startDate && dat < endDate);
  const filterCurrentLogs = (logs)=>logs.filter(({dat})=> dat>startDate && dat < endDate);
  logit('accountsStatus', accountsStatus)
  // var buyCredits = flatten(accountsStatus.filter(acc=>acc.extraCash));
  // var aLogs = flatten(accountsStatus.map(acc=>filterCurrent('A', acc.logs)));
  // var bLogs = flatten(accountsStatus.map(acc=>filterCurrent('W', acc.logs)));
  var cLogs = flatten(accountsStatus.map(acc=>filterCurrentLogs(acc.logs)));
  // var bLogs = flatten(accountsStatus.map(acc=>acc.logs.filter(log=>log.type==='W').filter(({dat})=> dat>startDate && dat < endDate)));
  var payments = accountsStatus.filter(acc=>acc.paymentsMade > 0)
  // var payments = accountsStatus.filter(acc=>acc.paymentsMade > 0).map(acc=>{let logs = filterCurrent('W', acc.logs); acc.logs = logs; return acc});
  // var pLogs = flatten(payments.map(acc=>acc.logs.filter(log=>log.type==='W').filter(({dat})=> dat>startDate && dat < endDate)));
  // var pLogs = flatten(payments.map(acc=>filterCurrent('W', acc.logs)));
  // var extra = difference(bLogs, payments);
  // logit('preTots', {aLogs, bLogs, buyCredits, extra, pLogs})
  // var tots = [...bLogs, ...aLogs].reduce((tot, lg)=>{
  var tots = cLogs.reduce((tot, lg)=>{
    if (!tot[lg.req])tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += Math.abs(lg.amount);
    return tot;
  }, {});

  var doc ={
    closingCredit: accountsStatus.filter(acc=>acc.balance > 0).reduce((sum, item)=>sum+item.balance, 0),
    closingDebt: accountsStatus.filter(acc=>acc.balance < 0).reduce((sum, item)=>sum+item.balance, 0),
    openingCredit,
    openingDebt,
    endDate, startDate,
    payments,
    // aLogs, bLogs,
    cLogs,
    tots,
    startDispDate: startDate && (new XDate(startDate).toString('dd MMM HH:mm')),
    endDispDate: (new XDate(endDate).toString('dd MMM HH:mm')),
    type: 'paymentSummary',
    _id: 'BP'+endDate.substr(0, 16),
  }
  logit('logs doc', doc, __dirname);
  fs.writeFileSync(`${__dirname}/../../../tests/paymentsFrom${startDate.substr(0,16).replace(/:/g, '.')}.json`, JSON.stringify(doc))
  logit('write report');
  // paymentsSummaryReport(doc)
  return  doc;
}
export default connect(()=>({}), mapDispatchToProps)(inject(mapStoreToProps)(Payments));
