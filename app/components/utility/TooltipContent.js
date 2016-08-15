/* jshint quotmark: false, jquery: true */
var React = require('react');

// var Reflux = require('reflux');
// var R = require('ramda');
// var S = require('sanctuary');

// var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;

// import {Logit} from 'AJNutilities';
// var logit = Logit('color:yellow; background:cyan;', 'TooltipButton.jsx');
var counter = 0;
export default React.createClass({
  displayName: 'TooltipContent',
  propTypes: {
    // You can declare that a prop is a specific JS primitive. By default, these
    // are all optional.
    placement: React.PropTypes.string,
    tiptext: React.PropTypes.string,
    visible: React.PropTypes.bool,
    // currentWalk: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return {
      active: true,
      visible: true,
      placement: 'top',
    };
  },
  render: function() {
    // logit('props', this.props);
    if (!this.props.visible) return null;
    if (!this.props.tiptext) return (
      <Button onClick={this.props.onClick} active={this.props.active} className={this.props.className + ' ttbtn' }>
        {this.props.img ? <img src={this.props.img} /> : null }{this.props.lable ? this.props.lable : null}
      </Button>
    );
    return (
      <OverlayTrigger placement={this.props.placement} overlay={<Tooltip id={'ttp'+(counter++)}>{this.props.tiptext}</Tooltip>}>
        {this.props.children}
      </OverlayTrigger>
    );
  },
});
