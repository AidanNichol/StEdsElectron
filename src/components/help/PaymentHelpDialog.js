import React from 'react';
import ReactModal from 'react-modal';
import { PaymentHelp } from './PaymentHelp';

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
class PaymentHelpDialog extends React.Component {
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
  customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '700px',
    },
  };
  render() {
    return (
      <div>
        <button
          className="button hint--top hint--rounded hint--medium"
          onClick={this.openModal}
          aria-label="Show help about using the payment boxes"
          style={{ marginLeft: 4, borderWidth: 0, background: 'rgb(238,238,238)' }}
        >
          <img src="../assets/info-square.svg" style={{ width: 20 }} />
        </button>

        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel="Modal"
          style={this.customStyles}
          contentLabel="Payment Help"
        >
          <a style={closeStyle} onClick={this.closeModal}>
            X
          </a>
          <h1 style={{ textAlign: 'center' }}>Payment Help</h1>
          <PaymentHelp />
          <div style={{ textAlign: 'center' }}>
            <button onClick={this.closeModal}>close</button>
          </div>
        </ReactModal>
      </div>
    );
  }
}
export { PaymentHelpDialog };
