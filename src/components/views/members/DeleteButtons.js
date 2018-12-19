// import _ from 'lodash';
import React from 'react';
import TooltipButton from '../../utility/TooltipButton';
const DeleteButtons = props => {
  const { deletePending, setDeletePending, deleteMember, editMode, suspended } = props;
  if (!suspended) return null;
  return (
    <span>
      {/* {deletePending ?
            <img className="stamp" src="../assets/Deleted Member.svg" /> : null
          } */}
      <TooltipButton
        label="Delete Member"
        onClick={deleteMember}
        tiptext="Permanently Delete Member"
        visible={editMode && deletePending}
      />
      <TooltipButton
        icon="user-undelete"
        onClick={() => setDeletePending(false)}
        tiptext="Clear the Delete Request"
        visible={editMode && deletePending}
      />
      <TooltipButton
        icon="user-delete"
        onClick={() => setDeletePending(true)}
        tiptext="Request Member Deletion"
        visible={editMode && !deletePending}
      />
    </span>
  );
};
export default DeleteButtons;
