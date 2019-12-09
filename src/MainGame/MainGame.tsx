/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'
import Square from './Square/Square';
import { SquareFootSharp } from '@material-ui/icons';

interface props {
}

interface IGame {
    square: {
        column: number;
        row: number;
        isChecker: boolean;
        checkerColor: 'white' | 'black' | undefined; 
    }
}

const MainGame: React.FC<props> = () => {
    const game: IGame[][] = Array.from({length: 8}, (v, columnsIndex) => Array.from({length: 8}, (v, rowsIndex) => {
        const checkerColor = columnsIndex <= 2 ? 'white' : columnsIndex >= 5 ? 'black' : undefined;
        const evenRow = rowsIndex%2 === 0;
        const isChecker = columnsIndex%2 === 0 ? evenRow : !evenRow; 
        return {
            square: {
                column: columnsIndex,
                row: rowsIndex,
                isChecker: isChecker,
                checkerColor: checkerColor,
            }
        }
    }))
    const rowStyle = css`
        display: flex;
        width: fit-content;
        margin: auto;
        width: 52vw;
        height: 6.5vw;
    `;
    return (
        <div css={css`width: fit-content;
        height: fit-content;
        margin: auto;`}>
            {game.map((column, columnIndex) => (
                <div css={rowStyle} key={columnIndex}>
                    {column.map((row, rowIndex) => <Square key={rowIndex} column={row.square.column} row={row.square.row} isChecker={row.square.isChecker} checkerColor={row.square.checkerColor} />)}
                </div>
            ))}
        </div>
    )
}
export default MainGame;