#!/usr/bin/env node
const src = '../components/containers/members-list-mobx.js';

const madge = require('madge');
let config = require('./configuration.js');
config.excludeRegExp = ['^(DateStore|eventBus)'];
config.dependencyFilter = (file, parent) => !/Store/.test(parent); // hide store details

config.graphVizOptions.G.label = 'List members';
const out = 'members-list.pdf';

madge(src, config)
  .then(res => {
    console.log(JSON.stringify(res.obj(), null, '\t'));
    return res;
  })
  .then(res => res.image(out))
  .then(writtenImagePath => {
    console.log('Image written to ' + writtenImagePath + '\nDone 👍🏽 😃');
  });
