import React from 'react';

import TooltipButton from '../../utility/TooltipButton';

const SubscriptionButton = props => {
  const {
    onChangeData,
    deletePending,
    editMode,
    subsStatus,
    subsPaid,
    subscription,
    bacs,
    setBacs,
    style = {},
    ...other
  } = props;
  style.whiteSpace = 'nowrap';
  if (!editMode || deletePending) return null;
  if (!subsStatus.showSubsButton || subscription === subsStatus.year) return null;
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      <span className="bacs">
        {' '}
        bacs{' '}
        <input
          value={bacs}
          type="checkbox"
          onChange={evt => setBacs(evt.target.checked)}
        />{' '}
      </span>
      <TooltipButton
        label={`Paid £${subsStatus.fee} for ${subsStatus.year}`}
        onClick={() => {
          onChangeData('subscription', subsStatus.year);
          subsPaid(subsStatus.fee, bacs);
        }}
        {...other}
        visible
        style={style}
      />
    </span>
  );
};
export default SubscriptionButton;
