import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Paper,
  Stack,
  Box,
} from '@mui/material';
import axios from '../axiosInstance';
import DeleteIcon from '@mui/icons-material/Delete';
import { StudyRoomCreate, StudyRoomOut } from '../types';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<StudyRoomOut[]>([]);
  const [name, setName] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get<StudyRoomOut[]>('/api/study-rooms/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(response.data);
      } catch (err) {
        console.error('Fetch rooms error:', err);
        setError('Failed to fetch rooms');
        navigate('/login');
      }
    };
    fetchRooms();
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const room: StudyRoomCreate = { name, subject };
      // const response = await axios.post<StudyRoomOut>('/api/study-rooms/', room, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      await axios.post<StudyRoomOut>('/api/study-rooms/', room, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setName('');
      setSubject('');
      const roomsResponse = await axios.get<StudyRoomOut[]>('/api/study-rooms/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(roomsResponse.data);
    } catch (err: any) {
      console.error('Create room error:', err.response?.data || err.message);
      setError('Failed to create room');
      navigate('/login');
    }
  };

  const handleDelete = async (roomId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.delete(`/api/study-rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(rooms.filter((room) => room.id !== roomId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete room');
    }
  };

  const handleJoin = async (roomId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post<StudyRoomOut>(`/api/study-rooms/${roomId}/join/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/chat/${roomId}`);
    } catch (err: any) {
      console.error('Join room error:', err.response?.data || err.message);
      setError('Failed to join room');
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #ffffff, #f0f4f8)',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          borderRadius: 4,
          width: '100%',
          maxWidth: 600,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" align="center" sx={{ marginBottom: 3 }}>
          Study Rooms
        </Typography>

        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleCreate}>
          <Stack spacing={2}>
            <TextField
              label="Room Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Subject"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Create Room
            </Button>
          </Stack>
        </form>

        <Typography variant="h6" sx={{ marginTop: 4 }}>
          Available Rooms
        </Typography>

        <List sx={{ marginTop: 2 }}>
          {rooms.map((room) => (
            <ListItem
              key={room.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(room.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => handleJoin(room.id)}>
                <ListItemText primary={room.name} secondary={room.subject} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ marginTop: 3, textAlign: 'center' }}>
          <Button onClick={() => navigate('/profile')} color="secondary">
            View Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Rooms;
