import React from 'react';
import { Button, Dialog } from "@blueprintjs/core";

export const HelpDialog = (props)=>{
  const {setHelp, isOpen, children} = props;
  return (
  <Dialog
    style={{width: 720, top: 0}}
    isOpen={isOpen}
    iconName="help"
    onClose={()=>setHelp(false)}
    title="Payments Help" >
    <div className="pt-dialog-body" style={{width: 700, paddingRight: 20}}>
      {children}
      <div className="pt-dialog-footer">
        <div className="pt-dialog-footer-actions">
          <Button className="pt-intent-primary" onClick={()=>setHelp(false)}>Close</Button>
        </div>
      </div>
    </div>
  </Dialog>
)};
