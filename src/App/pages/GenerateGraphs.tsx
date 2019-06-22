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
  tables: any
  visType: string
  ent1: string
  pKey1: string
  ent2?: string
  pKey2?: string
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
    let associativeEntity: string[] | undefined;
    if (props.ent2 && props.relationship == constants.MANY_TO_MANY)
      associativeEntity = this.getAssociativeEntity(props.ent1, props.ent2);
    if (updateEntInfo) graphPromise = getEntityDetails(props.dbDetails, props.visType,
                                                       props.ent1, props.pKey1, props.ent2, props.pKey2, associativeEntity);
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
    else if (props.visType == constants.WEAK_ENTITY && props.ent2 && props.pKey2)
      this.setState({entityInfo: entInfo,
        possibleGraphs: getGraphTypes_WeakEntity(entInfo, props.ent1, props.pKey1, props.ent2, props.pKey2,
          props.selectedAttributes), needToUpdate: false});
    else if (props.visType == constants.ONE_TO_MANY && props.ent2 && props.pKey2)
      this.setState({entityInfo: entInfo,
        possibleGraphs: getGraphTypes_OneToMany(entInfo, props.ent1, props.pKey1, props.ent2, props.pKey2,
          props.selectedAttributes), needToUpdate: false});
    else if (props.visType == constants.MANY_TO_MANY && props.ent2)
      this.setState({entityInfo: entInfo,
        possibleGraphs: getGraphTypes_ManyToMany(entInfo, props.ent1, props.pKey1, props.ent2,
          props.selectedAttributes), needToUpdate: false});
  }

  componentDidMount(): void { this.update(this.props, true); }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.selectedAttributes.length !== prevState.selectedAttLength)
      return {
        selectedAttLength: nextProps.selectedAttributes.length,
        needToUpdate: true
      };
    return null;
  }

  componentDidUpdate(nextProps: Props, nextState: State): void {
    // const updateEntInfo = !(this.props.visType == nextProps.visType && this.props.ent1 == nextProps.ent1 &&
    //   this.props.ent2 == nextProps.ent2);
    if (this.state.needToUpdate || (this.props.visType != nextProps.visType)) this.update(this.props, true);
  }

  getAssociativeEntity(ent1: string, ent2: string): string[] {
    let possibleAssociatives: string[] = [];
    if (ent1 in this.props.associativeEntities)
      possibleAssociatives = this.props.associativeEntities[ent1];
    else if (ent2 in this.props.associativeEntities)
      possibleAssociatives = this.props.associativeEntities[ent2];
    return possibleAssociatives;
  }

  handleGraphSelect = (e: object, chartType: string)  => {
    this.setState({chartType: chartType});
    let attributes: string[] = this.props.selectedAttributes;
    if ([constants.LINE, constants.STACKEDBAR, constants.GROUPEDBAR, constants.SPIDER].includes(chartType) &&
        this.props.ent2) {
      let ent2Data = this.props.tables[this.props.ent2];
      let changingPKey: string = ent2Data[constants.PRIMARY_KEYS].filter((e: string) =>
                        !ent2Data[constants.FOREIGN_KEYS].includes(e))[0];
      attributes = [changingPKey].concat(attributes);
    }
    getGraphData(this.props.dbDetails, chartType, this.props.ent1, this.props.pKey1, attributes,
                 this.props.ent2, this.props.pKey2)
      .then(raw_data => { return raw_data.json() })
      .then(data => { this.setState({graphData: data}); })
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
      [constants.TREE]: "Treemap",
      [constants.HIERARCHY]: "Hierarchy tree",
      [constants.CIRCLE]: "Circle packing",
      [constants.SUNBURST]: "Sunburst chart",
      //---------- Many to Many ----------//
      [constants.SANKEY]: "Sankey diagram",
      [constants.CHORD]: "Chord diagram"
    };
    let buttons: [JSX.Element?] = [];
    for (let [key, enabledState] of Object.entries(graphData))
      buttons.push(<RaisedButton label={chartTypes[key]} primary={true} onClick={(e) => this.handleGraphSelect(e, key)}
                                 disabled={!enabledState} style={{margin: 12}}/>);
    if (buttons.length == 0)
      buttons.push(<RaisedButton label={"No graphs possible (have you selected a View?)"}
                                 disabled={true} style={{ margin: 12 }}/>);
    return buttons;
  }

  render() {
    const buttons = this.generateEntityButtons(this.state.possibleGraphs);
    let graph;
    if (this.state.chartType && this.state.graphData == undefined)
      graph = <Timer time={-1}/>;
    else if (this.state.chartType && this.state.graphData)
      graph = <DrawGraph chartType={this.state.chartType}
                         graphData={this.state.graphData}
                         ent1={this.props.ent1}
                         pKey1={this.props.pKey1}
                         ent2={this.props.ent2}
                         pKey2={this.props.pKey2}
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

function getGraphTypes_WeakEntity(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                  ent2: string, pKey2: string, selectAtts: string[]): { [key: string]: boolean } {
  const cardinalityStrongEnt = entityData[constants.SIZE][ent1];
  const cardinalityWeakEnt = entityData[constants.SIZE][ent2];
  const attsLength = selectAtts.length;
  const scalars = entityData[ent2][constants.NUMERICS].concat(entityData[ent2][constants.TEMPORALS]);
  let graphs: { [key: string]: boolean } = {
    [constants.LINE]: false, [constants.STACKEDBAR]: false, [constants.GROUPEDBAR]: false, [constants.SPIDER]: false
  };
  if (attsLength == 1 && scalars.includes(selectAtts[0])) {
    // TODO: Fix to "20"
    if (cardinalityStrongEnt >= 1 && cardinalityStrongEnt <= 2000000) {
      graphs[constants.LINE] = scalars.includes(pKey2);
      graphs[constants.STACKEDBAR] = cardinalityWeakEnt >= 1 && cardinalityWeakEnt <= 20;
      graphs[constants.GROUPEDBAR] = graphs[constants.STACKEDBAR];
    }
    graphs[constants.SPIDER] = cardinalityStrongEnt >= 3 && cardinalityStrongEnt <= 10 &&
                               cardinalityWeakEnt >= 1 && cardinalityWeakEnt <= 20;
  }
  return graphs;
}


function getGraphTypes_OneToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                 ent2: string, pKey2: string, selectAtts: string[]): { [key: string]: boolean } {
  const numEntriesOneSide = entityData[constants.SIZE][ent1];
  const maxEntriesManySide = entityData[constants.SIZE][ent2];
  let graphs: { [key: string]: boolean } = {
    [constants.HIERARCHY]: false, [constants.TREE]: false, [constants.CIRCLE]: false, [constants.SUNBURST]: false
  };
  if (1 <= numEntriesOneSide && numEntriesOneSide <= MAXENTRIESONETOMANY &&
      1 <= maxEntriesManySide && maxEntriesManySide <= MAXENTRIESONETOMANY) {
    // If we have a scalar attribute then we can go ahead and graph
    const scalars = entityData[ent2][constants.NUMERICS].concat(entityData[ent2][constants.TEMPORALS]);
    const validScalar = selectAtts.length == 2 && scalars.some((elem: string) => scalars.includes(elem));
    graphs = {[constants.HIERARCHY]: true, [constants.TREE]: validScalar, [constants.CIRCLE]: validScalar,
              [constants.SUNBURST]: validScalar};
  }
  return graphs;
}

function getGraphTypes_ManyToMany(entityData: { [key: string]: any }, ent1: string, pKey1: string,
                                  ent2: string, selectAtts: string[]): { [key: string]: boolean } {
  // const sizes = entityData[constants.SIZE];
  // const validScalar = selectAtts.length == 1 &&
  //   entityData[constants.NUMERICS].concat(entityData[constants.TEMPORALS]).includes(selectAtts[0]);
  // let graphs: { [key: string]: boolean } = {
  //   [constants.CHORD]: false, [constants.SANKEY]: false
  // };
  // if (sizes[ent1] >= 1 && sizes[ent2] >= 1 && validScalar)
  //   if (sizes[ent1] <= MAXENTRIESSANKEY && sizes[ent2] <= MAXENTRIESSANKEY)
  //     graphs = {[constants.CHORD]: true, [constants.SANKEY]: true};
  //   else if (sizes[ent1] <= MAXENTRIESCHORD && sizes[ent2] <= MAXENTRIESCHORD)
  //     graphs[constants.CHORD] = true;
  // return graphs;
  return {}
}

export default GenerateGraphs;
