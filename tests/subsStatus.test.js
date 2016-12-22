import {getSubsStatus} from '../src/utilities/subsStatus';

function macro2(t, doc, date, expected) {
  const   providedTitle = t !== '' ? `(${t}) ` : ' ';
  const title = `${doc.memberStatus} ${providedTitle}${date}`.trim();

    const _today = new Date(date);
    test(title, ()=>{
      expect(getSubsStatus(doc,_today)).toEqual(expected)
    })
}
function macro3(t, memberDoc, date, expected) {
  const title = `${t} ${memberDoc.memberStatus} ${date}`.trim();
  const _today = new Date(date);
    // tk.freeze(new  Date(date));
    test(title, ()=>{
      expect(getSubsStatus(memberDoc, _today)).toEqual({due: false, status: 'guest', showSubsButton: false})
      let doc = {...memberDoc, memberStatus: 'Member'}; // make them a member
      expect(getSubsStatus(doc, _today)).toEqual(expected)
    })
}
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
describe('subsStatus', ()=>{
  macro2('', memberDoc, '2016-09-05', {due: false, showSubsButton: false, status: 'ok'})
  macro2('', memberDoc, '2016-12-05', {due: false, showSubsButton: true, year: 2017, fee: 13, status: 'ok'})
  macro2('', memberDoc, '2017-01-05', {due: true, showSubsButton: true, year: 2017, fee: 13, status: 'due'})
  macro2('', memberDoc, '2017-02-01', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})
  macro2('lapsed', memberDocLapsed, '2016-09-05', {due: true, showSubsButton: true, year: 2016, fee: 15, status: 'late'})
  macro2('lapsed', memberDocLapsed, '2016-12-05', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})
  macro2('lapsed', memberDocLapsed, '2017-01-05', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})
  macro2('', hlmDoc, '2016-09-05', {due: false, showSubsButton: false, status: 'ok'})
  macro2('', hlmDoc, '2016-12-05', {due: false, showSubsButton: false, status: 'ok'})
  macro2('', hlmDoc, '2016-01-05', {due: false, showSubsButton: false, status: 'ok'})
  macro2('', hlmDoc, '2016-02-05', {due: false, showSubsButton: false, status: 'ok'})
  macro2('', guestDoc, '2016-09-01', {due: false,  showSubsButton: false, status: 'guest'})
  macro3('', guestDoc, '2016-09-01', {due: true, showSubsButton: true, year: 2016, fee: 15, status: 'late'})
  macro3('', guestDoc, '2016-10-01', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})
  macro3('', guestDoc, '2016-12-05', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})
  macro3('', guestDoc, '2017-01-05', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})
  macro3('', guestDoc, '2017-02-05', {due: true, showSubsButton: true, year: 2017, fee: 15, status: 'late'})

  macro2('already renewed', memberDocRenewed, '2016-12-05', {due: false, showSubsButton: false, status: 'ok'})
  macro2('already renewed', memberDocRenewed, '2017-01-05', {due: false, showSubsButton: false, status: 'ok'})

})
