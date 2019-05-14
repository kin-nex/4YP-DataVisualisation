import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as constants from '../Constants';

// Use animations
am4core.useTheme(am4themes_animated);

const CHARTTOAMCHART: {[key: string]: string} = {
  [constants.BAR]: "chartdiv"
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
      default:
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
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = pKey;
  categoryAxis.renderer.grid.template.location = 0;
  categoryAxis.renderer.minGridDistance = 30;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

  // Create series
  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = attribute;
  series.dataFields.categoryX = pKey;
  series.name = attribute;
  series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
  return chart;
}

export default DrawGraph;