/* jshint quotmark: false, jquery: true */
'use strict';
var React = require('react');

// var Reflux = require('reflux');
// var R = require('ramda');
// var SelectMember = require('../components/SelectMember.jsx');

import {Button, Panel} from 'react-bootstrap';

// import {Logit} from 'AJNutilities';
// var logit = Logit('color:yellow; background:cyan;', 'BusLists.jsx');
var links = [
	{
		'react': 'http://facebook.github.io/react/docs/getting-started.html',
		'react-bootstrap': 'http://react-bootstrap.github.io/components.html',
		'react-router': 'https://github.com/rackt/react-router',
		'redux': 'http://redux.js.org/',
		'redux-sagas': 'http://yelouafi.github.io/redux-saga/index.html',
		'WebPack': 'http://webpack.github.io/docs/',
		'CSS': 'https://developer.mozilla.org/en-US/docs/Web/CSS',
		'javascript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
		'HTML': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element',
		'superAgent': 'http://visionmedia.github.io/superagent/',
	},
	{
		'Futton': 'http://127.0.0.1:5984/_utils/index.html',
		'PouchDB': 'http://pouchdb.com/',
		'PouchDB Authenticate': 'https://github.com/nolanlawson/pouchdb-authentication',
		'couchDB': 'http://docs.couchdb.org/en/latest/contents.html',
		'glyphicons': 'http://glyphicons.com/',
		'lodash': 'https://lodash.com/docs',
		'ramda': 'http://ramdajs.com/docs/#',
		'_String': 'http://epeli.github.io/underscore.string/#api',
	// },{
	}
];

var DevLinks = React.createClass({
	displayName: 'DevLinks',
    render() {
		var i = 0;
	return (
		<div {...this.props} >
		{
			links.map(function(ll) {
				return (
				<div key={i++}>
					{ Object.keys(ll).map( key => (<Button key={key} href={ll[key]} target='_blank' bsSize='xsmall' >{key}</Button>))}
				</div>
				);
			})
		}
        </div>
    );
  },
  // render: function() {
  //   return(
  //     <OverlayTrigger placement="top" overlay={<Tooltip>{this.props.venue}</Tooltip>}>
  //       <Button key={this.props.walkDate} onClick={this.setWalk} active={this.props.active}>{this.props.walkDate}</Button>
  //     </OverlayTrigger>
  //   );
  // },
});
module.exports = DevLinks;
