import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import StartJourney from './pages/StartJourney';
import DatabaseAnalysis from "./pages/DatabaseAnalysis";

class App extends Component {
  render() {
    const App = () => (
        <div>
            <Switch>
                <Route exact path='/' component={Home}/>
                <Route path='/signup' component={SignUp}/>
                <Route path='/startjourney' component={StartJourney}/>
                <Route path='/databaseanalysis' component={DatabaseAnalysis} />
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
