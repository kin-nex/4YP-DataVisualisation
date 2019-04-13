import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import DatabaseDetails from "./DatabaseDetails";
import { uploadDbDetails } from "./NetworkRequest";
import Timer from "./Timer";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";

const PACKAGE = "schemaspy";

interface State {
  dbDetails: any,
  sentDetails: boolean,
  folder?: string
}

class StartJourney extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      dbDetails: undefined,
      sentDetails: false,
      folder: undefined
    }
  }

  runDbAnalysis(dbDetails: any) {
    this.setState({sentDetails: true});
    let d = uploadDbDetails(JSON.stringify(dbDetails));
    d.then(response => { return response.text() })
      .then(data => { this.setState({folder: data }) })
  }

  render() {
    if (!this.state.sentDetails) {
      return (
        <MuiThemeProvider>
          <div>
            <AppBar showMenuIconButton={false} title="Start Journey" />
            <DatabaseDetails getDbData={this.runDbAnalysis.bind(this)} />
          </div>
        </MuiThemeProvider>
      );
    } else {
      if (this.state.sentDetails && this.state.folder == undefined) {
        return <Timer time={30}/>
      } else if (this.state.folder !== undefined) {
        return (
          <Redirect to={{
            pathname: "./databaseanalysis",
            state: {dbDetails: this.state.dbDetails, folder: this.state.folder, package: PACKAGE}
          }} />
        );
      }
    }
  }
}

export default StartJourney;