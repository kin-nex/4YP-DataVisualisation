import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import RaisedButton from "material-ui/RaisedButton";

import Login from "./Login";

interface State {
  loggedIn: boolean
}

class Home extends Component<{}, State> {

  constructor(props: any) {
    super(props);
    // this.loggedInState = this.loggedInState.bind(this);
    this.startJourney = this.startJourney.bind(this);
    this.logInState = this.logInState.bind(this);
  }

  logInState(newState: boolean) {
    this.setState({loggedIn: newState});
    alert("Log in state " + this.state.loggedIn);
  }

  startJourney(e: any) {

  }

  render() {
    return (
        <MuiThemeProvider>
          <div>
            <AppBar title="Home" />
            <div style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
            <div style={{ display: "inline-block", width: "30%" }}>
              <Login loggedIn={this.logInState} />
            </div>
            <div style={{
              display: "inline-block",
              borderLeft: "2px solid #d3d3d3",
              marginRight: "30px",
              marginLeft: "30px",
            }} />
            <div style={{ display: "inline-block", width: "30%" }}>
              <h1>Explore your data!</h1>
              <br /><br />
              <Link to={'./startjourney'}>
                <RaisedButton label="Start" primary={true} style={{margin: 15}}/>
              </Link>
            </div>
            </div>
          </div>
        </MuiThemeProvider>
    );
  }
}

export default Home;
