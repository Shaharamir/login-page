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
            squareColor: columnIndex % 2 === 0 ? rowIndex % 2 === 0 ? 'black' : 'white' : rowIndex % 2 === 0 ? 'white' : 'black',
            shouldHighlight: false
        }
    }
}))

console.log(gameInit)

const MainGame: React.FC<props> = (props) => {

    const { socket } = props;

    const [game, setGame] = useState<IGame[][]>(gameInit);
    const [isAlreadyClicked, setIsAlreadyClicked] = useState(false);
    const [currentClicked, setCurrentClicked] = useState<{row: number, col: number} | undefined>(undefined);
    const getAvailableSteps = () => {
        let a = [];
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(game[i][j].square.shouldHighlight) {
                    a.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        return a;
    }
    interface IAvailable {
        row: number;
        col: number;
    } 
    const [availableSteps, setAvailableSteps] = useState<IAvailable[]>([]);
    useEffect(() => {
        setAvailableSteps(getAvailableSteps())
    }, [game])
    console.log(availableSteps);

    useEffect(() => {
        if (socket) {
            socket.on('moveEnd', ({ turn, board }: { turn: 'black' | 'white', board: IGame[][] }) => {
                console.log(`move end: \n ${turn}, ${board}`)
                setGame(board);
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
        setIsAlreadyClicked(false);
        setCurrentClicked(undefined);
    }

    const checkIfNextStepIsTakenByYourself = (nextRow: number, nextCol: number): boolean => {
        return game[nextRow][nextCol].square.checkerColor === 'black';
    }

    const checkIfNextStepIsTakenByEnemy = (nextRow: number, nextCol: number): boolean => {
        return game[nextRow][nextCol].square.checkerColor === 'white';
    }

    const checkifNextNextStepIsTaken = (nextNextRow: number, nextNextCol: number) => {
        return game[nextNextRow][nextNextCol].square.checkerColor === 'white'
            || game[nextNextRow][nextNextCol].square.checkerColor === 'black';
    }


    const onSquareClick = (col: number, row: number) => {
        if(isAlreadyClicked) {
            if(currentClicked && currentClicked.row === row && currentClicked.col === col) {
                removeHighlight();
                return;
            }
            else if (availableSteps.filter(x => x.row === row && x.col === col).length > 0) {
                if(socket && currentClicked) {
                    const current = {
                        row: currentClicked.row,
                        col: currentClicked.col,
                    }
                    const target = {
                        row: row, 
                        col: col,
                    }
                    // turn: turn === 'black' ? 'white' : 'black'
                    setIsAlreadyClicked(false);
                    setCurrentClicked(undefined);
                    socket.emit('move', {turn: 'black',current ,target,  board: JSON.stringify(game) })
                }
                return;
            }
            else {
                return;
            }
        }
        else if (!game[row][col].square.isChecker || game[row][col].square.checkerColor === 'white') return;
        console.log(`you clicked [col - ${col}, row - ${row}]`);
        // if king...
        if (row === 0) {
            return;
        }
 
        if (col === 0) {
            const stepsAvailable = {
                nextRight: {
                    row: row - 1,
                    col: col + 1
                },
                nextNextRight: {
                    row: row - 2,
                    col: col + 2
                }
            }
            //next step available - {row-1}, {col+1};
            // next next step available - {row-2}, {col+2};
            console.log(`check right - [${row - 1}, ${col + 1}]`);
            const newGame: IGame[][] = produce(game, draft => {
                const isNextStepRightTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isNextStepRightTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isnextNextStepTaken = row <= 1 ? false : checkifNextNextStepIsTaken(stepsAvailable.nextNextRight.row, stepsAvailable.nextNextRight.col);
                if (isNextStepRightTakenByYouself) return;
                if (isNextStepRightTakenByEnemy && isnextNextStepTaken) return;
                if (isNextStepRightTakenByEnemy && !isnextNextStepTaken) {
                    draft[stepsAvailable.nextNextRight.row][stepsAvailable.nextNextRight.col].square.shouldHighlight = true;
                }
                else {
                    draft[stepsAvailable.nextRight.row][stepsAvailable.nextRight.col].square.shouldHighlight = true;
                }
            })
            setGame(newGame);
            setIsAlreadyClicked(true);
            setCurrentClicked({row: row, col: col});
        } else if (col === 7) {
            const stepsAvailable = {
                nextLeft: {
                    row: row - 1,
                    col: col - 1
                },
                nextNextLeft: {
                    row: row - 2,
                    col: col - 2
                }
            }
            //next step available - {row-1}, {col-1};
            // next next step available - {row-2}, {col-2};
            console.log(`check left - [${row - 1}, ${col - 1}]`);
            const newGame: IGame[][] = produce(game, draft => {
                const isNextStepLeftTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isNextStepLeftTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isnextNextLeftStepTaken = row <= 1 ? false : checkifNextNextStepIsTaken(stepsAvailable.nextNextLeft.row, stepsAvailable.nextNextLeft.col);
                if (isNextStepLeftTakenByYouself) return;
                if (isNextStepLeftTakenByEnemy && isnextNextLeftStepTaken) return;
                if (isNextStepLeftTakenByEnemy && !isnextNextLeftStepTaken) {
                    draft[stepsAvailable.nextNextLeft.row][stepsAvailable.nextNextLeft.col].square.shouldHighlight = true;
                }
                else {
                    draft[stepsAvailable.nextLeft.row][stepsAvailable.nextLeft.col].square.shouldHighlight = true;
                }
            })
            setGame(newGame);
            setIsAlreadyClicked(true);
            setCurrentClicked({row: row, col: col});
        }
        else if (col === 6) {
            const stepsAvailable = {
                nextLeft: {
                    row: row - 1,
                    col: col - 1
                },
                nextRight: {
                    row: row - 1,
                    col: col + 1
                },
                nextNextLeft: {
                    row: row - 2,
                    col: col - 2
                }
            }
            const newGame: IGame[][] = produce(game, draft => {
                const isNextStepLeftTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isNextStepLeftTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isnextNextLeftStepTaken = row <= 1 ? false : checkifNextNextStepIsTaken(stepsAvailable.nextNextLeft.row, stepsAvailable.nextNextLeft.col);
                if (isNextStepLeftTakenByYouself) return;
                if (isNextStepLeftTakenByEnemy && isnextNextLeftStepTaken) return;
                if (isNextStepLeftTakenByEnemy && !isnextNextLeftStepTaken) {
                    draft[stepsAvailable.nextNextLeft.row][stepsAvailable.nextNextLeft.col].square.shouldHighlight = true;
                }
                else {
                    draft[stepsAvailable.nextLeft.row][stepsAvailable.nextLeft.col].square.shouldHighlight = true;
                }
                const isNextStepRightTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isNextStepRightTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                if (isNextStepRightTakenByYouself) return;
                if (isNextStepRightTakenByEnemy) return;
                draft[stepsAvailable.nextRight.row][stepsAvailable.nextRight.col].square.shouldHighlight = true;
            })
            setGame(newGame);
            setIsAlreadyClicked(true);
            setCurrentClicked({row: row, col: col});
        }
        else if (col === 1) {
            const stepsAvailable = {
                nextLeft: {
                    row: row - 1,
                    col: col - 1
                },
                nextRight: {
                    row: row - 1,
                    col: col + 1
                },
                nextNextRight: {
                    row: row - 2,
                    col: col + 2
                }
            }
            const newGame: IGame[][] = produce(game, draft => {
                const isNextStepRightTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isNextStepRightTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isnextNextStepTaken = row <= 1 ? false : checkifNextNextStepIsTaken(stepsAvailable.nextNextRight.row, stepsAvailable.nextNextRight.col);
                if (isNextStepRightTakenByYouself) return;
                if (isNextStepRightTakenByEnemy && isnextNextStepTaken) return;
                if (isNextStepRightTakenByEnemy && !isnextNextStepTaken) {
                    draft[stepsAvailable.nextNextRight.row][stepsAvailable.nextNextRight.col].square.shouldHighlight = true;
                }
                else {
                    draft[stepsAvailable.nextRight.row][stepsAvailable.nextRight.col].square.shouldHighlight = true;
                }
                const isNextStepLeftTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isNextStepLeftTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                if (isNextStepLeftTakenByYouself) return;
                if (isNextStepLeftTakenByEnemy) return;
                draft[stepsAvailable.nextLeft.row][stepsAvailable.nextLeft.col].square.shouldHighlight = true;
            })
            setGame(newGame);
            setIsAlreadyClicked(true);
            setCurrentClicked({row: row, col: col});
        }
        else {
            const stepsAvailable = {
                nextLeft: {
                    row: row - 1,
                    col: col - 1
                },
                nextRight: {
                    row: row - 1,
                    col: col + 1
                },
                nextNextLeft: {
                    row: row - 2,
                    col: col - 2
                },
                nextNextRight: {
                    row: row - 2,
                    col: col + 2
                }
            }
            const newGame: IGame[][] = produce(game, draft => {
                const isNextStepRightTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isNextStepRightTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextRight.row, stepsAvailable.nextRight.col);
                const isnextNextStepTaken = row <= 1 ? false : checkifNextNextStepIsTaken(stepsAvailable.nextNextRight.row, stepsAvailable.nextNextRight.col);
                if (isNextStepRightTakenByYouself) return;
                if (isNextStepRightTakenByEnemy && isnextNextStepTaken) return;
                if (isNextStepRightTakenByEnemy && !isnextNextStepTaken) {
                    draft[stepsAvailable.nextNextRight.row][stepsAvailable.nextNextRight.col].square.shouldHighlight = true;
                }
                else {
                    draft[stepsAvailable.nextRight.row][stepsAvailable.nextRight.col].square.shouldHighlight = true;
                }
                const isNextStepLeftTakenByYouself = checkIfNextStepIsTakenByYourself(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isNextStepLeftTakenByEnemy = checkIfNextStepIsTakenByEnemy(stepsAvailable.nextLeft.row, stepsAvailable.nextLeft.col);
                const isnextNextLeftStepTaken = row <= 1 ? false : checkifNextNextStepIsTaken(stepsAvailable.nextNextLeft.row, stepsAvailable.nextNextLeft.col);
                if (isNextStepLeftTakenByYouself) return;
                if (isNextStepLeftTakenByEnemy && isnextNextLeftStepTaken) return;
                if (isNextStepLeftTakenByEnemy && !isnextNextLeftStepTaken) {
                    draft[stepsAvailable.nextNextLeft.row][stepsAvailable.nextNextLeft.col].square.shouldHighlight = true;
                }
                else {
                    draft[stepsAvailable.nextLeft.row][stepsAvailable.nextLeft.col].square.shouldHighlight = true;
                }
            });
            setGame(newGame);
            setIsAlreadyClicked(true);
            setCurrentClicked({row: row, col: col});
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