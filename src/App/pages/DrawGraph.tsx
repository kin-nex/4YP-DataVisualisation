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
  [constants.CLOUD]: "chartdiv"
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
  chart: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      switchAxes: false
    }
  }

  componentDidMount(): void {
    this.chart = drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, this.props.selectedAttributes);
  }


  componentWillUnmount() {
    if (this.chart)
      this.chart.dispose();
  }

  switchAxes(e: any) {
    this.chart.invalidateData();
    let atts = [...this.props.selectedAttributes];
    if (!this.state.switchAxes) {
      const temp = atts[0];
      atts[0] = atts[1];
      atts[1] = temp;
    }
    this.setState(prevState => ({ switchAxes: !prevState.switchAxes }));
    drawGraph(this.props.chartType, this.props.graphData, this.props.pKey1, atts);
  }

  render() {
    let toggle;
    if (TOGGLABLE.includes(this.props.chartType))
      toggle = <Toggle label="Switch axes?" onToggle={e => this.switchAxes(e)}/>;
    return (
      <div>
        {/* Give the user graph options if any */}
        {toggle}
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
  let valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxisX.title.text = attributes[0];
  valueAxisX.renderer.minGridDistance = 40;

  let valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxisY.title.text = attributes[1];

  let lineSeries = chart.series.push(new am4charts.LineSeries());
  lineSeries.dataFields.valueX = attributes[0];
  lineSeries.dataFields.valueY = attributes[1];
  lineSeries.strokeOpacity = 0;

  let bullet = lineSeries.bullets.push(new am4charts.Bullet());

  let point = bullet.createChild(am4core.Circle);
  point.width = 12;
  point.height = 12;

  chart.scrollbarX = new am4core.Scrollbar();
  chart.scrollbarY = new am4core.Scrollbar();
  return chart;
}

function createBubbleChart(data: any, pKey: string, attributes: string[]): any {

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