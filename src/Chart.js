var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var Link = require('react-router').Link;
var strftime = require('strftime');
var rawData = [];

function groupByDue(list) {
  var grouped = {};
  for (var i = 0; i < list.length; ++i) {
    var obj = array[i];
    if (obj.due in grouped) {
      grouped[obj.due] += 1;
    } else {
      grouped[obj.due] = 1;
    }
  }
  return grouped;
}

var ColumnChart = React.createClass({
  render: function() {
    return (
      <div id='chart-container'>
        Chart lives here with Data: {rawData}
      </div>
    )
  },

  componentDidMount: function() {
    this.loadData();

    FusionCharts.ready(function () {
      var chartData = {
        chart: {
          caption: 'Productivity Matters',
          subcaption: 'All vs Finished in Last 7 days',
          xaxisname: 'Date',
          yaxisname: 'Todos',
          theme: 'ocean'
        },
          categories: [{
            category: [{
              label: rawData[0].due
            }, {
              label: rawData[1].due
            }]
        }],
          dataset: [{
            seriesname: 'All',
              data: [{
                value: '10'
              }, {
                value: '12'
            }]
          }, {
            seriesname: 'Finished',
              renderas: 'area',
              showvalues: '0',
              data: [{
                value: '9'
              }, {
                value: '8'
              }]
          }]
      };

      var chartConfigs = {
        id: "all-finished-chart",
        renderAt: "all-finished-chart-container",
        type: "mscombi2d",
        width: 600,
        height: 400,
        dataFormat: "json",
        dataSource: chartData
      };

      React.render(
        < react_fc.FusionCharts {...chartConfigs} />,
        document.getElementById("chart-container")
      );
    });
  },

  loadData: function() {
    var user_id = 1;
    var yesterday = new Date();
    var oneWeekAgo = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = strftime('%F', yesterday);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo = strftime('%F', oneWeekAgo);

    $.ajax('/api/todos/?user_id='+user_id+'&from='+oneWeekAgo+'&to='+yesterday).done(function(data) {
      rawData = data['data'];
    });
  }
});

module.exports = ColumnChart;
