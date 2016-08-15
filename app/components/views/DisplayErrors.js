/* jshint quotmark: false */
'use strict';
import * as React from 'react';

import {Panel, Button} from 'react-bootstrap';
import '../../sass/DisplayErrors.scss';

import {Decorator as Cerebral} from 'cerebral-react';
import Component from 'cerebral-react';

@Cerebral({
  errors: ['errors'],
})
class DisplayErrors extends React.Component {
 
  render() {
    var errors = this.props.errors;
    if (!errors)return(<span/>);
    var title = (<h4>Errors</h4>);
    var errDisp = [];
    for (let ky of Object.keys(errors)){
      let err = errors[ky];
      errDisp.push(
        <div key={ky}>
          {err.action ? <span className="action">Action: {err.action}({err.payload[0]})</span> : null}
          <span className="reason">&nbsp;
            {err.status ? `${err.message} (${err.status}: ${err.name}) ` : err.errorStack}
          </span>
        </div>);
    }   

    if (errDisp.length === 0)return  <span />;
    var errWrapped = React.addons.createFragment({errors: errDisp});
    return(
      <Panel header={title} bsStyle="danger" className="errors">
        <div>
          {errWrapped}
          <Button onClick={ this.props.signals.clearAll()}>Clear All</Button>
        </div>
      </Panel>
    );
  };

  
};
export default DisplayErrors;
