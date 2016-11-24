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

    const AccLineTot = ({title, factor, base, item}) =>{
      logit('AccLineTot', {title, factor, base, item, calcNew})
      if (!tots[item])return null;
      calcNew[base] = calcNew[base] + factor* tots[item][1]
      return ( <div>{title}({tots[item][0]}) <span>{factor<0?'-': factor>0?'+':''}<span>{tots[item][1]}</span></span></div> )
    }
    const AccLine = ({title, factor=1, base, item}) =>{
      logit('AccLine', {title, factor, base, item, calcNew})
      calcNew[base] = calcNew[base] + factor* item
      return ( <div>{title} <span>{item}</span></div> )
    }
    var creditsUsed;
    const CreditUsed = ()=>{
      creditsUsed = closingCredit - calcNew.credit;
      logit('creditsUsed', {creditsUsed, closingCredit, calcNew})
      return null
    }
    var title = (<h4>Payments Made</h4>);
    return (
    <Panel className="paymentsSummary" header={title} style={{margin:20}} >
      <div>
        <div>
          <AccLine title="Opening Credit" item={openingCredit} base='credit' />
          <AccLineTot factor='+1' title="Bus Bookings Cancelled" item='BX' base='credit' />
          <AccLineTot factor='+1' title="Car Bookings Cancelled" item='CX' base='credit' />
          <AccLineTot factor='-1' title="Credits Refunded" item='PC' base='credit' />
          <CreditUsed/>
          <AccLine factor='-1' title="-Credit used" item={creditsUsed} base='credit' />
          <AccLine factor='0' title="Closing Credit" item={closingCredit} base='credit' />

        </div>
        <div>
          <AccLine title="Opening Debt" item={openingDebt} base='debt' />
          <AccLineTot factor='+1' title="Bus Bookings Made" item='B' base='debt' />
          <AccLineTot factor='+1' title="Car Bookings Made" item='C' base='debt' />
          <AccLineTot factor='-1' title="Payments Received(non BACS)" item='P' base='debt' />
          <AccLineTot factor='-1' title="Payments Received(BACS)" item='PB' base='debt' />
          <AccLineTot factor='-1' title="Payments Received(BACS)" item='PB' base='debt' />
          <AccLine factor='+1' title="+Credit used" item={creditsUsed} base='debt' />
          <AccLine factor='0' title="Closing Debt" item={closingDebt} base='debt' />
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
