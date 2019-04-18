import React, { Component } from 'react';

import { getPotentialGraphs_basicentity } from './NetworkRequest';
import RaisedButton from "material-ui/RaisedButton";

interface Props {
  dbDetails: any
  folder: string
  conceptual: any
  ent1?: string
  ent2?: string
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
    console.log("HERE");
    if (this.props.ent1 == prevProps.ent1 && this.props.ent2 == prevProps.ent2)
      return;
    console.log("HERE2")
    if (this.props.ent1 && this.props.ent2 == undefined)
      getPotentialGraphs_basicentity(this.props.dbDetails, this.props.ent1)
        .then(result => {return result.json()})
        .then(result => this.setState({possibleGraphs: result}));
  }

  generateButtons() {
    const chartTypes: { [key: string]: string } = {
      bar: "Bar chart",
      calendar: "Calendar chart",
      scatter: "Scatter diagram",
      bubble: "Bubble chart",
      chloropleth: "Chloropleth map",
      cloud: "Word cloud"
    };
    let buttons: [JSX.Element?] = [];
    console.log(this.state.possibleGraphs);
    for (let [key, enabledState] of Object.entries(this.state.possibleGraphs)) {
      buttons.push(<RaisedButton label={chartTypes[key]} primary={true} disabled={enabledState} style={{margin: 12}}/>);
    }
    if (buttons.length == 0)
      buttons.push(<RaisedButton label={"No graphs possible (have you selected a View?)"} disabled={true} style={{ margin: 12 }}/>);
    return buttons;
  }

  render() {
    const buttons = this.generateButtons();
    return (
      <div>
        {buttons}
      </div>
    );
  }

}

export default GenerateGraphs;