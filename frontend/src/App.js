import Login from "./comp/Login";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'; 
import Dashboard from "./comp/Dashboard";
import API, { ApiContext } from "./api";
import SignUp from "./comp/SignUp";

function App() {
  const api = new API();

  return (
    <ApiContext.Provider value={api}>
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/">
              <Login/>
            </Route>
            <Route path="/signup">
              <SignUp/>
            </Route>
            <Route path="/dashboard">
              <Dashboard/>
            </Route>
          </Switch>  
        </div>
      </Router>
    </ApiContext.Provider>
  );
}

export default App;
