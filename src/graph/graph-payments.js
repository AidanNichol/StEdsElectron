#!/usr/bin/env node
const src = '../components/containers/Payments-mobx.js';

const madge = require('madge');
let config = require('./configuration.js');
require('./configuration.js');
config.excludeRegExp = ['(eventBus|signinState)'];
config.dependencyFilter = (file, parent) => !/Store/.test(parent); // hide store details

config.graphVizOptions.G.label = 'Payments';
const out = 'payments.pdf';

madge(src, config)
  .then(res => {
    console.log(JSON.stringify(res.obj(), null, '\t'));
    return res;
  })
  .then(res => res.image(out))
  .then(writtenImagePath => {
    console.log('Image written to ' + writtenImagePath + '\nDone 👍🏽 😃');
  })
  .catch(error => console.log(error));
