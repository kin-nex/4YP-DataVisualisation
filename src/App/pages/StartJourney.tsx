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
  folder?: string
}

class StartJourney extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      dbDetails: undefined,
      folder: undefined
    }
  }

  runDbAnalysis(dbDetails: any) {
    this.setState({dbDetails: dbDetails});
    let d = uploadDbDetails(JSON.stringify(dbDetails));
    d.then(response => { return response.text() })
      .then(data => { this.setState({folder: data }) })
  }

  render() {
    if (this.state.dbDetails == undefined) {
      return (
        <MuiThemeProvider>
          <div>
            <AppBar showMenuIconButton={false} title="Start Journey" />
            <DatabaseDetails getDbData={this.runDbAnalysis.bind(this)} />
          </div>
        </MuiThemeProvider>
      );
    } else {
      if (this.state.folder == undefined) {
        return <Timer time={30}/>
      } else {
        return (
          <Redirect to={{
            pathname: "./databaseanalysis",
            state: {dbDetails: this.state.dbDetails, folder: this.state.folder, package: PACKAGE}
          }}/>
        );
      }
    }
  }
}

export default StartJourney;