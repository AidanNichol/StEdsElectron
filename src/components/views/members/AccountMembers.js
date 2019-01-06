import React from 'react';
import styled from 'styled-components';
import { inject, observer } from 'mobx-react';
import TooltipButton from '../../utility/TooltipButton';

import Logit from 'logit';
var logit = Logit(__filename);
const defaultState = { stage: '', addAccId: '', addAccName: '' };
const AccountMembers = observer(
  class AccountMembers extends React.Component {
    constructor(props) {
      super(props);
      this.state = defaultState;
      this.checkAccount = this.checkAccount.bind(this);
    }

    checkAccount(evt) {
      const { AS } = this.props;
      const mAccId = evt.target.value;
      const acc = AS.accounts.get(mAccId);
      if (acc) {
        this.setState({ stage: 'F', addAccId: mAccId, addAccName: acc.name });
      } else {
        this.setState({ ...defaultState, stage: '?' });
      }
    }
    render() {
      const { AS, accId } = this.props;
      const { props, state } = this;
      logit('props...', state, props);
      if (!props.id) return null;
      const mergeRequested = () => this.setState(() => ({ stage: '?' }));
      const reset = () => this.setState(defaultState);
      const merge = () => {
        const thisAccount = AS.accounts.get(accId);
        const otherAccount = AS.accounts.get(state.addAccId);
        logit('merge', state, thisAccount, otherAccount);
        thisAccount.mergeInAccount(otherAccount);
        reset();
      };
      const showIf = v => (state.stage === v ? true : false);
      const hideIf = v => (state.stage !== v ? true : false);
      return (
        <div className={`account-box ${props.className}`}>
          {props.AS.accounts
            .get(props.id)
            .accountMembers.filter(mem => mem.memId !== props.memId)
            .map(mem => (
              <div key={mem.memId}>
                &nbsp;Also: {mem.memId} {mem.firstName} {mem.lastName}
              </div>
            ))}
          {!props.editMode && (
            <div>
              <TooltipButton
                label="+"
                onClick={mergeRequested}
                tiptext="merge another account into this one"
                visible={!props.editMode && showIf('')}
              />
              {hideIf('') && (
                <div className="active">
                  <div>
                    <input placeholder="Annnn" onChange={this.checkAccount} />
                    {showIf('F') && <span>{state.addAccName}</span>}
                  </div>

                  <button onClick={reset}> Reset </button>
                  {showIf('F') && <button onClick={merge}> Merge </button>}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  },
);
const injectedComponent = inject(store => ({ AS: store.AS }))(AccountMembers);
export default styled(injectedComponent)`
  button,
  input {
    margin: 2px;
  }
  .active {
    width: 210px;
    border: thin solid black;
    margin: 1px;
  }
`;