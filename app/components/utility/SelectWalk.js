/* jshint quotmark: false, jquery: true */
import XDate from 'xdate';
var React = require('react');

import { ButtonGroup, Button} from 'react-bootstrap';

import Logit from 'factories/logit.js';
var logit = Logit('color:yellow; background:cyan;', 'WalkOptionList.js');

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
        <ButtonGroup style={{marginBottom: 15}}>
        {walks.map(function(walk) {
          let dispDate = new XDate(walk.walkDate).toString('dd MMM');
          let venue = walk.venue.replace(/\(.*\)/, '')
          return (
                <Button  style={{width:100}} key={'Y' + walk.walkId} onClick={()=>{setCurrentWalk(walk.walkId)}} active={currentWalk === walk.walkId}>{dispDate}<br/>{venue}</Button>
          );
          })
        }
        </ButtonGroup>
      </div>
      );
  },
});


module.exports = SelectWalk;
