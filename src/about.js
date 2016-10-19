import React from 'react';
import { render } from 'react-dom';
import fs from 'fs';
var open = require("open");

function fsExists(myDir) {
  try {
    fs.accessSync(myDir);
    return true;
  } catch (e) {
    return false;
  }
}


var links = [
  ['Electron', 'Electron', 'http://electron.atom.io'],
  ['react', 'react', 'http://facebook.github.io/react/docs/getting-started.html'],
  ['redux', 'redux', 'http://redux.js.org/'],
  ['redux-sagas', 'redux-sagas', 'http://yelouafi.github.io/redux-saga/index.html'],
  ['PouchDB', 'PouchDB', 'http://pouchdb.com/'],
  ['PouchDB Authenticate', 'PouchDB Authenticate', 'https://github.com/nolanlawson/pouchdb-authentication'],
  ['couchDB', 'couchDB', 'http://docs.couchdb.org/en/latest/contents.html'],
];
const GetIcon = ({name, ...rest})=>{
  const iName = `./assets/mark-${name.toLowerCase()}`;
  console.log({iName})
  const ico = fsExists(`${iName}.svg`) ? `${iName}.svg` : (fsExists(`${iName}.png`) ? `${iName}.png` : undefined);
  if (ico) return (<img src={ico} height='40px' {...rest}/>)
  return (<span {...rest}>{name}</span>)
};
render(
  (<div>
    <img src={`./assets/St.EdwardsLogoSimple.svg`} height='120px' />
    <div>St.Edwards Booking System</div>
    <div>Developed by Aidan Nichol</div>
    <GetIcon name="github" onClick={()=>open(`https://github.com/AidanNichol/StEdsElectron`)} />
    <span>Source code available on Github</span>
    {
      links.map(([name, text, link, icon], i)=>{
        return (
          <div key={'link:'+i} >
            <GetIcon {...{name}} onClick={()=>open(link)}/> {text}
          </div>
        );
      })
    }
  </div>)
  , document.getElementById('root')
);
