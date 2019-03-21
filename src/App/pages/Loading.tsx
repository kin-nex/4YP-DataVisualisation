import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import CircularProgress from "material-ui/CircularProgress";

export default class Loading extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <CircularProgress style={{ marginTop: 30, marginBottom: 30 }} />
      </MuiThemeProvider>
    );
  }
}