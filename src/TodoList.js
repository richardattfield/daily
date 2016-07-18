var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');
var Link = require('react-router').Link;
var Button = require('react-bootstrap/lib/Button');
var strftime = require('strftime');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var FormControl = require('react-bootstrap/lib/FormControl');

import CurrentDay from './CurrentDay'
import Header from './Header'
import ShowCalendarBtn from './ShowCalendarBtn'

var TodoFilter = require('./TodoFilter');
var TodoAdd = require('./TodoAdd');

var openFilterGlobal;

var TodoRow = React.createClass({
  handleDelete: function(e) {
    $('.'+this.props.todo.id).toggleClass("removed");
    var form = document.getElementById("deleteBtn");
    this.deleteTodo({title: this.props.todo.id});
  },
  handleChange: function(e) {
    this.props.todo.title=e.target.value;
    var $currentTodo=$("."+this.props.todo.id).children()[3].children[0].children[0].children[0];
    console.log("in changeHandler");
    console.log("title "+this.props.todo.title);
    $currentTodo.value=window.prompt("Update the task");
    this.updateTodo({title: $currentTodo.value, status: this.props.todo.status});
  },
  handleStatusChange: function(){
    var $todoId=$('.'+this.props.todo.id);
    var todoTitle=this.props.todo.title;
    $todoId.toggleClass("completed");
    if ($todoId.hasClass("completed")) {
      console.log("will fire update to mark closed");
      this.updateTodo({title: todoTitle, status:"closed" });
    } else {
      console.log("will fire update to mark open");
      this.updateTodo({title: todoTitle, status:"open" });
    }
  },
  updateTodo: function(todo) {
    console.log("Updating todo");
    $.ajax({
      type: 'PUT', url: '/api/todos/'+this.props.todo.id, contentType: 'application/json',
      data: JSON.stringify(todo),
      success: function(data) {
      }.bind(this),
      error: function(xhr, status, err) {
        // ideally, show error to user.
        console.log("Error adding todo:", err);
      }
    });
  },
  deleteTodo: function(todo) {
    console.log("Deleting todo:", todo);
    $.ajax({
      type: 'DELETE', url: '/api/todos/'+this.props.todo.id, contentType: 'application/json',
      data: JSON.stringify(todo),
      success: function(data) {
      }.bind(this),
      error: function(xhr, status, err) {
        // ideally, show error to user.
        console.log("Error adding todo:", err);
      }
    });
  },
  //
  render: function() {
    return (
      <tr className='table_rows'>
        <td className={this.props.todo.id}>
          <button type="button" className="destroy" onClick={this.handleDelete}>
            <span className="glyphicon glyphicon-remove" aria-hidden="false"></span>
          </button>
          <button type="button" className="markComplete" onClick={this.handleStatusChange}>
            <span className="glyphicon glyphicon-ok" aria-hidden="false"></span>
          </button>
          <button type="button" className="editTodo" onClick={this.handleChange}>
            <span className="glyphicon glyphicon-pencil" aria-hidden="false"></span>
          </button>
          <span className='table_cells'>
            <FormGroup >
              <form name="todoItem">
                <FormControl
                  contentEditable="true"
                  className={this.props.todo.id}
                  id={this.props.todo.id}
                  name="todoAdd"
                  type="text"
                  value={this.props.todo.title}/>
                <FormControl.Feedback />
              </form>
            </FormGroup>
          </span>
        </td>
      </tr>
    )
  }
});

var TodoTable = React.createClass({
  render: function() {
    var filter = openFilterGlobal;
    console.log("Rendering todo table, num items:", this.props.todos.length);
    var todoRows = this.props.todos.map(function(todo) {
      switch ( filter ) {
        case "closed":
          if (todo.status==="closed") {
            return <TodoRow key={todo.id} todo={todo}/>
          }
          break;
        case "open":
          if (todo.status==="open") {
            return <TodoRow key={todo.id} todo={todo}/>
          }
          break;
        default:
          return <TodoRow key={todo.id} todo={todo}/>
      }
    });
    return (
      <table className="table table-striped table-bordered table-condensed">
        <tbody className="tBody">
          {todoRows}
        </tbody>
      </table>
    )
  }
});

var TodoList = React.createClass({
  getInitialState: function() {
    return {todos: []};
  },
  render: function() {
    console.log("Rendering TodoList, num items:", this.state.todos.length);
    return (
      <div className='todoList'>
          <Header />
          <CurrentDay dateFilter={this.dateFilter} />
          <ShowCalendarBtn />
          <TodoTable todos={this.state.todos}/>
          <TodoAdd addTodo={this.addTodo} />
          <TodoFilter openFilter={this.openFilter}
            closeFilter={this.closeFilter} submitHandler={this.changeFilter} initFilter={this.props.location.query}
            allFilter={this.allFilter}/>
        </div>
    )
  },

  componentDidMount: function() {
    console.log("TodoList: componentDidMount");
    this.loadData();
  },

  componentDidUpdate: function(prevProps) {
    console.log("prevProps "+prevProps.todos);
    console.log("nowProps "+this.props.todos);
    var oldQuery = prevProps.location.query;
    var newQuery = this.props.location.query;
    console.log("old "+this.state.todos.length);
    console.log("new "+this.props.length);
    if (oldQuery.priority === newQuery.priority &&
        oldQuery.status === newQuery.status) {
      console.log("TodoList: componentDidUpdate, no change in filter, not updating");
      return;
    } else {
      console.log("TodoList: componentDidUpdate, loading data with new filter");
      this.loadData();
    }
  },

  loadData: function(status="all", dateSelected="null") {
    console.log("the test "+status);
    if (dateSelected==="null") {
      var today = strftime('%F', new Date());
    } else {
      var today=dateSelected;
    }
    var user_id=1;
    openFilterGlobal = status;
    console.log("openFilterGlobal "+openFilterGlobal);
    $.ajax('/api/todos/?user_id='+user_id+'&from='+today+'&to='+today).done(function(data) {
      this.setState({todos: data["data"]});
    }.bind(this));
  },

  dateFilter: function(dateSelected){
    this.loadData("all",dateSelected);
  },

  changeFilter: function(newFilter) {
    this.props.history.push({search: '?' + $.param(newFilter)});
  },

  allFilter: function(todo){
    $(".tBody").removeClass("completed");
    this.loadData("all");
  },

  openFilter: function(todo) {
    $(".tBody").removeClass("completed");
    this.loadData("open");
  },
  closeFilter: function(todo) {
    $(".tBody").addClass("completed");
    this.loadData("closed");

  },

  addTodo: function(todo) {
    console.log("Adding todo:", todo);
    $.ajax({
      type: 'POST', url: '/api/todos', contentType: 'application/json',
      data: JSON.stringify(todo),
      success: function(data) {
        var todo = data;
        // We're advised not to modify the state, it's immutable. So, make a copy.
        var todosModified = this.state.todos.concat(todo);
        this.setState({todos: todosModified});
        console.log("check this"+todosModified);
        this.loadData();
      }.bind(this),
      error: function(xhr, status, err) {
        // ideally, show error to user.
        console.log("Error adding todo:", err);
      }
    });
  },

});

module.exports = TodoList;
