import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";

interface State {
  username?: string,
  password?: string
}

class Login extends Component<{loggedIn: (newState: boolean) => void}, State> {
  constructor(props: any) {
    super(props);
    this.attemptLogin = this.attemptLogin.bind(this);
  }

  attemptLogin(e: any) {
    if (this.state.password == "password") {
      this.props.loggedIn(true);
    } else {
      // Failed log in
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <TextField
          hintText="Enter your Username"
          floatingLabelText="Username"
          onChange={(event, newValue) => this.setState({username:newValue})}
        />
        <br/>
        <TextField
          type="password"
          hintText="Enter your Password"
          floatingLabelText="Password"
          onChange = {(event, newValue) => this.setState({password:newValue})}
        />
        <br />
        <RaisedButton label="Submit" primary={true} style={{margin: 15}} onClick={e => this.attemptLogin(e)}/>
        <p style={{fontSize: 10}}>Don't have an account? <a href="#"><Link to={'./signup'}>Sign up here!</Link></a>
        </p>
      </MuiThemeProvider>
    );
  }
}

export default Login;