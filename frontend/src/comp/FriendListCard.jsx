import * as React from 'react';
import { useHistory } from "react-router";

import { FriendCardContainer } from '../styles/styling';


const FriendListCard = ({name}) => {
    const history = useHistory();

    const handleClick = () => {
        history.push(`/user/${name}`)
    }

    return(
        <FriendCardContainer onClick={handleClick} elevation={5}>
            {name}
        </FriendCardContainer>
    );
}

export default FriendListCard;