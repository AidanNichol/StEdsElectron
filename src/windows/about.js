import React from 'react';
import { render } from 'react-dom';
import jetpack from 'fs-jetpack';
import {shell} from 'electron';

var links = [
  [
    'Electron',
    'Packaging as an application is achieved using Electron',
    'http://electron.atom.io',
  ],
  [
    'react',
    'The user interface ahs been recreated usinf React',
    'http://facebook.github.io/react/docs/getting-started.html',
  ],
  [
    'MobX',
    'Internal state of the application is managed using reactive style architecture using MobX',
    'https://mobx.js.org/docs/mobx.png',
  ],
  [
    'PouchDB',
    'Persistent state is created locally using Websql data base via PouchDB',
    'http://pouchdb.com/',
  ],
  [
    'couchDB',
    'Central data storage is on a remote server running couchDB',
    'http://docs.couchdb.org/en/latest/contents.html',
  ],
  // ['PouchDB Authenticate', 'PouchDB Authenticate', 'https://github.com/nolanlawson/pouchdb-authentication'],
];
const open = url=> shell.openExternal(url)
const GetIcon = ({ name, ...rest }) => {
  const iName = `../assets/mark-${name.toLowerCase()}`;
  const xName = `mark-${name.toLowerCase()}`;
  const dir = jetpack.cwd(__dirname).dir('../assets');
  const ext = ['svg', 'png', 'jpg'].find(
    ext => !!dir.exists(`${xName}.${ext}`),
  );
  const ico = ext && `${dir.cwd()}/${xName}.${ext}`;
  console.log({
    iName,
    xName,
    dir: dir.cwd(),
    ext,
    ico,
    svg: dir.exists(`${xName}.svg`),
    png: dir.exists(`${xName}.png`),
  });
  // const ico = jetpack.exists(`${iName}.svg`)==='file' ? `${iName}.svg` : (jetpack.exists(`${iName}.png`)==='file' ? `${iName}.png` : undefined);
  if (ico)
    return (
      <div>
        <img src={ico} height="40px" {...rest} />
      </div>
    );
  return <div {...rest}>{name}</div>;
};
render(
  <div id="about-page">
    <div className="item">
      <img
        className="main-logo"
        src={`../assets/St.EdwardsLogoSimple.svg`}
        height="120px"
      />
      <div className="main-text">
        <div>St.Edwards Booking System</div>
        <div style={{ fontSize: '1em' }}>Developed by Aidan Nichol</div>
      </div>
    </div>
    <div className="item">
      <GetIcon
        className="sub-logo"
        name="github"
        onClick={() => open(`https://github.com/AidanNichol/StEdsElectron`)}
      />
      <div className="sub-text">
        The source code for this project is available on Github.
      </div>
    </div>
    {links.map(([name, text, link], i) => {
      return (
        <div className="item" key={'link:' + i}>
          <GetIcon
            className="sub-logo"
            {...{ name }}
            onClick={() => open(link)}
          />
          <div className="sub-text">{text}</div>
        </div>
      );
    })}
  </div>,
  document.getElementById('root'),
);
