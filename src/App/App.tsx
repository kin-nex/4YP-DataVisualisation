import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import StartJourney from './pages/StartJourney';

class App extends Component {
  render() {
    const App = () => (
        <div>
            <Switch>
                <Route exact path='/' component={Home}/>
                <Route path='/signup' component={SignUp}/>
                <Route path='/startjourney' component={StartJourney}/>
            </Switch>
        </div>
    );
    return (
        <Switch>
            <App/>
        </Switch>
    );
  }
}

export default App;
