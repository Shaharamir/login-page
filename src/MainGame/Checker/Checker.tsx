/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'

interface props {
    checkerColor: 'white' | 'black';
    isChecked: boolean;
}

const Checker: React.FC<props> = (props) => {
    const { checkerColor, isChecked } = props;
    const checker = css`
        border-radius: 50%;
        border: 2px solid #ccc;
        background-color: ${checkerColor};
        box-shadow: 0 0 1px black;
        width: 50%;
        height: 50%;
        ${isChecked && `
            box-shadow: 0 0 17px white;
        `}
    `;
    return (
        <div css={checker}>
        </div>
    )
}
export default Checker;