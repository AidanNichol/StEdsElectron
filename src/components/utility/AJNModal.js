import React from 'react';
import Modal from 'react-modal';
import TooltipButton from './TooltipButton.js';
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
var AJNModal = React.createClass({

  getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal(){
    this.setState({modalIsOpen: true})
  },

  closeModal(){
    this.setState({modalIsOpen: false})
  },


  render(){
    return (
      <div>
      <TooltipButton icon={this.props.icon} onClick={this.openModal} tiptext={this.props.tiptext} visible/>
      <Modal
        isOpen={this.state.modalIsOpen}
        // onAfterOpen={afterOpenFn}
        onRequestClose={this.closeModal}
        // closeTimeoutMS={n}
        // style={customStyle}
        contentLabel="Modal"
      >

      <a style={closeStyle} onClick={this.closeModal}>X</a>
      {this.props.children}

      </Modal>
      </div>
    )
  }
})
export default AJNModal;
