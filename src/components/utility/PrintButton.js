import React from 'react';
import TooltipButton from 'components/utility/TooltipButton';
import { observable, autorun, action } from 'mobx';
import { observer } from 'mobx-react';
import Logit from 'logit';
var logit = Logit(__filename);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const state = {
  @observable printRunning: false,
  @observable icon: 'Printer',
  reportName: undefined,
};
const runReport = action(async function(rptFn) {
  state.printRunning = true;
  state.icon = 'spin';
  var rptNm = rptFn();
  await delay(1000);
  state.reportName = rptNm;
  state.printRunning = false;
  state.icon = 'Yes_check';
  await delay(3000);
  state.reportName = undefined;
  state.icon = 'Printer';
});
autorun(() => {
  logit('printRunning', state.printRunning, state.icon);
});

//----------------------------------------------------------
//      components
//----------------------------------------------------------

export const PrintButton = observer(({ tiptext, onClick, ...props }) => {
  if (state.printRunning) tiptext = 'Processing Request';
  else if (state.reportName) {
    tiptext = 'Printed saved as ' + state.reportName;
  }
  if (state.reportName) tiptext = 'Printed saved as ' + state.reportName;
  logit('TooltipButton', {
    running: state.printRunning,
    icon: state.icon,
    tiptext,
    props,
  });
  return (
    <TooltipButton
      onClick={() => runReport(onClick)}
      {...props}
      tiptext={tiptext}
      icon={state.icon}
      style={{ padding: 2, maxHeight: 40 }}
      iconStyle={{ width: 30, height: 30 }}
    />
  );
});
