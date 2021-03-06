import React, { PureComponent } from 'react';
import { UserList, Register, ChatBox, Unopened } from './partials';
import { socket } from './socket';

export class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      connected: false, // whether socketIo is connected
      registered: false, // whether is registered
      name: "", // user name
      onlineUsers: [], // array of online users
      userRecords: {}, // chat history
      openedUsers: [], // array of opened (chatBox visible) users
      activeUser: -1, // index of current highlighted user
      updateCounter: 0 // ensure the name broadcast is the latest version
    };
    this.handleRegister = this.handleRegister.bind(this);
    this.handleOpenChat = this.handleOpenChat.bind(this);
    this.handleCloseChat = this.handleCloseChat.bind(this);
    this.getUnopenedUsers = this.getUnopenedUsers.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.addRecord = this.addRecord.bind(this);
  }
  componentWillMount() {
    socket.on('connect', () => {
      // triggers on connected
      this.setState({ connected: true });
      if (this.state.registered) {
        //reconnect if already registered
        this.handleRegister(this.state.name);
      }
    });

    socket.on('disconnect', () => {
      // triggers on disconnected, will try to reconnect
      this.setState({ connected: false });
    });

    socket.on('register_success', (name) => {
      // triggers on successfully registered
      this.setState({ registered: true, name });
    });

    socket.on('request_update_name', (updateCounter) => {
      // triggers on a request of name updating
      if (updateCounter > this.state.updateCounter) {
        // empty current onlineUsers
        this.setState({ onlineUsers: [], updateCounter })
      }
      if (this.state.registered) {
        // broadcast my name
        socket.emit('update_name', { updateCounter, name: this.state.name })
      }
    });

    socket.on('update_name', ({ updateCounter, name }) => {
      // triggers on receiving a name broadcast
      if (name === this.state.name) return;
      if (updateCounter === this.state.updateCounter) {
        this.setState({ onlineUsers: [...this.state.onlineUsers, name].sort() });
      }
    });

    socket.on('send_success', ({ user, body, timestamp }) => {
      // triggers on a message received
      this.addRecord(user, body, timestamp, false);
    });

    socket.on('new_message', ({ user, body, timestamp }) => {
      // triggers on a message received
      this.handleOpenChat(user, true);
      this.addRecord(user, body, timestamp, true);
    });
  }

  handleRegister(name) {
    // triggers on requesting to register
    socket.emit('register', name);
    // will try to get stored history from localStorage
    let userRecords;
    try {
      userRecords = JSON.parse(localStorage.getItem(name)) || {}
    } catch (e) {
      userRecords = {}
    }
    this.setState({ userRecords });
  }

  handleOpenChat(name, keepOrder) {
    // triggers on requesting to open a chat
    // will move to first if keepOrder is false and the chat is already opened
    let users = [...this.state.openedUsers];
    let index = users.indexOf(name);
    if (index > -1) {
      if (keepOrder) {
        this.setState({ activeUser: index });
        return;
      };
      users.splice(index, 1);
    }
    users.unshift(name);
    this.setState({ openedUsers: users, activeUser: 0 });
  }

  handleCloseChat(name) {
    // triggers on requesting to close a chat
    let users = [...this.state.openedUsers];
    let index = users.indexOf(name);
    if (index > -1) {
      users.splice(index, 1);
      this.setState({ openedUsers: users });
    }
  }

  handleSend(data) {
    // triggers on requesting to send a message
    socket.emit('send', data);
  }

  getUnopenedUsers() {
    // return users that have chat history but not currently opened
    return Object.keys(this.state.userRecords).filter(user => !this.state.openedUsers.includes(user));
  }

  addRecord(user, body, timestamp, inbox) {
    // add the record to userRecords (chat history)
    // inbox: true means it's send from 'user' to 'me'
    // also attempt to save to localStorage
    let userRecords = Object.assign({}, this.state.userRecords);
    if (userRecords[user] === undefined) {
      userRecords[user] = [];
    }
    userRecords[user].push({ body, inbox, timestamp });
    localStorage.setItem(this.state.name, JSON.stringify(userRecords));
    this.setState({ userRecords });
  }

  render() {
    const { connected, onlineUsers, openedUsers, name, registered, userRecords, activeUser } = this.state;
    if (!connected) {
      return <h1 className="App__name">Chat Server<span className="App__connecting">&#8226; connecting</span></h1>
    }
    return <div className="App">
      <h1 className="App__name">Chat Server<span className="App__connected">&#8226; connected</span></h1>
      {/*show register bar if not registered; otherwise show the list of online users */}
      <div className="App__navbar">
        {registered ?
          <UserList name={name} onlineUsers={onlineUsers} handleOpenChat={this.handleOpenChat} /> :
          <Register handleRegister={this.handleRegister} />}
      </div>
      {/* iterate ChatBox for users that marked as opened */}
      <div className="App__container">
        {!registered && <div className="App__label">Please register your name first.</div>}
        {registered && openedUsers.length === 0 && <div className="App__label">Please select a user to start a chat.</div>}
        {openedUsers.map((user, index) =>
          <ChatBox key={user} from={name} to={user} userRecords={userRecords}
            handleCloseChat={this.handleCloseChat} handleSend={this.handleSend}
            active={index === activeUser} handleClick={() => { this.setState({ activeUser: index }) }} online={onlineUsers.includes(user)} />)}
        {/* users that have chat history but not currently online */}
        <Unopened users={this.getUnopenedUsers()} handleOpenChat={this.handleOpenChat}></Unopened>
      </div>
    </div>
  }
}