import React from 'react'; 
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import { apiBaseUrl } from './const';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@material-ui/core/Button';
import { AlertContext } from '../App';
import Select from '@mui/material/Select';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center'
  };

const StockSelect = ({stockCode, name,pid, setClose}) => {
    const alert = React.useContext(AlertContext);
    const token = localStorage.getItem('token');

    const [price, setPrice] = React.useState("");
    const [quantity, setQuantity] = React.useState(0);
    const [brokerage, setBroker] = React.useState('');
    const [flag, setFlag] = React.useState(0);

    // modal states 
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleChange = (e) => setFlag(e.target.value);
    

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            if (name === "Watchlist"){
                await axios.post(`${apiBaseUrl}/user/stocks/add`, 
                    {token, pid, stock: stockCode, price: 0, quantity: 0});
                setClose();
            } else {
                handleOpen();
            }
        } catch (e){
            alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
        }   
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            var floatPrice = parseFloat(price); 
            var intQuantity = parseInt(quantity);
            await axios.post(`${apiBaseUrl}/user/stocks/add`, 
                {token, pid, stock: stockCode, price: floatPrice, quantity: intQuantity, brokerage, flag});
            handleClose();
            setClose();
        } catch (e){
            alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
        }   
    }

    return (
        <div>
            <MenuItem onClick={handleAddStock} style={{padding:"5px"}}>
                {name}
            </MenuItem>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Add New Stock
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <TextField type="number" required variant="standard" label="price"
                            onChange={e => setPrice(e.target.value)}/>
                        <br />
                        <TextField style={{marginBottom:"2%"}} type="number" required variant="standard" label="quantity"
                        onChange={e => setQuantity(e.target.value)}/>
                         <br />
                         select brokerage fee option
                         <Select
                            style={{marginRight:"3%"}}
                            value={flag}
                            onChange={handleChange}
                            label="Select Option"
                            displayEmpty
                        >
                            <MenuItem style={{width:"100%"}} value={1}>Percentage (_%) </MenuItem>
                            <MenuItem style={{width:"100%"}} value={0}>Flat Fee ($USD)</MenuItem>
                        </Select>
                        <TextField style = {{marginBottom:'5%'}} type="number" required variant="standard" label="Brokerage fee (USD$)"
                        onChange={e => setBroker(e.target.value)}/>
                        <Button style={{margin: "10px 0", width: "100%"}} type='submit' onClick={handleSubmit}>
                            Add Stock
                        </Button>
                    </Typography>
                </Box>
            </Modal>
        </div> 
    );
};

export default StockSelect;