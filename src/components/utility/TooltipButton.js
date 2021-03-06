/* jshint quotmark: false, jquery: true */
var React = require('react');
import classnames from 'classnames';
import { Icon } from './Icon.js';
import styled from 'styled-components';

import Logit from 'logit';
var logit = Logit(__filename);
class TooltipButton extends React.Component {
  visible: true;
  render() {
    var {
      img,
      icon,
      lable,
      label,
      placement,
      tiptext,
      visible,
      className,
      style,
      overlay,
      iconStyle,
      ...other
    } = this.props;
    logit('props', this.props);
    if (lable) label = lable;
    if (!visible) return null;

    const clnm = classnames({
      [className]: className,
      button: true,
      ttbtn: false,
      ['hint--' + (placement || 'top')]: tiptext,
      [' hint--rounded hint--medium']: tiptext,
    });

    return (
      <button
        className={clnm}
        aria-label={tiptext}
        type="button"
        style={{ position: 'relative', ...style }}
        {...other}
      >
        {icon ? <Icon name={icon} style={iconStyle} /> : null}{' '}
        {img ? <img src={img} style={iconStyle} /> : null}
        {label ? label : this.props.children}
        {overlay ? <span className="overlay">{overlay}</span> : ''}
      </button>
    );
  }
}
export default styled(TooltipButton)`
  color: #333;
  background-color: #e6e6e6;
  border: 1px solid #adadad;
  padding: 5px 8px;
  border-radius: 4px;

  //  boxShadow: inset 0 3px 5px rgb(0,0,0,.125);
  margin-left: 5;

  .overlay {
    position: absolute;
    top: -2px;
    left: 0;
    font-size: 1.2em;
    font-weight: bold;
  }
`;
