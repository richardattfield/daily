import React from 'react'
var Datetime = require('react-datetime');
var date = new Date();
export default React.createClass({
  render: function() {
    return (
      <div>
        <Datetime className="currentDayName" defaultValue={date} open={false}/>
      </div>
      )
    }
  })
