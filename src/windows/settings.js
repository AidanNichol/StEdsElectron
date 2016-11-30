import React from 'react';
import { render } from 'react-dom';
import {getSettings, setSettings} from 'ducks/settings-duck'

var data = getSettings();
const changed = (base, inpt)=>{
  setSettings(base, inpt.value) }
const toggled = (base, inpt)=>{
  setSettings(base, inpt.checked)
}


const numb = (val, base, name)=>{
  let inputValue;
  return <div key={base}><span key={base+'S'}>{name}</span><input key={base+'I'} onChange={()=>changed(base, inputValue)} ref={(input) => inputValue = input} defaultValue={val} /><span className="base">{base}</span></div>
};
const strng = (val, base, name)=>{
  let inputValue;
  return <div key={base}><span key={base+'S'}>{name}</span><input key={base+'I'} onChange={()=>changed(base, inputValue)} ref={(input) => inputValue = input} defaultValue={val} /><span className="base">{base}</span></div>
};
const bool = (val, base, name)=>{
  let inputValue;
  return <div key={base}><span key={base+'S'}>{name}</span><input key={base+'I'} type='checkbox' onChange={()=>toggled(base, inputValue)} ref={(input) => inputValue = input} defaultChecked={val} /><span className="base">{base}</span></div>
};
const list = (val, base, name, obj)=>{
  let inputValue;
  return (<div key={base}>
          <span key={base+'S'}>{name}</span>
          <select key={base+'I'} type='checkbox' onChange={()=>changed(base, inputValue)} ref={(input) => inputValue = input} defaultValue={val} >
          { Object.keys(obj).filter((n)=>(typeof obj[n] === 'object')).map((n)=>(<option value={n}>{n}</option>))}
          </select>
          <span className="base">{base}</span>
        </div>)
  };
const adapter = (val, base, name)=>list(val, base, name, {idb:{}, websql: {}})


const objectTree = (obj, base, name)=>{
  const typeMap = {
    object: objectTree,
    number: numb,
    string: strng,
    boolean: bool,
    'database.current': list,
    adapter: adapter,
  };
  base = (base ? base +'.' : '');
  return (
    <div className='obj' key={'obj:'+base}>
      {name&&<h4>{name}</h4>}
      <div>
      {
        Object.keys(obj).map((name)=>{
          let val = obj[name]
          const baseN = base+name
          if (typeMap[name])return typeMap[name](val, base+name, name, obj)
          if (typeMap[baseN])return typeMap[baseN](val, base+name, name, obj)
          return typeMap[typeof val](val, baseN, name)
        })
      }

      </div>
    </div>)
}



render(
  (<div id="settings-page">
    <div className='item'>
      <img className="main-logo" src={`../assets/St.EdwardsLogoSimple.svg`} height='120px' />
      <div className="main-text">
        <div>St.Edwards Booking System</div>
        <div style={{fontSize: '1em'}}>Settings</div>

      </div>
    </div>
    <div>
      {objectTree(data)}
      {/* <ObjectTree obj={data} key='' base='' /> */}
    </div>


  </div>)
  , document.getElementById('root')
);
