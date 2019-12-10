/** @jsx jsx */
import React, { useEffect, useState } from 'react';
import { jsx, css } from '@emotion/core'
import Square from './Square/Square';
import produce from 'immer';

interface props {
    socket: SocketIOClient.Socket | undefined;
}


interface IGame {
    square: {
        column: number;
        row: number;
        isChecker: boolean;
        checkerColor: 'white' | 'black' | undefined;
        squareColor: 'white' | 'black';
        shouldHighlight: boolean;
    }
}

const gameInit: IGame[][] = Array.from({ length: 8 }, (v, rowIndex) => Array.from({ length: 8 }, (v, columnIndex) => {
    const checkerColor = rowIndex <= 2 ? 'white' : (rowIndex >= 5 ? 'black' : undefined);
    const evenRow = columnIndex % 2 === 0;
    const rowsAllowed = rowIndex <= 2 && rowIndex >= 5;
    const isChecker = (checkerColor !== undefined) && (rowIndex % 2 === 0 ? evenRow : !evenRow);
    return {
        square: {
            row: rowIndex,
            column: columnIndex,
            isChecker: isChecker,
            checkerColor: isChecker ? checkerColor : undefined,
            squareColor: columnIndex%2 === 0 ? rowIndex%2===0 ? 'black' : 'white' : rowIndex%2===0 ? 'white' : 'black',
            shouldHighlight: false
        }
    }
}))

console.log(gameInit)

const MainGame: React.FC<props> = (props) => {

    const { socket } = props;

    const [game, setGame] = useState<IGame[][]>(gameInit)

    useEffect(() => {
        if (socket) {
            socket.emit('move', { turn: 'black', board: JSON.stringify(game) })
            socket.on('moveEnd', ({ turn, board }: { turn: 'black' | 'white', board: IGame[][] }) => {
                console.log(`move end: \n ${turn}, ${board}`)
                setGame(board);
                setTimeout(() => {
                    socket.emit('move', { turn: turn === 'black' ? 'white' : 'black', board: JSON.stringify(game) })
                }, 2000)
            })
        }
    }, [socket])
    
    const rowStyle = css`
        display: flex;
        width: fit-content;
        margin: auto;
        width: 52vw;
        height: 6.5vw;
    `;

    const removeHighlight = () => {
        const newGame: IGame[][] = produce(game, draft => {
            game.map((row, rowIndex) => row.map((column, columnIndex) => draft[rowIndex][columnIndex].square.shouldHighlight = false))
        });
        setGame(newGame);
    }
    const onSquareClick = (col: number, row: number) => {
        if(!game[row][col].square.isChecker || game[row][col].square.checkerColor === 'white') return;
        console.log(`you clicked [col - ${col}, row - ${row}]`);
        // if king...
        if (row === 0) {
            return;
        }
        if (col === 0) {
            console.log(`check right - [${row-1}, ${col+1}]`);
            if(game[row-2][col+2].square.checkerColor === 'black') return;
            if(!game[row-2][col+2].square.isChecker) {
                const newGame: IGame[][] = produce(game, draft => {
                    draft[row-1][col+1].square.shouldHighlight = true;
                    draft[row-2][col+2].square.shouldHighlight = true;
                });
                setGame(newGame);
            }
            else {
                const newGame: IGame[][] = produce(game, draft => {
                    draft[row-1][col+1].square.shouldHighlight = true;
                });
                setGame(newGame);
            }
        } else if (col === 7) {
            console.log(`check left - [${row-1}, ${col-1}]`);
            if(game[row-2][col-2].square.checkerColor === 'black') return;
            if(!game[row-2][col-2].square.isChecker) {
                const newGame: IGame[][] = produce(game, draft => {
                    draft[row-1][col-1].square.shouldHighlight = true;
                    draft[row-2][col-2].square.shouldHighlight = true;
                });
                setGame(newGame);
            }
            else {
                const newGame: IGame[][] = produce(game, draft => {
                    draft[row-1][col-1].square.shouldHighlight = true;
                });
                setGame(newGame);
            }
        } else {
            console.log(`check left - [${row-1}, ${col-1}] and check right - [${row-1}, ${col+1}]`);
            if(col > 1 && col < 6 && row > 1) {
                const newGame: IGame[][] = produce(game, draft => {
                    draft[row-2][col-2].square.shouldHighlight = true;
                    draft[row-1][col+1].square.shouldHighlight = true;
                    draft[row-1][col-1].square.shouldHighlight = true;
                    draft[row-2][col+2].square.shouldHighlight = true;
                });
                setGame(newGame);
            }
            else {
                const newGame: IGame[][] = produce(game, draft => {
                    if(col === 7 || col === 6) {
                        draft[row-2][col-2].square.shouldHighlight = true;
                    }
                    if(col === 1 || col === 0) {
                        draft[row-2][col+2].square.shouldHighlight = true;
                    }
                    draft[row-1][col+1].square.shouldHighlight = true;
                    draft[row-1][col-1].square.shouldHighlight = true;
                });
                setGame(newGame);
            }
        }
    };

    return (
        <div css={css`width: fit-content;
        height: fit-content;
        margin: auto;`}>
            {game.map((row, rowIndex) => (
                <div css={rowStyle} key={rowIndex}>
                    {row.map((column, columnIndex) => <Square key={columnIndex} shouldHighlight={column.square.shouldHighlight} squareColor={column.square.squareColor} onSquareOut={() => removeHighlight()} onSquareClick={() => onSquareClick(column.square.column, column.square.row)} column={column.square.column} row={column.square.row} isChecker={column.square.isChecker} checkerColor={column.square.checkerColor} />)}
                </div>
            ))}
        </div>
    )
}
export default MainGame;