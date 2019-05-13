import React, { Component } from 'react';
import RaisedButton from "material-ui/RaisedButton";

import {getEntityDetails} from './NetworkRequest';
import * as constants from "../Constants";
import DrawGraph from "./DrawGraph";

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
  selectedAttributes: string[]
}

interface State {
  selectedAttLength: number
  needToUpdate: boolean
  possibleGraphs: { [key: string]: boolean }
  graphData: any;
}

class GenerateGraphs extends Component<Props, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      selectedAttLength: -1,
      needToUpdate: true,
      possibleGraphs: {},
      graphData: undefined
    }
  }

  update(props: Props): void {
    let graphPromise: Promise<Response> | undefined;
    let pKey2: string | undefined;
    let associativeEntity: string[] | undefined;
    if (props.relationship == constants.ONE_TO_MANY || props.relationship == constants.MANY_TO_MANY)
      pKey2 = this.getPrimKey2(props.conceptual[props.relationship]);
    if (props.ent2 && props.relationship == constants.MANY_TO_MANY)
      associativeEntity = this.getAssociativeEntity(props.ent1, props.ent2);
    graphPromise = getEntityDetails(props.dbDetails, props.visType, props.ent1, props.pKey1, props.ent2,
      pKey2, associativeEntity);
    if (graphPromise == undefined)
      return;
    graphPromise.then(result => {return result.json()}).then(result => {
      if (props.visType == constants.BASIC_ENTITY)
        this.setState({possibleGraphs: getGraphTypes_BasicEntity(result, props.ent1, props.pKey1,
            props.selectedAttributes), needToUpdate: false});
      else if (props.visType == constants.ONE_TO_MANY && props.ent2)
        this.setState({possibleGraphs: getGraphTypes_OneToMany(result, props.ent1, props.pKey1, props.ent2,
          props.selectedAttributes), needToUpdate: false});
      else if (props.visType == constants.MANY_TO_MANY && props.ent2)
        this.setState({possibleGraphs: getGraphTypes_ManyToMany(result, props.ent1, props.pKey1, props.ent2,
            props.selectedAttributes), needToUpdate: false});
    });
  }

  componentDidMount(): void{ this.update(this.props); }

  static getDerivedStateFromProps(nextProps: Props, prevState: State){
    if (nextProps.selectedAttributes.length !== prevState.selectedAttLength)
      return {
        selectedAttLength: nextProps.selectedAttributes.length,
        needToUpdate: true
      };
    return null;
  }

  componentDidUpdate(nextProps: Props, nextState: State): void {
    if (this.state.needToUpdate) this.update(this.props);
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

  generateGraphData(e: object, graphType: string) {

  }

  generateEntityButtons(graphData: { [key: string]: boolean }) {
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
      buttons.push(<RaisedButton label={chartTypes[key]} primary={true} onClick={(e) => this.generateGraphData(e, key)}
                                 disabled={!enabledState} style={{margin: 12}}/>);
    if (buttons.length == 0)
      buttons.push(<RaisedButton label={"No graphs possible (have you selected a View?)"} disabled={true} style={{ margin: 12 }}/>);
    return buttons;
  }

  render() {
    const buttons = this.generateEntityButtons(this.state.possibleGraphs);
    let graph;
    if (this.state.graphData !== undefined)
      graph = <DrawGraph />;
    return (
      <div>
        <div>
          {buttons}
        </div>
        <div>
          {graph}
        </div>
      </div>
    );
  }
}


function getGraphTypes_BasicEntity(entityData: { [key: string]: any }, entity: string, pKey: string, selectAtts: string[]):
                                  { [key: string]: boolean } {
  const numEntries = entityData[constants.SIZE][entity];
  const attsLength = selectAtts.length;
  const scalars = entityData[constants.NUMERICS].concat(entityData[constants.TEMPORALS]);
  if (numEntries < 1)
    // No graphs are possible
    return {};
  let graphs: { [key: string]: boolean } = {};
  graphs[BAR] = numEntries <= MAXENTRIESBARCHART && attsLength == 1 && scalars.includes(selectAtts[0]);
  graphs[CALENDAR] = attsLength == 1 && entityData[constants.TEMPORALS].includes(selectAtts[0]);
  graphs[SCATTER] = attsLength == 2 && selectAtts.every(att => scalars.includes(att));
  graphs[BUBBLE] = attsLength == 3 && selectAtts.every(att => scalars.includes(att)) &&
    selectAtts.some(att => entityData[constants.NUMERICS].includes(att));
  graphs[CHOROPLETH] = attsLength == 2 &&
    ((scalars.includes(selectAtts[0]) && entityData[constants.SPACIALS].includes(selectAtts[1])) ||
      (scalars.includes(selectAtts[1]) && entityData[constants.SPACIALS].includes(selectAtts[0])));
  graphs[CLOUD] = entityData[constants.LEXICALS].includes(pKey) && attsLength == 1 &&
    entityData[constants.NUMERICS].includes(selectAtts[0]);
  return graphs;
}

function getGraphTypes_OneToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                 ent2: string, selectAtts: string[]): { [key: string]: boolean } {
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
    const validScalar = selectAtts.length == 1 &&
      entityData[constants.NUMERICS].concat(entityData[constants.TEMPORALS]).includes(selectAtts[0]);
    graphs = {[HIERARCHY]: true, [TREE]: validScalar, [CIRCLE]: validScalar};
  }
  return graphs;
}

function getGraphTypes_ManyToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                  ent2: string, selectAtts: string[]): { [key: string]: boolean } {
  const sizes = entityData[constants.SIZE];
  const validScalar = selectAtts.length == 1 &&
    entityData[constants.NUMERICS].concat(entityData[constants.TEMPORALS]).includes(selectAtts[0]);
  let graphs: { [key: string]: boolean } = {
    [CHORD]: false, [SANKEY]: false
  };
  if (sizes[ent1] >= 1 && sizes[ent2] >= 1 && validScalar)
    if (sizes[ent1] <= MAXENTRIESSANKEY && sizes[ent2] <= MAXENTRIESSANKEY)
      graphs = {[CHORD]: true, [SANKEY]: true};
    else if (sizes[ent1] <= MAXENTRIESCHORD && sizes[ent2] <= MAXENTRIESCHORD)
      graphs[CHORD] = true;
  return graphs;
}

export default GenerateGraphs;
