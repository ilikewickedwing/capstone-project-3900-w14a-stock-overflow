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

const PerformanceRow = ({pid, rowName,stocks, isItemSelected, handleClick}) => {
    const [open, setOpen] = React.useState(false);

    return (
      <React.Fragment>
        <TableRow
          hover
          tabIndex={-1}
          key={pid}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    color="primary"
                    checked={isItemSelected}
                    onChange={(event) => handleClick(event, pid)}
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
          <TableCell align="left" component="th" scope="row">
            {rowName}
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
                        <TableCell>Value</TableCell>
                        <TableCell>Profit/Loss($)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocks.map((e) => {
                    return (
                      <TableRow key={e.code}>
                        <TableCell align="left" >{e.code}</TableCell> 
                        <TableCell align="left" >${parseFloat(e.buyPrice).toFixed(2)}</TableCell>
                        <TableCell align="left" >${e.currPrice}</TableCell>
                        <TableCell align="left" >{e.changePer}%</TableCell>
                        <TableCell align="left" >{e.units}</TableCell>
                        {e.value < 0?(
													<TableCell align="left" >-${Math.abs(parseFloat(e.value)).toFixed(2)}</TableCell>
												):(
													<TableCell align="left" >${parseFloat(e.value).toFixed(2)}</TableCell>
												)}
                        {e.profitLoss < 0?(
													<TableCell align="left" >-${Math.abs(parseFloat(e.profitLoss)).toFixed(2)}</TableCell>
												):(
													<TableCell align="left" >${parseFloat(e.profitLoss).toFixed(2)}</TableCell>
												)}
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