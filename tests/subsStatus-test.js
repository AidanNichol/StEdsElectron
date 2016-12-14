import test from 'ava';
import tk from 'timekeeper';

import {getSubsStatus} from 'utilities/subsStatus';

function macro2(t, memberDoc, date, expected) {
    tk.freeze(new Date(date));
    t.deepEqual(getSubsStatus(memberDoc), expected);
}
function macro3(t, memberDoc, date, expected) {
    tk.freeze(new  Date(date));
    t.deepEqual(getSubsStatus(memberDoc), {due: false, status: 'guest'}); // guests don't pay subscription
    let doc = {...memberDoc, memberStatus: 'Member'}; // make them a member
    t.deepEqual(getSubsStatus(doc), expected);
}
// macro2.title = (providedTitle, doc, date, expected) => `${providedTitle} ${date}`.trim();
macro2.title = (providedTitle, doc, date, expected) => {
  providedTitle = providedTitle ? `(${providedTitle}) ` : ' ';
  return `${doc.memberStatus} ${providedTitle}${date}`.trim();
}
macro3.title = (providedTitle, doc, date, expected) => `${providedTitle} ${doc.memberStatus} ${date}`.trim();
/*-----------------------------------------------------------------------*/
/* These are the member documents we are using for our testing.          */
/*                                                                       */
/* They are stripped down to the bare minimum because from the point of  */
/* subscriptions the only things that matter are the type of membership  */
/* which year they last paid subscriptions.
/*-----------------------------------------------------------------------*/

// normal member
const memberDoc = {subscription: '2016', memberStatus: "Member"};

// this member has already renewed - don't ask for it again
const memberDocRenewed = {subscription: '2017', memberStatus: "Member"};

// this member didn't renew this year
const memberDocLapsed = {subscription: '2015', memberStatus: "Member"};

// Honorary Life Member - don't pay subs
const hlmDoc = { memberStatus: "HLM"};

// Guest to be converted to member
const guestDoc = { memberStatus: "Guest"};

/*-----------------------------------------------------------------------*/
/* These are the tests to be performed.                                  */
/*                                                                       */
/* Each test takes a members document and asks what the subscription     */
/* status would be on a specific date i.e                                */
/*       are subs due?                                                   */
/*       if so what is the fee and what is the year being subscribed to. */
/*       and are they over due yet.                                      */
/* The last bit between the { and the } are the results we expect to get */
/* back from the program.                                                */
/*-----------------------------------------------------------------------*/

test(macro2, memberDoc, '2016-09-05', {due: false, status: 'ok'})
test(macro2, memberDoc, '2016-12-05', {due: true, year: 2017, fee: 13, status: 'due'})
test(macro2, memberDoc, '2017-01-05', {due: true, year: 2017, fee: 13, status: 'due'})
test(macro2, memberDoc, '2017-02-01', {due: true, year: 2017, fee: 15, status: 'late'})
test('lapsed', macro2, memberDocLapsed, '2016-09-05', {due: true, year: 2016, fee: 15, status: 'late'})
test('lapsed', macro2, memberDocLapsed, '2016-12-05', {due: true, year: 2017, fee: 15, status: 'late'})
test('lapsed', macro2, memberDocLapsed, '2017-01-05', {due: true, year: 2017, fee: 15, status: 'late'})
test(macro2, hlmDoc, '2016-09-05', {due: false, status: 'ok'})
test(macro2, hlmDoc, '2016-12-05', {due: false, status: 'ok'})
test(macro2, hlmDoc, '2016-01-05', {due: false, status: 'ok'})
test(macro2, hlmDoc, '2016-02-05', {due: false, status: 'ok'})
test(macro2, guestDoc, '2016-09-01', {due: false,  status: 'guest'})
test(macro3, guestDoc, '2016-09-01', {due: true, year: 2016, fee: 15, status: 'late'})
test(macro3, guestDoc, '2016-10-01', {due: true, year: 2017, fee: 15, status: 'late'})
test(macro3, guestDoc, '2016-12-05', {due: true, year: 2017, fee: 15, status: 'late'})
test(macro3, guestDoc, '2017-01-05', {due: true, year: 2017, fee: 15, status: 'late'})
test(macro3, guestDoc, '2017-02-05', {due: true, year: 2017, fee: 15, status: 'late'})

test('already renewed', macro2, memberDocRenewed, '2016-12-05', {due: false, status: 'ok'})
test('already renewed', macro2, memberDocRenewed, '2017-01-05', {due: false, status: 'ok'})
