/* jshint quotmark: false, jquery: true */
var React = require('react');

import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'Walk:OptionList');

var SelectWalk = React.createClass({
  displayName: 'SelectWalk',

  render: function() {
    var { walks, currentWalk, setCurrentWalk} = this.props;
    if (!currentWalk && walks && walks.length > 0)currentWalk = walks[0].walkId;
    logit('SelectWalk', walks, this.props);
    return (
      <div className="walkSelect">
        <div style={{marginBottom: 10}}>
          {walks.map(function(walk) {
            let venue = walk.venue.replace(/\(.*\)/, '')
            let style = {
              width: `${100/walks.length}%`,
              backgroundColor: currentWalk === walk.walkId ? '#87bbe7' : '#d9edf7',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }
            return (
              <button  style={style} key={'Y' + walk.walkId} onClick={()=>{setCurrentWalk(walk.walkId)}} >{walk.dispDate}<br/>{venue}</button>
          );
          })
        }
        </div>
      </div>
      );
  },
});


export default SelectWalk;
