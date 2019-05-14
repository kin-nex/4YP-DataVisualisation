import React, { Component } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import CircularProgress from "material-ui/CircularProgress";

export default class Timer extends Component<{time: number}, {count: number}> {
  private interval: any;
  constructor (props: any) {
    super(props);
    this.state = {count: this.props.time}
  }

  componentDidMount(): void {
    this.interval = setInterval(this.tick.bind(this), 1000);
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  tick(): void {
    this.setState({count: (this.state.count - 1)})
  }

  render () {
    if (this.state.count < 0) {
      {clearInterval()}
      return (
        <div style={{textAlign: "center"}}>
          <MuiThemeProvider>
            <div>
              <CircularProgress style={{ marginTop: 30, marginBottom: 30 }} />
              <div>Hmmmm. Should be done soon...</div>
            </div>
          </MuiThemeProvider>
        </div>
      );
    }
    return (
      <div style={{textAlign: "center"}}>
        <MuiThemeProvider>
          <div>
            <CircularProgress style={{ marginTop: 30, marginBottom: 30 }} />
            <div>Should be done in: {this.state.count} seconds.</div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}