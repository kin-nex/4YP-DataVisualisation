import React, { Component } from 'react';
import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";

interface Props {
  tables: { [key: string]: any }
  folder: string
}

class DbTables extends Component<Props, {}> {
  constructor(props: any) {
    super(props);
  }

  generateRecords() {
    let tableContents: [JSX.Element?] = [];
    for (let [tableName, data] of Object.entries(this.props.tables)) {
      tableContents.push(
        <TableRow>
          <TableCell style={{textAlign: "center"}}>{tableName}</TableCell>
          <TableCell style={{textAlign: "center"}}>{data["type"].toUpperCase()}</TableCell>
          <TableCell style={{textAlign: "center"}}>{data["primary_keys"].join(", ")}</TableCell>
          <TableCell style={{textAlign: "center"}}>{data["foreign_keys"].join(", ")}</TableCell>
          <TableCell style={{textAlign: "center"}}>{data["non_keys"].join(", ")}</TableCell>
          <TableCell style={{textAlign: "center"}}>{data["rows"]}</TableCell>
          <TableCell style={{textAlign: "center"}}>
            <img src={this.props.folder + "/" + tableName + ".png"} width="100%" />
          </TableCell>
        </TableRow>
      )
    }
    return tableContents;
  }

  render() {
    return (
      <Table style={{ width: "auto", tableLayout: "auto", overflowX: "auto" }}>
        <TableHead>
          <TableRow>
            <TableCell style={{textAlign: "center"}}>Relation</TableCell>
            <TableCell style={{textAlign: "center"}}>Type</TableCell>
            <TableCell style={{textAlign: "center"}}>Primary Keys</TableCell>
            <TableCell style={{textAlign: "center"}}>Foreign Keys</TableCell>
            <TableCell style={{textAlign: "center"}}>Non-key attributes</TableCell>
            <TableCell style={{textAlign: "center"}}>Number of records</TableCell>
            <TableCell style={{textAlign: "center"}}>Relation diagram</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.generateRecords()}
        </TableBody>
      </Table>
    );
  }
}

export default DbTables;