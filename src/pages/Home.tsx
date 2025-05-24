import { Button, Container, Typography, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #2193b0, #6dd5ed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: 'white',
          borderRadius: 4,
          boxShadow: 4,
          textAlign: 'center',
          padding: 4,
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
          StudyRooms
        </Typography>
        <Typography variant="h6" gutterBottom color="textSecondary">
          Collaborate. Learn. Grow.
        </Typography>

        <Stack spacing={2} mt={4}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ borderRadius: '25px' }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ borderRadius: '25px' }}
          >
            Register
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
