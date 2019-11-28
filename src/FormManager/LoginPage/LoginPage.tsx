/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Chip, CircularProgress, InputAdornment, IconButton } from '@material-ui/core';
import { VisibilityOffRounded as VisibilityOff ,VisibilityRounded as Visibility, AccountCircle, VpnKey } from '@material-ui/icons/';
import useForm from 'react-hook-form';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { IUser, verifyUser } from '../../App';



interface IProps {
  switchForms: () => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

interface ILogin {
  usernameOrEmail: string;
  password: string;
}

const LoginPage: React.FC<IProps> = (props) => {

  const { switchForms, setIsLoading, setUser } = props;
  const { register, handleSubmit, errors } = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [ isLoginLoading, setIsLoginLoading ] = useState(false);
  const [ showPassword, setShowPassword ] = useState(false);


  const container = css`
    padding: 1em;
    width: 70%;
    min-width: 19em;
    max-width: 50em;
  `;

  const header = css`
    display: flex;
    justify-content: center;
    margin-bottom: 0.2em;
  `;

  const textFieldsContainer = css`
    display: flex;
    flex-direction: column;
    padding: 0.1em;
  `;

  const formInputs = css`
    margin-top: 0.6em;
  `;

  const onSubmit = (data: ILogin) => {
    setIsLoginLoading(true);
    axios.defaults.withCredentials = true;
    axios.post('http://localhost:8080/user/login/', data)
    .then((res) => {
      enqueueSnackbar('User logged in succesfuly', {variant: 'success'});
      setIsLoginLoading(false);
      verifyUser(setUser, setIsLoading);
    }).catch((error) => {
      setIsLoginLoading(false);
      if (!error.response) return;
      if (error.response.status === 400) {
        enqueueSnackbar("Wrong password", {variant: 'error'})
      }
      if(error.response.status === 404) {
        enqueueSnackbar("Username or Email not found", {variant: 'error'})
      }
    })
  };

  return (
    <Paper css={container}>
      <div>
        <Typography css={header} variant="h4">Login</Typography>
        <Chip label="Are you new? Sign Up!" onClick={switchForms} clickable variant="outlined" />
      </div>
      <form css={textFieldsContainer} onSubmit={handleSubmit(onSubmit as any)}>
        {/* USERNAME */}
        <TextField css={formInputs}
          variant="outlined"
          label="Username/Email *"
          error={errors.usernameOrEmail ? true : false}
          name="usernameOrEmail"
          placeholder="JhonnyDoe_1"
          inputRef={register({
            required: true,
            // pattern: { value: /^[a-zA-Z0-9_.-]{3,15}$|[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, message: '* Username is not valid' }
          })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            )
          }}
        />
        {/* PASSWORD */}
        <TextField css={formInputs}
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          label="Password *"
          error={errors.password ? true : false}
          name="password"
          placeholder="Monkey1212"
          inputRef={register({
            required: true,
            // pattern: {
            //   value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
            //   message: '* Password is not valid'
            // }
          })}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <VpnKey />
              </InputAdornment>
            )
          }}
        />
        <Button css={formInputs} type="submit" variant="outlined" color="primary" disabled={isLoginLoading} >{isLoginLoading ? <CircularProgress /> : 'Enter'}</Button>
      </form>
    </Paper>
  );
}

export default LoginPage;
