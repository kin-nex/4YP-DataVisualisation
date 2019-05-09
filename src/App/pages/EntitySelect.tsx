import React, { Component } from 'react';
import RadioButton, {RadioButtonGroup} from "material-ui/RadioButton";

interface Props {
  tables: { [key: string]: [string] }
  conceptual: { [key: string]: any }
  selected: any
  ent1?: string
  pKey1?: string
  ent2?: string
  relationship?: string
}

interface State {
  selectablePKey: boolean
}

class EntitySelect extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectablePKey: false
    }
  }

  generateEntityRadios(): JSX.Element[] {
    return Object.keys(this.props.tables).map(table => { return <RadioButton key={table} value={table} label={table} /> });
  }

  identifyPrimKey(): JSX.Element[] {
    if (this.props.ent1 != undefined && this.state.selectablePKey)
      return this.props.tables[this.props.ent1].map(pKey => { return <RadioButton key={pKey} value={pKey} label={pKey} /> });
    return []
  }

  possibleRelationships(): JSX.Element[] {
    if (this.props.ent1 == undefined) return [];
    let possible: JSX.Element[] = [];
    for (let [rel, ents] of Object.entries(this.props.conceptual))
      for (let entry of ents)
        if (entry.ent1 == this.props.ent1 && entry.att1 == this.props.pKey1)
          possible.push(<RadioButton key={[rel, entry.ent2].join(",")} value={[rel, entry.ent2].join(",")} label={"(" + rel + ") " + entry.ent2}/>);
    return possible;
  }

  handleChangeEntSelect = (event: object, value: string) => {
    let pKeys = this.props.tables[value];
    // Check if only 1 primary key
    if (pKeys.length == 1) {
      this.props.selected({ent1: value, pKey1: pKeys[0], ent2: undefined, relationship: undefined});
      this.setState({selectablePKey: false})
    } else {
      this.props.selected({ent1: value, pKey1: undefined, ent2: undefined, relationship: undefined});
      this.setState({selectablePKey: true})
    }
  };

  handleChangePrimSelect = (event: object, value: string) => {
    this.props.selected({pKey1: value, ent2: undefined, relationship: undefined});
  };

  handleChangeSecondEnt = (event: object, value: string) => {
    const values = value.split(",");
    this.props.selected({relationship: values[0], ent2: values[1]});
  };

  render () {
    return (
      <div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"entities"} onChange={this.handleChangeEntSelect}>
            {this.generateEntityRadios()}
          </RadioButtonGroup>
        </div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"primKey"} onChange={this.handleChangePrimSelect}>
            {this.identifyPrimKey()}
          </RadioButtonGroup>
        </div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"relationship"} onChange={this.handleChangeSecondEnt}>
            {this.possibleRelationships()}
          </RadioButtonGroup>
        </div>
      </div>
    );
  }
}

export default EntitySelect;