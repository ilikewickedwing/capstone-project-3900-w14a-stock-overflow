import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import { ApiContext } from '../api';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import {NavBar, Logo, LogoutButton, FlexRows, SearchToggle, SearchDiv, NavBtnWrapper } from '../styles/styling';
import {TextInput} from "../styles/styling"; 
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import { apiBaseUrl } from '../comp/const';
import axios from 'axios';
import NotificationButton from '../notifications/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import ExploreIcon from '@mui/icons-material/Explore';
import { AlertContext } from '../App';

const label = { inputProps: { 'aria-label': 'toggle' } };

const Navigation = () => {
    const api = React.useContext(ApiContext);
    const alert = useContext(AlertContext)
    const history = useHistory();

    // const [query, setQuery] = React.useState('');
    const [queryRes, setRes] = React.useState([]);
    // textinput state
    const [search, setSearch ] = React.useState("");
    const [currCode, setCode] = React.useState("");

    // handle logout
    const onLogOut = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${apiBaseUrl}/auth/logout`,{token});
            history.push('/');
        } catch (e) {
            alert(`Status Code ${e.response.status} : ${e.response.data.message}`,'error');
        }
    }
    
      // on first load, cache the stock list 
    React.useEffect(() => {   
        fetchStockList();
    },[]);
    
    const fetchStockList = async () => {
        try {
          const request = await axios.get(`${apiBaseUrl}/stocks/all`);
          // map it so its MUI autocorrect friendly 
          const newList = [];
          request.data.forEach(obj => {
              newList.push({
                  code: obj["symbol"],
                  name: obj["name"]
              })
          })
          setRes(newList);
        } catch (e) {
          alert(`Status Code ${e.status} : ${e.response.data.error}`,'error');
        }
      };

    const submitQuery = () => {
        history.push(`/stock/${currCode}`);
    }


    return (
        <NavBar className="font-two">
            <Link to="/dashboard">
                <Logo>
                    Stock Overflow 
                </Logo>
            </Link>
            <SearchToggle>
                stocks
                <Switch {...label}/>
                friends
            </SearchToggle>
            <SearchDiv>
            <Autocomplete
                disablePortal
                options={queryRes.map((e)=> e.code+" "+ e.name)}
                sx={{ width: 300 }}
                inputValue={search}
                onInputChange={(e,v) => {
                    setSearch(v);
                    var code = v.split(" ")[0];
                    setCode(code); 
                }}
                renderInput={(params) => (
                <TextInput 
                    {...params} 
                    label="Search Stock" 
                />)}
            />
            <IconButton type="submit" sx={{p:'10px'}} onClick={submitQuery}>
                <SearchIcon />
            </IconButton>
            </ SearchDiv> 
            <FlexRows style={{padding:"1%"}}>
                <NotificationButton/>
                <NavBtnWrapper>
                    <IconButton onClick={() => history.push('/celebrity/discover') }>
                        <ExploreIcon style={{ fontSize: '2rem', color: '#ffffff' }}/>
                    </IconButton>
                </NavBtnWrapper>
                <NavBtnWrapper>
                    <IconButton onClick={() => history.push('/profile') }>
                        <SettingsIcon style={{ fontSize: '2rem', color: '#ffffff' }}/>
                    </IconButton>
                </NavBtnWrapper>
                <LogoutButton 
                    name="logOut"
                    startIcon={<ExitToAppRoundedIcon />}
                    onClick={onLogOut}
                >
                    Log Out
                </LogoutButton >
            </FlexRows>
        </NavBar>
    );
};

export default Navigation;