import React from 'react'; 
import { useHistory } from 'react-router';
import {Link} from 'react-router-dom';
import { ApiContext } from '../api';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import {NavBar, Logo, LogoutButton, FlexRows, SearchToggle } from '../styles/styling';
import { Button } from '@material-ui/core';
import {TextInput} from "../styles/styling"; 
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import { apiBaseUrl } from '../comp/const';
import axios from 'axios';

const label = { inputProps: { 'aria-label': 'toggle' } };

const Navigation = () => {
    const api = React.useContext(ApiContext);
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
            alert(`Status Code ${e.response.status} : ${e.response.data.message}`);
        }
    }
    
    // // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
    // var url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${search}&apikey=59SO8FIM49NYQS21`;
    // var request = require('request');
    
    // // handle search submission 
    // const searchBar = async(e) =>{
    //     e.preventDefault(); 
        
    //     request.get({
    //         url: url,
    //         json: true,
    //         headers: {'User-Agent': 'request'}
    //     }, (err, res, data) => {
    //         if (err) {
    //         console.log('Error:', err);
    //         } else if (res.statusCode !== 200) {
    //         console.log('Status:', res.statusCode);
    //         } else {
    //         // data is successfully parsed as a JSON object:
    //         const response =  data.bestMatches;

    //         if (response){
    //             const newList = []; 
    //             response.forEach((obj) => {
    //                 newList.push({
    //                     code: obj["1. symbol"],
    //                     name: obj["2. name"]
    //                 });
    //             })
    //             setRes(newList);
    //         }
    //         }
    //     });
    // }
      // on first load 
    
    React.useEffect(() => {   
        fetchStockList();
    },[]);
    
    const fetchStockList = async () => {
        try {
          const request = await axios.get(`${apiBaseUrl}/stocks/all`);
          console.log(request); 
          // map it so its autocorrect friendly 
          setRes(request);
        } catch (e) {
          alert(`Status Code ${e.response.status} : ${e.response.data.error}`);
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
                friends
                <Switch {...label} defaultChecked />
                stocks
            </SearchToggle>
            <FlexRows style={{margin:'1%', justifyContent:'center'}}>
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
                    // onKeyDown={e => {
                    //     if (e.keyCode === 13 && e.target.value) {
                    //         searchBar(e);
                    //     }
                    // }}
                />)}
            />
            <IconButton type="submit" sx={{p:'10px'}} onClick={submitQuery}>
                <SearchIcon />
            </IconButton>
            </ FlexRows> 
            <FlexRows style={{padding:"1%"}}>
                <Link to="/profile">
                    <Button>
                        Edit Profile
                    </Button>
                </Link>
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