//@ts-check
import { remote, ipcRenderer } from 'electron';
// const BrowserWindow = remote.BrowserWindow;
import React from 'react';
import { render } from 'react-dom';
import _ from 'lodash';
import { observable, computed, action, toJS, autorun, decorate } from 'mobx';
import { observer } from 'mobx-react';
import debug from 'debug';
import styled from 'styled-components';
debug.enable('debugOptions');
let logme = debug(`debugOptions`);
let logmeC = debug(`children`);
let logmeP = debug(`group`);
let logmeA = debug(`autorun`);
let logmeS = debug(`make`);
let logmeB = debug(`bool`);
logme('BrowserWindow', remote.getCurrentWindow());
var logitCodes = JSON.parse(localStorage.getItem('logitCodes') || '[]').sort();
logme(logitCodes);
const select = { YES: true, SOME: '???', NO: false };
class Bool {
  state = select.NO;
  enableString = '';
  parent = null;
  token = null;
  type = 'Bool';
  constructor(token, parent, partName) {
    this.token = token;
    this.parent = parent;
    this.partName = partName;

    autorun(() => logmeA(this.partName, this.state));
    autorun(() => this.enableString && logmeA(this.partName, this.enableString));
  }
  get stateName() {
    return _.findKey(select, value => value === this.state);
  }
  isGroup() {
    return this.type === 'Group';
  }
  setName(token) {
    this.token = token;
    return this;
  }
  setParent(parent) {
    this.parent = parent;
    return this;
  }
  get count() {
    const bc = this.state === select.YES ? [1, 0] : [0, 1];
    logmeB('count', this.token, bc);
    return bc;
  }

  getEnableString = parentDerivedState => {
    if (parentDerivedState === this.state) return '';
    this.enableString = (parentDerivedState === select.YES ? ',-' : ',') + this.partName;
    return this.enableString;
  };

  get string() {
    return this.enableString;
  }

  setAncestors = val => {
    this.parent && this.parent.setState(val);
  };
  setChildren() {}
  get children() {
    return [];
  }

  setState = val => {
    if (this.state === val) return;
    logmeP('setBoolState', this.partName, val);
    this.state = val;
    this.setParentState(val);
    data.count;
    // }
  };
  setParentState = val => {
    let parent = this.parent;
    if (!parent) {
      logmeP('no parent', this.partName, val);
      return;
    }
    let resVal = val;
    if (val !== select.SOME) {
      for (const token in parent.children) {
        if (parent.children[token].state !== val) {
          resVal = select.SOME;
          break;
        }
      }
    }

    logmeP('setParentState', parent.partName, `${parent.state} ==> ${resVal}(${val})`);
    parent.setState(resVal, false);
  };
}
decorate(Bool, {
  state: observable,
  enableString: observable,
  string: computed,
  getEnableString: action,
  setAncestors: action,
  setState: action,
  setParentState: action,
});
class Group extends Bool {
  type = 'Group';
  derivedState = select.SOME;
  constructor(...args) {
    super(...args);
    // autorun(() => logmeA(this.partName, this.state));
  }
  childrenObj = {};

  get derivedStateName() {
    if (this.state !== select.SOME) return '';
    return _.findKey(select, value => value === this.derivedState) || '';
  }

  isGroup() {
    return true;
  }

  addChild = (key, child) => {
    this.childrenObj[key] = child;
  };
  getChild = key => {
    return this.childrenObj[key];
  };

  get children() {
    return Object.values(this.childrenObj || {});
  }
  get count() {
    this.derivedState = this.state;
    if (this.state !== select.SOME) {
      const bc = this.state === select.YES ? [1, 0] : [0, 1];
      logmeP('count 0', this.partName, bc);
      return bc;
    }
    let myCount = this.children.reduce(
      (count, child) => {
        const cc = child.count;
        return [count[0] + cc[0], count[1] + cc[1]];
      },
      [0, 0],
    );
    let diff = myCount[0] - myCount[1];
    let { state, derivedState } = this;
    logmeP('count', this.partName, myCount, { diff, state, derivedState });
    if (Math.abs(diff) < 2 && this.parent) return myCount;
    this.derivedState = diff > 0 ? select.YES : select.NO;
    const gc = diff > 0 ? [1, 0] : [0, 1];
    logmeP('count 2', this.partName, gc, this.derivedState);
    return gc;
  }

  getEnableString = parentDerivedState => {
    this.enableString = '';
    if (this.state !== select.SOME) {
      if (parentDerivedState === this.state) return '';
      this.enableString = (this.state === select.YES ? ',' : ',-') + this.partName + ':*';
      logmeP(
        'string 1',
        this.partName,
        parentDerivedState,
        this.state,
        this.enableString,
      );
      return this.enableString;
    }
    if (this.derivedState !== parentDerivedState && this.derivedState !== select.SOME) {
      this.enableString =
        (this.derivedState === select.YES ? ',' : ',-') + this.partName + ':*';
      parentDerivedState = parentDerivedState === select.YES ? select.NO : select.YES;
    }
    this.enableString = this.children.reduce(
      (str, child) => str + child.getEnableString(parentDerivedState),
      this.enableString,
    );
    logmeP('string 2', this.partName, this.derivedState, this.enableString);
    return this.enableString;
  };

  setChildren = val => {
    this.children.forEach(child => {
      logmeC(child.partName, child.token, val);
      child.state = val;
      if (child.isGroup()) {
        child.setChildren(val);
      }
    });
  };

  setState = (val, down = true) => {
    if (this.state === val) return;

    logmeP(`set${this.type}State`, this.partName, `${this.state} ==> ${val}`);
    this.state = val;
    down && this.setChildren(val);
    this.setParentState(val);
    data.count;
  };
}
decorate(Group, {
  derivedState: observable,
  addChild: action,
  getEnableString: action,
  setChildren: action,
  setState: action,
  children: computed,
});
/* 
get table of current logit codes and built the data hierarchy

 */
