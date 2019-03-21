import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";

interface State {
  dbtype?: string,
  host?: string,
  port?: string,
  dbname?: string,
  schema?: string,
  username?: string,
  password?: string
}

class DatabaseDetails extends Component<{getDbData: (details: any) => void}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      // dbtype: "",
      // host: "",
      // port: undefined,
      // dbname: "",
      // schema: "",
      // username: "",
      // password: ""
      dbtype: "mysql",
      host: "data-visualisation.ceouikiw05cd.eu-west-2.rds.amazonaws.com",
      port: "3306",
      dbname: "employees",
      schema: "employees",
      username: "Erkin",
      password: "P4ssword"
    };
  }

  handleChange(event: any, name: string, newValue: string) {
    this.setState({[name]: newValue});
  }

  render() {
    // Handle mysql database/schema
    let schema;
    if (this.state.dbtype == "mysql") {
      schema = <TextField
        disabled={true}
        floatingLabelText="Schema*"
        value={this.state.schema}
      />
    } else {
      schema = <TextField
        floatingLabelText="Schema*"
        onChange={(e, newValue) => (this.handleChange(e, "schema", newValue))}
      />
    }
    return (
      <MuiThemeProvider>
        <AppBar title="Start Journey" />
        <div style={{textAlign: "center"}}>
          <SelectField
            style={{textAlign: "left"}}
            floatingLabelText="Database type"
            value={this.state.dbtype}
            onChange={(e, _, newValue) => {
              if (newValue == "mysql") {
                this.setState({"dbtype": newValue, "schema": this.state.dbname, "port": "3306"})
              } else if (newValue == "pgsql") {
                this.setState({"dbtype": newValue, "port": "5432"})
              } else if (newValue == "mssql") {
                this.setState({"dbtype": newValue, "port": "1433"})
              }
            }}
          >
            <MenuItem value="mssql" label="Microsoft SQL Server" primaryText="Microsoft SQL Server" />
            <MenuItem value="mysql" label="MySQL" primaryText="MySQL" />
            <MenuItem value="pgsql" label="PostgreSQL" primaryText="PostgreSQL" />
          </SelectField>
          <br />
          <TextField
            floatingLabelText="Host address*"
            onChange={(e, newValue) => (this.handleChange(e, "host", newValue))}
          />
          <br />
          <TextField
            type="number"
            floatingLabelText={"Port*"}
            value={this.state.port}
            onChange={(e, newValue) => (this.handleChange(e, "port", newValue.toString()))}
          />
          <br />
          <TextField
            floatingLabelText={"Database name*"}
            onChange={(e, newValue) => {
              if (this.state.dbtype == "mysql") {
                this.setState({"dbname": newValue, "schema": newValue});
              } else {
                this.handleChange(e, "dbname", newValue);
              }}
            }
          />
          <br />
          {schema}
          <br />
          <TextField
            floatingLabelText={"Username*"}
            onChange={(event, newValue) => {this.setState({username: newValue})}}
          />
          <br />
          <TextField
            type="password"
            floatingLabelText={"Password*"}
            onChange={(event, newValue) => {this.setState({password: newValue})}}
          />
          <br />
          <RaisedButton label="Submit" primary={true} style={{margin: 15}}
                        onClick={() => this.props.getDbData(this.state)} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default DatabaseDetails;