import Login from "./pages/Login";
import {BrowserRouter, Route, Switch} from 'react-router-dom'; 
import Dashboard from "./pages/Dashboard";
import API, { ApiContext } from "./api";
import SignUp from "./pages/SignUp";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Stock from "./pages/Stock";
import './App.css';
import { StocksPage } from "./graph/StocksPage";
import AdminPage from "./admin/AdminPage";
import { ExamplePerformancePage } from "./graph/ExamplePerformancePage";
import FileUpload from "./files/FileUpload";
import Friend from "./pages/Friend";

function App() {
  const api = new API();

  return (
    <ApiContext.Provider value={api}>
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route path="/user" component={Friend} /> 
            <Route path="/stocks/:companyId" component={StocksPage}/>
            <Route path="/signup" component={SignUp} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/portfolio/:pid" component={Portfolio} />
            <Route path="/profile" component={Profile} />
            <Route path="/stock/:stockCode" component={Stock} />
            <Route path="/performance/:pids" component={ExamplePerformancePage}/>
            <Route path="/admin" component={AdminPage} />
            <Route path="/upload" component={FileUpload}/>
            <Route path="/" component={Login} />
          </Switch>  
        </div>
      </BrowserRouter>
    </ApiContext.Provider>
  );
}

export default App;
