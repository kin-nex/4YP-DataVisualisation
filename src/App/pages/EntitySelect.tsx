import React, { Component } from 'react';
import RadioButton, {RadioButtonGroup} from "material-ui/RadioButton";
import {JSXElement} from "@babel/types";

interface Props {
  tables: string[]
  conceptual: { [key: string]: any }
  selected: any
}

interface State {
  ent1?: string
  ent2?: string
}

class EntitySelect extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      ent1: undefined,
      ent2: undefined
    }
  }

      generateEntityRadios(): JSX.Element[] {
    return this.props.tables.map((table) => { return <RadioButton value={table} label={table} /> });
  }

  possibleRelationships(): JSX.Element[] {
    if (this.state.ent1 == undefined) return [];
    let possible: JSX.Element[] = [];
    for (let [_, rels] of Object.entries(this.props.conceptual))
      for (let entry of rels)
        if (entry.ent1 == this.state.ent1)
          possible.push(<RadioButton value={entry.ent2} label={entry.ent2}/>);
    return possible;
  }

  handleChange = (event: any, value: string) => {
    this.setState({ent1: value});
  };

  render () {
    return (
      <div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"entities"} onChange={this.handleChange}>
            {this.generateEntityRadios()}
          </RadioButtonGroup>
        </div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"relationship"}>
            {this.possibleRelationships()}
          </RadioButtonGroup>
        </div>
      </div>
    );
  }
}

export default EntitySelect;