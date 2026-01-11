
import { type Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  skills: string[];
  location:string;
};

// This represents the structure in Firestore, using server Timestamps
export type Job = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  payment: number;
  sos: boolean;
  location: string;
  status: 'open' | 'assigned' | 'completed' | 'canceled' | 'paid';
  posterId: string;
  workerId?: string;
  applicantIds: string[];
  createdAt: Timestamp;
  imageUrl?: string;
};

// This can be used on the client-side, where timestamp is a Date object
export type JobWithDate = Omit<Job, 'createdAt'> & { createdAt: Date };


export type ChatMessage = {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
};

export type ChatMessageWithDate = Omit<ChatMessage, 'timestamp'> & { timestamp: Date };
