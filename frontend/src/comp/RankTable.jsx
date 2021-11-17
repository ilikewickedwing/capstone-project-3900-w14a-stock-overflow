import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useHistory } from "react-router";

const RankTable = ({rows, myRanking}) => {
  const history = useHistory();
    return (
    <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
          <TableRow>
            <TableCell style={{fontWeight:"bold"}}>User</TableCell>
            <TableCell style={{fontWeight:"bold"}} align="right">% Performance</TableCell>
            <TableCell style={{fontWeight:"bold"}} align="right">Rank</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
          {rows.map((row) => (
            <TableRow
            hover
            key={row.name}
            onClick={()=> history.push(`/user/${row.name}`)}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">@{row.name}</TableCell>
              <TableCell align="right">{parseFloat(row.performance).toFixed(2)}%</TableCell>
              <TableCell align="right">#{row.rank}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell component="th" scope="row" style={{fontWeight:"bold"}}>My Ranking</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">@{myRanking.name}</TableCell>
            <TableCell align="right">{parseFloat(myRanking.performance).toFixed(2)}%</TableCell>
            <TableCell align="right">#{myRanking.rank}</TableCell>
          </TableRow> 
          </TableBody>
        </Table>
    </TableContainer>
    );
}

export default RankTable;