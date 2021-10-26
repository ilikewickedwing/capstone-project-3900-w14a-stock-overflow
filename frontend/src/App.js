import Login from "./comp/Login";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'; 
import Dashboard from "./comp/Dashboard";
import API, { ApiContext } from "./api";
import SignUp from "./comp/SignUp";
import Portfolio from "./comp/Portfolio";
import Profile from "./comp/Profile";
import './App.css';
import StocksGraph from "./graph/StocksGraph";

function App() {
  const api = new API();

  return (
    <ApiContext.Provider value={api}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/signup">
              <SignUp/>
            </Route>
            <Route path="/dashboard">
              <Dashboard/>
            </Route>
            <Route path="/portfolio">
              <Portfolio/>
            </Route>
            <Route path="/profile">
              <Profile/>
            </Route>
            <Route path="/stocks/:companyId">
              <StocksGraph/>
            </Route>
            <Route path="/">
              <Login/>
            </Route>
          </Switch>  
        </div>
      </Router>
    </ApiContext.Provider>
  );
}

export default App;
