import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import TextField from "material-ui/TextField";
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";

interface State {
    username?: string,
    password?: string,
    checkPassword?: string,
    usernameAvailable?: boolean,
    passwordsEqual?: boolean
}

class SignUp extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: "",
      password: "",
      checkPassword: "",
      usernameAvailable: undefined,
      passwordsEqual: undefined
    };
    this.checkIfUsernameAvailable = this.checkIfUsernameAvailable.bind(this);
    this.signup = this.signup.bind(this);
  }

  checkIfUsernameAvailable(username: string) {
    this.setState({usernameAvailable: true});
  }

  signup(e: any) {

  }

    // Retrieves the list of items from the Express app
    // getList = () => {
    //     fetch('/api/getList')
    //         .then(res => res.json())
    //         .then(list => this.setState({ list }))
    // };

  render() {
    let matching, availUser, button;
    if (this.state.passwordsEqual) {
      matching = "Passwords match!";
    } else if (this.state.passwordsEqual == false) {
      matching = "Passwords do not match";
      }
    if (this.state.usernameAvailable) {
      availUser = "Username available!";
    } else if (this.state.usernameAvailable == false) {
      availUser = "Username taken :(";
    }
    if (this.state.usernameAvailable && this.state.passwordsEqual) {
      button = <RaisedButton label="Sign Up!" primary={true} style={{ margin: 15 }} onClick={e => this.signup(e)}/>;
    } else {
      button = <RaisedButton disabled label="Sign Up!" primary={true} style={{ margin: 15 }} onClick={e => this.signup(e)}/>
    }
    return (
      <MuiThemeProvider>
        <div>
          <AppBar title="Sign up" />
          <div style={{textAlign: "center"}}>
          <TextField
            required
            floatingLabelText="Username*"
            onChange={(event, newValue) => {
                this.checkIfUsernameAvailable(newValue);
                this.setState({username: newValue})
            }}
          />
          <br />
          <TextField
            required
            type="password"
            floatingLabelText="Password*"
            onChange={(event, newValue) => {
              if (newValue == this.state.checkPassword) {
                this.setState({password: newValue, passwordsEqual: true});
              } else {
                this.setState({password: newValue, passwordsEqual: false});
              }
            }}
          />
          <br />
          <TextField
            required
            type="password"
            floatingLabelText="Retype password*"
            onChange={(event, newValue) => {
              if (newValue == this.state.password) {
                this.setState({checkPassword: newValue, passwordsEqual: true});
              } else {
                this.setState({checkPassword: newValue, passwordsEqual: false});
              }
            }}
          />
          <p>{availUser}</p>
          <p>{matching}</p>
          {button}
          </div>
        </div>
        </MuiThemeProvider>
      );
    }
}

export default SignUp;