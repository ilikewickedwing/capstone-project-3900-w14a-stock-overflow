import React from 'react'; 
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import { apiBaseUrl } from './const';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@material-ui/core/Button';

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
  };

const StockSelect = ({stockCode, name,pid, setClose}) => {
    const token = localStorage.getItem('token');

    const [price, setPrice] = React.useState("");
    const [quantity, setQuantity] = React.useState(0);

    // modal states 
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            if (name === "Watchlist"){
                await axios.post(`${apiBaseUrl}/user/stocks/add`, 
                    {token, pid, stock: stockCode, price: 0, quantity: 0});
                console.log("added to watchlist");
                setClose();
            } else {
                handleOpen();
            }
        } catch (e){
            alert(`Status Code ${e.response.status} : ${e.response.data.error}`);
        }   
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            var floatPrice = parseFloat(price); 
            var intQuantity = parseInt(quantity);
            await axios.post(`${apiBaseUrl}/user/stocks/add`, 
                {token, pid, stock: stockCode, price: floatPrice, quantity: intQuantity});
            handleClose();
            setClose();
        } catch (e){
            alert(`Status Code ${e.response.status} : ${e.response.data.error}`);
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
                        <TextField type="number" required variant="standard" label="quantity"
                        onChange={e => setQuantity(e.target.value)}/>
                         <br />
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