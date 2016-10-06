// /* jshint quotmark: false */
// var React = require('react');
// import Awesomplete from '../awesomplete-gh-pages/Awesomplete.js';
// import '../Awesomplete-gh-pages/Awesomplete.css.js';
// import Logit from '../../factories/logit.js';
// var logit = Logit('color:white; background:black;', 'WalksReducer');
// logit('loaded', null);
//
// // var filter = (text, input)=>text.includes(input);
//
// // var alphabetic = (a, b)=>a.localeCompare(b);
//
// var SearchBox = React.createClass({
//   displayName: 'SearchBox',
//   attach: function(input){
//     // var members = R.pluck('nameR', this.members);
//     var members = this.members.map((memb)=> memb.nameR);
//     // var element = React.findDOMNode(this);
//     var ac = new Awesomplete(input, { // eslint-disable-line no-unused-vars
//       list: this.props.options,
//       minChars: 1,
//       autoFirst: true,
//       filter: (text, input)=>text.includes(input),
//       sort: (a, b)=>a.localeCompare(b),
//     });
//     window.addEventListener('awesomplete-selectcomplete', this.selected);
//   },
//
//   componentWillUnmount: function(){
//     window.removeEventListener('awesomplete-selectcomplete', this.selected);
//   },
//   // element: null,
//   changed(event){
//     if (event.target.value.length === 1)event.target.value = event.target.value.toUpperCase();
//   },
//   selected(event){
//     // console.log('selected', event, event.srcElement.value);
//     // var datum = R.find(R.propEq('nameR', event.srcElement.value), this.members);
//     var datum = this.members.find((memb)=>memb.nameR === event.srcElement.value);
//     // console.log('elm', datum);
//     logit('selected', {datum})
//     this.props.action(datum);
//     event.srcElement.value = '';
//   },
//   render: function(){
//     logit('select', this.props);
//     return (
//       <input onChange={this.props.} placeholder="Enter Member Name" style={this.props.style} ref={(c)=>this.attach()} type='search' />
//     );
//   }
// });
// export default SearchBox;
