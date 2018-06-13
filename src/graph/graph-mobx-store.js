#!/usr/bin/env node
const madge = require('madge');
let config = require('./config');
config.excludeRegExp = ['^(DateStore|eventBus)'];
config.graphVizOptions.G.label = 'MOBX Store';

madge('../mobx/AccountsStore.js', config)
  .then(res => res.image('mobx-store.pdf'))
  .then(writtenImagePath => {
    console.log('Image written to ' + writtenImagePath + '\nDone 👍🏽 😃');
  });
