import React from 'react';
const paddingV = 5;
const paddingH = 10;
const border = 2;
const radius = 4;
const panelStyle =
        {
          boxSizing: 'border-box',
          padding: `${paddingV}px ${paddingH}px`,
          marginBottom: 10,
          borderWidth: border,
          borderStyle: 'solid',
          borderColor: '#bce8f1',
          borderRadius: radius,
          backgroundColor: 'rgb(255, 255, 255)'
        };
const headerStyle =
        {
          // display: 'flex',
          boxSizing: 'border-box',
          fontSize: '2rem',
          alignItems: 'center',
          fontWeight: 600,
          borderWidth: border,
          borderStyle: 'solid',
          borderColor: '#bce8f1',
          borderTopLeftRadius: border,
          borderTopRightRadius: border,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          marginLeft: -border-paddingH,
          marginRight: -border-paddingH,
          marginTop: -border-paddingV,
          marginBottom: paddingH,
          padding:  `${paddingV}px ${paddingH}px`,
          color:'#31708f',
          backgroundColor: '#d9edf7',
        }
export const Panel = (props)=>{
  const { className='', header, style, children, bsStyle, ...other} = props;
  console.log('Panel', {className, header, style, children, other, props})
  return (
    <div className={'panel '+className} style={panelStyle} {...other}>
      {header? (<PanelHeader>{header}</PanelHeader>) : null}
      <div className='panel-body' style={{padding:0, margins:0}}>
        {children}

      </div>
    </div>)
}
export const PanelHeader = (props)=>(<div className={'panel-header ' + props.className?props.className:''} style={headerStyle}>{props.children}</div>)
