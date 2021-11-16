import * as React from 'react';
import { useHistory } from "react-router";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

import { FriendCardContainer } from '../styles/styling';


const FriendListCard = ({name}) => {
    const history = useHistory();
    const handleClick = () => {
        history.push(`/user/${name}`)
    }

    return(
        <FriendCardContainer onClick={handleClick} elevation={5}>
            <AccountCircleOutlinedIcon />
            {name}
        </FriendCardContainer>
    );
}

export default FriendListCard;