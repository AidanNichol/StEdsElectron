import React from 'react'
export const Icon = ({type, name, className, ...rest})=>{
  return <img className={(className||'')+' icon'} {...rest} src={`../assets/${type ? 'icon-'+type : name}.svg`} />
  // {/* <img src={`./assets/${name}.svg`} {...rest} /> */}
};
