/* jshint quotmark: false */
import { connect } from 'react-redux';
var xxx = require( '../containers/PaymentsFunctions')
import {getAllDebts, getWalkLogsByDate, getAccountLogByDateAndType} from '../containers/PaymentsFunctions'
import {dispatchIfUnlocked} from 'ducks/lock-duck.js';
import {setPage} from 'ducks/router-duck.js';

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


function Payments(props){

    logit('payments', props);
    var {aLogs, bLogs, tots,
    closingDebt, closingCredit,
    openingDebt, openingCredit} = props;
    var calcNew = {debt: openingDebt, credit: openingCredit};
    logit('calcNew', calcNew)

    const AccLineTot = ({title, factor='', base, item}) =>{
      logit('AccLineTot', {title, factor, amount: tots[item]&&tots[item][1], base, item, tots})
      if (!tots[item])return null;
      return ( <div><div>{title}({tots[item][0]})</div> <div>{factor}£<span>{tots[item][1]}</span></div></div> )
    }
    const AccLine = ({title, factor='', base, item}) =>{
      if (item <0 )return null;
      logit('AccLine', {title, factor, base, item})
      return ( <div><div>{title}</div> <div>{factor}£<span>{item}</span></div></div> )
    }

    const creditsUsed = openingCredit + (tots.BX ? tots.BX[1] : 0) + (tots.CX ? tots.CX[1] : 0) - (tots.PC ? tots.PC[1] : 0) - closingCredit;
    const calcDebt = openingDebt + (tots.B ? tots.B[1] : 0) + (tots.C ? tots.C[1] : 0) - (tots.P ? tots.P[1] : 0) - (tots.PC ? tots.PC[1] : 0) - creditsUsed;
    logit('creditsUsed', creditsUsed)
    var title = (<h4>Payments Made</h4>);
    return (
    <Panel className="payments-summary" header={title} style={{margin:20}} >
      <div className="summary">
        <div>
          <AccLine title="Opening Credit" item={openingCredit} base='credit' />
          <AccLineTot factor='+' title="Bus Bookings Cancelled" item='BX' base='credit' />
          <AccLineTot factor='+' title="Car Bookings Cancelled" item='CX' base='credit' />
          <AccLineTot factor='-' title="Credits Refunded" item='PC' base='credit' />
          {/* <CreditUsed/> */}
          <AccLine factor='-' title="Credit Used" item={creditsUsed} base='credit' />
          <AccLine factor='+' title="Credit Issused" item={-creditsUsed} base='credit' />
          <AccLine title="Closing Credit" item={closingCredit} base='credit' />

        </div>
        <div>
          <AccLine title="Opening Debt" item={-openingDebt} base='debt' />
          <AccLineTot factor='+' title="Bus Bookings Made" item='B' base='debt' />
          <AccLineTot factor='+' title="Car Bookings Made" item='C' base='debt' />
          <AccLineTot factor='-' title="Payments Received(non BACS)" item='P' base='debt' />
          <AccLineTot factor='-' title="Payments Received(BACS)" item='PB' base='debt' />
          <AccLine factor='+' title="Credit Used" item={creditsUsed} base='debt' />
          <AccLine factor='-' title="Credit Issued" item={-creditsUsed} base='debt' />
          <AccLine title="Calculated Closing Debt" item={calcDebt} base='debt' />
          <AccLine title="Closing Debt" item={-closingDebt} base='debt' />
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
  var endDate = '2016-11-03T12:00';
  const {credits, debts} = getAllDebts(state);
  var closingCredit = credits.reduce((sum, item)=>sum+item.balance, 0);
  var closingDebt = debts.reduce((sum, item)=>sum+item.balance, 0);
  var openingCredit = 0;
  var openingDebt = 0;

  var aLogs = getAccountLogByDateAndType(state, startDate, endDate, 'P');
  var bLogs = getWalkLogsByDate(state, startDate, endDate);
  var tots = [...bLogs, ...aLogs].reduce((tot, lg)=>{
    if (!tot[lg.req])tot[lg.req] = [0, 0];
    tot[lg.req][0]++;
    tot[lg.req][1] += lg.amount;
    return tot;
  }, {});
  logit('logs', aLogs, bLogs, tots, closingCredit, closingDebt);
  return {
            aLogs,
            bLogs,
            tots,
            closingDebt, closingCredit,
            openingDebt, openingCredit,
      };
}
export default connect(mapStateToProps, mapDispatchToProps)(Payments);
