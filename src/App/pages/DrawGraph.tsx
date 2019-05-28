import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as constants from '../Constants';

// Use animations
am4core.useTheme(am4themes_animated);

const CHARTTOAMCHART: {[key: string]: string} = {
  [constants.BAR]: "chartdiv",
  [constants.SCATTER]: "chartdiv"
};

interface Props {
  chartType: string
  graphData: any
  ent1: string
  pKey1: string
  ent2?: string
  selectedAttributes: string[]
}

interface State {
}

class DrawGraph extends Component<Props, State> {
  chart: any;
  constructor(props: Props) {
    super(props);
  }

  componentDidMount(): void {
    switch (this.props.chartType) {
      case constants.BAR:
        this.chart = createBarChart(this.props.graphData, this.props.pKey1, this.props.selectedAttributes[0]);
        break;
      case constants.SCATTER:
        console.log("HERE")
        this.chart = createScatterDiagram(this.props.graphData, this.props.pKey1, this.props.selectedAttributes);
      default:
        this.chart = null;
        break;
    }
  }

  componentWillUnmount() {
    if (this.chart)
      this.chart.dispose();
  }

  render() {
    return (
      <div id={CHARTTOAMCHART[this.props.chartType]}
           style={{ width: "80%", height: "500px" }}></div>
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
  return chart
}

export default DrawGraph;