/* jshint quotmark: false, jquery: true */
import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import { Panel } from '../../utility/AJNPanel';
import SelectMember from '../../utility/RSelectMember.js';
import { Icon } from '../../utility/Icon';

import { PaymentsBoxes } from '../../containers/PaymentsBoxes-mobx';
import { ChangeLogM } from '../../containers/PaymentStatusLog-mobx';
import { AnnotateBooking, openAnnotationDialog } from './annotateBooking';

import Logit from 'logit';
var logit = Logit(__filename);
const delSettings = {
  D: { text: 'Subs Due', style: { '--color': 'green' } },
  G: { text: 'Guest', style: { '--color': 'blue' } },
  L: { text: 'Subs Late', style: { '--color': 'red' } },
  S: { text: 'Suspended', style: { '--color': 'black' } },
  X: { text: 'Delete Me', style: { '--color': 'red' } },
};

const Bookings = observer(
  class Bookings extends React.Component {
    render() {
      var {
        openWalks,
        options,
        account,
        accountSelected,
        closeWalkBookings,
      } = this.props;
      if (!account) return null;
      var accId = account._id;
      logit('props', this.props);
      var accNames = account.accountMembers || [];

      var newBooking = (walk, memId, full, i) => {
        // logit('newBookings', {walkId,memId, full, i})
        let reqType = full ? 'W' : 'B';
        return (
          // <div className={'book member'+i} key={memId} onClick={()=>walkUpdateBooking(walkId, accId, memId, reqType)} >
          <div className={'bookingcell book member' + i} key={memId}>
            <span
              className="hotspot fullwidth"
              onClick={() => walk.updateBookingRequest(memId, reqType)}
            >
              <Icon type={reqType} />
            </span>
            <span
              className="hotspot halfwidth"
              onClick={() => walk.updateBookingRequest(memId, 'W')}
            >
              <Icon type="W" />
            </span>
            <span
              className="hotspot halfwidth"
              onClick={() => walk.updateBookingRequest(memId, 'C')}
            >
              <Icon type="C" />
            </span>
          </div>
        );
      };

      var oldBooking = (walk, booking, i) => {
        const { memId, status, annotation } = booking;
        const width = status === 'W' ? ' halfwidth' : ' fullwidth';
        return (
          <div
            className={'bookingcell booked member' + i}
            style={{ position: 'relative' }}
            key={memId}
          >
            <Icon type={status} className="normal " />
            <span className="normal annotation">{annotation}</span>
            <Icon
              className={'hotspot ' + width}
              type={status + 'X'}
              onClick={() => walk.updateBookingRequest(memId, status + 'X')}
            />
            {status === 'W' ? (
              <span
                className={'hotspot bookme fa-stack' + width}
                onClick={() => walk.updateBookingRequest(memId, 'B')}
              >
                <Icon type="B" />
              </span>
            ) : null}
            <span
              className="hotspot fullwidth annotate"
              onClick={() => openAnnotationDialog(booking, memId, annotation)}
            >
              <Icon type="A" />
            </span>
          </div>
        );
      };

      var title = <h4>Bookings</h4>;
      var bCl = classnames({
        bookings: true,
        ['mems' + accNames.length]: true,
      });
      var mCl = accNames.map((member, i) => {
        logit('member', member);
        return classnames({
          avail: true,
          ['member' + i]: true,
          suspended: member.suspended,
          [member.subs]: true,
        });
      });
      var _today = this.props.todaysDate;
      const closeit = walk => {
        return (
          walk.walkDate < _today && (
            <button
              onClick={() => closeWalkBookings(walk.walkId)}
              style={{ marginLeft: 3 }}
            >
              X
            </button>
          )
        );
      };
      return (
        <Panel header={title} body={{ className: bCl }} id="steds_bookings">
          <div className="select">
            <SelectMember options={options} onSelected={accountSelected} />
            <h5>{account.name}</h5>
          </div>
          <div className="bTable">
            <div className={'heading bLine mems' + accNames.length}>
              <div className="title date">
                Date
                <br />
                Venue
              </div>
              <div className="title avail">Available</div>
              {accNames.map((member, i) => (
                <div
                  className={mCl[i]}
                  key={member.memId}
                  {...delSettings[member.showState]}
                >
                  {member.firstName}
                </div>
              ))}
            </div>
            {openWalks.map((walk, w) => (
              <div
                className={'walk bLine mems' + accNames.length}
                key={w + 'XYZ' + walk.walkId}
              >
                <div className="date">
                  {walk.walkDate}
                  {closeit(walk)}
                  <br />
                  {walk.venue}
                </div>
                <div className="avail">{walk.bookingTotals.display}</div>
                {accNames.map((member, i) => {
                  let booking = walk.bookings.get(member.memId);
                  return !booking || booking.status.length > 1
                    ? newBooking(walk, member.memId, walk.bookingTotals.full, i)
                    : oldBooking(walk, booking, i);
                })}
              </div>
            ))}
            <AnnotateBooking />
          </div>

          {/* <ChangeLog accId={accId}/> */}
          <ChangeLogM accId={accId} />
          <PaymentsBoxes accId={accId} />
        </Panel>
      );
    }
  },
);
export default Bookings;
