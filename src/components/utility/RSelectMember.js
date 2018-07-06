/* jshint quotmark: false */
var React = require('react');
import Select from 'react-select';
import Logit from 'logit';
var logit = Logit(__filename);

var SearchBox = function(props) {
  logit('props', props);
  return (
    <Select
      placeholder="enter member name"
      name="form-field-name"
      value="one"
      options={props.options}
      onChange={props.onSelected}
    />
  );
};
export default SearchBox;
