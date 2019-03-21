import React, { Component } from 'react';

interface State {
  count: number
}

export default class Timer extends Component<{time: number}, State> {
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

  tick () {
    this.setState({count: (this.state.count - 1)})
  }

  render () {
    if (this.state.count < 0) {
      {clearInterval()}
      return <div>Hmmmm. Should've been done by now...</div>
    } else {
      return (
        <div>
          Should be done in: {this.state.count} seconds.
        </div>
      );
    }
  }

}