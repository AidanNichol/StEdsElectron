/* jshint quotmark: false */
var React = require('react');
import Select from 'react-select';
import Logit from '../../factories/logit.js';
var logit = Logit(__filename);

var SearchBox = React.createClass({
  displayName: 'SearchBox',

  // renderOption: function(option) {
  //   return <span style={{ color: 'blue' }}>{option.label} {option.link}</span>;
  // },
  // renderValue: function(option) {
  //   logit('this', this);
  //   return <strong style={{ color: 'red' }}>{option.label} xxx </strong>;
  // },

  render: function(){
    logit('props', this.props)
    return (
      <Select
      placeholder="enter member name"
          name="form-field-name"
          value="one"
          options={this.props.options}
          onChange={this.props.onSelected}
      />
    );
  }
});
export default SearchBox;
