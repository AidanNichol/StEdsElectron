import React from 'react';

export const Panel = (props)=>{
  const { className='', header, style, children, body={}, ...other} = props;
  console.log('Panel', {className, header, style, children, other, props})
  const {className: clb, ...bdy} = body;
  return (
    <div className={'panel ajn-panel '+className} {...other}>
      <div className='panel-header'>{header}</div>
      <div className={'panel-body '+(clb||'')} {...bdy}>
        <div className='panel-contents'>
          {children}
        </div>
      </div>
    </div>)
}
