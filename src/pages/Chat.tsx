import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Typography, Container, List, ListItem, ListItemText, Box, IconButton } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import axios from 'axios';

interface Message {
  id: number;
  content: string;
  username: string;
  created_at: string; // ISO string from backend
}

interface Peer {
  username: string;
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

const Chat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [videoWs, setVideoWs] = useState<WebSocket | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  // Initialize chat WebSocket and message history
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No authentication token found. Please log in.');
      return;
    }

    // Fetch message history
    axios
      .get(`/api/chat/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error('Failed to fetch messages:', err));

    // Initialize WebSocket
    const chatWs = new WebSocket(`ws://localhost:8000/api/chat/${roomId}?token=${token}`);
    wsRef.current = chatWs;

    chatWs.onopen = () => {
      console.log('Chat WebSocket connected');
      setIsConnected(true);
    };

    chatWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('WebSocket error:', data.error);
          alert(`Chat error: ${data.error}`);
        } else {
          setMessages((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error('Invalid message format:', e);
      }
    };

    chatWs.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      setIsConnected(false);
    };

    chatWs.onclose = (event) => {
      console.log('Chat WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      if (event.code === 1008) {
        alert('Chat connection closed: Invalid token or room not found.');
      }
    };

    return () => {
      if (chatWs.readyState === WebSocket.OPEN) {
        chatWs.close(1000, 'Component unmounted');
      }
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [roomId]);

  // Initialize video WebSocket and WebRTC (unchanged)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8000/api/video/${roomId}?token=${token}`);
    setVideoWs(ws);

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'user_joined':
          await handleUserJoined(message.username);
          break;
        case 'user_left':
          handleUserLeft(message.username);
          break;
        case 'offer':
          if (message.sender !== localStorage.getItem('username')) {
            await handleOffer(message.sender, message.data);
          }
          break;
        case 'answer':
          if (message.sender !== localStorage.getItem('username')) {
            await handleAnswer(message.sender, message.data);
          }
          break;
        case 'ice-candidate':
          if (message.sender !== localStorage.getItem('username')) {
            await handleIceCandidate(message.sender, message.data);
          }
          break;
      }
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error('Failed to get media:', err));

    return () => {
      ws.close();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  const handleUserJoined = async (username: string) => {
    const pc = new RTCPeerConnection(rtcConfig);
    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        videoWs?.send(
          JSON.stringify({
            type: 'ice-candidate',
            target: username,
            data: event.candidate,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => {
        const existing = prev.find((p) => p.username === username);
        if (existing) {
          existing.stream = event.streams[0];
          return [...prev];
        }
        return [...prev, { username, pc, stream: event.streams[0] }];
      });
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    videoWs?.send(
      JSON.stringify({
        type: 'offer',
        target: username,
        data: offer,
      })
    );

    setPeers((prev) => [...prev, { username, pc, stream: null }]);
  };

  const handleUserLeft = (username: string) => {
    setPeers((prev) => {
      const peer = prev.find((p) => p.username === username);
      if (peer) {
        peer.pc.close();
      }
      return prev.filter((p) => p.username !== username);
    });
  };

  const handleOffer = async (sender: string, offer: any) => {
    let peer = peers.find((p) => p.username === sender);
    if (!peer) {
      const pc = new RTCPeerConnection(rtcConfig);
      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          videoWs?.send(
            JSON.stringify({
              type: 'ice-candidate',
              target: sender,
              data: event.candidate,
            })
          );
        }
      };

      pc.ontrack = (event) => {
        setPeers((prev) => {
          const existing = prev.find((p) => p.username === sender);
          if (existing) {
            existing.stream = event.streams[0];
            return [...prev];
          }
          return [...prev, { username: sender, pc, stream: event.streams[0] }];
        });
      };

      peer = { username: sender, pc, stream: null };
      setPeers((prev) => [...prev, peer!]);
    }

    await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    videoWs?.send(
      JSON.stringify({
        type: 'answer',
        target: sender,
        data: answer,
      })
    );
  };

  const handleAnswer = async (sender: string, answer: any) => {
    const peer = peers.find((p) => p.username === sender);
    if (peer) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleIceCandidate = async (sender: string, candidate: any) => {
    const peer = peers.find((p) => p.username === sender);
    if (peer) {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageData = {
        content: message.trim(),
        room_id: parseInt(roomId!),
      };
      wsRef.current.send(JSON.stringify(messageData));
      setMessage('');
    } else {
      console.error('WebSocket is not open. State:', wsRef.current?.readyState);
      alert('Cannot send message: Chat is disconnected.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>
        Study Room {roomId}
      </Typography>
      <Typography variant="subtitle1" color={isConnected ? 'green' : 'red'}>
        Chat Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Typography>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        {/* Video Section */}
        <Box sx={{ flex: 2 }}>
          <Typography variant="h6">Video Call</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mt: 2 }}>
            <Box sx={{ width: 'auto', height: 'auto', backgroundColor: '#000', borderRadius: '8px' }}>
              <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: '100%' }} />
              <Typography sx={{ color: '#fff', position: 'absolute', bottom: 0, left: 10 }}>
                You
              </Typography>
            </Box>
            {peers.map((peer) => (
              <Box
                key={peer.username}
                sx={{ width: '300px', height: '200px', backgroundColor: '#000', borderRadius: '8px' }}
              >
                <video
                  autoPlay
                  style={{ width: '100%', height: '100%' }}
                  ref={(video) => {
                    if (video && peer.stream) video.srcObject = peer.stream;
                  }}
                />
                <Typography sx={{ color: '#fff', position: 'absolute', bottom: 0, left: 10 }}>
                  {peer.username}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2 }}>
            <IconButton onClick={toggleMute} color={isMuted ? 'error' : 'primary'}>
              <MicOffIcon />
            </IconButton>
            <IconButton onClick={toggleVideo} color={isVideoOff ? 'error' : 'primary'}>
              <VideocamOffIcon />
            </IconButton>
          </Box>
        </Box>
        {/* Chat Section */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Chat</Typography>
          <List sx={{ maxHeight: '300px', overflow: 'auto', backgroundColor: '#fff', borderRadius: '8px', p: 2 }}>
            {messages.map((msg) => (
              <ListItem key={msg.id}>
                <ListItemText
                  primary={`${msg.username}: ${msg.content}`}
                  secondary={new Date(msg.created_at).toLocaleTimeString()}
                />
              </ListItem>
            ))}
          </List>
          <TextField
            label="Message"
            fullWidth
            margin="normal"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!isConnected}
          />
          <Button
            onClick={sendMessage}
            variant="contained"
            color="primary"
            fullWidth
            disabled={!isConnected}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Chat;