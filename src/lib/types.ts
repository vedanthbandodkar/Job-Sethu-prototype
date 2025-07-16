export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  skills: string[];
  location: string;
};

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
  applicants: string[];
  createdAt: Date;
  imageUrl?: string;
};

export type ChatMessage = {
  id: string;
  jobId: string;
  senderId: string;
  content: string;
  timestamp: Date;
};
