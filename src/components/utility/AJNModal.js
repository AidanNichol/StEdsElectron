import React from 'react';
import Modal from 'react-modal';
const closeStyle = {
  background: '#606061',
  color: '#FFFFFF',
  lineHeight: '25px',
  position: 'absolute',
  right: '2px',
  textAlign: 'center',
  top: '1px',
  width: '24px',
  textDecoration: 'none',
  fontWeight: 'bold',
  borderRadius: '12px',
  boxShadow: '1px 1px 3px #000',
  cursor: 'pointer'
}
export default class App extends React.Component{

  constructor(){
    super()
    this.state = {}
  }

  show(){
    this.setState({show: true})
  }

  close(){
    this.setState({show: false})
  }


  render(){
    return (
      <div>
      <a onClick={this.show.bind(this)}>Open Modal</a>
      <Modal
        isOpen={this.state.show}
        // onAfterOpen={afterOpenFn}
        onRequestClose={this.close.bind(this)}
        // closeTimeoutMS={n}
        // style={customStyle}
        contentLabel="Modal"
      >

      <a style={closeStyle} onClick={this.close.bind(this)}>X</a>
      {this.props.children}

      </Modal>
      </div>
    )
  }
}
