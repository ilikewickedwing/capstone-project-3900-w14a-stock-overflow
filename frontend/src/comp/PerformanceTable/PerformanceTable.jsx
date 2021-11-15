import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import axios from 'axios';
import { apiBaseUrl } from '../../comp/const';
import PerformanceRow from './PerformanceRow';

// layer 1= overview: portfolio name, total value and profit loss 
// layer 2 = stocks: code,name, buyprice, current price, change %, units, value, pro/loss

const PerformanceTable = ({portfolios,setPerfSelected}) => {
  const [selected, setSelected] = React.useState([]);
  const isSelected = (name) => selected.indexOf(name) !== -1;

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
    setPerfSelected(newSelected);
  }

    return (
        <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell />
              <TableCell align="left" style={{fontWeight:'bold'}}>Portfolio Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolios &&
            portfolios.map((info) =>{
              const isItemSelected = isSelected(info.pid);
              return (
                <PerformanceRow 
                  key={info.name} 
                  pid={info.pid} 
                  rowName={info.name} 
                  stocks={info.stocks} 
                  isItemSelected={isItemSelected}
                  handleClick = {handleClick} />
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
}

export default PerformanceTable;