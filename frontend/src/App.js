import Login from "./pages/Login";
import {BrowserRouter, Route, Switch} from 'react-router-dom'; 
import Dashboard from "./pages/Dashboard";
import API, { ApiContext } from "./api";
import SignUp from "./pages/SignUp";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Stock from "./pages/Stock";
import './App.css';
import AdminPage from "./admin/AdminPage";
import CelebrityRequestPage from "./celebrity/CelebrityRequestPage";
import Friend from "./pages/Friend";
import DiscoverCelebrityPage from "./celebrity/DiscoverCelebrity";

function App() {
  const api = new API();

  return (
    <ApiContext.Provider value={api}>
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/user" component={Friend} /> 
            <Route path="/signup" component={SignUp} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/portfolio/:pid" component={Portfolio} />
            <Route path="/profile" component={Profile} />
            <Route path="/stock/:stockCode" component={Stock} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/celebrityrequest" component={CelebrityRequestPage}/>
            <Route path="/celebrity/discover" component={DiscoverCelebrityPage}/>
            <Route path="/" component={Login} />
          </Switch>  
        </div>
      </BrowserRouter>
    </ApiContext.Provider>
  );
}

export default App;
