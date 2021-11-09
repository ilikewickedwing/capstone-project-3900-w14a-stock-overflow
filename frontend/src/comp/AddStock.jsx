import React from 'react'; 

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import {FlexColumns} from "../styles/styling"; 

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { apiBaseUrl } from './const';


// add stock form 
const AddStock = ({token, pid, onAddCallback, load = () => {}, name}) => {
    // textinput state
    const [search, setSearch ] = React.useState("");
    // list of api return 
    const [queryRes, setRes] = React.useState([]);

    const [currCode, setCode] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [quantity, setQuantity] = React.useState(0);
    const [brokerage, setBroker] = React.useState('');
    const [flag, setFlag] = React.useState(0);

       // on first load, cache the stock list 
       React.useEffect(() => {   
        fetchStockList();
        getDefaultBrokerage();
    },[]);
    
      // grab the current default
    const getDefaultBrokerage = async ()=> {
        try {
        const res = await axios.get(`${apiBaseUrl}/user/getDefBroker?token=${token}`);
        setBroker(res.data.defBroker.defBroker); 
        setFlag(res.data.defBroker.brokerFlag);
        
        } catch (e) {
        alert(`Status Code ${e.status} : ${e.response.data.message}`);
        }
    }

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
          alert(`Status Code ${e.status} : ${e.response.data.error}`);
        }
      };
    var request = require('request');

    const handleAddStock = async (e) => {
        e.preventDefault(); 
        try {
            var floatPrice = parseFloat(price); 
            var intQuantity = parseInt(quantity);
            const res = await axios.post(`${apiBaseUrl}/user/stocks/add`, 
                {token, pid, stock: currCode, price: floatPrice, quantity: intQuantity, brokerage, flag});
            onAddCallback();
            load();
        } catch (e){
            alert(`Status Code ${e.response.status} : ${e.response.data.error}`);
        }
    }

    return (
        <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <u>  + Add New Stock </u> 
        </AccordionSummary>
        <AccordionDetails>
        <FlexColumns style={{width:'100%', justifyContent:'space-between'}}>
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
            <TextField 
                {...params} 
                label="Search Stock" 
            />)}
        />
        {
            name === 'Watchlist' ? (
                <div>
                </div>
            ) : (
                <div>
                    <TextField type="text" required variant="standard" label="Price (USD$)"
                     onChange={e => setPrice(e.target.value)}/>
                     <br/>
                    <TextField type="text" required variant="standard" label="Quantity"
                     onChange={e => setQuantity(e.target.value)}/>
                      <br/>
                    <TextField type="text" required variant="standard" label="Brokerage fee (USD$)"
                     onChange={e => setBroker(e.target.value)}/>
                </div>
            )
        }
            <Button type='submit' variant='outlined' onClick={handleAddStock}>
                Add Stock
            </Button>
        </FlexColumns>
        </AccordionDetails>
      </Accordion>
    )
};

export default AddStock;