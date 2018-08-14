import React from 'react';
import Select from 'react-select';

const roleOptions = [
  { label: 'Committee', value: 'committee' },
  { label: 'Tester', value: 'tester' },
  { label: 'No receipt', value: 'no-receipt' },
];

class SelectRole extends React.component {
  value = [];

  handleSelectChange(value) {
    console.log("You've selected:", value);
    this.setState({ value });
  }

  render() {
    const { value } = this.state;

    return (
      <div className="section">
        <Select
          multi
          onChange={this.handleSelectChange}
          options={roleOptions}
          placeholder="Select role(s)"
          removeSelected
          simpleValue
          value={value}
        />
      </div>
    );
  }
}

module.exports = SelectRole;
