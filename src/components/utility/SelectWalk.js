/* jshint quotmark: false, jquery: true */
import XDate from 'xdate';
var React = require('react');

import Logit from '../../factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'Walk:OptionList');

var SelectWalk = React.createClass({
  displayName: 'SelectWalk',
  propTypes: {
      currentWalk: React.PropTypes.string.isRequired,
      setCurrentWalk: React.PropTypes.func.isRequired,
      walks: React.PropTypes.array.isRequired,
    },

  render: function() {
    var { walks, currentWalk, setCurrentWalk} = this.props;
    if (!currentWalk)currentWalk = walks[0].walkId;
    logit('SelectWalk', walks, this.props);
    return (
      <div className="walkSelect">
        <div style={{marginBottom: 10}}>
        {walks.map(function(walk) {
          let dispDate = new XDate(walk.walkDate).toString('dd MMM');
          let venue = walk.venue.replace(/\(.*\)/, '')
          let style = {width: `${100/walks.length}%`, backgroundColor: currentWalk === walk.walkId ? '#87bbe7' : '#d9edf7'}
          return (
                <button  style={style} key={'Y' + walk.walkId} onClick={()=>{setCurrentWalk(walk.walkId)}} >{dispDate}<br/>{venue}</button>
          );
          })
        }
        </div>
      </div>
      );
  },
});


export default SelectWalk;
