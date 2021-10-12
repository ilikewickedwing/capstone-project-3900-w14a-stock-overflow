import React from 'react'; 
import { ApiContext } from '../api';

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import {TextInput} from "../styles/styling"; 

// add stock form 
const AddStock = () => {
    const api = React.useContext(ApiContext);
    const [search, setSearch ] = React.useState("");
    const [success, setSuccess] = React.useState(0);
    const [queryRes, setRes] = React.useState([]);

    var request = require('request');

    // replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
    var url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${search}&apikey=59SO8FIM49NYQS21`;

    const searchBar = async(e) =>{
        e.preventDefault(); 
        setSearch(e.target.value);
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
    const toggleSuccess = (num) => {
        setSuccess(num);
    }

    // TODO 
    // check successful search 
    const checkSuccess = () => {
        if (success === 1) {
            // use the code and name, from the currently selected option
            // to add the stock 
            toggleSuccess(0);
        }
    }

    return (
        <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <u>  + Add New Stock </u> 
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
        <form onSubmit={checkSuccess}>
            <TextInput required id="search" variant="outlined" label="Search Stock" onChange={searchBar}/>
        </form> 
        
            
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
};

export default AddStock;