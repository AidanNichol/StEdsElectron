import React from 'react';
import {getSettings} from 'ducks/settings-duck';
const mode = getSettings('database.current');
export const Panel = (props)=>{
  const { className='', header, style, children, body={}, ...other} = props;
  console.log('Panel', {className, header, style, children, other, props})
  const {className: clb, ...bdy} = body;
  return (
    <div className={`panel ajn-panel ${className} ${mode}`} {...other}>
      <div className='panel-header'>{header}</div>
      <div className={'panel-body '+(clb||'')} {...bdy}>
        <div className='panel-contents'>
          {children}
        </div>
      </div>
    </div>)
}
