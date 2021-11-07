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
    const [broker, setBroker] = React.useState(0);


    var request = require('request');

    // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
    var url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${search}&apikey=59SO8FIM49NYQS21`;

    const searchBar = async(e) =>{
        e.preventDefault(); 
        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request'}
        }, (err, res, data) => {
            if (err) {
            console.log('Error:', err);
            } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
            } else {
            // data is successfully parsed as a JSON object:
            const response =  data.bestMatches;

            if (response){
                const newList = []; 
                response.forEach((obj) => {
                    newList.push({
                        code: obj["1. symbol"],
                        name: obj["2. name"]
                    });
                })
                setRes(newList);
            }
            }
        });
    }

    const handleAddStock = async (e) => {
        e.preventDefault(); 
        try {
            var floatPrice = parseFloat(price); 
            var intQuantity = parseInt(quantity);
            const res = await axios.post(`${apiBaseUrl}/user/stocks/add`, 
                {token, pid, stock: currCode, price: floatPrice, quantity: intQuantity});
            onAddCallback();
            load();
        } catch (e){
            alert(e);
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
                onKeyDown={e => {
                    if (e.keyCode === 13 && e.target.value) {
                      searchBar(e);
                    }
                  }}
            />)}
        />
        <form>
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
            <Button type='submit' onClick={handleAddStock}>
                Add Stock
            </Button>
        </form>
        </FlexColumns>
        </AccordionDetails>
      </Accordion>
    )
};

export default AddStock;