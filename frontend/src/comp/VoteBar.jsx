import React, { useContext } from 'react'; 
import { FlexRows } from '../styles/styling';
import { Button } from "@material-ui/core";
import { apiBaseUrl } from './const';
import { AlertContext } from '../App';
import axios from 'axios';


// feed in percentage as an int
const VoteBar = ({percentage, stock, reload}) => {
    const alert = useContext(AlertContext);
    const token = localStorage.getItem('token');
    const containerStyles = {
        height: 40,
        width: '100%',
        backgroundColor: "#eb7f7f",
        borderRadius: 5,
        margin: '10px 0px'
      }
    
      const fillerStyles = {
        height: '100%',
        width: `${percentage}%`,
        backgroundColor: "#b2edbb",
        borderRadius: '5px 0 0 5px',
        textAlign: 'right'
      }
    
      const labelStyles = {
        padding: 5,
        color: 'white',
        fontWeight: 'bold'
      }
      const bullButton = {
        borderColor: 'green',
        color: 'green'
      }
      
      const bearButton = {
        borderColor: 'red',
        color:'red'
      }
      
      //num => 0: bearish, 1: bullish 
      const vote = async (e,num) => {
        e.preventDefault();
        try {
          await axios.post(`${apiBaseUrl}/stocks/vote`,{token, stock, type: num});
          reload();
        } catch (e) {
            alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
        }
      }

    return (
        <div>
            <FlexRows style={{justifyContent:'space-between'}}>
                <div style={{color:"green"}}>
                    Bullish: {percentage}%
                </div>
                <div style={{color:"red"}}>
                    Bearish: {100-percentage}%
                </div>
            </FlexRows>
            <div style={containerStyles}>
            <div style={fillerStyles}>
                <span style={labelStyles}></span>
            </div>
            </div>
            <FlexRows style={{justifyContent:'space-between'}}>
            <Button onClick={(e) => vote(e, 1)} style={bullButton} variant="outlined">
                Vote Bullish
            </Button>
            <Button onClick={(e) => vote(e, 0)} style={bearButton} variant="outlined">
                Vote Bearish
            </Button>
            </FlexRows>
        </div>
    );
}

export default VoteBar;