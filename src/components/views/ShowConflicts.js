/* jshint quotmark: false, jquery: true */
import React from 'react';
import { observer, inject } from 'mobx-react';
import styled from 'styled-components';
// import mobx from 'mobx'
import XDate from 'xdate';
import os from 'os';
import { getMac } from 'getmac';
// import R from 'ramda';

import SelectWalk from '../utility/SelectWalk.js';

import { Panel } from '../utility/AJNPanel';

import WS from 'mobx/WalksStore';
// import MS from 'mobx/MembersStore'

import Logit from 'factories/logit.js';
var logit = Logit(__filename);

const ShowLogs = inject('MS')(
  observer(({ memId, data, versions, MS }) => {
    logit('ShowLogs', { memId, data, versions });

    return (
      <div>
        <h5>
          {memId} {MS.members[memId].fullName}
        </h5>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              {versions.map(ver => <th key={ver}>{ver.substr(0, 10)}</th>)}
            </tr>
            <tr>
              <th>Status {data.statusOk}</th>
              {data.status.map((stat, i) => (
                <th key={`${versions[i]}-${i}`}>{stat}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.logs)
              .sort(logCmpDate)
              .map(([dat, data]) => <ShowLog key={dat} {...{ dat, data }} />)}
          </tbody>
        </table>
      </div>
    );
  }),
);

const ShowLog = observer(({ dat, data }) => {
  logit('ShowLog', { dat, data });
  return (
    <tr>
      <td>{new XDate(dat).toString('dd MMM HH:mm')}</td>
      {data.map((lg, i) => <td key={dat + '-' + i}>{lg}</td>)}
    </tr>
  );
});

const ShowConflictsUnstyled = inject('WS')(
  observer(({ WS, ...props }) => {
    const walk = WS.walks[WS.activeWalk || WS.conflictingWalks[0]._id];
    logit('props', props, WS);
    logit('walk', walk);
    logit('getMac os', os.networkInterfaces());
    getMac(function(err, macAddress) {
      if (err) {
        logit('getMac err', err);
        throw err;
      }
      logit('getMac fnc', macAddress);
    });
    let sum = walk.conflictsByMember;
    logit('conflictsByMember', sum);
    var title = <h4>Show Conflicts</h4>;
    const versions = walk.conflictingDocVersions;
    // .sort(logCmpDate)
    return (
      <Panel header={title} className={'showconflicts ' + props.className}>
        <SelectWalk
          {...{
            setCurrentWalk: WS.setActiveWalk,
            walks: WS.conflictingWalks,
            currentWalk: WS.activeWalk || WS.conflictingWalks[0]._id,
          }}
        />
        <div>
          {Object.entries(sum).map(([memId, data]) => (
            <ShowLogs key={memId} {...{ memId, data, versions }} />
          ))}
        </div>
      </Panel>
    );
  }),
);
var logColl = new Intl.Collator();
var logCmpDate = (a, b) => logColl.compare(a[0], b[0]);

export default styled(ShowConflictsUnstyled)`
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
