/* jshint quotmark: false, jquery: true */
var React = require('react');

export default React.createClass({
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
    var {className, placement, tiptext, visible, active, img, lable, onClick} = this.props;
    if (!visible) return null;
    if (!tiptext) return (
      <button onClick={onClick} active={active} className={className + ' ttbtn' }>
        {img ? <img src={img} /> : null }{lable ? lable : null}
      </button>
    );
    return (
      <div className={className + ' ttbtn hint--'+placement+' hint--rounded hint--medium' } aria-label={tiptext}>
        {this.props.children}
      </div>
    );
  },
});
