import WS from 'mobx/WalksStore'
import {sprintf} from 'sprintf-js';

const nbsp = "\u00A0";

class FundsManager {
  owedForWalks = new Set();
  available = {P: 0, T: 0, '+': 0};
  cashReceivedThisPeriod = 0;
  traceMe = false;

  addWalkLog = (log)=>{
    if (!log.billable)return;
    log.owing = log.amount;
    log.paid = {P: 0, T: 0, '+': 0};
    this.owedForWalks.add(log);
  };

  addCredit = (i, log)=>{
    if (!log.ignore){
      this.available['+'] += Math.abs(log.amount);
      this.applyFunds();
    }
    this.traceMe && this.showLog(i, log, ' ', this.available);
  }

  addPayment = (i, log)=>{
    let amount = Math.abs(log.amount) * (log.req.length > 1? -1 : 1);
    if (log.activeThisPeriod && log.req[0] === 'P'){
      this.cashReceivedThisPeriod += amount;
    }
    this.available[log.req]+=amount;
    this.traceMe && this.showLog(i, log, ' ', this.available);
    this.owedForWalks.forEach(logB=>{
      this.useAnyFunds(logB, log.activeThisPeriod);
    });
    if (!log.activeThisPeriod){
      if (this.available.P){
        this.available['+'] += this.available.P;
        this.available.P = 0;
      }
      if (this.available.T){
        this.available['+'] += this.available.T;
        this.available.T = 0;
      }
    }

  };

  applyFunds = (activeThisPeriod)=>{
    this.owedForWalks.forEach(oLog=>{
      Object.keys(this.available).forEach(key=>{
        this.available[key] = this.useFunds(oLog, this.available[key], key, activeThisPeriod)
      })
    });
  };

  useFunds = (log, amount, type, activeThisPeriod)=>{
    if (amount <= 0 || !log) return amount;
    const spend = Math.min(log.owing || 0, amount);
    log.owing -= spend;
    log.activeThisPeriod = activeThisPeriod;
    log.paid[type] += spend;
    if (log.owing === 0)this.owedForWalks.delete(log);
    amount -= spend;
    this.traceMe && this.showLog(0, log, '*', this.available);
    return amount;
  }

  /*-------------------------------------------------*/
  /*         Routines to help with debugging         */
  /*-------------------------------------------------*/
  showPaid = (paid)=>{
    const xx = {P: '£', T: 'T', '+': 'Cr'}
    let txt = '';
    Object.keys(paid||{}).forEach(key=>{
      if (paid[key] != 0) txt += xx[key] + ': '+paid[key]+ ' ';
    } )
    return (txt.length > 0 ? ' ': '') + txt;
  }

  showLog = (i,log, what=nbsp, available)=>{
    var color = log.type === 'A' ? 'blue' : (log.owing === 0 ? 'green' : 'red');
    if (log.cancelled)color = 'black';
    color = 'color: '+color;
    const showBool = (name, show=name)=>(log[name] ? show+' ' : '');
    const walk = log.type == 'W' ? WS.walks.get(log.walkId).names.code : '';
    var txt2 = showBool('hideable', 'hide')+showBool('activeThisPeriod', 'actv')+showBool('historic', 'hist')+showBool('ignore', 'ignr')
    var txt3 = log.type === 'W' ? sprintf('Owe:%3d %10s', log.owing, this.showPaid(log.paid)) : '';
    var txt = sprintf('%2s%.1s %.16s %-16s %2s A:%3d B:%3d, %-18s, %12s',
    i, what, log.dat,
    (log.type === 'W' ? `${log.walkId} ${walk}` : 'Payment'),
    log.req, log.amount, log.balance,  txt3, txt2);
    console.log('%c%s %c%s', color, txt, 'color: white; background: black', this.showPaid(available));
    return `${(i+what).padStart(3)} ${log.dat.substr(0,16)} ` +
    (log.type === 'W' ? log.walkId : 'Payment'.padEnd(11, nbsp)) +
    ` ${log.req.padEnd(2, nbsp)} ${walk.padEnd(4, nbsp)} `;
  }



}
export default  new FundsManager;
