import React from 'react';
import Select from 'react-select';
// import { observer } from 'mobx-react';
import _ from 'lodash';
import Logit from 'logit';
var logit = Logit(__filename);
const roleOptions = [
  { label: 'Committee', value: 'committee' },
  { label: 'Tester', value: 'tester' },
  { label: 'Uploader', value: 'uploader' },
  { label: 'No receipt', value: 'no-receipt' },
  { label: 'Admin', value: 'admin', isDisabled: true },
  { label: 'Walks', value: 'walks', isDisabled: true },
];
const pickOpt = roles => {
  let vals = _.split(roles || '', /, */);
  return _.filter(roleOptions, opt => _.includes(vals, opt.value));
};
const SelectRole = props => {
  const roles = pickOpt(props.value);
  logit('SelectRoles', roles, props.disabled, props);

  const customStyles = { 
    control: prov => ({ ...prov, minWidth: 257 }), 
    option: (base, { isDisabled })=> isDisabled ? { ...base, display: 'none' } : base ,

    multiValueRemove: (base, {data, isDisabled}) => {
    return isDisabled || data.isDisabled ? { ...base, display: 'none' } : base;
  } };

  return (
    <div className="section">
      <Select
        isMulti
        styles={customStyles}
        onChange={roles => {
          logit('SelectRoles changed', roles);
          props.onChange({ target: { value: roles.map(r => r.value).join(',') } });
        }}
        options={roleOptions}
        isClearable={false}
        isDisabled={props.disabled}
        placeholder={props.disabled ? 'No Roles' : 'Select...'}
        removeSelected
        backspaceRemovesValue={false}
        defaultValue={roles}
      />
    </div>
  );
};

export default SelectRole;
