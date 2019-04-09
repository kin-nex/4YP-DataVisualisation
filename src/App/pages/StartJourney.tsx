import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import DatabaseDetails from "./DatabaseDetails";
import { uploadDbDetails } from "./NetworkRequest";
import Timer from "./Timer";

const PACKAGE = "schemaspy";

interface State {
  sentDetails: boolean,
  folder?: string
}

class StartJourney extends Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      sentDetails: false,
      folder: undefined
    }
  }

  runDbAnalysis(dbDetails: any) {
    this.setState({sentDetails: true});
    let d = uploadDbDetails(JSON.stringify(dbDetails));
    d.then(response => { return response.text() })
      .then(data => { console.log(data); this.setState({folder: data }) })
  }

  render() {
    if (!this.state.sentDetails) {
      return <DatabaseDetails getDbData={this.runDbAnalysis.bind(this)} />
    } else {
      if (this.state.sentDetails && this.state.folder == undefined) {
        return <Timer time={30}/>
      } else if (this.state.folder !== undefined) {
        return (
          <Redirect to={{
            pathname: "./databaseanalysis",
            state: {folder: this.state.folder, package: PACKAGE}
          }} />
        );
      }
    }
  }
}

export default StartJourney;