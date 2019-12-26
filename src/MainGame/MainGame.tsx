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
        isKing: boolean;
    }
}

const gameInit: IGame[][] = Array.from({ length: 8 }, (v, rowIndex) => Array.from({ length: 8 }, (v, columnIndex) => {
    console.log('rendered again');
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
            shouldHighlight: false,
            isKing: false,
        }
    }
}));

const MainGame: React.FC<props> = (props) => {
    const getAvailableSteps = () => {
        let coords = [];
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(game[i][j].square.shouldHighlight) {
                    coords.push({
                        row: i,
                        col: j
                    })
                }
            }
        }
        return coords;
    }
    const moveChecker = (currentGame: IGame[][], current: {row: number, col: number}, target: {row: number, col: number}) => {
        printBoard(currentGame);
        console.log(`From: ${current.row},${current.col} To: ${target.row},${target.col}`);
        console.log(`------------------------------`);
        const newGame: IGame[][] = produce(currentGame, draft => {
            //if eat
            if(Math.abs(current.row - target.row) === 2) {
                const eatedRow = (current.row+target.row)/2
                const eatedCol = (current.col+target.col)/2
                draft[eatedRow][eatedCol].square.isChecker = false;
                draft[eatedRow][eatedCol].square.checkerColor = undefined;
                draft[eatedRow][eatedCol].square.isKing = false;
            }
            draft.forEach((row, rowIndex) => 
                row.forEach((column, columnIndex) => 
                    draft[rowIndex][columnIndex].square.shouldHighlight = false
                )
            );
            const currentChecker = draft[current.row][current.col].square;
            draft[current.row][current.col].square.isChecker = false;
            draft[target.row][target.col].square.isChecker = true;
            draft[target.row][target.col].square.checkerColor = currentChecker.checkerColor;
            if(target.row === 7 && currentChecker.checkerColor === 'white' || currentChecker.isKing) {
                draft[target.row][target.col].square.isKing = true;
            }
            else if(target.row === 0 && currentChecker.checkerColor === 'black' || currentChecker.isKing) {
            draft[target.row][target.col].square.isKing = true;
            }
            draft[current.row][current.col].square.checkerColor = undefined;
            draft[current.row][current.col].square.isKing = false;
            return draft;
        });
        return newGame;
    }
 
    const { socket } = props;
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [turn, setTurn] = useState(false);;
    const [game, setGame] = useState<IGame[][]>(gameInit);
    const [isAlreadyClicked, setIsAlreadyClicked] = useState(false);
    const [currentClicked, setCurrentClicked] = useState<ICoords | undefined>(undefined);
    const [availableSteps, setAvailableSteps] = useState<ICoords[]>([]);
    useEffect(() => {
        setAvailableSteps(getAvailableSteps())
    }, [game])

    const checkIfClicked = (row: number, col: number) => {
        return currentClicked ? currentClicked.row === row && currentClicked.col === col : false
    }

    useEffect(() => {
        if(socket) {
            socket.off('moveEnd');
            socket.on('moveEnd', ({ current, target }: { current: ICoords, target: ICoords}) => {
                setGame(moveChecker(game, current, target));
                setTurn(true);
            });

            socket.off('gameStart');
            socket.on('gameStart', (turn: string) => {
                setIsGameStarted(true);
                setTurn(turn === socket.id);
            });
        }
    }, [socket, game]);

    const rowStyle = css`
        display: flex;
        width: fit-content;
        margin: auto;
        width: 52vw;
        height: 6.5vw;
    `;

    const removeHighlight = () => {
        const newGame: IGame[][] = produce(game, draft => {
            draft.map((row, rowIndex) => row.map((column, columnIndex) => draft[rowIndex][columnIndex].square.shouldHighlight = false))
        });
        setGame(newGame);
        setIsAlreadyClicked(false);
        setCurrentClicked(undefined);
    }

    interface ICoords {
        row: number;
        col: number;
    }

    const isStepTaken = (coords: ICoords | null) => {
        if(coords) {
            return game[coords.row][coords.col].square.isChecker;
        }
        else {
            return false
        }
    }

    const playerColor = (coords: ICoords) => {
        if(game[coords.row][coords.col].square.checkerColor) {
            return game[coords.row][coords.col].square.checkerColor;
        };
    }


    const onSquareClick = (col: number, row: number) => {
        if(isAlreadyClicked) {
            //if clicked himslef
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
                    setGame(moveChecker(game, current, target));
                    setTurn(false);
                    socket.emit('move', { current ,target });
                }
                return;
            }
            else {
                return;
            }
        }
        else if (!game[row][col].square.isChecker || game[row][col].square.checkerColor === 'white') return;
        console.log(`you clicked [col - ${col}, row - ${row}]`);

        const checkStepsAvailable = (next: ICoords, nextNext: ICoords | null, game: IGame[][]): IGame[][] => {
            const isNextStepTaken = isStepTaken(next);
            const isNextNextStepTaken = isStepTaken(nextNext);
            const nextPlayerColor = playerColor(next);
            let isSucceed = false;
            const newGame: IGame[][] = produce(game, draft => {
                if(isNextStepTaken) {
                    if(nextPlayerColor === 'black') {
                        return;
                    }
                    else if(nextPlayerColor === 'white') {
                        if(isNextNextStepTaken) {
                            return;
                        }
                        else {
                            if(nextNext) {
                                draft[nextNext.row][nextNext.col].square.shouldHighlight = true;
                                isSucceed = true;
                            }
                        }
                    }
                }
                else {
                    draft[next.row][next.col].square.shouldHighlight = true;
                    isSucceed = true;
                }
            })
            if(isSucceed) {
                setIsAlreadyClicked(true);
                setCurrentClicked({row: row, col: col});
            }
            return newGame
        }

        // if king...
        if(game[row][col].square.isKing) {
            if(row === 0 && col === 0) {
                const stepsAvailable = {
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousPreviousRight: {
                        row: row + 2,
                        col: col + 2
                    }
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.previousRight, stepsAvailable.previousPreviousRight, game);
                setGame(updatedBoard)
            }
            else if(row === 0 && col === 6) {
                const stepsAvailable = {
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.previousRight, null, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, updatedBoard);
                setGame(updatedBoardLatest); 
            }
            else if(row === 0) {
                const stepsAvailable = {
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousPreviousRight: {
                        row: row + 2,
                        col: col + 2
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.previousRight, stepsAvailable.previousPreviousRight, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, updatedBoard);
                setGame(updatedBoardLatest); 
            }
            else if(row === 7 && col === 7) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game);
                setGame(updatedBoard)
            }
            else if(row === 7 && col === 1) {
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
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, null, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, updatedBoard);
                setGame(updatedBoardLatest); 
            }
            else if(row === 1 && col === 1) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousPreviousRight: {
                        row: row + 2,
                        col: col + 2
                    },
                }
                const nextLeft = checkStepsAvailable(stepsAvailable.nextLeft, null, game)
                const nextRight = checkStepsAvailable(stepsAvailable.nextRight, null, nextLeft)
                const previousLeft = checkStepsAvailable(stepsAvailable.previousLeft, null, nextRight)
                const previousRight = checkStepsAvailable(stepsAvailable.previousRight, stepsAvailable.previousPreviousRight, previousLeft)
                setGame(previousRight);
            }
            else if(row === 1) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousPreviousRight: {
                        row: row + 2,
                        col: col + 2
                    },
                }
                const nextLeft = checkStepsAvailable(stepsAvailable.nextLeft, null, game)
                const nextRight = checkStepsAvailable(stepsAvailable.nextRight, null, nextLeft)
                const previousLeft = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, nextRight)
                const previousRight = checkStepsAvailable(stepsAvailable.previousRight, stepsAvailable.previousPreviousRight, previousLeft)
                setGame(previousRight);
            }
            else if(row === 7) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextNextRight: {
                        row: row - 2,
                        col: col + 2
                    },
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else if(col === 0 && row === 6) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextNextRight: {
                        row: row - 2,
                        col: col + 2
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, game)
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.previousRight, null, updatedBoard)
                setGame(updatedBoardLatest);
            }
            else if(col === 6 && row === 6) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                }
                const nextLeft = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game)
                const nextRight = checkStepsAvailable(stepsAvailable.nextRight, null, nextLeft)
                const previousLeft = checkStepsAvailable(stepsAvailable.previousLeft, null, nextRight)
                const previousRight = checkStepsAvailable(stepsAvailable.previousRight, null, previousLeft)
                setGame(previousRight);
            }
            else if (col === 6) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                }
                const nextLeft = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game)
                const nextRight = checkStepsAvailable(stepsAvailable.nextRight, null, nextLeft)
                const previousLeft = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, nextRight)
                const previousRight = checkStepsAvailable(stepsAvailable.previousRight, null, previousLeft)
                setGame(previousRight);
            }
            else if(col === 1) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextNextRight: {
                        row: row - 2,
                        col: col + 2
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.previousRight, null, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, updatedBoard);
                setGame(updatedBoardLatest); 
            }
            else if(col === 0) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextNextRight: {
                        row: row - 2,
                        col: col + 2
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousPreviousRight: {
                        row: row + 2,
                        col: col + 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.previousRight, stepsAvailable.previousPreviousRight, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else if(col === 7 && row === 1) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, null, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else if(col === 7) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                    previousLeft: {
                        row: row + 1,
                        col: col - 1
                    },
                    previousPreviousLeft: {
                        row: row + 2,
                        col: col - 2
                    },
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextNextRight: {
                        row: row - 2,
                        col: col + 2
                    },
                    previousRight: {
                        row: row + 1,
                        col: col + 1
                    },
                    previousPreviousRight: {
                        row: row + 2,
                        col: col + 2
                    },
                }
                const nextLeft = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game)
                const nextRight = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, nextLeft)
                const previousLeft = checkStepsAvailable(stepsAvailable.previousLeft, stepsAvailable.previousPreviousLeft, nextRight)
                const previousRight = checkStepsAvailable(stepsAvailable.previousRight, stepsAvailable.previousPreviousRight, previousLeft)
                setGame(previousRight);
            }
        }
        else {
            if(col === 0) {
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
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, game);
                setGame(updatedBoard)
            }
            else if (col === 7) {
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
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game);
                setGame(updatedBoard);
            }
            else if (col === 1 && row !== 1) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextNextRight: {
                        row: row - 2,
                        col: col + 2
                    },
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    }
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextLeft, null, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else if (col === 6) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                    nextNextLeft: {
                        row: row - 2,
                        col: col - 2
                    },
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    }
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextRight, null, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else if (row === 1 && col === 0) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextRight, null, game);
                setGame(updatedBoard);
    
            }
            else if (row === 1 && col === 7) {
                const stepsAvailable = {
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, null, game);
                setGame(updatedBoard);
    
            }
            else if(row === 1) {
                const stepsAvailable = {
                    nextRight: {
                        row: row - 1,
                        col: col + 1
                    },
                    nextLeft: {
                        row: row - 1,
                        col: col - 1
                    },
                }
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextLeft, null, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextRight, null, updatedBoard);
                setGame(updatedBoardLatest);
            }
            else {
                if(row === 0) return;
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
                const updatedBoard = checkStepsAvailable(stepsAvailable.nextRight, stepsAvailable.nextNextRight, game);
                const updatedBoardLatest = checkStepsAvailable(stepsAvailable.nextLeft, stepsAvailable.nextNextLeft, updatedBoard);
                setGame(updatedBoardLatest);
            }
        }
    };

    return (
        <React.Fragment>
        <div css={css`width: fit-content;
        height: fit-content;
        margin: auto;`}>
            {socket && isGameStarted ? 
                turn ? 
                    <React.Fragment>
                        {game.map((row, rowIndex) => (
                            <div css={rowStyle} key={rowIndex}>
                                {row.map((column, columnIndex) => <Square key={columnIndex} isKing={column.square.isKing} isDisabled={false} isChecked={checkIfClicked(rowIndex, columnIndex)} shouldHighlight={column.square.shouldHighlight} squareColor={column.square.squareColor} onSquareClick={() => onSquareClick(column.square.column, column.square.row)} isChecker={column.square.isChecker} checkerColor={column.square.checkerColor} />)}
                            </div>
                        ))}
                        <div>Your turn.</div>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        {game.map((row, rowIndex) => (
                            <div css={rowStyle} key={rowIndex}>
                                {row.map((column, columnIndex) => <Square key={columnIndex} isDisabled={true} isKing={column.square.isKing} isChecked={checkIfClicked(rowIndex, columnIndex)} shouldHighlight={column.square.shouldHighlight} squareColor={column.square.squareColor} onSquareClick={() => onSquareClick(column.square.column, column.square.row)} isChecker={column.square.isChecker} checkerColor={column.square.checkerColor} />)}
                            </div>
                        ))}
                        <div>Waiting for opponent to play.</div>
                    </React.Fragment>
                :
            <div>Waiting for opponent to join...</div>}
        </div>
        </React.Fragment>
    )
}

const printSymbol = {
    white: '🍪',
    black: '🍦',
    default: '🍫',
}
const printBoard = (board: IGame[][]) => {
    board.map(row => {
        const printRow = row.map(({ square: { checkerColor } }) => {
            const symbol = printSymbol[checkerColor!] || printSymbol.default;
            return ` ${symbol} `
        });
        console.log(...printRow);
    });
}

//@ts-ignore;
MainGame.whyDidYouRender = true
export default MainGame;