#!/usr/bin/env node
const src = '../components/containers/bookings-mobx.js';
// const src = '../components/views/ShowConflicts.js';
// const src = '../components/containers/buslists-mobx.js';
// const src = '../components/containers/Payments-mobx';

const madge = require('madge');
let config = require('./configuration.js');
// config.excludeRegExp = [
//   '(Account|Walk|Member|Booking|AccLog|BookingLog|PaymentsSummaryStore|fundsManager[0-9]?|DateStore).js',
//   '(eventBus|signinState)',
// ];
config.excludeRegExp = ['^(DateStore|eventBus)'];
config.dependencyFilter = (file, parent) => !/Store/.test(parent); // hide store details

config.graphVizOptions.G.label = 'Bookings';
const out = 'Bookings.pdf';

madge(src, config)
  .then(res => res.image(out))
  .then(writtenImagePath => {
    console.log('Image written to ' + writtenImagePath + '\nDone 👍🏽 😃');
  });
