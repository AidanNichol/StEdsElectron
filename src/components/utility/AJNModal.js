import React from 'react';
import ReactModal from 'react-modal';
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
  cursor: 'pointer',
};
ReactModal.setAppElement('#root');
class AJNModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modalIsOpen: false };
  }

  openModal = () => {
    this.setState({ modalIsOpen: true });
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  render() {
    return (
      <div>
        <TooltipButton
          icon={this.props.icon}
          onClick={this.openModal}
          tiptext={this.props.tiptext}
          iconStyle={this.props.iconStyle}
          visible
        />
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel="Modal"
        >
          <a style={closeStyle} onClick={this.closeModal}>
            X
          </a>
          {this.props.children}
        </ReactModal>
      </div>
    );
  }
}
export default AJNModal;
