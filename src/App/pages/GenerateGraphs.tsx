import React, { Component } from 'react';
import RaisedButton from "material-ui/RaisedButton";

import {getEntityDetails, getGraphData} from './NetworkRequest';
import * as constants from "../Constants";
import DrawGraph from "./DrawGraph";
import Timer from "./Timer";

const MAXENTRIESBARCHART = 50;
const MAXENTRIESONETOMANY = 100;
const MAXENTRIESSANKEY = 100;
const MAXENTRIESCHORD = 100;

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
  entityInfo: any
  possibleGraphs: { [key: string]: boolean }
  chartType?: string
  graphData: any
}

class GenerateGraphs extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedAttLength: -1,
      needToUpdate: true,
      entityInfo: undefined,
      possibleGraphs: {},
      chartType: undefined,
      graphData: undefined
    }
  }

  update(props: Props, updateEntInfo: boolean): void {
    let graphPromise: Promise<Response> | undefined;
    let pKey2: string | undefined;
    let associativeEntity: string[] | undefined;
    if (props.relationship == constants.ONE_TO_MANY || props.relationship == constants.MANY_TO_MANY)
      pKey2 = this.getPrimKey2(props.conceptual[props.relationship]);
    if (props.ent2 && props.relationship == constants.MANY_TO_MANY)
      associativeEntity = this.getAssociativeEntity(props.ent1, props.ent2);
    if (updateEntInfo) graphPromise = getEntityDetails(props.dbDetails, props.visType, props.ent1, props.pKey1, props.ent2,
      pKey2, associativeEntity);
    if (graphPromise == undefined)
      this.determineGraphs(props, this.state.entityInfo);
    else
      graphPromise.then(result => {return result.json()}).then(result => {
        this.determineGraphs(props, result)
      });
  }

  determineGraphs(props: Props, entInfo: any) {
    if (props.visType == constants.BASIC_ENTITY)
      this.setState({entityInfo: entInfo, possibleGraphs: getGraphTypes_BasicEntity(entInfo, props.ent1, props.pKey1,
          props.selectedAttributes), needToUpdate: false});
    else if (props.visType == constants.ONE_TO_MANY && props.ent2)
      this.setState({entityInfo: entInfo,
        possibleGraphs: getGraphTypes_OneToMany(entInfo, props.ent1, props.pKey1, props.ent2,
          props.selectedAttributes), needToUpdate: false});
    else if (props.visType == constants.MANY_TO_MANY && props.ent2)
      this.setState({entityInfo: entInfo,
        possibleGraphs: getGraphTypes_ManyToMany(entInfo, props.ent1, props.pKey1, props.ent2,
          props.selectedAttributes), needToUpdate: false});
  }

  componentDidMount(): void{ this.update(this.props, true); }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.selectedAttributes.length !== prevState.selectedAttLength)
      return {
        selectedAttLength: nextProps.selectedAttributes.length,
        needToUpdate: true
      };
    return null;
  }

  componentDidUpdate(nextProps: Props, nextState: State): void {
    const updateEntInfo = !(this.props.visType == nextProps.visType && this.props.ent1 == nextProps.ent1 &&
      this.props.ent2 == nextProps.ent2);
    console.log(updateEntInfo)
    if (this.state.needToUpdate) this.update(this.props, updateEntInfo);
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

  find(attributes: string[]): {[key: string]: string} {
    let dataTypes: {[key: string]: string} = {};
    for (let attribute of attributes)
      if (this.state.entityInfo[constants.NUMERICS].includes(attribute)) {
        dataTypes[attribute] = constants.NUMERICS;
      }else if (this.state.entityInfo[constants.SPACIALS].includes(attribute))
        dataTypes[attribute] = constants.SPACIALS;
      else if (this.state.entityInfo[constants.TEMPORALS].includes(attribute))
        dataTypes[attribute] = constants.TEMPORALS;
      else if (this.state.entityInfo[constants.LEXICALS].includes(attribute))
        dataTypes[attribute] = constants.LEXICALS;
    return dataTypes;
  }

  handleGraphSelect = (e: object, chartType: string)  => {
    this.setState({chartType: chartType});
    let pKeyDatatype = this.find([this.props.pKey1]);
    let attDatatypes = this.find(this.props.selectedAttributes);
    getGraphData(this.props.dbDetails, chartType, this.props.ent1, pKeyDatatype,
                 attDatatypes, this.props.ent2).then(raw_data => {
      return raw_data.json()
    }).then(data => { this.setState({graphData: data}); })
  };

  generateEntityButtons(graphData: { [key: string]: boolean }) {
    const chartTypes: { [key: string]: string } = {
      //---------- Basic Entity ----------//
      [constants.BAR]: "Bar chart",
      [constants.CALENDAR]: "Calendar chart",
      [constants.SCATTER]: "Scatter diagram",
      [constants.BUBBLE]: "Bubble chart",
      [constants.CHOROPLETH]: "Choropleth map",
      [constants.CLOUD]: "Word cloud",
      //---------- Weak Entity ----------//
      [constants.LINE]: "Line chart",
      [constants.STACKEDBAR]: "Stacked bar chart",
      [constants.GROUPEDBAR]: "Grouped bar chart",
      [constants.SPIDER]: "Spider chart",
      //---------- One to Many ----------//
      [constants.TREE]: "Tree chart",
      [constants.HIERARCHY]: "Hierarchy tree",
      [constants.CIRCLE]: "Circle packing",
      //---------- Many to Many ----------//
      [constants.SANKEY]: "Sankey diagram",
      [constants.CHORD]: "Chord diagram"
    };
    let buttons: [JSX.Element?] = [];
    for (let [key, enabledState] of Object.entries(graphData))
      buttons.push(<RaisedButton label={chartTypes[key]} primary={true} onClick={(e) => this.handleGraphSelect(e, key)}
                                 disabled={!enabledState} style={{margin: 12}}/>);
    if (buttons.length == 0)
      buttons.push(<RaisedButton label={"No graphs possible (have you selected a View?)"} disabled={true} style={{ margin: 12 }}/>);
    return buttons;
  }

  render() {
    const buttons = this.generateEntityButtons(this.state.possibleGraphs);
    let graph;
    if (this.state.chartType && this.state.graphData == undefined)
      graph = <Timer  time={-1}/>;
    else if (this.state.chartType && this.state.graphData)
      graph = <DrawGraph chartType={this.state.chartType}
                         graphData={this.state.graphData}
                         ent1={this.props.ent1}
                         pKey1={this.props.pKey1}
                         ent2={this.props.ent2}
                         selectedAttributes={this.props.selectedAttributes}/>;
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
  graphs[constants.BAR] = numEntries <= MAXENTRIESBARCHART && attsLength == 1 && scalars.includes(selectAtts[0]);
  graphs[constants.CALENDAR] = attsLength == 1 && entityData[constants.TEMPORALS].includes(selectAtts[0]);
  graphs[constants.SCATTER] = attsLength == 2 && selectAtts.every(att => scalars.includes(att));
  graphs[constants.BUBBLE] = attsLength == 3 && selectAtts.every(att => scalars.includes(att)) &&
    selectAtts.some(att => entityData[constants.NUMERICS].includes(att));
  const selectAttsUppercase = selectAtts.map(elem => elem.toUpperCase());
  graphs[constants.CHOROPLETH] = attsLength == 3 &&
    selectAtts.every(att => entityData[constants.NUMERICS].includes(att)) &&
    ((selectAttsUppercase.includes("LAT") && selectAttsUppercase.includes("LONG")) ||
    (selectAttsUppercase.includes("LATITUDE") && selectAttsUppercase.includes("LONGITUDE")));
  graphs[constants.CLOUD] = entityData[constants.LEXICALS].includes(pKey) && attsLength == 1 &&
    entityData[constants.NUMERICS].includes(selectAtts[0]);
  return graphs;
}

function getGraphTypes_OneToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                 ent2: string, selectAtts: string[]): { [key: string]: boolean } {
  const numEntriesOneSide = entityData[constants.SIZE][ent1];
  const maxEntriesManySide = entityData[constants.SIZE][ent2];
  let graphs: { [key: string]: boolean } = {
    [constants.HIERARCHY]: false, [constants.TREE]: false, [constants.CIRCLE]: false
  };
  if (1 <= numEntriesOneSide && numEntriesOneSide <= MAXENTRIESONETOMANY &&
      1 <= maxEntriesManySide && maxEntriesManySide <= MAXENTRIESONETOMANY) {
    graphs[constants.HIERARCHY] = true;
    // If we have a scalar attribute then we're good to go
    delete entityData[constants.NUMERICS][pKey1]; delete entityData[constants.TEMPORALS][pKey1];
    const validScalar = selectAtts.length == 1 &&
      entityData[constants.NUMERICS].concat(entityData[constants.TEMPORALS]).includes(selectAtts[0]);
    graphs = {[constants.HIERARCHY]: true, [constants.TREE]: validScalar, [constants.CIRCLE]: validScalar};
  }
  return graphs;
}

function getGraphTypes_ManyToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                  ent2: string, selectAtts: string[]): { [key: string]: boolean } {
  const sizes = entityData[constants.SIZE];
  const validScalar = selectAtts.length == 1 &&
    entityData[constants.NUMERICS].concat(entityData[constants.TEMPORALS]).includes(selectAtts[0]);
  let graphs: { [key: string]: boolean } = {
    [constants.CHORD]: false, [constants.SANKEY]: false
  };
  if (sizes[ent1] >= 1 && sizes[ent2] >= 1 && validScalar)
    if (sizes[ent1] <= MAXENTRIESSANKEY && sizes[ent2] <= MAXENTRIESSANKEY)
      graphs = {[constants.CHORD]: true, [constants.SANKEY]: true};
    else if (sizes[ent1] <= MAXENTRIESCHORD && sizes[ent2] <= MAXENTRIESCHORD)
      graphs[constants.CHORD] = true;
  return graphs;
}

export default GenerateGraphs;
