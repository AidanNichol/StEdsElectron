/* jshint quotmark: false, jquery: true */
var React = require('react');

// var Reflux = require('reflux');
// var R = require('ramda');
// var S = require('sanctuary');

// var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var Tooltip = require('react-bootstrap').Tooltip;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;

import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'TooltipButton.jsx');
var counter = 0;
var TooltipButton = React.createClass({
  propTypes: {
    // You can declare that a prop is a specific JS primitive. By default, these
    // are all optional.
    active: React.PropTypes.bool,
    img: React.PropTypes.string,
    label: React.PropTypes.string,
    lable: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
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
    var {active, img, lable, label, onClick, placement, tiptext, visible, className} = this.props;
    if (typeof visible != 'boolean') logit('props', this.props);
    if (lable)label = lable;
    if (!visible) return null;
    if (!tiptext) return (
      <Button onClick={onClick} active={active} className={className + ' ttbtn' }>
        {img ? <img src={img} /> : null }{label ? label : null}
      </Button>
    );
    return (
      <OverlayTrigger placement={placement} overlay={<Tooltip id={'ttp'+(counter++)}>{tiptext}</Tooltip>}>
        <Button onClick={onClick} active={active} className={className + ' ttbtn' }>
          {img ? <img src={img} /> : null }{label ? label : null}
        </Button>
      </OverlayTrigger>
    );
  },
});
module.exports = TooltipButton;
