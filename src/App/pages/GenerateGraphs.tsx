import React, { Component } from 'react';
import RaisedButton from "material-ui/RaisedButton";

import {getEntityDetails} from './NetworkRequest';
import * as constants from "../Constants";

const MAXENTRIESBARCHART = 100;
const MAXENTRIESONETOMANY = 100;
const MAXENTRIESSANKEY = 100;
const MAXENTRIESCHORD = 100;

const BAR = "bar";
const CALENDAR = "calendar";
const SCATTER = "scatter";
const BUBBLE = "bubble";
const CHOROPLETH = "choropleth";
const CLOUD = "cloud";
const LINE = "line";
const STACKEDBAR = "stackedBar";
const GROUPEDBAR = "groupedBar";
const SPIDER = "spider";
const TREE = "tree";
const HIERARCHY = "hierarchy";
const CIRCLE = "circle";
const SANKEY = "sankey";
const CHORD = "chord";

interface Props {
  dbDetails: any
  conceptual: any
  visType: string
  ent1: string
  pKey1: string
  ent2?: string
  relationship?: string
  associativeEntities?: any
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

  update(): void {
    let graphPromise: Promise<Response> | undefined;
    let pKey2: string | undefined;
    let associativeEntity: string[] | undefined;
    if (this.props.relationship == constants.ONE_TO_MANY || this.props.relationship == constants.MANY_TO_MANY)
      pKey2 = this.getPrimKey2(this.props.conceptual[this.props.relationship]);
    if (this.props.ent2 && this.props.relationship == constants.MANY_TO_MANY)
      associativeEntity = this.getAssociativeEntity(this.props.ent1, this.props.ent2);
    graphPromise = getEntityDetails(this.props.dbDetails, this.props.visType, this.props.ent1, this.props.pKey1,
      this.props.ent2, pKey2, associativeEntity);
    if (graphPromise == undefined)
      return;
    graphPromise.then(result => {return result.json()}).then(result => {
      if (this.props.visType == constants.BASIC_ENTITY)
        this.setState(getGraphTypes_BasicEntity(result, this.props.ent1, this.props.pKey1));
      else if (this.props.visType == constants.ONE_TO_MANY && this.props.ent2)
        this.setState(getGraphTypes_OneToMany(result, this.props.ent1, this.props.pKey1, this.props.ent2));
      else if (this.props.visType == constants.MANY_TO_MANY && this.props.ent2)
        this.setState(getGraphTypes_ManyToMany(result, this.props.ent1, this.props.pKey1, this.props.ent2));
    });
  }

  componentWillMount(): void{
    this.update();
  }

  componentDidUpdate(prevProps: Props) {
    // We've already updated.
    if (this.props.ent1 == prevProps.ent1 && this.props.pKey1 == prevProps.pKey1 &&
        this.props.ent2 == prevProps.ent2)
      return;
    this.update();
  }

  getPrimKey2(entries: any[]): string {
    const ent1 = this.props.ent1, pKey1 = this.props.pKey1, ent2 = this.props.ent2;
    for (let entry of entries)
      if (entry.ent1 == ent1 && entry.att1 == pKey1 && entry.ent2 == ent2)
        return entry.att2;
    return "Error";
  }

  getAssociativeEntity(ent1: string, ent2: string): string[] {
    let possibleAssociatives: string[] = [];
    if (ent1 in this.props.associativeEntities)
      possibleAssociatives = this.props.associativeEntities[ent1];
    else if (ent2 in this.props.associativeEntities)
      possibleAssociatives = this.props.associativeEntities[ent2];
    return possibleAssociatives;
  }

  render() {
    const buttons = generateEntityButtons(this.state.possibleGraphs);
    return (
      <div>
        {buttons}
      </div>
    );
  }
}

