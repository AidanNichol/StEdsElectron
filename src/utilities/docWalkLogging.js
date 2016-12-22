import {getLogTime, datetimeIsRecent} from 'utilities/DateUtilities.js';
import Logit from 'factories/logit.js';
var logit = Logit('color:white; background:black;', 'docLogging');
export function shiftLog(log=[], ...args){
  var logRec = [getLogTime(), ...args ];
  return [logRec, ...log];
}
function nothingEarlier(log, logRec){
  let earlier = log.slice(0, -2);
  if (earlier.length === 0) return true;
  var prevLog = earlier[earlier.length-1];
  logit('pushLog earlier', {earlier, prevLog, logRec, log})
  if (logRec.req==='A'){
    if (logRec.note === prevLog.note) return true;
  } else {
    if (prevLog.req === logRec.req)return true;
  }
  return false;
}

const isRequestReversal = (req1, req2)=>{
  if (!req1 || !req2)logit('isRequestReversal', req1,req2)
  if (req1[0] !== req2[0])return false;
  if (req1.length === 1 && req2[2] === 'X') return true;
  if (req2.length === 1 && req1[2] === 'X') return true;
  return false;
}
export function pushWalkLog(log=[], data, _today = new Date()){
  var logRec = {dat: getLogTime(_today), ...data, type: 'W'};
  if (log.length === 0) return [logRec];
  // if this request is a reversal of recent request then simply cancel the previous
  // log record rather than clutter the log with two records
  var logLast = log[log.length-1];
  logit('pushWalkLog', {logRec, logLast,  earlier: nothingEarlier(log, logRec)})
  if (
    isRequestReversal(logRec.req, logLast.req)
     && logLast.dat.substr(10) === logRec.dat.substr(10)  // same day
     && nothingEarlier(log, logRec)
   ){ // reverse previous request
    return log.slice(0, -1);
  }
  return [...log, logRec];
}
export function pushWalkAnnotationLog(logs=[], data, _today = new Date()){
  var logRec = {dat: getLogTime(_today), ...data, type: 'W'};
  if (logs.length === 0){
    if (logRec.note.length > 0)return [logRec];
    else return [];
  }

  var logLast = logs[logs.length-1];

  if ( logLast.req === 'A'
     && logLast.dat.substr(10) === logRec.dat.substr(10)  // same day
   ) logs = logs.slice(0, -1); //get rid of the record we are replacing
  let earlier = logs.filter((log)=>log.req==='A')
  if (earlier.length === 0 && logRec.note.length === 0)return logs;
  if (earlier.length > 0 && earlier[earlier.length-1].note === logRec.note)return logs;
  return [...logs, logRec];
}

export function pushAccLog(log=[], purge, who, walkId, memId, req, amount, note, inFull){
  var logRec = {dat:getLogTime(), who, walkId, memId, req, type: 'A', amount, note, inFull};
  if (log.length > 0){
    // if this request is a reversal of recent request then simply cancel the previous
    // log record rather than clutter the log with two records
    var logLast = log[log.length-1];
    logit('pushAccLog', {logRec, logLast, recent : datetimeIsRecent(logLast[0])})
    if (isRequestReversal(logRec.req, logLast.req) && logLast.amount - logRec.amount === 0
      && datetimeIsRecent(logLast.dat)  // close together in time
     ){ // reverse previous request
      return log.slice(0, -1);
    }

  }
  return [...log, logRec];
}
