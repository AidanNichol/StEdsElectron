// /* jshint quotmark: false */
// 'use strict';
// import React from 'react';
// import ReactDOM from 'react-dom';
// import Awesomplete from '../../../utilities/awesomplete.js';
// import '../../../utilities/awesomplete.css.js';
// // import members../List from '../computed/membersList.js';
//
// // @Cerebral({
// //   // listById: ['membersList', 'listById'],
// //   // listByName: ['membersList', 'listByName'],
// //   members: membersList,
// // })
// class SearchBox extends React.Component { // eslint-disable-line react/display-name
//   componentDidMount(){
//     // var members = R.pluck('nameR', this.members);
//     var members = this.props.members.map((mem)=>mem.name);
//     // var element = React.findDOMNode(this);
//     var ac = new Awesomplete(ReactDOM.findDOMNode(this), { // eslint-disable-line no-unused-vars
//       list: members,
//       minChars: 1,
//       autoFirst: true,
//       filter: (text, input)=>text.includes(input),
//       sort: (a, b)=>a.localeCompare(b),
//     });
//     window.addEventListener('awesomplete-selectcomplete', (event)=>this.selected(event));
//   }
//
//   componentWillUnmount(){
//     window.removeEventListener('awesomplete-selectcomplete', (event)=>this.selected(event));
//   }
//   changed(event){
//     if (event.target.value.length === 1)event.target.value = event.target.value.toUpperCase();
//   }
//   selected(event){
//     console.log('selected', event, event.srcElement.value);
//     // var datum = R.find(R.propEq('nameR', event.srcElement.value), this.members);
//     var datum = this.props.members.find((memb)=>memb.name === event.srcElement.value);
//     console.log('elm', datum);
//     this.props.action(datum);
//     event.srcElement.value = '';
//   }
//   render(){
//     return (
//       <input onChange={(event)=>this.changed(event)} placeholder="Enter Member Name" style={this.props.style} type='search' />
//     );
//   }
// }
// export default SearchBox;
