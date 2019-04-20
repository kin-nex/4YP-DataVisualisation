import React, { Component } from 'react';
import RaisedButton from "material-ui/RaisedButton";

import { getPotentialGraphs_basicentity, getPotentialGraphs_onetomany } from './NetworkRequest';
import {MANY_TO_MANY, ONE_TO_MANY} from "../Constants";

interface Props {
  dbDetails: any
  conceptual: any
  ent1?: string
  pKey1?: string
  ent2?: string
  relationship?: string
}

interface State {
  possibleGraphs: { [key: string]: boolean }
}

class GenerateGraphs extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
     possibleGraphs: {}
    }
  }

  componentDidUpdate(prevProps: Props) {
    // We've already updated.
    if (this.props.ent1 == prevProps.ent1 && this.props.pKey1 == prevProps.pKey1 &&
        this.props.ent2 == prevProps.ent2)
      return;
    let graphPromise: Promise<Response> | undefined;
    // We have Basic Entity
    if (this.props.ent1 && this.props.pKey1 && this.props.ent2 == undefined)
      graphPromise = getPotentialGraphs_basicentity(this.props.dbDetails, this.props.ent1, this.props.pKey1);
    if (this.props.relationship == ONE_TO_MANY || this.props.relationship == MANY_TO_MANY) {
      const pKey2: string = this.getPrimKey2(this.props.conceptual[this.props.relationship]);
      // We have one-to-many relationship
      if (this.props.ent1 && this.props.pKey1 && this.props.ent2 && this.props.relationship == ONE_TO_MANY)
        graphPromise = getPotentialGraphs_onetomany(this.props.dbDetails, this.props.ent1, this.props.pKey1,
                                                    this.props.ent2, pKey2);
    }

    if (graphPromise != undefined)
      graphPromise.then(result => {return result.json()}).then(result => this.setState({possibleGraphs: result}));
    else
      this.setState({possibleGraphs: {}})
  }

  getPrimKey2(entries: any[]): string {
    const ent1 = this.props.ent1, pKey1 = this.props.pKey1, ent2 = this.props.ent2;
    for (let entry of entries)
      if (entry.ent1 == ent1 && entry.att1 == pKey1 && entry.ent2 == ent2)
        return entry.att2;
    return "Error";
  }


  render() {
    console.log(this.state.possibleGraphs)
    const buttons = generateButtons(this.state.possibleGraphs);
    return (
      <div>
        {buttons}
      </div>
    );
  }
}

function generateButtons(graphData: { [key: string]: boolean }) {
  const chartTypes: { [key: string]: string } = {
    //---------- Basic Entity ----------//
    bar: "Bar chart",
    calendar: "Calendar chart",
    scatter: "Scatter diagram",
    bubble: "Bubble chart",
    chloropleth: "Chloropleth map",
    cloud: "Word cloud",
    //---------- Weak Entity ----------//
    line: "Line chart",
    stackedBar: "Stacked bar chart",
    groupedBar: "Grouped bar chart",
    spider: "Spider chart",
    //---------- One to Many ----------//
    tree: "Tree chart",
    hierarchy: "Hierarchy tree",
    circle: "Circle packing",
    //---------- Many to Many ----------//
    sankey: "Sankey diagram",
    chord: "Chord diagram"
  };
  let buttons: [JSX.Element?] = [];
  for (let [key, enabledState] of Object.entries(graphData)) {
    buttons.push(<RaisedButton label={chartTypes[key]} primary={true} disabled={!enabledState} style={{margin: 12}}/>);
  }
  if (buttons.length == 0)
    buttons.push(<RaisedButton label={"No graphs possible (have you selected a View?)"} disabled={true} style={{ margin: 12 }}/>);
  return buttons;
}

export default GenerateGraphs;