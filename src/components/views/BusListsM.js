/* jshint quotmark: false, jquery: true */
import React from 'react';
import { PrintButton } from '../utility/PrintButton';
import { summaryReport } from '../../reports/summaryReport2';

import SelectWalk from '../utility/SelectWalk.js';

import { Panel } from '../utility/AJNPanel';

import Logit from 'logit';
var logit = Logit(__filename);

export default function BusLists(props) {
  var {
    bookings,
    cars,
    waitingList,
    walkId,
    status,
    walks,
    setCurrentWalk,
    showMemberBookings,
    printFull,
    togglePrint,
  } = props;
  logit('props', props);

  const Cars = props => {
    return props.cars.length === 0 ? null : (
      <section className="booked-cars">
        <h4>Cars</h4>
        {props.cars.map(bkng => (
          <div
            className="member"
            key={bkng.memId}
            onClick={() => showMemberBookings(bkng.memId)}
          >
            <div className="bName">{bkng.name}</div>
            <div className="annotation">{bkng.annotation} </div>
          </div>
        ))}
      </section>
    );
  };
  const Waitlist = props =>
    props.list.length === 0 ? null : (
      <div className="waiting-list">
        <h4>Waiting List</h4>

        {props.list.map(bkng => {
          return (
            <div
              key={bkng.memId}
              className="member"
              onClick={() => showMemberBookings(bkng.memId)}
            >
              <div className="wName">
                <span className="pos">{pos++}. </span>
                {bkng.name}{' '}
              </div>
              <div className="annotation">{bkng.annotation} </div>
            </div>
          );
        })}
      </div>
    );

  var title = <h4>Bus List</h4>;
  var pos = 1;
  return (
    <Panel header={title} className="bus-list">
      <SelectWalk {...{ setCurrentWalk, walks, walkId, currentWalk: walkId }} />
      <div className="buttons">
        <PrintButton
          onClick={() => summaryReport(printFull)}
          onContextMenu={togglePrint}
          overlay={printFull ? 'F' : 'W'}
          tiptext="Print All Walks PDF"
          visible
        />
      </div>
      <div className="booked-members">
        {bookings.map(bkng => (
          <div className="member" key={bkng.memId}>
            <div className="bName" onClick={() => showMemberBookings(bkng.memId)}>
              {bkng.name}{' '}
            </div>
            <div className="annotation">{bkng.annotation}</div>
          </div>
        ))}
        <div className="seats-available">
          Seats available <div>{status.free} </div>
        </div>
      </div>
      <div className="others">
        <Waitlist list={waitingList} />
        <Cars cars={cars} />
      </div>
    </Panel>
  );
}
