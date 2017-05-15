import React, { PureComponent } from 'react';

// invoke parent handleRegister when a name is entered and submitted
export class Register extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { nameInput: '' };
    this.handleNameInputChange = this.handleNameInputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.register = this.register.bind(this);
  }

  handleNameInputChange(event) {
    this.setState({ nameInput: event.target.value });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && this.validate()) {
      this.register();
    }
  }

  validate() {
    // allow to register if username is not empty
    return this.state.nameInput.length > 0;
  }

  register() {
    this.props.handleRegister(this.state.nameInput);
  }

  render() {
    const { users } = this.props;
    return <div>
      <label htmlFor="name">Name: </label>
      <input type="text" name="name" className="Register__input" onChange={this.handleNameInputChange} onKeyPress={this.handleKeyPress} />
      <button disabled={!this.validate()} onClick={this.register} className="Register__button">Register</button>
    </div>
  }
}