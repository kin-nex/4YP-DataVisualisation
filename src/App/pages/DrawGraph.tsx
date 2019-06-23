import React, {Component} from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4maps from "@amcharts/amcharts4/maps";
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import am4geodata_worldHigh from "@amcharts/amcharts4-geodata/worldHigh";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as constants from '../Constants';
import Toggle from "material-ui/Toggle";
import {reverseGeocode} from "./NetworkRequest";

// Use animations
am4core.useTheme(am4themes_animated);

const TOGGLABLE = [constants.SCATTER, constants.BUBBLE];
const WORDCLOUDCOUNT = 50;

interface Props {
  chartType: string
  graphData: any
  ent1: string
  pKey1: string
  ent2?: string
  pKey2?: string
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
                                this.props.pKey1, this.props.selectedAttributes, this.props.pKey2);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.chartType != this.props.chartType ||
      JSON.stringify(prevProps.graphData) != JSON.stringify(this.props.graphData)) {
      if (this.chart) this.chart.dispose();
      this.chart = this.drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1,
        this.props.selectedAttributes, this.props.pKey2);
    } else if (prevProps.chartType == this.props.chartType &&
               JSON.stringify(prevState.updatedGraphData) != JSON.stringify(this.state.updatedGraphData)) {
      if (this.chart) this.chart.dispose();
      this.chart = this.drawGraph(this.props.chartType, this.state.updatedGraphData, this.props.pKey1,
                                  this.props.selectedAttributes, this.props.pKey2);
    }
  }

  componentWillUnmount(): void { if (this.chart) this.chart.dispose(); }

  switchAxes(e: any) {
    this.chart.invalidateData();
    let atts = [...this.props.selectedAttributes];
    if (!this.switchedAxes) {
      const temp = atts[0];
      atts[0] = atts[1];
      atts[1] = temp;
    }
    this.switchedAxes = !this.switchedAxes;
    this.drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, atts, this.props.pKey2);
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

  drawGraph(chartType: string, data: any, pKey1: string, attributes: string[], pKey2?: string) {
    switch (chartType) {
      case constants.BAR:             return createBarChart(data, pKey1, attributes[0]);
      case constants.SCATTER:         return createScatterDiagram(data, pKey1, attributes);
      case constants.CLOUD:           return createWordCloud(data, pKey1, attributes[0]);
      case constants.BUBBLE:          return createBubbleChart(data, pKey1, attributes);
      case constants.CHOROPLETH:      this.updateChoroplethData(data, attributes);
                                      return createChoroplethChart(data);
      case constants.STACKEDBAR:      if (pKey2) return createStackedBarChart(data, pKey1, pKey2); break;
      case constants.GROUPEDBAR:      if (pKey2) return createGroupedBarChart(data, pKey1, pKey2); break;
      case constants.TREE:            if (pKey2) return createTreeMap(data); break;
      case constants.SUNBURST:        if (pKey2) return createSunburstChart(data); break;
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
        <div id="chartdiv" style={{ width: "90%", height: "600px" }} />
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
  bullet.tooltipText = "{" + pKey + "}\n" + attributes[2] + ":{value}";
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

function createChoroplethChart(data: any) {
  let chart = am4core.create("chartdiv", am4maps.MapChart);

  chart.geodata = am4geodata_worldHigh;
  chart.projection = new am4maps.projections.Mercator();

  // Set default starting point
  chart.homeZoomLevel = 6;
  chart.homeGeoPoint = { longitude: 10, latitude: 51 };

  let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

  //Set min/max fill color for each area
  polygonSeries.heatRules.push({
    property: "fill",
    target: polygonSeries.mapPolygons.template,
    min: chart.colors.getIndex(1).brighten(2),
    max: chart.colors.getIndex(1).brighten(-0.7)
  });

  polygonSeries.useGeodata = true;
  chart.projection = new am4maps.projections.Mercator();

  let polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.tooltipText = "{name}: {value}";
  polygonTemplate.nonScalingStroke = true;
  polygonTemplate.strokeWidth = 0.5;

  let hs = polygonTemplate.states.create("hover");
  hs.properties.fill = chart.colors.getIndex(1).brighten(-0.5);
  // Combine duplicates
  let countryValueMap: {[key: string]: number} = {};
  for (let entry of data)
    if (entry.id in countryValueMap) countryValueMap[entry.id] += Number(entry.value);
    else countryValueMap[entry.id] = Number(entry.value);
  let combinedData: any[] = [];
  for (let [id, value] of Object.entries(countryValueMap))
    combinedData.push({id: id, value: value});
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

  // Combine duplicates
  let wordValueMap: {[key: string]: number} = {};
  for (let entry of data)
    if (entry[pKey] in wordValueMap)
      wordValueMap[entry[pKey]] += Number(entry[attribute]);
    else wordValueMap[entry[pKey]] = Number(entry[attribute]);
  let combinedData: any[] = [];
  for (let [key, value] of Object.entries(wordValueMap))
    combinedData.push({[pKey]: key, [attribute]: value});

  series.data = combinedData.sort((obj1: any, obj2: any) => {
    return obj2[attribute] - obj1[attribute]
  }).slice(0, WORDCLOUDCOUNT);
  series.dataFields.word = pKey;
  series.dataFields.value = attribute;
  return chart;
}

function createStackedBarChart(data: any, pKey1: string, pKey2: string): any {
  // Our data has more values than just pKey and attributes, all columns make up the primary key
  let chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.data = data;
  let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = pKey2;
  categoryAxis.renderer.grid.template.location = 0;

  let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.renderer.inside = true;
  valueAxis.renderer.labels.template.disabled = true;
  valueAxis.min = 0;

  function createSeries(name: string) {
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueY = name;
    series.dataFields.categoryX = pKey2;
    series.sequencedInterpolation = true;

    series.stacked = true;

    series.columns.template.width = am4core.percent(60);
    series.columns.template.tooltipText = "[bold]{name}[/]\n{categoryX}: {valueY}";

    let labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.text = "{valueY}";
    labelBullet.locationY = 0.5;

    return series;
  }
  let keys: string[] = [];
  let possibleKeys: string[] = [];
  for (let dataObj of data) {
    possibleKeys = Object.keys(dataObj);
    possibleKeys.splice(keys.indexOf(pKey2), 1);
    keys = keys.concat(possibleKeys);
  }
  keys = [...new Set(keys)];
  for (let key of keys)
    createSeries(key);

  chart.legend = new am4charts.Legend();
  return chart;
}

function createGroupedBarChart(data: any, pKey1: string, pKey2: string) {
  let chart = am4core.create("chartdiv", am4charts.XYChart);
  chart.data = data;

  let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = pKey2;
  categoryAxis.numberFormatter.numberFormat = "#";
  categoryAxis.renderer.inversed = true;
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.cellStartLocation = 0.1;
  categoryAxis.renderer.cellEndLocation = 0.9;

  let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.renderer.opposite = true;

  function createSeries(name: string) {
    let series = chart.series.push(new am4charts.ColumnSeries());
    series.name = name;
    series.dataFields.valueX = name;
    series.dataFields.categoryY = pKey2;
    series.columns.template.tooltipText = "{name}: [bold]{valueX}[/]";
    series.columns.template.height = am4core.percent(100);
    series.sequencedInterpolation = true;

    let valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.text = "{valueX}";
    valueLabel.label.horizontalCenter = "left";
    valueLabel.label.dx = 10;
    valueLabel.label.hideOversized = false;
    valueLabel.label.truncate = false;

    let categoryLabel = series.bullets.push(new am4charts.LabelBullet());
    categoryLabel.label.text = "{name}";
    categoryLabel.label.horizontalCenter = "right";
    categoryLabel.label.dx = -10;
    categoryLabel.label.fill = am4core.color("#fff");
    categoryLabel.label.hideOversized = false;
    categoryLabel.label.truncate = false;
  }
  let keys: string[] = [];
  let possibleKeys: string[] = [];
  for (let dataObj of data) {
    possibleKeys = Object.keys(dataObj);
    possibleKeys.splice(keys.indexOf(pKey2), 1);
    keys = keys.concat(possibleKeys);
  }
  keys = [...new Set(keys)];
  for (let key of keys)
    createSeries(key);

  return chart;
}

function createTreeMap(data: any) {
  let chart = am4core.create("chartdiv", am4charts.TreeMap);
  chart.hiddenState.properties.opacity = 0;
  chart.data = data;
  chart.colors.step = 2;

  chart.dataFields.value = "value";
  chart.dataFields.name = "name";
  chart.dataFields.children = "children";
  chart.layoutAlgorithm = chart.binaryTree;

  chart.zoomable = false;

  let level0SeriesTemplate = chart.seriesTemplates.create("0");
  let level0ColumnTemplate = level0SeriesTemplate.columns.template;

  level0ColumnTemplate.column.cornerRadius(10, 10, 10, 10);
  level0ColumnTemplate.fillOpacity = 0;
  level0ColumnTemplate.strokeWidth = 4;
  level0ColumnTemplate.strokeOpacity = 0;

  let level1SeriesTemplate: any = chart.seriesTemplates.create("1");
  level1SeriesTemplate.tooltip.dy = - 15;
  level1SeriesTemplate.tooltip.pointerOrientation = "vertical";

  let level1ColumnTemplate = level1SeriesTemplate.columns.template;

  level1SeriesTemplate.tooltip.animationDuration = 0;
  level1SeriesTemplate.strokeOpacity = 1;

  level1ColumnTemplate.column.cornerRadius(10, 10, 10, 10)
  level1ColumnTemplate.fillOpacity = 1;
  level1ColumnTemplate.strokeWidth = 4;
  level1ColumnTemplate.stroke = am4core.color("#ffffff");

  let bullet1 = level1SeriesTemplate.bullets.push(new am4charts.LabelBullet());
  bullet1.locationY = 0.5;
  bullet1.locationX = 0.5;
  bullet1.label.text = "{name}";
  bullet1.label.fill = am4core.color("#ffffff");
  bullet1.interactionsEnabled = false;
  chart.maxLevels = 2;
}

function createSunburstChart(data: any) {
  let chart = am4core.create("chartdiv", am4plugins_sunburst.Sunburst);
  chart.padding(0, 0, 0, 0);
  chart.radius = am4core.percent(98);
  chart.data = data;

  chart.colors.step = 2;
  chart.fontSize = 11;
  chart.innerRadius = am4core.percent(10);

  chart.dataFields.value = "value";
  chart.dataFields.name = "name";
  chart.dataFields.children = "children";

  let level0SeriesTemplate = new am4plugins_sunburst.SunburstSeries();
  level0SeriesTemplate.hiddenInLegend = false;
  chart.seriesTemplates.setKey("0", level0SeriesTemplate);

  // This makes labels to be hidden if they don't fit
  level0SeriesTemplate.labels.template.truncate = true;
  level0SeriesTemplate.labels.template.hideOversized = true;

  level0SeriesTemplate.labels.template.adapter.add("rotation", (rotation, target) => {
    target.maxWidth = target.dataItem.slice.radius - target.dataItem.slice.innerRadius - 10;
    target.maxHeight = Math.abs(target.dataItem.slice.arc * (target.dataItem.slice.innerRadius + target.dataItem.slice.radius) / 2 * am4core.math.RADIANS);

    return rotation;
  });

  let level1SeriesTemplate = level0SeriesTemplate.clone();
  chart.seriesTemplates.setKey("1", level1SeriesTemplate);
  level1SeriesTemplate.fillOpacity = 0.75;
  level1SeriesTemplate.hiddenInLegend = true;

  let level2SeriesTemplate = level0SeriesTemplate.clone();
  chart.seriesTemplates.setKey("2", level2SeriesTemplate);
  level2SeriesTemplate.fillOpacity = 0.5;
  level2SeriesTemplate.hiddenInLegend = true;

  chart.legend = new am4charts.Legend();
}

export default DrawGraph;