const partNameIndex = {};
let data = new Group('root', null, '*');
partNameIndex['*'] = data;
['pouchdb:api', 'pouchdb:http', ...logitCodes].forEach((code, i) => {
  if (`${code}:` === logitCodes[i + 1]) logme('collison', i, code, logitCodes[i + 1]);
  let parent = data;
  code = code
    .split(':')
    .map(part => _.upperFirst(part))
    .join(':');
  code.split(':').forEach((part, i, arr) => {
    logme(code, part, i, arr, i >= arr.length - 1, parent);
    if (!parent.getChild(part)) {
      let newChild,
        partName = code;
      if (i >= arr.length - 1) newChild = new Bool(part, parent, code);
      else {
        partName = arr.slice(0, i + 1).join(':');
        newChild = new Group(part, parent, partName);
      }
      partNameIndex[partName] = newChild;
      logmeS(code, part, newChild);
      parent.addChild(part, newChild);
    }
    parent = parent.getChild(part);
  });
});
logme('---- data -----', data);
logme('---- partNameIndex -----', partNameIndex);
/* 
override the default values with the current setting
 */
var enableString = JSON.parse(localStorage.getItem('enableString') || '""');
enableString
  .replace(/:\*/g, '')
  .split(',')
  .forEach(name => {
    let val = select.YES;
    if (name[0] === '-') {
      name = name.substr(1);
      val = select.NO;
    }
    logme('setIndex', name, val, partNameIndex[name]);
    partNameIndex[name] && partNameIndex[name].setState(val);
  });
data.count;

var save = () => {
  data.count;
  let enableString = data.getEnableString(select.NO).substr(1);
  logmeP('save me', enableString);
  localStorage.setItem('debug', JSON.stringify(enableString));
  ipcRenderer.send('reload-main', {});
  // BrowserWindow.getFocusedWindow().close();
};
ipcRenderer.on('reload-reply', (event, arg) => {
  console.log(arg); // prints "pong"
});
const ShowBool = observer(props => {
  let { obj, className } = props;
  const getStateName = state => _.findKey(select, value => value === state);
  let stateName = getStateName(obj.state);
  let derivedStateName =
    (obj.state === select.SOME && getStateName(obj.derivedState)) || '';
  logme('showBool', obj.partName, obj.state, stateName, obj);
  return (
    <div
      key={obj.partName}
      className={stateName + ' ' + className}
      onClick={() => {
        obj.setState(!obj.state);
      }}
    >
      <input
        key={obj.partName + 'I'}
        type="checkbox"
        onChange={() => {
          // obj.setState(!obj.state);
        }}
        checked={obj.state}
        ref={input => {
          if (input) {
            input.indeterminate = obj.state === select.SOME;
          }
        }}
      />
      <span>
        {' '}
        {obj.partName}
        &nbsp;{(obj.state === select.SOME && derivedStateName) || ''}
      </span>
    </div>
  );
});
// BrowserWindow.getFocusedWindow().reload();
const unstyledObjectTree = observer(props => {
  let { obj, className } = props;
  logme(
    'Obj',
    obj.partName,
    obj.token,
    obj,
    obj.children.size,
    toJS(obj.children.keys()),
  );
  return (
    <div className={'obj ' + className} key={'obj:' + obj.partName}>
      {obj.token && (
        <h4 className={`${obj.stateName} ${obj.derivedStateName}`}>
          <ShowBool obj={obj} />
        </h4>
      )}
      <div key={'objj:' + obj.partName} className="objContent">
        {obj.children.map(child => {
          logme('objectTree', child.type, child.partName, child.token, child);
          if (child.type === 'Group')
            return <ObjectTree key={child.partName} obj={child} />;
          else return <ShowBool key={child.partName} obj={child} className="bool" />;
        })}
      </div>
    </div>
  );
});
const ObjectTree = styled(unstyledObjectTree)`
  margin: 10px;
  margin-left: 0;

  h4 {
    /* background-color: cyan; */
    border-bottom: black solid thin;
    font-size: 1.1em;
    font-weight: normal;
    margin: 0;
    padding-left: 0px;
    &.YES {
      background-color: #00ff00;
      &.SOME {
        /* opacity: 50%; */
        background-color: #88ff88;
      }
    }
    &.NO {
      background-color: #ff0000;
      &.SOME {
        /* opacity: 50%; */
        background-color: #ff8888;
      }
    }
  }

  span {
    display: inline-block;
    /* width: 150px; */
    margin: 4px;
  }

  & > div {
    padding-left: 10px;
    & .objContent {
      padding-left: 20px;
    }
  }

  .obj {
    border: #000000 solid thin;
    max-width: 620px;
  }

  .base {
    display: none;
  }
  .YES {
    font-weight: bold;
  }
  .NO > span {
    text-decoration: line-through;
  }
  .SOME {
    opacity: 0.7;
  }
  .bool {
    padding-left: 3px;
  }
`;

render(
  <div id="settings-page">
    <div className="item">
      <img
        className="main-logo"
        src={`../assets/St.EdwardsLogoSimple.svg`}
        height="120px"
      />
      <div className="main-text">
        <div>St.Edwards Booking System</div>
        <div style={{ fontSize: '1em' }}>Debug Options</div>
      </div>
    </div>
    <div>
      <button onClick={save}>Save</button>
      <ObjectTree obj={data} />
      <button onClick={save}>Save</button>
      <div>enable: {data.string}</div>
    </div>
  </div>,
  document.getElementById('root'),
);
