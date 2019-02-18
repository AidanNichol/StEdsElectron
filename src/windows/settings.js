import { remote, ipcRenderer } from 'electron';
const BrowserWindow = remote.BrowserWindow;
import React from 'react';
import { render } from 'react-dom';
import { setSettings, getAllSettings } from 'StEdsSettings';

var data = getAllSettings();
const changed = (base, inpt) => {
  console.log('changed', base, inpt.value);
  setSettings(base, inpt.value);
};
const dbSelected = (base, inpt) => {
  setSettings(base, inpt.value);
  ipcRenderer.send('reload-main', {[base]: inpt.value});
};
const toggled = (base, inpt) => {
  console.log('changed', base, inpt.checked);
  setSettings(base, inpt.checked);
};
var mode = data.database.current;
const advanced = data.advanced;

const numb = (val, base, name) => {
  let inputValue;
  return (
    <div key={base}>
      <span key={base + 'S'}>{name}</span>
      <input
        key={base + 'I'}
        onChange={() => changed(base, inputValue)}
        ref={input => (inputValue = input)}
        defaultValue={val}
      />
      <span className="base">{base}</span>
    </div>
  );
};
const strng = (val, base, name) => {
  let inputValue;
  return (
    <div key={base}>
      <span key={base + 'S'}>{name.toString()}</span>
      <input
        className={name+''}
        key={base + 'I'}
        onChange={() => changed(base, inputValue)}
        ref={input => (inputValue = input)}
        defaultValue={val}
      />
      <span className="base">{base}</span>
    </div>
  );
};
const bool = (val, base, name, changed = toggled) => {
  let inputValue;
  console.log('bool', base, name, val );
  return (
    <div key={base}>
      <span key={base + 'S'}>{name}</span>
      <input
        key={base + 'I'}
        type="checkbox"
        onChange={() => changed(base, inputValue)}
        ref={input => (inputValue = input)}
        defaultChecked={val}
      />
      <span className="base">{base}</span>
    </div>
  );
};
const advancedBool = (val, base, name) => {
  const advancedToggle = (base, inpt) => {
    console.log('advanced toggle', base, inpt.checked, name)
    toggled(base, inpt);
    ipcRenderer.send('reload-main', {[base]: inpt.checked});
  };
  return bool(val, base, name, advancedToggle);
};
const list = (val, base, name, obj) => {
  let inputValue;
  return (
    <div key={base}>
      <span key={base + 'S'}>{name}</span>
      <select
        key={base + 'I'}
        type="checkbox"
        onChange={() => dbSelected(base, inputValue)}
        ref={input => (inputValue = input)}
        defaultValue={val}>
        {Object.keys(obj)
          .filter(n => typeof obj[n] === 'object')
          .map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
      </select>
      <span className="base">{base}</span>
    </div>
  );
};
const adapter = (val, base, name) =>
  list(val, base, name, { idb: {}, websql: {} });

const objectTree = (obj, base, name) => {
  const typeMap = {
    object: objectTree,
    number: numb,
    string: strng,
    boolean: bool,
    'user.current': list,
    'database.current': list,
    advanced: advancedBool,
    adapter: adapter
  };
  base = base ? base + '.' : '';
  return (
    <div className={"obj "+name} key={'obj:' + base}>
      {name && <h4 className={mode}>{name}</h4>}
      <div>
        {Object.keys(obj).map(name => {
          let val = obj[name];
          const baseN = base + name;
          if (
            base === 'user.' &&
            name !== data.user.current &&
            name !== 'current'
          )
            return null;
          if (base === 'database.' && name !== mode && name !== 'current')
            return null;
          if (!advanced && base === 'database.' && name !== mode) return null;
          if (
            !advanced &&
            base === `database.${mode}.` &&
            name.substr(0, 5) !== 'reset'
          )
            return null;

          if (typeMap[name]) return typeMap[name](val, base + name, name, obj);
          if (typeMap[baseN])
            return typeMap[baseN](val, base + name, name, obj);
          return typeMap[typeof val](val, baseN, name);
        })}
      </div>
    </div>
  );
};

render(
  <div id="settings-page">
    <div className="item">
      <img
        className="main-logo"
        src={`../assets/St.EdwardsLogoSimple.svg`}
        height="120px"
      />
      <div className="main-text">
        <div>St.Edwards Booking System</div>
        <div style={{ fontSize: '1em' }}>Settings</div>
      </div>
    </div>
    <div>
      {objectTree(data)}
    </div>
  </div>,
  document.getElementById('root')
);
