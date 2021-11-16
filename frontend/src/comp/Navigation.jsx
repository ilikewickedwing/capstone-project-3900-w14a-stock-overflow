import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import {NavBar, Logo, LogoutButton, FlexRows, SearchDiv, NavBtnWrapper } from '../styles/styling';
import {TextInput} from "../styles/styling"; 
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete , { createFilterOptions }from '@mui/material/Autocomplete';
import { apiBaseUrl } from '../comp/const';
import axios from 'axios';
import NotificationButton from '../notifications/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import ExploreIcon from '@mui/icons-material/Explore';
import { AlertContext } from '../App';
const filter = createFilterOptions();


const Navigation = () => {
    const alert = useContext(AlertContext);
    const history = useHistory();
    const token = localStorage.getItem('token');

    // const [query, setQuery] = React.useState('');
    const [queryRes, setRes] = React.useState([]);
    // textinput state
    const [search, setSearch ] = React.useState("");

    // handle logout
    const onLogOut = async () => {
        try {
            await axios.post(`${apiBaseUrl}/auth/logout`,{token});
            localStorage.clear();
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
                  type: "Stocks",
                  code: obj["symbol"],
                  name: obj["name"]
              })
          })

          // append friends to the search pool 
          const friendList =[];
          const request2 = await axios.get(`${apiBaseUrl}/friends/all?token=${token}`);
          request2.data.friends.forEach(obj => {
            friendList.push({
                type: "Friends",
                code: obj["username"],
                name: obj["uid"]
            })
          })
          
          // append celebrities to the pool
          const celebList = [];
          const request3 = await axios.get(`${apiBaseUrl}/celebrity/discover`);
          request3.data.celebrities.forEach(obj => {
            celebList.push({
                type: "Celebrities",
                code: obj["username"],
                name: obj["uid"]
            })
          })
        newList.push(...friendList,...celebList);
          setRes(newList);
        } catch (e) {
          alert(`Status Code ${e.status} : ${e.response.data.error}`,'error');
        }
      };

    const submitQuery = () => {
        if (search.includes(' ')){
            var code = search.split(" ")[0];
            history.push(`/stock/${code}`);
        } else {
            history.push(`/user/${search}`);
        }
    }


    return (
        <NavBar className="font-two">
            <Link to="/dashboard">
                <Logo>
                    Stock Overflow 
                </Logo>
            </Link>
            <SearchDiv>
            <Autocomplete
                disablePortal
                options={queryRes}
                sx={{ width: '100%' }}
                filterOptions={(options, params) => {
                const filtered = filter(options, params);
        
                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option.code);
                if (inputValue !== '' && !isExisting) {
                    filtered.push({
                    inputValue,
                    code: `Add "${inputValue}"`,
                    });
                }
                return filtered;
                }}
                inputValue={search}
                groupBy={(option) => option.type}
                getOptionLabel={ (e) => {
                    // Value selected with enter, right from the input
                    if (typeof e === 'string') {
                        return e;
                    }
                    // Add "xxx" option created dynamically
                    if (e.inputValue) {
                        return e.inputValue;
                    }
                    if (e.type === "Friends" ||e.type === "Celebrities" ){
                        return e.code;
                    }
                    return e.code+" "+ e.name;
                }}

                onInputChange={(e,v) => {
                    setSearch(v);
                }}
                freeSolo
                renderInput={(params) => (
                <TextInput 
                    {...params} 
                    label="Search stock/user" 
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