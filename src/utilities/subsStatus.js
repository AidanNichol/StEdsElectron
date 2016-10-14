



export const getSubsStatus = (doc)=>{
  let status = 'ok';
  if (doc.memberStatus === "HLM") return {due: false, status};
  if (doc.memberStatus === "Guest") return {due: false, status: 'guest'};

  const currentUserSubs = parseInt(doc.subscription || 0);

  let fee = 15;
  const _today = new Date();
  let thisYear = _today.getFullYear();
  // year - all new subs will be ok until the end of thie 'year'
  let year = _today >= (new Date(`${thisYear}-10-01`)) ? thisYear+1 : thisYear;
  // dueSubsYear - we are collecting subs for this year
  let dueSubsYear = _today >= (new Date(`${thisYear}-12-01`)) ? thisYear+1 : thisYear;
  // okSubsYear - if current value is this then you get the reduced rate.
  let okSubsYear = _today < (new Date(`${thisYear}-02-01`)) ? thisYear-1 : thisYear;

  if (currentUserSubs >= year || currentUserSubs >= dueSubsYear) return {due: false, status};
  status = 'due';
  if (currentUserSubs >= okSubsYear) fee = 13;
  else status = 'late';
  return {due:true, year, fee, status}
};