function generateEntityButtons(graphData: { [key: string]: boolean }) {
  const chartTypes: { [key: string]: string } = {
    //---------- Basic Entity ----------//
    [BAR]: "Bar chart",
    [CALENDAR]: "Calendar chart",
    [SCATTER]: "Scatter diagram",
    [BUBBLE]: "Bubble chart",
    [CHOROPLETH]: "Choropleth map",
    [CLOUD]: "Word cloud",
    //---------- Weak Entity ----------//
    [LINE]: "Line chart",
    [STACKEDBAR]: "Stacked bar chart",
    [GROUPEDBAR]: "Grouped bar chart",
    [SPIDER]: "Spider chart",
    //---------- One to Many ----------//
    [TREE]: "Tree chart",
    [HIERARCHY]: "Hierarchy tree",
    [CIRCLE]: "Circle packing",
    //---------- Many to Many ----------//
    [SANKEY]: "Sankey diagram",
    [CHORD]: "Chord diagram"
  };
  let buttons: [JSX.Element?] = [];
  for (let [key, enabledState] of Object.entries(graphData))
    buttons.push(<RaisedButton label={chartTypes[key]} primary={true} disabled={!enabledState} style={{margin: 12}}/>);
  if (buttons.length == 0)
    buttons.push(<RaisedButton label={"No graphs possible (have you selected a View?)"} disabled={true} style={{ margin: 12 }}/>);
  return buttons;
}

function getGraphTypes_BasicEntity(entityData: { [key: string]: any }, entity: string, pKey: string):
                                  { possibleGraphs: { [key: string]: boolean } } {
  const numEntries = entityData[constants.SIZE][entity];
  const scalarCount = entityData[constants.NUMERICS].length + entityData[constants.TEMPORALS].length;
  if (numEntries < 1)
    // No graphs are possible
    return {possibleGraphs: {}};
  let graphs: { [key: string]: boolean } = {};
  graphs[BAR] = numEntries <= MAXENTRIESBARCHART && scalarCount;
  graphs[CALENDAR] = entityData[constants.TEMPORALS].length >= 1;
  graphs[SCATTER] = scalarCount >= 2;
  graphs[BUBBLE] = scalarCount >= 3;
  graphs[CHOROPLETH] = scalarCount >= 1 && entityData[constants.SPACIALS].length >= 1;
  graphs[CLOUD] = entityData[constants.LEXICALS].includes(pKey)&& scalarCount >= 1;
  return {possibleGraphs: graphs};
}

function getGraphTypes_OneToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                 ent2: string):
  { possibleGraphs: { [key: string]: boolean } } {
  const numEntriesOneSide = entityData[constants.SIZE][ent1];
  const maxEntriesManySide = entityData[constants.SIZE][ent2];
  let graphs: { [key: string]: boolean } = {
    [HIERARCHY]: false, [TREE]: false, [CIRCLE]: false
  };
  if (1 <= numEntriesOneSide && numEntriesOneSide <= MAXENTRIESONETOMANY &&
      1 <= maxEntriesManySide && maxEntriesManySide <= MAXENTRIESONETOMANY) {
    graphs[HIERARCHY] = true;
    // If we have a scalar attribute then we're good to go
    delete entityData[constants.NUMERICS][pKey1]; delete entityData[constants.TEMPORALS][pKey1];
    const scalarsExist = (entityData[constants.NUMERICS].length + entityData[constants.TEMPORALS].length) >= 1
    graphs = {[HIERARCHY]: true, [TREE]: scalarsExist, [CIRCLE]: scalarsExist};
  }
  return {possibleGraphs: graphs};
}

function getGraphTypes_ManyToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                  ent2: string):
  { possibleGraphs: { [key: string]: boolean } } {
  const sizes = entityData[constants.SIZE];
  let graphs: { [key: string]: boolean } = {
    [CHORD]: false, [SANKEY]: false
  };
  if (sizes[ent1] >= 1 && sizes[ent2] >= 1)
    if (sizes[ent1] <= MAXENTRIESSANKEY && sizes[ent2] <= MAXENTRIESSANKEY)
      graphs = {[CHORD]: true, [SANKEY]: true};
    else if (sizes[ent1] <= MAXENTRIESCHORD && sizes[ent2] <= MAXENTRIESCHORD)
      graphs[CHORD] = true;
  return {possibleGraphs: graphs};
}

export default GenerateGraphs;
