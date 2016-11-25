/* jshint quotmark: false */
import { connect } from 'react-redux';
var xxx = require( '../containers/PaymentsFunctions')
import {getAllDebts, getWalkLogsByDate, getAccountLogByDateAndType} from '../containers/PaymentsFunctions'
import {dispatchIfUnlocked} from 'ducks/lock-duck.js';
import {setPage} from 'ducks/router-duck.js';
import {getLogTime} from 'utilities/DateUtilities.js';

import React from 'react';
import {Panel} from '../utility/AJNPanel'
// import TooltipButton from '../utility/TooltipButton.js';
// import TooltipContent from '../utility/TooltipContent.js';
import {Icon} from 'ducks/walksDuck'
// import {Lock} from 'ducks/lock-duck'

import Logit from '../../factories/logit.js';
var logit = Logit('color:blue; background:yellow;', 'Payments:Summary');
logit('PaymentsFunctions', xxx)


const AccLogRec = ({log})=>{return (
    <div className='walk-detail'>{log.dispDate} <span>£{log.amount}</span>  {log.text && ` [${log.text}] `}<span className="name">{log.name}</span> </div>
  )}

const BkngLogRec = ({log})=>(
    <div className='walk-detail'>{log.dispDate}<Icon type={log.req} width="16"/>  <span>{log.amount}</span>{log.text&&log.text!=='' && ` [${log.text}] `}<span className="name">{log.name}</span> </div>
  )


function Payments({doc}){

    logit('payments', doc);
    var {aLogs, bLogs, tots,
    closingDebt, closingCredit,
    openingDebt, openingCredit, startDate, endDate} = doc;
    var calcNew = {debt: openingDebt, credit: openingCredit};
    logit('calcNew', calcNew)

    const AccLineTot = ({title, factor='', item, className=''}) =>{
      logit('AccLineTot', {title, factor, amount: tots[item]&&tots[item][1], item, tots})
      if (!tots[item])return null;
      return (<div className={"line detail "+className}><div className="title">{title.replace(/ /g, ' ')} ({tots[item][0]})</div><div className="value">{factor}£<span>{tots[item][1]}</span></div></div>)
    }
    const AccLine = ({title, factor='', item, className=''}) =>{
      if (item <0 )return null;
      logit('AccLine', {title, factor, item})
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
    logit('creditsUsed', creditsUsed)
    var title = (<h4>Payments Made</h4>);
    return (
    <Panel className="payments-summary" header={title} style={{margin:20}} >
      <div className="summary">
        <div className="block">
          <div className="credit">
          <AccLine title="Opening Credit" item={openingCredit}/>
          </div>
          <div className="debt">
          <AccLine title="Opening Debt" item={-openingDebt}/>
          </div>
        </div>
        <div className="block">
          <div className="credit"></div>
          <div className="debt">
          <AccLineTot factor='' title="Bus Bookings Made" item='B'/>
          <AccLineTot factor='' title="Car Bookings Made" item='C'/>
          <AccLineTot factor='-' title="Bus Bookings Cancelled" item='BX'/>
          <AccLineTot factor='-' title="Car Bookings Cancelled" item='CX'/>
          <AccLine factor='+' title="Net Bookings" item={netBookings}/>
          <AccLineTot factor='' title="Payments Received" item='P'/>
          <AccLineTot factor='' title="Payments Received(BACS)" item='PB'/>
          <AccLineTot factor='-' title="Payments Refunded" item='PC'/>
          <AccLineTot factor='-' title="Payments Refunded(BACS)" item='PBC'/>
          <AccLine factor='-' title="Net Payments" item={netPayments}/>
          </div>
        </div>
        <div className="block">
          <div className="credit">
          {/* <CreditUsed/> */}
          <AccLine factor='－' title="Net Credit Used" item={creditsUsed}/>
          <AccLine factor='+' title="Net Credit Issused" item={-creditsUsed}/>
          </div>
          <div className="debt">
          <AccLine factor='-' title="Net Credit Used" item={creditsUsed}/>
          <AccLine factor='+' title="Net Credit Issued" item={-creditsUsed}/>
          </div>
        </div>
        <div className="block">
          <div className="credit">
          <AccLine title="Closing Credit" item={closingCredit}/>
          </div>
          <div className="debt">
          <AccLine title="Closing Debt" item={-closingDebt}/>
          <AccLine title="Calculated Closing Debt" item={calcDebt}/>
          </div>
        </div>
        <div className="block">
          <div className="credit">&nbsp; </div>
          <div className="debt">
            <AccLine title="Cash & Cheques to Bank" className="bank" item={netCashAndCheques}/>
          </div>
        </div>
      </div>
      <div className="all-debts">
      {/* <Lock /> */}

        {
          aLogs.map((log,i) => {return <AccLogRec {...{log, i}} key={'logAcc'+i} />})
        }
        {
          bLogs.map((log, i) => {return <BkngLogRec {...{log, i}} key={'logBkng'+i} />})
        }
      </div>
    </Panel>
  )

}

function mapDispatchToProps(dispatch) {
  return {
    showMemberBookings: (accId)=>{dispatch(setPage({page: 'bookings', memberId: accId, accountId: accId}))},
    accountUpdatePayment: (accId, amount)=>{dispatchIfUnlocked(dispatch, {type: 'ACCOUNT_UPDATE_PAYMENT', accId, amount});},
  };
}

const mapStateToProps = function(state) {
  var startDate;
  var endDate;
  const {credits, debts} = getAllDebts(state);
  endDate = '2016-11-03T12:00:00';
  if (!endDate)endDate = getLogTime();

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
    openingCredit: 0,
    openingDebt: 0,
    aLogs, bLogs, tots, startDate, endDate,
    type: 'paymentSummary', _id: 'S'+endDate.substr(0, 17),
  }

  logit('logs doc', doc);
  return { doc };
}
export default connect(mapStateToProps, mapDispatchToProps)(Payments);