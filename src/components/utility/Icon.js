import React from 'react'
import path from 'path';
const loc = path.resolve(__dirname, '../../../images')
export const Icon = ({name, ...rest})=>(
  <img src={`${loc}/${name}.svg`} {...rest} />
);
