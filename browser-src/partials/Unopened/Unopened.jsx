import React, { PureComponent } from 'react';

// show the list of unopened users that have history stored
// invoke parent handleOpenChat when a user is clicked
export class Unopened extends PureComponent {
  render() {
    const { users } = this.props;
    return <div className="Unopened">
      {users.length > 0 && <span>Check chat history of: {users.map(user => <span className="Unopened__user" key={user} onClick={() => this.props.handleOpenChat(user)}>{user}</span>)}</span>}
    </div>
  }
}