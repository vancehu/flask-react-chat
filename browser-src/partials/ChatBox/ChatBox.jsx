import React, { Component } from 'react';

// invoke parent handleCloseChat when the close button is clicked
// invoke parent handleSend when body is not empty and the send button is clicked
export class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleBodyChange = this.handleBodyChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.state = {
      body: ""
    }
  }

  componentDidMount() {
    this.refs.content.scrollTop = this.refs.content.scrollHeight;
  }
  componentDidUpdate() {
    this.refs.content.scrollTop = this.refs.content.scrollHeight;
  }
  handleBodyChange(event) {
    this.setState({ body: event.target.value })
  }
  handleKeyPress(e) {
    if (e.key === 'Enter' && this.validate()) {
      this.handleSend();
    }
  }
  handleClose() {
    this.props.handleCloseChat(this.props.to);
  }
  handleSend() {
    this.setState({ body: "" });
    this.props.handleSend({ body: this.state.body, from: this.props.from, to: this.props.to });
  }
  validate() {
    return this.state.body.length > 0 && this.props.online;
  }
  render() {
    const { from, to, userRecords, active, online } = this.props;
    return <div className={"ChatBox__container" + (active ? " active" : "")} onClick={this.props.handleClick}>
      <div className={"ChatBox__title" + (online ? "" : " offline")}>{to + (online ? "" : " (offline)")}<button className="ChatBox__close" onClick={this.handleClose}>X</button></div>
      <div className="ChatBox__content" ref="content">
        {userRecords[to] && userRecords[to].map((record, index) => <div className="ChatBox__line" key={index.toString()}>{record.inbox ? <span className="ChatBox__inbox">{to}: </span> : <span className="ChatBox__outbox">{from}: </span>}{record.body}<span className="ChatBox__timestamp"> ({new Date(record.timestamp).toTimeString().substring(0, 5)})</span></div>)}
        {!userRecords[to] && <div className="ChatBox__line">No chat history</div>}
      </div>
      <input className="ChatBox__input" type="text" onChange={this.handleBodyChange} onKeyPress={this.handleKeyPress} value={this.state.body} /><button className="ChatBox__button" disabled={!this.validate()} onClick={this.handleSend}>Send</button>
    </div>
  }
}