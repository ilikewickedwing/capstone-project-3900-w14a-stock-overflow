import API, { ApiContext } from "./api";
import Login from "./pages/Login";
import {BrowserRouter, Route, Switch} from 'react-router-dom'; 
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Stock from "./pages/Stock";
import './App.css';
import AdminPage from "./admin/AdminPage";
import CelebrityRequestPage from "./celebrity/CelebrityRequestPage";
import Friend from "./pages/Friend";
import DiscoverCelebrityPage from "./celebrity/DiscoverCelebrity";
import { Snackbar } from "@material-ui/core";
import MuiAlert from '@mui/material/Alert';
import { createContext, useState,forwardRef } from "react";
import PerformanceGraph from "./graph/PerformanceGraph";

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AlertContext = createContext();

function App() {
  const api = new API();
  const [ alertMessage, setAlertMessage ] = useState('');
  const [ showAlert, setShowAlert ] = useState(false);
  const [severity, setSeverity] = useState('');
  // Custom alert function
  const alert = (message,severity) => {
    setSeverity(severity);
    setAlertMessage(message);
    setShowAlert(true);
  }
  
  return (
    <ApiContext.Provider value={api}>
      <AlertContext.Provider value={alert}>
        <BrowserRouter>
          <div className="App">
            {/* This is a custom alert component (default alert is ugly) */}
            <Snackbar 
              open={showAlert}
              onClose={() => setShowAlert(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              autoHideDuration={6000} 
            >
              <Alert onClose={() => setShowAlert(false)} severity={severity} sx={{ width: '100%' }}>
                {alertMessage}
              </Alert>
            </Snackbar> 
            <Switch>
              <Route path="/oops" component={NotFound} />
              <Route path="/user/:handle" component={Friend} /> 
              <Route path="/signup" component={SignUp} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/portfolio/:pid" component={Portfolio} />
              <Route path="/profile" component={Profile} />
              <Route path="/stock/:stockCode" component={Stock} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/celebrity/request" component={CelebrityRequestPage}/>
              <Route path="/celebrity/discover" component={DiscoverCelebrityPage}/>
              <Route path="/" component={Login} />
            </Switch>  
          </div>
        </BrowserRouter>
      </AlertContext.Provider>
    </ApiContext.Provider>
  );
}

export default App;
