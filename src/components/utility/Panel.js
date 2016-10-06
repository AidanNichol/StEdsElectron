import React from 'react';

const PanelStyle = {
  borderColor: 'red',
  borderRadius: 10,
  width: '50%',
  marginLeft: '2%',
  border: 'solid red thin'
};
const TitleStyle = {
  borderRadius: 10,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  backgroundColor: 'cyan',
  borderBottom: 'solid red thin',
  fontWeight: 'bold',
  color: 'blue',
  fontSize: 16,
};
export const Panel = (props)=> (
  <div className={props.className} style={PanelStyle}>
    <div style={TitleStyle}>{props.header}</div>
      {props.children}
  </div>
);
