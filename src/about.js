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
  ['Electron', 'Packaging as an application is achieved using Electron', 'http://electron.atom.io'],
  ['react', 'The user interface ahs been recreated usinf React', 'http://facebook.github.io/react/docs/getting-started.html'],
  ['redux', 'Internal state of the application is managed using flux style architecture using Redux', 'http://redux.js.org/'],
  ['redux-sagas', 'Asyncronous actions such as communicating with the data base is managed by using redux-sagas', 'http://yelouafi.github.io/redux-saga/index.html'],
  ['PouchDB', 'Persistent state is created locally using Websql data base via PouchDB', 'http://pouchdb.com/'],
  ['couchDB', 'Central data storage is on a remote server running couchDB', 'http://docs.couchdb.org/en/latest/contents.html'],
  // ['PouchDB Authenticate', 'PouchDB Authenticate', 'https://github.com/nolanlawson/pouchdb-authentication'],
];
const GetIcon = ({name, ...rest})=>{
  const iName = `./assets/mark-${name.toLowerCase()}`;
  console.log({iName})
  const ico = fsExists(`${iName}.svg`) ? `${iName}.svg` : (fsExists(`${iName}.png`) ? `${iName}.png` : undefined);
  if (ico) return (<div><img src={ico} height='40px' {...rest}/></div>)
  return (<div {...rest}>{name}</div>)
};
render(
  (<div id="about-page">
    <div className='item'>
      <img className="main-logo" src={`./assets/St.EdwardsLogoSimple.svg`} height='120px' />
      <div className="main-text">
        <div>St.Edwards Booking System</div>
        <div style={{fontSize: '1em'}}>Developed by Aidan Nichol</div>

      </div>
    </div>
    <div className='item'>
      <GetIcon className="sub-logo" name="github" onClick={()=>open(`https://github.com/AidanNichol/StEdsElectron`)} />
      <div className="sub-text">The source code for this project is available on Github.</div>

    </div>
    {
      links.map(([name, text, link, icon], i)=>{
        return (
          <div className='item' key={'link:'+i} >
            <GetIcon className="sub-logo" {...{name}} onClick={()=>open(link)}/>
            <div className="sub-text">
              {text}
            </div>
          </div>
        );
      })
    }
  </div>)
  , document.getElementById('root')
);
