// src/types/index.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  role?: string;
  createdAt?: string;
  skills?: Skill[];
  experiences?: Experience[];
  educations?: Education[];
  _count?: { posts: number; sentConnections: number };
}

export interface Skill {
  id: string;
  name: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Post {
  id: string;
  content: string;
  images: string[];
  visibility: string;
  createdAt: string;
  author: User;
  isLiked?: boolean;
  _count: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

export interface Message {
  id: string;
  content: string;
  read: boolean;
  senderId: string;
  createdAt: string;
  sender: User;
}

export interface Connection {
  connectionId: string;
  user: User;
  connectedAt?: string;
  sentAt?: string;
}