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

    return (
        <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <u>  + Add New Stock </u> 
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <TextInput required id="search" variant="outlined" label="Search Stock" onChange={(e) => setSearch(e.target.value) }/>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
};

export default AddStock;