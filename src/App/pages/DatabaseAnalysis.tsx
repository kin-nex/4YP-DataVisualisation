import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import Tabs, {Tab} from "material-ui/Tabs";

import { schemaAnalysis } from './NetworkRequest';

interface State {
  tables: string
}

class DatabaseAnalysis extends Component<{folder: string, package: string}, State> {
    constructor(props: any) {
      super(props);
    }

    componentDidMount(): void {
      let d = schemaAnalysis(this.props.folder);
      d.then(response => { return response.json() })
        .then(data => { this.setState({tables: data}) })
    }

    render() {
      return (
        <MuiThemeProvider>
          <AppBar title="Database Analysis" />
            <div>
              <Tabs>
                <Tab label="Tables">
                  A
                  {/*{this.schema()}*/}
                </Tab>
                <Tab label="ERD">
                  B
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