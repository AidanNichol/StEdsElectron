import React from 'react'
export const Icon = ({type, name, className, ...rest})=>{
  // return (<svg className={(className||'')+' icon'} {...rest}>
  //   <use xlinkHref={`../assets/icons.svg#${type ? 'icon-'+type : name}`} />
  //   {/* <use xlinkHref={`../assets/requestTypeIcons.svg#${type ? 'icon-'+type : name}`} /> */}
  // </svg>)
  return <img className={(className||'')+' icon'} {...rest} src={`../assets/${type ? 'icon-'+type : name}.svg`} />
};
