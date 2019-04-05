import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import Tabs, {Tab} from "material-ui/Tabs";

import { schemaAnalysis } from './NetworkRequest';

const BUCKET = "https://s3.eu-west-2.amazonaws.com/data-visualisation-data/";

interface State {
  tables: string,
  erd: string,
  conceptual: string
}

class DatabaseAnalysis extends Component<{location: any}, State> {
    constructor(props: any) {
      super(props);
    }

    componentDidMount(): void {
      console.log(this.props.location.state.folder);
      console.log(this.props.location.state.package);
      let d = schemaAnalysis(this.props.location.state.folder);
      // d.then(response => { return response.json() })
      //   .then(data => {console.log(data);
      //     this.setState({tables: data.tables, erd: data.erd, conceptual: data.conceptual}) })
    }

    render() {
      const htmlFolder = encodeURIComponent(this.props.location.state.folder);
      const imgsrc = BUCKET + htmlFolder + "/summary/relationships.real.large.svg";
      return (
        <MuiThemeProvider>
          <AppBar title="Database Analysis" />
            <div>
              <Tabs>
                <Tab label="Tables">
                  A
                </Tab>
                <Tab label="ERD">
                  <img src={imgsrc} />
                </Tab>
                <Tab label="Graphs">
                  C
                </Tab>
              </Tabs>
            </div>
        </MuiThemeProvider>
      );
    }
}

export default DatabaseAnalysis;