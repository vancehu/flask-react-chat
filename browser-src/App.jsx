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
      // will try to get stored history from sessionStorage
      let userRecords;
      try {
        userRecords = JSON.parse(sessionStorage.getItem(name)) || {}
      } catch (e) {
        userRecords = {}
      }
      this.setState({ registered: true, name, userRecords });
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

    socket.on('send', ({ user, body }) => {
      // triggers on a message received
      this.handleOpenChat(user, true);
      this.addRecord(user, body, true);
    });
  }

  handleRegister(name) {
    // triggers on requesting to register
    socket.emit('register', name);
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
    this.addRecord(data.to, data.body, false);
  }

  getUnopenedUsers() {
    // return users that have chat history but not currently opened
    return Object.keys(this.state.userRecords).filter(user => !this.state.openedUsers.includes(user));
  }

  addRecord(user, body, inbox) {
    // add the record to userRecords (chat history)
    // inbox: true means it's send from 'user' to 'me'
    // also attempt to save to sessionStorage
    let userRecords = Object.assign({}, this.state.userRecords);
    if (userRecords[user] === undefined) {
      userRecords[user] = [];
    }
    userRecords[user].push({ body, inbox });
    sessionStorage.setItem(this.state.name, JSON.stringify(userRecords));
    this.setState({ userRecords });
  }

  render() {
    const { connected, onlineUsers, openedUsers, name, registered, userRecords, activeUser } = this.state;
    if (!connected) {
      return <div className="App__connecting">Connecting...</div>
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
        {openedUsers.length === 0 && <span className="App__label">Please select a user to start a chat.</span>}
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