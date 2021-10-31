import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export const FlexRows = styled.div`
    display:flex;
    flex-direction: row;
`;

export const FlexColumns = styled.div`
    display:flex;
    flex-direction: column;
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

export const LeftBody= styled.div`
    flex: 2;
    border: 3px solid black;
    border-radius: 15px;
    padding: 2%;
    margin: 1% 0%;
`;

export const RightBody= styled(FlexColumns)`
    flex: 1;
    border: 3px solid red;
    margin:1%;
    padding: 2%;
    border-radius: 15px;
`;

export const PfBody = styled(FlexRows)`
    width: 100%; 
    flex:1;
`;

export const RightCard = styled.div`
    height: 20%;
    border 3px solid green;
    border-radius: 15px;
    padding: 2%;
    margin: 1%; 
`;

export const PageBody = styled(FlexColumns)`
    border 3px solid purple;
    height:100vh;
    width: 100vw;
`;

export const TextInput = styled(TextField)`
 &&{
     margin: 0.5%; 
 }
`;


export const StockQueryButton= styled.button`
 &&{
     width: 60%;
     text-align: center;
 }
`;

export const StockOverview = styled(FlexColumns)`
    border: 1px solid pink;
    padding: 2%;
    border-radius: 15px;

`;

export const ContentBody = styled(FlexColumns)`
    padding: 1%;
    height: 100%;
`;

export const CleanButton = styled.button`
    background: transparent;
    box-shadow: 0px 0px 0px transparent;
    border: 0px solid transparent;
    text-shadow: 0px 0px 0px transparent;
`;