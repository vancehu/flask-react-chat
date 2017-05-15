import React, { PureComponent } from 'react';

// show current user's name; list a the other users' name in an option
// invoke parent handleOpenChat when a user is selected and button clicked
export class UserList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: undefined
    }
    this.handleSelectedUserChange = this.handleSelectedUserChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.onlineUsers.length > 0 && this.state.selectedUser === undefined) {
      this.setState({ selectedUser: nextProps.onlineUsers[0] });
    }
  }
  handleSelectedUserChange(event) {
    this.setState({ selectedUser: event.target.value });
  }
  handleClick() {
    this.props.handleOpenChat(this.state.selectedUser);
  }

  render() {
    const { onlineUsers, openedUsers, name } = this.props;
    return <div>
      <span>Welcome: </span><span className="UserList__name">{name}</span>
      {onlineUsers.length > 0 ?
        <span>Users: <select className="UserList__select" value={this.state.selectedUser} onChange={this.handleSelectedUserChange}>
          {onlineUsers.map(user => <option key={user} value={user}>{user}</option>)}
        </select><button onClick={this.handleClick}>Open Chat</button></span> :
        <span>No other user</span>}
    </div>
  }
}