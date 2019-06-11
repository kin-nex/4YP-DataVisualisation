import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import am4geodata_worldHigh from "@amcharts/amcharts4-geodata/worldHigh";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as constants from '../Constants';
import Toggle from "material-ui/Toggle";
import {reverseGeocode} from "./NetworkRequest";

// Use animations
am4core.useTheme(am4themes_animated);

const CHARTTOAMCHART: {[key: string]: string} = {
  [constants.BAR]: "chartdiv",
  [constants.SCATTER]: "chartdiv",
  [constants.CLOUD]: "chartdiv",
  [constants.CHOROPLETH]: "chartdiv",
  [constants.BUBBLE]: "chartdiv"
};
const TOGGLABLE = [constants.SCATTER, constants.BUBBLE];
const WORDCLOUDCOUNT = 100;

interface Props {
  chartType: string
  graphData: any
  ent1: string
  pKey1: string
  ent2?: string
  selectedAttributes: string[]
}

interface State {
  chartType: string
  updatedGraphData: any[]
}

class DrawGraph extends Component<Props, State> {
  private chart: any;
  private switchedAxes: boolean;
  constructor(props: Props) {
    super(props);
    this.switchedAxes = false;
    this.state = {
      chartType: "",
      updatedGraphData: []
    }
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.chartType != prevState.chartType)
      return {updatedGraphData: []};
    return null;
  }

  componentDidMount(): void {
    this.chart = this.drawGraph(this.props.chartType, this.props.graphData,
                                this.props.pKey1, this.props.selectedAttributes);
  }

  componentWillUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): void {
    if (this.props.chartType != nextProps.chartType ||
        JSON.stringify(this.props.graphData) != JSON.stringify(nextProps.graphData)) {
      if (this.chart) this.chart.dispose();
      this.switchedAxes = false;
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (JSON.stringify(prevProps.graphData) != JSON.stringify(this.props.graphData)) {
      if (this.chart) this.chart.dispose();
      this.chart = this.drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1,
        this.props.selectedAttributes);
    } else if (prevProps.chartType == this.props.chartType &&
               JSON.stringify(prevState.updatedGraphData) != JSON.stringify(this.state.updatedGraphData)) {
      if (this.chart) this.chart.dispose();
      this.chart = this.drawGraph(this.props.chartType, this.state.updatedGraphData, this.props.pKey1,
                                  this.props.selectedAttributes);
    }
  }

  componentWillUnmount() {
    if (this.chart) this.chart.dispose();
  }

  switchAxes(e: any) {
    this.chart.invalidateData();
    let atts = [...this.props.selectedAttributes];
    if (!this.switchedAxes) {
      const temp = atts[0];
      atts[0] = atts[1];
      atts[1] = temp;
    }
    this.switchedAxes = !this.switchedAxes;
    this.drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, atts);
  }

  updateChoroplethData(data: any, attributes: string[]) {
    if (this.state.updatedGraphData.length > 0) return;
    let latlongs: any = [];
    let latIndex: number = -1, longIndex: number = -1;
    for (let i = 0; i < attributes.length; i++)
      if (ciEquals(attributes[i], "latitude") || ciEquals(attributes[i], "lat")) latIndex = i;
      else if (ciEquals(attributes[i], "longitude") || ciEquals(attributes[i], "long")) longIndex = i;
    let lat: string = attributes[latIndex], long: string = attributes[longIndex];
    let value: string = [...attributes].filter(elem => ![lat, long].includes(elem))[0];
    let graphData: any[] = [];
    for (let entry of data) {
      latlongs.push([entry[lat], entry[long]]);
      graphData.push({"value": entry[value]})
    }
    reverseGeocode(latlongs).then(response => { return response.json() }).then(jsonData => {
      let countries = eval(jsonData);
      for (let i = 0; i < graphData.length; i++)
        graphData[i] = {...graphData[i], ...countries[i]};
      this.setState({chartType: this.props.chartType, updatedGraphData: graphData});
    });
  }

  drawGraph(chartType: string, data: any, pKey1: string, attributes: string[]) {
    switch (chartType) {
      case constants.BAR:             return createBarChart(data, pKey1, attributes[0]);
      case constants.SCATTER:         return createScatterDiagram(data, pKey1, attributes);
      case constants.CLOUD:           return createWordCloud(data, pKey1, attributes[0]);
      case constants.BUBBLE:          return createBubbleChart(data, pKey1, attributes);
      case constants.CHOROPLETH:      this.updateChoroplethData(data, attributes);
                                      return createChoroplethChart(data);
      default:                        return null;
    }
  }


  render() {
    let toggle;
    if (TOGGLABLE.includes(this.props.chartType))
      toggle = <Toggle label="Switch axes?" onToggle={e => this.switchAxes(e)} />;
    return (
      <div>
        {/* Give the user graph options if any */}
        <div style={{ width: 200, margin: 15 }}>{toggle}</div>
        <div id={CHARTTOAMCHART[this.props.chartType]}
             style={{ width: "80%", height: "500px" }} />
      </div>
    );
  }
}

