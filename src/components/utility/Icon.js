import React from 'react'
export const Icon = ({name, ...rest})=>(
  <img src={`./assets/${name}.svg`} {...rest} />
);
