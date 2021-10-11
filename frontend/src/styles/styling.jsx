import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export const FlexRows = styled.div`
    display:flex;
    flex-direction: row;
`;

export const NavBar = styled(FlexRows)`
    justify-content: space-between;
    padding: 0 5%;
    background: rgb(72,3,84);
    background: linear-gradient(90deg, rgba(72,3,84,1) 0%, rgba(0,133,186,1) 36%, rgba(0,212,255,1) 100%);
`;
export const TabButton = styled(Button)
`
    &&{
        margin: 5px;
    }
`;

export const CreatePortContent = styled.div`
    width: 60vw;
    margin: 5%;
    margin-right: 10%;
    padding-right: 60px;
    display:flex;
    flex-direction:column;
    text-align:center;
`;

export const CreatePortField = styled(TextField)
`
&&{
    width:90%;
    margin: 5% 0%;
}
`;

export const Logo = styled.h1`
    color:white;
`;

export const LogoutButton = styled(Button)`
    &&{
        font-weight:bold;
        margin: 25x 0;
        background-color: white;
        transition: 0.5s;
        &: hover {
            background-color: #8c112d;
            color: white;
        }
        margin:1%;
    }
`;

export const TabBar = styled.div`
    margin: 1%;
`;

export const ConfirmCancel = styled(FlexRows)`
    justify-content: space-between; 
`;