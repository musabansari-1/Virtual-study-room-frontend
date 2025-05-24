import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Stack
} from '@mui/material';
import axios from 'axios';
import { Token } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<Token>('/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/rooms');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #74ebd5, #ACB6E5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 4,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Welcome Back 👋
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Login to continue to StudyRooms
        </Typography>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" size="large" color="primary" fullWidth>
              Login
            </Button>
            <Button onClick={() => navigate('/register')} color="secondary" fullWidth>
              Don’t have an account? Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
