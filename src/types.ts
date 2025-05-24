export interface UserCreate {
    username: string;
    email: string;
    password: string;
  }
  
  export interface UserOut {
    username: string;
    email: string;
  }
  
  export interface UserProfile {
    username: string;
    email: string;
    study_hours: number;
    tasks_completed: number;
    study_streak: number;
    points: number;
  }
  
  export interface Token {
    access_token: string;
    token_type: string;
  }
  
  export interface StudyRoomCreate {
    name: string;
    subject: string;
  }
  
  export interface StudyRoomOut {
    id: number;
    name: string;
    subject: string;
    created_at: string;
  }
  
  export interface MessageCreate {
    content: string;
    room_id: number;
  }
  
  export interface MessageOut {
    id: number;
    content: string;
    user_id: number;
    room_id: number;
    created_at: string;
    username: string;
  }