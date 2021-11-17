import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import { visuallyHidden } from "@mui/utils";
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@material-ui/core/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import axios from "axios";
import { apiBaseUrl } from '../comp/const';
import { useParams } from 'react-router-dom';
import { AlertContext } from "../App";

function createData(code, name, buyPrice, currPrice, changePer, units, value, profitLoss) {
  return {
    code,
    name,
    buyPrice,
    currPrice,
    changePer,
    units,
    value,
    profitLoss,
  };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "code",
    label: "Code"
  },
  {
    id: "name",
    label: "Name"
  },
  {
    id: "buyPrice",
    label: "Buy Price"
  },
  {
    id: "currPrice",
    label: "Current Price"
  },
  {
    id: "changePer",
    label: "Change (%)"
  },
  {
    id: "units",
    label: "Units"
  },
  {
    id: "value",
    label: "Value"
  },
  {
    id: "profitLoss",
    label: "Profit/ Loss"
  },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts"
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align='left'
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
};

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

const EnhancedTableToolbar = (props) => {
  const alert = React.useContext(AlertContext);
  const { numSelected, selected, load, isFriend } = props;
  
  const { pid } = useParams();
  const token = localStorage.getItem('token');

  const [price, setPrice] = React.useState("");
  const [quantity, setQuantity] = React.useState(0);
  const [brokerage, setBroker] = React.useState('');
  const [flag, setFlag] = React.useState(0);

  // modal states 
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // select options : sell or buy ; default sell
  const [option, setOption] = React.useState(0);

  const handleChange = (e) => {
    setOption(e.target.value);
  }
  
  // handle flag change 
  const handleFlag = (e) => {
    setFlag(e.target.value);
  }

  React.useEffect(() => {
    getDefaultBrokerage();
  },[])

    // grab the current default brokerage fee
    const getDefaultBrokerage = async ()=> {
      try {
      const res = await axios.get(`${apiBaseUrl}/user/getDefBroker?token=${token}`);
      setBroker(res.data.defBroker.defBroker); 
      setFlag(res.data.defBroker.brokerFlag);
      
      } catch (e) {
      alert(`Status Code ${e.status} : ${e.response.data.error}`,'error');
      }
  }

  const editClick = async () => {
    handleOpen();
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiBaseUrl}/user/stocks/edit`, {
        token,
        pid,
        stock: selected[0],
        price: parseInt(price),
        quantity:parseInt(quantity),
        option: option,
        brokerage,
        flag
      })
      load();
    } catch (e){
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }
    handleClose();
  }

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            )
        })
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
        </Typography>
      )}
      {numSelected === 1 && isFriend !== 1 &&
        <Tooltip title="Edit">
          <IconButton onClick={editClick}>
            <EditIcon /> 
          </IconButton>
        </Tooltip>
      }
      <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
      >
          <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                  Edit Stock: {selected[0]}
              </Typography>
              <div style={{display:'flex', flexDirection:'column'}}>
                <Select
                  style={{width: '100%'}}
                  value={option}
                  onChange={handleChange}
                  label="Select Buy or Sell"
                  displayEmpty
                >
                  <MenuItem style={{width:"100%"}} value={1}>Buy</MenuItem>
                  <MenuItem style={{width:"100%"}} value={0}>Sell</MenuItem>
                </Select>
                  <TextField type="number" required variant="standard" label="price"
                      onChange={e => setPrice(e.target.value)}/>
                  <TextField type="number" required variant="standard" label="quantity"
                  onChange={e => setQuantity(e.target.value)}/>
                  <br />
                  <Select
                          style={{marginRight:"3%"}}
                          value={flag}
                          onChange={handleFlag}
                          label="Select Option"
                          displayEmpty
                      >
                          <MenuItem style={{width:"100%"}} value={1}>Percentage (_%) </MenuItem>
                          <MenuItem style={{width:"100%"}} value={0}>Flat Fee ($USD)</MenuItem>
                      </Select>
                      <TextField  type="number" required variant="standard" label="Brokerage fee (USD$)"
                      onChange={e => setBroker(e.target.value)}/>
                  {
                    option?   
                    <Button style={{margin: "10px 0", width: "100%"}} type='submit' onClick={handleEditSubmit}>
                      Buy Stock
                    </Button>:
                    <Button style={{margin: "10px 0", width: "100%"}} type='submit' onClick={handleEditSubmit}>
                      Sell Stock
                    </Button>
                  }
              </div> 
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              

              </Typography>
          </Box>
      </Modal>
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.array.isRequired,
  load: PropTypes.func.isRequired,
  isFriend: PropTypes.number
};

export default function PfTable({stocks, load, setGraphSelected, isFriend}) {
  const alert = React.useContext(AlertContext);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("prices");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState([]);

  const [totalProf, setProf] = React.useState(0);
  const [totalValue, setValue] =React.useState(0);


  React.useEffect(() => {
    loadStocks();
  },[stocks]);

  const loadStocks = async () => {
    if (stocks.length === 0) {
      setRows([]);
      return;
    }
    const getNames = stocks.map(x=>x.stock);
    const stockNames = getNames.join(',');
    try {
      const request = await axios.get(`${apiBaseUrl}/stocks/info?type=1&stocks=${stockNames}`);
      let apiInfo = request.data.data.quotes.quote;
      if (!Array.isArray(apiInfo)) {
        apiInfo = [apiInfo];
      }
      
      let stockRows = [];
      let totalProfit = 0; 
      let totalVal = 0; 
      for (let i = 0; i < stocks.length; i++) {
        const inf = apiInfo[i];
        const totalPrice = stocks[i].quantity * inf.last;
        const profitLoss = totalPrice - (stocks[i].avgPrice * stocks[i].quantity);
        const changePer = (inf.last - stocks[i].avgPrice) / stocks[i].avgPrice * 100;
        stockRows.push(createData(stocks[i].stock, inf.description, stocks[i].avgPrice, inf.last.toFixed(2), changePer.toFixed(2),stocks[i].quantity, totalPrice.toFixed(2), profitLoss.toFixed(2)));
        totalProfit = totalProfit + profitLoss;
        totalVal = totalValue + totalPrice;
      }
      setRows(stockRows);
      setProf(totalProfit);
      setValue(totalVal);
      
    } catch (e) {
      alert(`Status Code ${e.response.status} : ${e.response.data.error}`,'error');
    }

  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.code);
      setSelected(newSelecteds);
      setGraphSelected(newSelecteds);
      return;
    }
    setSelected([]);
    setGraphSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    setGraphSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length}
          selected={selected} 
          load = {load}
          isFriend={isFriend}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size= "small"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.code);
                  const labelId = `enhanced-table-checkbox-${index}`;
									const rowValue = parseFloat(row.value);
									const profLoss = parseFloat(row.profitLoss);
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.code)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.code}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.code}
                      </TableCell>
                      <TableCell align="left" >{row.name}</TableCell>
                      <TableCell align="left" >${parseFloat(row.buyPrice).toFixed(2)}</TableCell>
                      <TableCell align="left" >${parseFloat(row.currPrice).toFixed(2)}</TableCell>
                      <TableCell align="left" >{parseFloat(row.changePer).toFixed(2)}%</TableCell>
                      <TableCell align="left" >{parseFloat(row.units).toFixed(2)}</TableCell>
											{rowValue < 0?(
                        <TableCell align="left" >-${Math.abs(rowValue).toFixed(2)}</TableCell>
                      ):(
                        <TableCell align="left" >${parseFloat(rowValue).toFixed(2)}</TableCell>
                      )}
											{profLoss < 0?(
                        <TableCell align="left" >-${Math.abs(profLoss).toFixed(2)}</TableCell>
                      ):(
                        <TableCell align="left" >${parseFloat(profLoss).toFixed(2)}</TableCell>
                      )}
                    </TableRow>
                  );
                })}
               <TableRow hover>
                      <TableCell>Total:</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell align="left"></TableCell>
                      <TableCell align="left" ></TableCell>
                      <TableCell></TableCell>
                      <TableCell>${totalValue.toFixed(2)}</TableCell>
                      <TableCell align="left" >${totalProf.toFixed(2)}</TableCell>
                    </TableRow>
              {emptyRows > 0 && (
                <TableRow
                >
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
