import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Container, Paper, Button, Box } from '@mui/material';
import axios from '../axiosInstance';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<UserProfile>('/api/users/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch profile');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  if (!profile) return null;

  return (
    <Container maxWidth="sm" sx={{ padding: '20px', backgroundColor: '#f4f7fa', borderRadius: '15px' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
        User Profile
      </Typography>
      {error && <Typography color="error" sx={{ marginBottom: '20px' }}>{error}</Typography>}
      
      <Paper sx={{ padding: '20px', marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>Username</Typography>
          <Typography variant="body1">{profile.username}</Typography>
        </Box>
        
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>Email</Typography>
          <Typography variant="body1">{profile.email}</Typography>
        </Box>

        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>Study Hours</Typography>
          <Typography variant="body1">{profile.study_hours}</Typography>
        </Box>

        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>Tasks Completed</Typography>
          <Typography variant="body1">{profile.tasks_completed}</Typography>
        </Box>

        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>Study Streak</Typography>
          <Typography variant="body1">{profile.study_streak} days</Typography>
        </Box>

        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007bff' }}>Points</Typography>
          <Typography variant="body1">{profile.points}</Typography>
        </Box>
      </Paper>

      <Button
        onClick={() => navigate('/rooms')}
        color="primary"
        variant="contained"
        fullWidth
        sx={{
          marginTop: '20px',
          backgroundColor: '#007bff',
          '&:hover': { backgroundColor: '#0056b3' },
          padding: '12px',
          borderRadius: '20px',
          fontSize: '16px',
        }}
      >
        Back to Rooms
      </Button>
    </Container>
  );
};

export default Profile;
