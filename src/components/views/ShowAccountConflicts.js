/* jshint quotmark: false, jquery: true */
import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
// import mobx from 'mobx'
import XDate from 'xdate';
// import R from 'ramda';

import { Panel } from '../utility/AJNPanel';

import AS from 'mobx/AccountsStore';
import MS from 'mobx/MembersStore';

import Logit from '../../factories/logit.js';
var logit = Logit(__filename);

const ShowLogs = observer(({ account }) => {
  let versions = account.conflictingDocVersions;
  let accId = account._id;
  let data = account.conflictsByDate;
  logit('ShowLogs', { accId, data, versions });

  return (
    <div>
      <h5>
        {accId} {AS.accounts.get(accId).fullName}
      </h5>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {versions.map(ver => <th key={ver}>{ver.substr(0, 10)}</th>)}
          </tr>
          {/* <tr>
        <th>Status {data.statusOk}</th>
        {data.status.map((stat,i)=>(<th key={`${versions[i]}-${i}`}>{stat}</th>))}
      </tr> */}
        </thead>
        <tbody>
          {Object.entries(data.logs)
            .sort(logCmpDate)
            .map(([dat, data]) => <ShowLog key={dat} {...{ dat, data }} />)}
        </tbody>
      </table>
    </div>
  );
});

const ShowLog = observer(({ dat, data }) => {
  logit('ShowLog', { dat, data });
  return (
    <tr>
      <td>{new XDate(dat).toString('dd MMM HH:mm')}</td>
      {data.map((lg, i) => <td key={dat + '-' + i}>{lg}</td>)}
    </tr>
  );
});

const ShowAccountConflictsUnstyled = observer(props => {
  logit('props', props, AS, MS);
  var title = <h4>Show Conflicts</h4>;
  return (
    <Panel header={title} className={'showconflicts ' + props.className}>
      <div>
        {AS.conflictingAccounts.map(acc => (
          <ShowLogs key={acc._id} account={acc} />
        ))}
      </div>
    </Panel>
  );
});
var logColl = new Intl.Collator();
var logCmpDate = (a, b) => logColl.compare(a[0], b[0]);

export default styled(ShowAccountConflictsUnstyled)`
  h5 {
    font-weight: bold;
    font-size: 2em;
    color: blue;
  }

  th,
  td {
    min-width: 10em;
    text-align: center;
  }
`;
