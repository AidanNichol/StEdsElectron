import React from 'react';
import styled from 'styled-components';
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
    var newValue = target.type === 'checkbox' ? target.checked : target.value;
    logit('handleInputChange', event, name, target.value);
    if (normalize) newValue = normalize(newValue, value);
    onChangeData(name, newValue);
  };
  return hidden ? null : (
    <div className={`form-line ${className} ${name}`}>
      <label className="item-label">{name}</label>
      <Type
        className="item-input"
        {...{ ...rest, name, value }}
        onChange={evt => onChange(evt, name)}
      />
      {children}
    </div>
  );
};
export default styled(FormLine)`
  margin-top: 5px;
  padding-top: 5px;
  width: 95%;
  display: flex;
  flex-direction: row;
  align-items: center;

  &.accountId,
  &.memberId {
    input {
      width: 3.7em;
    }
  }

  &.subscription input {
    width: 3em;
  }

  &.hidden {
    visibility: hidden;
  }

  .item-label {
    padding-right: 10px;
    padding-top: 8px;
    text-align: right;
    vertical-align: top;
    min-width: 110px;
  }

  .item-input {
    width: 300px;
    height: 28px;

    .subscription {
      width: 47px;
    }

    .bacs {
      margin-left: 20px;
    }

    &.due input {
      background-color: #ff6;
      margin-right: 6px;
    }

    &.late input {
      background-color: #f66;
    }
  }

  div.item-input {
    border: inset 2px rgb(238, 238, 238);
    margin-bottom: 5px;
    margin-top: 10px;
  }

  button,
  a[type='button'] {
    img {
      height: 40px;
    }

    padding: 3px 8px;
  }
`;
