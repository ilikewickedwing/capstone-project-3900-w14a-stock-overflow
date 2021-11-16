import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Paper } from '@material-ui/core'

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

export const BoxShadow = styled(Paper)`
border-radius: 8px;
`;

export const NavBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1% 3%;
    background-color: #6d6875;
    height:7%;
`;

export const NavBtnWrapper = styled.div`
    display: flex;
    align-items: center;
`

// body containers
export const PageBody = styled(FlexColumns)`
    min-height:100vh;
    width: 100%;
    background-color: #FAE1DD;
`;

export const LeftBody= styled(BoxShadow)`
    padding: 2%;
    margin: 1% 0%;
    background-color: white;
    flex:2;
`;

export const RightBody= styled.div`
    display:flex;
    flex-direction: column;
    margin:1%;
    //background-color: white;
    flex-wrap: wrap;
    flex:1;
`;

export const PfBody = styled(FlexRows)`
    width: 100%; 
    padding: 1%;
    margin-top: -2%;
    justify-content:center;
`;

export const WatchlistBody = styled(BoxShadow)`
    padding: 2%;
    margin: 1% 0%;
    background-color: white;
    width: 70%;
    text-align: center;
`;

export const ContentBody = styled(FlexColumns)`
    padding: 1%;
    height: 100%;
`;

export const WatchlistCardContainer = styled(BoxShadow)`
    padding: 1%;
    margin 1% 0;
    display:flex;
    justify-content: space-between;
    border-radius: 5px;
    font-size: 1.3em;
    cursor: pointer;
    &: hover {
        background-color: #edf6f9;
        transition: 0.3s;
    }
`;

export const ReqCardContainer = styled(BoxShadow)`
    padding: 4%;
    margin: 3%;
    display:flex;
    align-items:center;
    justify-content: space-between;
`;

export const FriendCardContainer = styled(ReqCardContainer)`
    &: hover {
        background-color: #edf6f9;
        transition: 0.3s;
    }
`;

export const TabBar = styled.div`
    margin: 1%;
`;

export const SearchDiv = styled.div`
    padding: 1%;
    display: flex;
    border-radius: 8px; 
    background-color: white;
    width:30%;
    align-items:center;
`;
// Text Styles 
export const Welcome = styled.div`
    font-size: 3em;
    font-weight:bold;
    padding: 1%; 
    margin: 5%;
    color: #FAE1DD;
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

export const SearchToggle = styled.div`
    font-size: 0.7 em;
`;
export const Logo = styled.div`
    font-size:2em;
    font-weight: bold;
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


export const ConfirmCancel = styled(FlexRows)`
    justify-content: space-between; 
`;


export const RightCard = styled(BoxShadow)`
    padding: 4%;
    margin-bottom: 2%;
    background-color: white;
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
    text-align: center;
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

export const Performer = styled.div`
    background: rgb(63,94,251);
    background: radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`