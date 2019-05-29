import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as constants from '../Constants';
import Toggle from "material-ui/Toggle";

// Use animations
am4core.useTheme(am4themes_animated);

const CHARTTOAMCHART: {[key: string]: string} = {
  [constants.BAR]: "chartdiv",
  [constants.SCATTER]: "chartdiv",
  [constants.CLOUD]: "chartdiv",
  [constants.BUBBLE]: "chartdiv"
};
const TOGGLABLE = [constants.SCATTER, constants.BUBBLE];
const WORDCLOUDCOUNT = 50;

interface Props {
  chartType: string
  graphData: any
  ent1: string
  pKey1: string
  ent2?: string
  selectedAttributes: string[]
}

interface State {
  switchAxes: boolean
}

class DrawGraph extends Component<Props, State> {
  private chart: any;
  private switchedAxes: boolean;
  constructor(props: Props) {
    super(props);
    this.switchedAxes = false;
    this.state = {
      switchAxes: false
    }
  }

  componentDidMount(): void {
    this.chart = drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, this.props.selectedAttributes);
  }

  componentWillUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): void {
    if (this.props.chartType != nextProps.chartType ||
        JSON.stringify(this.props.graphData) != JSON.stringify(nextProps.graphData)) {
      this.chart.dispose();
      this.switchedAxes = false;
    }
  }
  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.chartType != this.props.chartType ||
        JSON.stringify(prevProps.graphData) != JSON.stringify(this.props.graphData)) {
      this.chart = drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, this.props.selectedAttributes);
    }
  }

  componentWillUnmount() {
    if (this.chart)
      this.chart.dispose();
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
    // this.setState(prevState => ({ switchAxes: !prevState.switchAxes }));
    drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, atts);
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

function drawGraph(chartType: string, data: any, pKey1: string, attributes: string[]) {
  switch (chartType) {
    case constants.BAR:             return createBarChart(data, pKey1, attributes[0]);
    case constants.SCATTER:         return createScatterDiagram(data, pKey1, attributes);
    case constants.CLOUD:           return createWordCloud(data, pKey1, attributes[0]);
    case constants.BUBBLE:          return createBubbleChart(data, pKey1, attributes);
    default:                        return null;
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

  let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.title.text = attribute;

  let series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = attribute;
  series.dataFields.categoryX = pKey;
  series.name = attribute;
  series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
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