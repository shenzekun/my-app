import React, {Component} from 'react';
import '../../css/App.css';
import 'normalize.css'
import TodoInput from '../../js/mod/TodoInput'
import TodoItem from '../../js/mod/TodoItem'
import UserDialog from '../../js/mod/UserDialog'
import {getCurrentUser, signOut, TodoModel} from '../../js/mod/leanCloud'
import '../../bootstrap/css/bootstrap.min.css'
import '../../bootstrap/css/bootstrapValidator.css'



class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: getCurrentUser() || {},
            newTodo: '',
            todoList: []
        };
        let user = getCurrentUser();
        if (user) {
            TodoModel.getByUser(user, (todos) => {
                let stateCopy = JSON.parse(JSON.stringify(this.state));
                stateCopy.todoList = todos;
                this.setState(stateCopy)
            })
        }
    }

    render() {
        let todos = this.state.todoList.filter((item) => !item.deleted).map((item, index) => {
            return (
                <li key={index}><TodoItem todo={item} onToggle={this.toggle.bind(this)}
                                          onDelete={this.delete.bind(this)}/></li>
            )
        });
        return (
            <div className="App">
                <h1>{this.state.user.username || '我'}的待办 {this.state.user.id
                    ? <button onClick={this.signOut.bind(this)}>登出</button> : null}
                </h1>
                <div className="inputWrapper">
                    <TodoInput
                        content={this.state.newTodo}
                        onChange={this.changeTitle.bind(this)}
                        onSubmit={this.addTodo.bind(this)}/>
                </div>
                <ol className="todoList">
                    {todos}
                </ol>
                {this.state.user.id
                    ? null
                    : <UserDialog
                        onSignUp={this.onSignUpOrSignIn.bind(this)}
                        onSignIn={this.onSignUpOrSignIn.bind(this)}/>}

            </div>
        )
    }

    componentDidUpdate() {
    }

    toggle(e, todo) {
        let oldStatus = todo.status;
        todo.status = (todo.status === 'completed' ? '' : 'completed');
        TodoModel.update(todo, () => {
            this.setState(this.state)
        }, (error) => {
            console.log(error);
            todo.status = oldStatus;
            this.setState(this.state)
        })
    }

    /*删除todo*/
    delete(e, todo) {
        TodoModel.destroy(todo.id, () => {
            todo.deleted = true;
            this.setState(this.state)
        },(error)=>{
            console.log(error);
        })
    }


/*增加todo
* 每个todo 拥有：
id - 区分两个todo的依据
title - 也就是用户写的东西
status - completed 表示完成，空表示未完成
deleted - bool 值，表示是否删除了*/
    addTodo(event) {
        let newTodo = {
            title: event.target.value,
            status: '',
            deleted: false
        };
        TodoModel.create(newTodo, (id) => {
            newTodo.id = id;
            this.state.todoList.push(newTodo);
            this.setState({
                newTodo: '',
                todoList: this.state.todoList
            })
        }, (error) => {
            console.log(error);
        })
    }


    /*监听输入框的变化*/
    changeTitle(event) {
        this.setState({newTodo: event.target.value, todoList: this.state.todoList})
    }

    onSignUpOrSignIn(user) {
        let stateCopy = JSON.parse(JSON.stringify(this.state));
        stateCopy.user = user;
        this.setState(stateCopy)
    }

    /*登出*/
    signOut() {
        signOut();
        let stateCopy = JSON.parse(JSON.stringify(this.state));
        stateCopy.user = {};
        this.setState(stateCopy)
    }
}

export default App;
