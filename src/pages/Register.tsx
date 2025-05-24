import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Box
} from '@mui/material';
import axios from 'axios';
import { UserCreate, UserOut } from '../types';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user: UserCreate = { username, email, password };
      await axios.post<UserOut>('/api/auth/register', user);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Try a different username or email.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #ffecd2, #fcb69f)',
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
          maxWidth: 450,
          width: '100%',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Create Account 📝
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
          Sign up to start your journey with StudyRooms
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
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
              Register
            </Button>
            <Button onClick={() => navigate('/login')} color="secondary" fullWidth>
              Already have an account? Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
