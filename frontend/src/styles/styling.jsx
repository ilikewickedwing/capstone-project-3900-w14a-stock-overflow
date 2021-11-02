import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// https://coolors.co/fec5bb-fcd5ce-fae1dd-f8edeb-e8e8e4-d8e2dc-ece4db-ffe5d9-ffd7ba-fec89a

// for in- the same row layouts 
export const FlexRows = styled.div`
    display:flex;
    flex-direction: row;
`;

// for top -> down layouts
export const FlexColumns = styled.div`
    display:flex;
    flex-direction: column;
`;

export const BoxShadow = styled.div`
    box-shadow: 2px 1px 8px 1px rgba(181,177,177,0.72);
    -webkit-box-shadow: 2px 1px 8px 1px rgba(181,177,177,0.72);
    -moz-box-shadow: 2px 1px 8px 1px rgba(181,177,177,0.72);
`;
export const NavBar = styled(FlexRows)`
    justify-content: space-between;
    padding: 2% 5%;
    background-color: #FEC89A;
    // background: rgb(72,3,84);
    // background: linear-gradient(90deg, rgba(72,3,84,1) 0%, rgba(0,133,186,1) 36%, rgba(0,212,255,1) 100%);
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

export const LeftBody= styled(BoxShadow)`
    flex: 2;
    border-radius: 15px;
    padding: 2%;
    margin: 1% 0%;
    background-color: white;
    
`;

export const RightBody= styled(BoxShadow)`
    display:flex;
    flex-direction: column;
    flex: 1;
    margin:1%;
    padding: 2%;
    border-radius: 15px;
    background-color: white;
`;

export const PfBody = styled(FlexRows)`
    width: 100%; 
    flex:1;
    padding: 1%;
    margin-top: -2%;
`;

export const RightCard = styled(BoxShadow)`
    border-radius: 15px;
    padding: 2%;
    margin: 1%; 
    background-color: white;

`;

export const PageBody = styled(FlexColumns)`
    height:100vh;
    width: 100vw;
    background-color: #FAE1DD;
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

export const StockOverview = styled(BoxShadow)`
    display:flex;
    flex-direction: column;
    padding: 2%;
    border-radius: 15px;
    text-align: center;
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

export const PfBar = styled(FlexRows)`
    width: 100%;
    justify-content: space-between;
    padding: 2% 0%;
`;

export const Heading = styled.div`
    font-size: 2em;
    font-weight: bold;
`;

export const StockHeading = styled(FlexRows)`
    font-size: 1em;
    font-weight: bold;
    padding: 2% 0%;
    position: relative;
`