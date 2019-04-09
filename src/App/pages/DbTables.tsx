import React, { Component } from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from "material-ui";

interface Props {
  tables: { [key: string]: any },
  folder: string
}

interface State {
  records?: any
}

const BUCKET = "https://s3.eu-west-2.amazonaws.com/data-visualisation-data/";

class DbTables extends Component<Props, State> {
  constructor(props: any) {
    super(props);
  }
  table: any = null;

  componentDidMount(): void {
    this.table =
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>Relation</TableHeaderColumn>
            <TableHeaderColumn>Type</TableHeaderColumn>
            <TableHeaderColumn>Primary Keys</TableHeaderColumn>
            <TableHeaderColumn>Foreign Keys</TableHeaderColumn>
            <TableHeaderColumn>Non-key attributes</TableHeaderColumn>
            <TableHeaderColumn>Number of records</TableHeaderColumn>
            <TableHeaderColumn>Relationship diagram</TableHeaderColumn>
          </TableRow>
          <TableBody>
            {this.generateRecords()}
          </TableBody>
        </TableHeader>
      </Table>;
  }


  generateRecords() {
    let tableContents: [JSX.Element?] = [];
    for (let [tableName, data] of Object.entries(this.props.tables)) {
      tableContents.push(
        <TableRow>
          <TableRowColumn style={{textAlign: "center"}}>{tableName}</TableRowColumn>
          <TableRowColumn style={{textAlign: "center"}}>{data["type"]}</TableRowColumn>
          <TableRowColumn style={{textAlign: "center"}}>{data["primary_keys"].join(", ")}</TableRowColumn>
          <TableRowColumn style={{textAlign: "center"}}>{data["foreign_keys"].join(", ")}</TableRowColumn>
          <TableRowColumn style={{textAlign: "center"}}>{data["non_keys"].join(", ")}</TableRowColumn>
          <TableRowColumn style={{textAlign: "center"}}>{data["rows"]}</TableRowColumn>
          <TableRowColumn style={{textAlign: "center"}}>
            <img src={this.props.folder + "/" + tableName + ".png"} width={300} />
            </TableRowColumn>
        </TableRow>
      )
    }
    return tableContents;
  }

  render() {
    return (
      <Table fixedHeader={false} style={{ width: "auto", tableLayout: "auto" }}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={{textAlign: "center"}}>Relation</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: "center"}}>Type</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: "center"}}>Primary Keys</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: "center"}}>Foreign Keys</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: "center"}}>Non-key attributes</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: "center"}}>Number of records</TableHeaderColumn>
            <TableHeaderColumn style={{textAlign: "center"}}>Relation diagram</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.generateRecords()}
        </TableBody>
      </Table>
    );
  }
}

export default DbTables;