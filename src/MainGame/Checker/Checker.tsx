/** @jsx jsx */
import React from 'react';
import { jsx, css } from '@emotion/core'

interface props {
    checkerColor: 'white' | 'black'
}

const Checker: React.FC<props> = (props) => {
    const { checkerColor } = props;
    return (
        <div css={css`border-radius: 50%; border: 2px solid #ccc; background-color: ${checkerColor}; box-shadow: 0 0 1px black;; width: 2em; height: 2em;`}>
        </div>
    )
}
export default Checker;