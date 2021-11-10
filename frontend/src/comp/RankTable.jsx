import * as React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const RankTable = ({rows, myRanking}) => {
    return (
    <TableContainer component={Paper}>
        <Table aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Friend</TableCell>
                <TableCell align="right">% Peformance</TableCell>
                <TableCell align="right">Rank</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {rows.map((row) => (
                <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell component="th" scope="row">@{row.name}</TableCell>
                <TableCell align="right">{row.performance}%</TableCell>
                <TableCell align="right">#{row.rank}</TableCell>
                </TableRow>
            ))}
            my ranking
            <TableRow>
                <TableCell component="th" scope="row">@{myRanking.name}</TableCell>
                <TableCell align="right">{myRanking.performance}</TableCell>
                <TableCell align="right">#{myRanking.rank}</TableCell>
            </TableRow> 
            </TableBody>
        </Table>
    </TableContainer>
    );
}

export default RankTable;