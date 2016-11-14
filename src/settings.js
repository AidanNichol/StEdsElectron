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



const objectTree = (obj, base, name)=>{
  const typeMap = {
    object: objectTree,
    number: numb,
    string: strng,
    boolean: bool,
  };
  base = (base ? base +'.' : '');
  return (
    <div className='obj' key={'obj:'+base}>
      {name&&<h4>{name}</h4>}
      <div>
      {
        Object.keys(obj).map((name)=>{
          let val = obj[name]
          return typeMap[typeof val](val, base+name, name)
        })
      }

      </div>
    </div>)
}



render(
  (<div id="settings-page">
    <div className='item'>
      <img className="main-logo" src={`./assets/St.EdwardsLogoSimple.svg`} height='120px' />
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
