/* jshint quotmark: false */
var React = require('react');
import Select, { components } from 'react-select';
import Logit from 'logit';
var logit = Logit(__filename);

var SearchBox = function(props) {
  logit('props', props);
  const Option = props => {
    var regex = new RegExp(`^(.*?)(${props.selectProps.inputValue})(.*)$`, 'i');
    const parts = props.label.match(regex);
    if (!parts) {
      return null;
    }
    return (
      <components.Option {...props}>
        {parts[1]}
        <strong style={{ color: 'blue' }}>{parts[2]}</strong>
        {parts[3]}
      </components.Option>
    );
  };
  var found = false;
  var noFound = 0;
  const ValueContainer = ({ children, ...props }) => {
    logit('ValueContainer', found, noFound, props, children);
    return <components.ValueContainer {...props}> {children} </components.ValueContainer>;
  };
  const MenuList = props => {
    noFound = props.children.length;
    found = props.children.length === 1;
    logit('MenuList', found, noFound, props);
    return <components.MenuList {...props} />;
  };
  return (
    <Select
      placeholder="enter member name"
      components={{ Option, MenuList, ValueContainer }}
      styles={{
        singleValue: base => ({ ...base, color: 'white' }),
        valueContainer: base => ({ ...base, background: found ? 'cyan' : 'white' }),
      }}
      name="form-field-name"
      value="one"
      options={props.options}
      onChange={props.onSelected}
    />
  );
};
export default SearchBox;
