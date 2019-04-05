import React, { Component } from 'react';
import {Link, Redirect} from 'react-router-dom';
import DatabaseDetails from "./DatabaseDetails";
import DatabaseAnalysis from "./DatabaseAnalysis";
import { uploadDbDetails } from "./NetworkRequest";
import Loading from "./Loading";
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
        return (
          <div style={{textAlign: "center"}}>
            <Loading/><br/>
            <Timer time={30}/>
          </div>
        )
      } else if (this.state.folder !== undefined) {
        return (
          <Redirect to={{
            pathname: "./databaseanalysis",
            state: {folder: this.state.folder, package: PACKAGE}
          }} />
          // <Link to={'./databaseanalysis'}>
          //   <DatabaseAnalysis folder={this.state.folder} package={PACKAGE} />
          // </Link>
        );
      }
    }
  }
}

export default StartJourney;