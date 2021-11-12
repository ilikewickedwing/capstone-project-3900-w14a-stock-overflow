import * as React from 'react';

import { ReqCardContainer} from '../styles/styling';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { AlertContext } from '../App';

const FriendRequestCard = ({name, reload}) => {
  const alert = React.useContext(AlertContext);
  // handle accept
  const handleAccept = async() => {
    try {
        alert(`You have accepted ${name}'s friend request`);
        reload();
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`);
    }
  }

  // handle reject friend
  const handleReject = async() => {
    try {
        alert(`You have rejected ${name}'s friend request`);
        reload(); 
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.message}`);
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