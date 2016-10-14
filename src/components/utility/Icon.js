import React from 'react'
export const Icon = ({name, ...rest})=>(
  <img src={`../images/${name}.svg`} {...rest} />
);
