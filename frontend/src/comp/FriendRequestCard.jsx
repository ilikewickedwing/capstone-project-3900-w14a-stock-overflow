import * as React from 'react';

import axios from 'axios';
import { apiBaseUrl } from '../comp/const';
import { ReqCardContainer} from '../styles/styling';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { AlertContext } from '../App';

const FriendRequestCard = ({name,uid,reload}) => {
  const alert = React.useContext(AlertContext);
  const token = localStorage.getItem('token');
  // handle accept
  const handleAccept = async() => {
    try {
        await axios.post(`${apiBaseUrl}/friends/add`, {token, friendID:uid});
        alert(`You have accepted ${name}'s friend request`,'success');
        reload();
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }

  // handle reject friend
  const handleReject = async() => {
    try {
      await axios.delete(`${apiBaseUrl}/friends/decline`, {data:{token, friendID:uid}});
      alert(`You have rejected ${name}'s friend request`,'info');
      reload(); 
    } catch (e){
      console.log(e);
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
  }
  
    return(
        <ReqCardContainer elevation={5}>
            <div>
                {name}
            </div>
            <div>
                <IconButton onClick={handleAccept}>
                    <CheckCircleOutlineIcon style={{color:'green'}}/>
                </IconButton> 
                <IconButton onClick={handleReject}>
                    <CancelOutlinedIcon style={{color:'red'}}/>
                </IconButton> 
            </div>
        </ReqCardContainer>
    );
}

export default FriendRequestCard; 