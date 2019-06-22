import React, { Component } from 'react';
import RadioButton, {RadioButtonGroup} from "material-ui/RadioButton";
import * as constants from "../Constants";
import Checkbox from "material-ui/Checkbox";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

interface Props {
  tables: { [key: string]: any }
  conceptual: { [key: string]: any }
  selected: any
  ent1?: string
  pKey1?: string
  ent2?: string
  pKey2?: string
  relationship?: string
}

interface State {
  selectablePKey: boolean
  selectAtts: string[]
}

class EntitySelect extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectablePKey: false,
      selectAtts: [],
    }
  }

  generateEntityRadios(): JSX.Element[] {
    return Object.keys(this.props.tables).map(table => { return <RadioButton value={table} label={table} /> });
  }

  identifyPrimKey(): JSX.Element[] {
    if (this.props.ent1 != undefined && this.state.selectablePKey)
      return this.props.tables[this.props.ent1][constants.PRIMARY_KEYS].map((pKey: string) => {
        return <MenuItem value={this.props.ent1 + "," + pKey} primaryText={[pKey]} />
      });
    return []
  }

  possibleRelationships(): JSX.Element[] {
    if (this.props.ent1 == undefined) return [];
    let possible: JSX.Element[] = [];
    for (let [rel, ents] of Object.entries(this.props.conceptual))
      for (let entry of ents) {
        if (entry.ent1 == this.props.ent1 && entry.att1 == this.props.pKey1)
          possible.push(<RadioButton key={[rel, entry.ent2, entry.att2].join(",")}
                                     value={[rel, entry.ent2, entry.att2].join(",")}
                                     label={"(" + rel + ") " + entry.ent2 + " : " + entry.att2}/>);
      }
    return possible;
  }

  handleChangeEntSelect = (event: object, value: string) => {
    let pKeys = this.props.tables[value][constants.PRIMARY_KEYS];
    // Check if only 1 primary key
    if (pKeys.length == 1) {
      this.props.selected({ent1: value, pKey1: pKeys[0], ent2: undefined, pKey2: undefined,
        relationship: undefined, selectAtts: []});
      this.setState({selectablePKey: false, selectAtts: []});
    } else {
      this.props.selected({ent1: value, pKey1: undefined, ent2: undefined, pKey2: undefined,
        relationship: undefined, selectAtts: []});
      this.setState({selectablePKey: true, selectAtts: []});
    }
  };

  handleChangePrimSelect = (event: object, index: number, value: string) => {
    const values =  value.split(",");
    this.props.selected({pKey1: values[1], ent2: undefined, relationship: undefined});
    this.setState({selectAtts: []})
  };

  handleChangeSecondEnt = (event: object, value: string) => {
    const values = value.split(",");
    this.props.selected({relationship: values[0], ent2: values[1], pKey2: values[2]});
  };

  updateAttCheck(e: object, att: string) {
    this.setState((prevState) => {
      let atts: string[] = prevState.selectAtts;
      atts.includes(att) ? atts.splice(atts.indexOf(att), 1) : atts.push(att);
      this.props.selected({selectAtts: atts});
      return {selectAtts: atts};
    })
  }

  attributeSelect(tableInfo: any): JSX.Element[] {
    const attributes: string[] = [...new Set([
      ...tableInfo[constants.PRIMARY_KEYS],
      ...tableInfo[constants.FOREIGN_KEYS],
      ...tableInfo[constants.NON_KEYS]
    ])];
    if (this.props.pKey2)
      attributes.splice(attributes.indexOf(this.props.pKey2), 1);
    else if (this.props.pKey1)
      attributes.splice(attributes.indexOf(this.props.pKey1), 1);
    return attributes.map(att => <div style={{float: "left"}}>
      <Checkbox checked={this.state.selectAtts.includes(att)} label={att}
                onCheck={e => this.updateAttCheck(e, att)} style={{margin: 15}} /></div>);
  }

  render () {
    let attSelect;
    if (this.props.ent1 && this.props.pKey1)
      attSelect = this.attributeSelect(this.props.tables[(this.props.ent2) ? this.props.ent2 : this.props.ent1]);
    return (
      <div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"entities"} onChange={this.handleChangeEntSelect}>
            {this.generateEntityRadios()}
          </RadioButtonGroup>
        </div>
        <div style={{float: "left", margin: 25}}>
          {(() => {if (this.props.ent1 != undefined && this.state.selectablePKey) {
            return (
              <SelectField floatingLabelText={"Primary Key"} hintText={"Primary Key"}
                           value={this.props.ent1 + "," + this.props.pKey1} onChange={this.handleChangePrimSelect}>
                {this.identifyPrimKey()}
              </SelectField>
            );
          }})()}
        </div>
        <div style={{float: "left", margin: 25}}>
          <RadioButtonGroup name={"relationship"} onChange={this.handleChangeSecondEnt}>
            {this.possibleRelationships()}
          </RadioButtonGroup>
        </div>
        <div style={{float: "left", clear: "both"}}>
          {attSelect}
        </div>
      </div>
    );
  }
}

export default EntitySelect;