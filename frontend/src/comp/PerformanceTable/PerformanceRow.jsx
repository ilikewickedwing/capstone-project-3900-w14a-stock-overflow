import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Checkbox from "@mui/material/Checkbox";

const PerformanceRow = ({row}) => {
    const [selected, setSelected] = React.useState([]);
    console.log(row);
    const [open, setOpen] = React.useState(false);

    const isSelected = (name) => selected.indexOf(name) !== -1;
    const isItemSelected = isSelected(row.name);

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
      };
  
    return (
      <React.Fragment>
        <TableRow 
        sx={{ '& > *': { borderBottom: 'unset' } }}
        hover
        tabIndex={-1}
        // selected={isItemSelected}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    // checked={isItemSelected}
                    // onClick={(event) => handleClick(event, row.name)}
                />
            </TableCell>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Buy</TableCell>
                        <TableCell>Curr. Price</TableCell>
                        <TableCell>Change(%)</TableCell>
                        <TableCell>Units</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Profit/Loss($)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.stocks.map((e) => {
                    return (
                      <TableRow key={e.stock}>
                        <TableCell align="center" >{e.code}</TableCell> 
                        <TableCell align="center" >${e.buyPrice}</TableCell>
                        <TableCell align="center" >${e.currPrice}</TableCell>
                        <TableCell align="center" >{e.changePer}%</TableCell>
                        <TableCell align="center" >{e.units}</TableCell>
                        <TableCell align="center" >${e.value}</TableCell>
                        <TableCell align="center" >${e.profitLoss}</TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }
  
 export default PerformanceRow; 