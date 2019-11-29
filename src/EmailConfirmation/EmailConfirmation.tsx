/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { Container } from '../shared';
import { IDatabaseUser } from '../types/types';
import { Typography } from '@material-ui/core';

interface IProps {
    user: IDatabaseUser
}

const EmailConfirmation: React.FC<IProps> = (props) => {
    const { user } = props;

    const header = css`
      display: flex;
      justify-content: center;
      margin-bottom: 0.2em;
    `;

  return (
    <Container>
        <Typography variant="h4" css={header}>Verify Email</Typography>
        <div>Hey <b>{user.username}</b>,</div>
        <div>Please verify your email at <b>{user.email}</b></div>
    </Container>
  );
}

export default EmailConfirmation;