// import _ from 'lodash';
import React from 'react';

import TooltipButton from '../../utility/TooltipButton';

const SuspendButtons = props => {
  const { suspended, deletePending, onChangeData, editMode } = props;
  return (
    <span>
      <TooltipButton
        icon="user-disable"
        onClick={() => onChangeData('suspended', true)}
        tiptext="Suspend this Member"
        visible={editMode && !suspended}
      />
      <TooltipButton
        icon="user-enable"
        onClick={() => onChangeData('suspended', false)}
        tiptext="Unsuspend this Member"
        visible={editMode && !deletePending && suspended}
      />
    </span>
  );
};
export default SuspendButtons;
