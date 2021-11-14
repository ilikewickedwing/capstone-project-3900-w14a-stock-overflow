import React, { useContext } from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import { ApiContext } from '../api';
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

const label = { inputProps: { 'aria-label': 'toggle' } };
const filter = createFilterOptions();

const stubFriends= [{
    type: "Friends",
    code: "handle_1",
    name: "handle_1"
},{
    type: "Friends",
    code: "handle_2",
    name: "handle_2"
    },
]

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
                  type: "Stocks",
                  code: obj["symbol"],
                  name: obj["name"]
              })
          })
          // TODO CALL ENPOINT TO PUSH FRIENDS 
          const friendList =[];
          newList.push(...stubFriends);

          // TODO CALL ENDPOINT TO PUSH CELEBRITIES 
          const celebList = [];

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
                sx={{ width: 300 }}
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
                    if (e.type === "Friends"){
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