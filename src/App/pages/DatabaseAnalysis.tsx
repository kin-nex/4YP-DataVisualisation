import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import Tabs, {Tab} from "material-ui/Tabs";

import { schemaAnalysis } from './NetworkRequest';
import Timer from "./Timer";
import DbTables from "./DbTables";
import EntitySelect from "./EntitySelect";
import GenerateGraphs from "./GenerateGraphs";

const BUCKET = "https://s3.eu-west-2.amazonaws.com/data-visualisation-data/";

interface State {
  tables?: any
  conceptual?: any
  ent1?: string
  ent2?: string
}

class DatabaseAnalysis extends Component<{location: any}, State> {
    constructor(props: any) {
      super(props);
      this.state = {
        tables: undefined,
        conceptual: undefined,
        ent1: undefined,
        ent2: undefined,
      };
      this.selectEntityRelationship = this.selectEntityRelationship.bind(this);
    }

    componentDidMount(): void {
      let d = schemaAnalysis(this.props.location.state.package, this.props.location.state.folder);
      d.then(response => { return response.json() })
        .then(data => { this.setState({tables: data.tables, conceptual: data.conceptual}) })
    }

    selectEntityRelationship(entrel: any) {
      this.setState({ent1: entrel.ent1, ent2: entrel.ent2})
    }


    render() {
      const htmlFolder = encodeURIComponent(this.props.location.state.folder);
      const imgsrc = BUCKET + htmlFolder + "/summary/relationships.implied.large.png";
      if (this.state.tables == undefined)
        return <Timer time={0} />;
      const selectedTables: { [key: string]: string } = {};
      if (this.state.ent1 != null) selectedTables[this.state.ent1] = this.state.tables[this.state.ent1];
      if (this.state.ent2 != null) selectedTables[this.state.ent2] = this.state.tables[this.state.ent2];
      return (
        <MuiThemeProvider>
          <div>
            <AppBar showMenuIconButton={false} title="Database Analysis" />
              <div>
                <Tabs>
                  <Tab label="Tables">
                    <DbTables tables={this.state.tables} folder={BUCKET + htmlFolder}/>
                  </Tab>
                  <Tab label="ERD">
                    {/*<img src={imgsrc} />*/}
                  </Tab>
                  <Tab label="Graphs">
                    <div>
                      <div style={{ float: "left" }}>
                        <EntitySelect tables={Object.keys(this.state.tables)}
                                      conceptual={this.state.conceptual}
                                      selected={this.selectEntityRelationship} />
                      </div>
                      <div style={{ float: "left" }}>
                        {(() => {if (this.state.ent1 != undefined)
                          return <DbTables tables={selectedTables} folder={BUCKET + htmlFolder} />})()}
                      </div>
                    </div>
                    <div>
                      <GenerateGraphs dbDetails={this.props.location.state.dbDetails}
                                      folder={BUCKET + htmlFolder}
                                      conceptual={this.state.conceptual}/>
                    </div>
                  </Tab>
                </Tabs>
              </div>
          </div>
        </MuiThemeProvider>
      );
    }
}

export default DatabaseAnalysis;