function createBarChart(data: any, pKey: string, attribute: string): any {
  let chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.data = data;
  let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = pKey;
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.minGridDistance = 30;
  categoryAxis.title.text = pKey;
  categoryAxis.renderer.labels.template.horizontalCenter = "right";
  categoryAxis.renderer.labels.template.verticalCenter = "middle";
  categoryAxis.renderer.minHeight = 0;
  categoryAxis.renderer.labels.template.rotation = 270;

  let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.title.text = attribute;

  let series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = attribute;
  series.dataFields.categoryX = pKey;
  series.name = attribute;
  series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";

  chart.scrollbarX = new am4core.Scrollbar();
  return chart;
}

function createScatterDiagram(data: any, pKey: string, attributes: string[]): any {
  let chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.data = data;
  let xAxis = chart.xAxes.push(new am4charts.ValueAxis());
  xAxis.title.text = attributes[0];
  xAxis.renderer.minGridDistance = 40;

  let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
  yAxis.title.text = attributes[1];

  let series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueX = attributes[0];
  series.dataFields.valueY = attributes[1];
  series.strokeOpacity = 0;

  let bullet = series.bullets.push(new am4charts.Bullet());
  bullet.tooltipText = "{" + pKey + "}";

  let point = bullet.createChild(am4core.Circle);
  point.width = 12;
  point.height = 12;

  chart.scrollbarX = new am4core.Scrollbar();
  chart.scrollbarY = new am4core.Scrollbar();
  return chart;
}

function createBubbleChart(data: any, pKey: string, attributes: string[]): any {
  let chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.data = data;
  let xAxis = chart.xAxes.push(new am4charts.ValueAxis());
  xAxis.title.text = attributes[0];
  xAxis.renderer.minGridDistance = 50;

  let yAxis = chart.yAxes.push(new am4charts.ValueAxis());
  yAxis.title.text = attributes[1];
  yAxis.renderer.minGridDistance = 50;

  let series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueX = attributes[0];
  series.dataFields.valueY = attributes[1];
  series.dataFields.value = attributes[2];
  series.strokeOpacity = 0;

  let bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.stroke = am4core.color("#ffffff");
  bullet.tooltipText = "x:{valueX} y:{valueY}";
  series.heatRules.push({
    target: bullet.circle,
    min: 5,
    max: 50,
    property: "radius"
  });

  chart.scrollbarX = new am4core.Scrollbar();
  chart.scrollbarY = new am4core.Scrollbar();
  return chart;
}

function ciEquals(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
}
function combineDupes(data: any) {
  console.log(data)
  let countryValueMap: {[key: string]: number} = {};
  for (let entry of data)
    if (entry.id in countryValueMap) countryValueMap[entry.id] += Number(entry.value);
    else countryValueMap[entry.id] = Number(entry.value);
  let dataArray: any[] = [];
  for (let [id, value] of Object.entries(countryValueMap))
    dataArray.push({id: id, value: value});
  return dataArray;
}

function createChoroplethChart(data: any) {
  let chart = am4core.create("chartdiv", am4maps.MapChart);
  // Set map definition
  chart.geodata = am4geodata_worldHigh;

  // Set projection
  chart.projection = new am4maps.projections.Mercator();

  // Center on the groups by default
  chart.homeZoomLevel = 6;
  chart.homeGeoPoint = { longitude: 10, latitude: 51 };

  // Create map polygon series
  let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

  //Set min/max fill color for each area
  polygonSeries.heatRules.push({
    property: "fill",
    target: polygonSeries.mapPolygons.template,
    min: chart.colors.getIndex(1).brighten(1),
    max: chart.colors.getIndex(1).brighten(-0.3)
  });

  polygonSeries.useGeodata = true;
  // Make map load polygon data (state shapes and names) from GeoJSON

  chart.projection = new am4maps.projections.Mercator();
  // Configure series tooltip
  let polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.tooltipText = "{name}: {value}";
  polygonTemplate.nonScalingStroke = true;
  polygonTemplate.strokeWidth = 0.5;

  // Create hover state and set alternative fill color
  let hs = polygonTemplate.states.create("hover");
  hs.properties.fill = chart.colors.getIndex(1).brighten(-0.5);
  const combinedData = combineDupes(data);
  console.log(combinedData);
  console.log(JSON.stringify(combinedData.slice(1, 500)));
  polygonSeries.data = (Object.keys(combinedData[0]).length == 2) ? combinedData.slice(1, 500) : [];
  return chart;
}

function createWordCloud(data: any, pKey: string, attribute: string): any {
  let chart = am4core.create("chartdiv", am4plugins_wordCloud.WordCloud);
  let series = chart.series.push(new am4plugins_wordCloud.WordCloudSeries());

  series.accuracy = 4;
  series.step = 15;
  series.rotationThreshold = 0.7;
  series.minWordLength = 2;
  series.labels.template.tooltipText = "{word}: {value}";
  series.fontFamily = "Courier New";
  series.maxFontSize = am4core.percent(30);

  series.data = data.sort((obj1: any, obj2: any) => {
    return obj2[attribute] - obj1[attribute]
  }).slice(0, WORDCLOUDCOUNT);
  series.dataFields.word = pKey;
  series.dataFields.value = attribute;
  return chart;
}

export default DrawGraph;