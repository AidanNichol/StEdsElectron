/* jshint quotmark: false, jquery: true */
var React = require('react');
import classnames from 'classnames'
import {Icon} from './Icon.js'

import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'TooltipButton.jsx');
var TooltipButton = React.createClass({
  propTypes: {
    // You can declare that a prop is a specific JS primitive. By default, these
    // are all optional.
    active: React.PropTypes.bool,
    img: React.PropTypes.string,
    icon: React.PropTypes.string,
    label: React.PropTypes.string,
    lable: React.PropTypes.string,
    onClick: React.PropTypes.func,
    placement: React.PropTypes.string,
    tiptext: React.PropTypes.string,
    visible: React.PropTypes.bool,
    // currentWalk: React.PropTypes.string.isRequired,
  },
  getDefaultProps: function() {
    return {
      visible: true,
    };
  },
  render: function() {
    var {img, icon, lable, label, placement, tiptext, visible, className, style, ...other} = this.props;
    if (typeof visible != 'boolean') logit('props', this.props);
    if (lable)label = lable;
    if (!visible) return null;
    // if (!tiptext) return (
    //   <button onClick={onClick} active={active} className={className + ' ttbtn' }>
    //     {img ? <img src={img} /> : null }{label ? label : null}
    //   </button>
    // );
    const clnm = classnames({[className]: className, button:true, ttbtn:false, ['hint--'+(placement||'top')]: tiptext, [' hint--rounded hint--medium']:tiptext})
    style = {color: '#333',
                   backgroundColor: '#e6e6e6',
                   border: '1px solid #adadad',
                   padding: '5px 8px',
                   borderRadius: 4,
                   boxShadow: 'inset 0 3px 5px rgb(0,0,0,.125)',
                   marginLeft: 5,
                   ...style,
                  }
    return (
      <button className={clnm }
          aria-label={tiptext} style={style}
           {...other}>
           {icon ? <Icon name={icon}/> : null} {img ? <img src={img} /> : null }{label ? label : this.props.children}
      </button>

    );
  },
});
export default TooltipButton;
