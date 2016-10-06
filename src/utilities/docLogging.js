import {getLogTime, datetimeIsRecent} from '../utilities/DateUtilities.js';
export function shiftLog(log=[], ...args){
  var logRec = [getLogTime(), ...args ];
  return [logRec, ...log];
}
function nothingEarlier(log, logRec){
  let earlier = log.slice(0, -2);
  earlier = earlier.filter((rec)=>rec[2]===logRec[2])
  if (earlier.length === 0) return true;
  var prevLog = earlier[earlier.length-1];
  console.log('pushLog earlier', {earlier, prevLog, logRec, log})
  if (logRec[3]==='A'){
    if (logRec[5] === prevLog[5]) return true;
  } else {
    if (prevLog[3] === logRec[3])return true;
  }
  return false;
}
export function pushLog(log=[], purge, ...args){
  if (purge) return log.filter((log)=>log[2] !== args[1]);
  var logRec = [getLogTime(), ...args ];
  if (log.length > 0){
    // if this request is a reversal of recent request then simply cancel the previous
    // log record rather than clutter the log with two records
    var logLast = log[log.length-1];
    console.log('pushLog', {logRec, logLast, recent : datetimeIsRecent(logLast[0]), earlier: nothingEarlier(log, logRec)})
    if (logRec[4]!=="P"
      && logRec[2] === logLast[2] // same member
      && logRec[3][0] === logLast[3][0]
      //  && logRec[3][0] !== 'A' &&
      //  ((logRec[3] === "B" && (logLast[3] === "X" || logLast[3] === "L")) ||
      //  ((logRec[3]==="X" || logLast[3]==="L") && logLast[3]==="B")) &&
       && datetimeIsRecent(logLast[0])  // close together in time
       && nothingEarlier(log, logRec)
     ){ // reverse previous request
      return log.slice(0, -1);
    }
    if (logRec[4]==="P" && logLast[4]==="P" && logLast[5] + logRec[5] === 0
      // && logLast[2] === logRec[2] && logLast[3] === logRec[3]
      && datetimeIsRecent(logLast[0])  // close together in time
     ){ // reverse previous request
      return log.slice(0, -1);
    }

  }
  return [...log, logRec];
}
