import React from 'react';
import Logit from 'logit';
var logit = Logit(__filename);

const FormLine = props => {
  let {
    name,
    value,
    vals,
    className = '',
    onChangeData,
    normalize,
    hidden,
    Type,
    children,
    ...rest
  } = props;
  value = value || vals[name];
  const onChange = (event, name) => {
    const target = event.target;
    var value = target.type === 'checkbox' ? target.checked : target.value;
    logit('handleInputChange', event, name, target.value);
    if (normalize) value = normalize(value);
    onChangeData(name, value);
  };
  return hidden ? null : (
    <div className={'form-line ' + className}>
      <label className="item-label">{name}</label>
      <Type
        {...{ ...rest, name, value }}
        // value={value || vals[name]}
        onChange={evt => onChange(evt, name)}
      />
      {children}
    </div>
  );
};
export default FormLine;
