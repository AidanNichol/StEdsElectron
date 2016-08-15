import React from 'react';
import {connect} from 'react-redux';

export const Shortcuts = ()=>(
  <div className="shortcuts">
  <button key="0" className="sc" onClick={()=>{actions.logonSuccess({name: 'Daniel', memId: 'M1094', role: '', provider: 'shortcut', email: 'dannyfoster27@icloud.com', thumbnail: ''})}}>Daniel</button>
  <button key="1" className="sc" onClick={()=>{actions.logonSuccess({name: 'Harry', memId: '', role: '', provider: 'shortcut', email: 'harry@hogwarts.ac.uk', thumbnail: ''})}}>Harry</button>
  <button key="2" className="sc" onClick={()=>{actions.logonSuccess({name: 'Tim', memId: 'M9001', role: '', provider: 'shortcut', email: 'tim@nicholware.co.uk', thumbnail: ''})}}>Tim</button>
  <button key="3" className="sc" onClick={()=>{actions.logonSuccess({name: 'Sandy', memId: 'M1108', role: 'bookings', provider: 'shortcut', email: 'sandysandy48@hotmail.co.uk', thumbnail: ''})}}>Sandy</button>
  <button key="4" className="sc" onClick={()=>{actions.logonSuccess({name: 'Val', memId: 'M616', role: 'members', provider: 'shortcut', email: 'jimandval@jvdavis.plus.com', thumbnail: ''})}}>Val</button>
  <button key="5" className="sc" onClick={()=>{actions.logonSuccess({name: 'Aidan', memId: 'M1049', role: 'admin', provider: 'shortcut', email: 'aidan@nicholware.co.uk', thumbnail: ''})}}>Aidan</button>
  </div>);

class LogonInt extends React.Component {

  renderServiceButton(service){
     return (<button
                  key={service} className={service}
                  onClick={()=>this.props.signals.authenticateUserViaServiceRequested({service: service})}>
                <img src={'images/'+service+'.svg'}/>
                {service}
              </button>)


  }
  render() {
    console.log('signals', this.props.signals);
    var {session, actions} = this.props;
    return (
      <div className="logon">
        {/*<div className="row">*/}
          {session.name  ?
            <div className="right">Logged in (via {session.provider}): {session.name} ({session.role})
              <img src={session.thumbnail } /><button onClick={()=>actions.logoutRequested()}>Logout</button>
            </div>
            :
            <div name="loginForm" className="div-inline">

              {['google', 'microsoft', 'facebook'].map((service, index) => this.renderServiceButton(service, index))}

            </div>
          }
        {/*</div>*/}
      </div>
    );
  }
}


import * as actions from 'actions/logon-actions';

const mapStateToProps = (state) => {
  return { session: state.logon, actions }
}

export const Logon = connect(
  mapStateToProps,
  // mapDispatchToProps
)(LogonInt)
