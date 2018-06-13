#!/usr/bin/env node
const src = '../components/containers/buslists-mobx.js';
// const src = '../components/containers/Payments-mobx';

const madge = require('madge');
let config = require('./configuration.js');
config.excludeRegExp = ['(eventBus|signinState|DateStore)'];
config.dependencyFilter = (file, parent) => !/Store/.test(parent); // hide store details
config.graphVizOptions.G.label = 'Bus Lists';
const out = 'bus-lists.pdf';

madge(src, config)
  .then(res => {
    console.log(JSON.stringify(res.obj(), null, '\t'));
    return res;
  })
  .then(res => res.image(out))
  .then(writtenImagePath => {
    console.log('Image written to ' + writtenImagePath + '\nDone 👍🏽 😃');
  });
