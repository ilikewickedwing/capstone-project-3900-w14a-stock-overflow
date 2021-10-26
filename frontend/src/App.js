import Login from "./comp/Login";
import {BrowserRouter, Route, Switch} from 'react-router-dom'; 
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
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/stocks/:companyId" component={StocksGraph}/>
            <Route exact path="/" component={Login} />
            <Route path="/signup" component={SignUp} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/portfolio/:pid" component={Portfolio} />
            <Route path="/profile" component={Profile} />
          </Switch>  
        </div>
      </BrowserRouter>
    </ApiContext.Provider>
  );
}

export default App;
