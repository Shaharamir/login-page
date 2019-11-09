/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { AppBar as Bar, IconButton, Toolbar, Typography } from '@material-ui/core';
import { MenuRounded as MenuIcon } from '@material-ui/icons';

interface IProps {
}

const AppBar: React.FC<IProps> = (props) => {

  const appBar = css`
    flex-grow: 1;
  `;

  const iconButton = css`
    color: white;
    margin-right: 0.5em;
  `;


  return (
      <Bar position="static" css={appBar}>
        <Toolbar>
          <IconButton css={iconButton}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h5">Lorem</Typography>
        </Toolbar>
      </Bar>
  );
}

export default AppBar;
