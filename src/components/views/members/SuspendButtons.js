// import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';

import TooltipButton from '../../utility/TooltipButton';

const SuspendButtons = props => {
  const { onChangeData, editMode, deleteMember, showState, className } = props;
  if (!editMode) return null;
  const curState = showState >= 'S' ? showState : 'OK';
  const prevState = {
    X: { icon: 'user-undelete', newstate: 'S', tiptext: 'Clear the Delete Request' },
    S: { icon: 'user-enable', newstate: '', tiptext: 'Unsuspend this Member' },
    OK: { visible: false },
  }[curState];
  const nextState = {
    X: {
      label: 'Delete Member',
      onClick: deleteMember,
      tiptext: 'Permanently Delete Member',
    },
    S: { icon: 'user-delete', newstate: 'X', tiptext: 'Request Member Deletion' },
    OK: { icon: 'user-disable', newstate: 'S', tiptext: 'Suspend this Member' },
  }[curState];
  return (
    <div className={'suspend-buttons ' + className}>
      <TooltipButton
        visible
        onClick={() => onChangeData('deleteState', nextState.newstate)}
        {...nextState}
      />
      <TooltipButton
        visible
        {...prevState}
        onClick={() => onChangeData('deleteState', prevState.newstate)}
      />
    </div>
  );
};
export default styled(SuspendButtons)`
  display: flex;
  flex-direction: column;
  align-items: center;
  button,
  a[type='button'] {
    img {
      height: 40px;
    }

    padding: 3px 8px;
  }
  img.icon {
    height: 40px;
  }
`;
