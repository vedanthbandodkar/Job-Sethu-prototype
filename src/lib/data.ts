import type { User, Job, ChatMessage } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['React', 'Node.js', 'Graphic Design'],
    location: 'San Francisco, CA',
  },
  {
    id: 'user-2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Plumbing', 'Electrical Work'],
    location: 'Oakland, CA',
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Content Writing', 'SEO', 'Marketing'],
    location: 'San Jose, CA',
  },
    {
    id: 'user-4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Gardening', 'Landscaping'],
    location: 'San Francisco, CA',
  },
];

export let mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Build a landing page',
    description: 'Need a developer to build a responsive landing page with React and Tailwind CSS. Design will be provided.',
    skills: ['React', 'Tailwind CSS', 'Next.js'],
    payment: 5000,
    sos: false,
    location: 'San Francisco, CA',
    status: 'open',
    posterId: 'user-1',
    applicants: ['user-3'],
    createdAt: new Date('2024-07-20T10:00:00Z'),
  },
  {
    id: 'job-2',
    title: 'Fix a leaky faucet',
    description: 'My kitchen sink faucet is dripping and needs to be repaired or replaced. SOS, water bill is high!',
    skills: ['Plumbing'],
    payment: 1500,
    sos: true,
    location: 'Oakland, CA',
    status: 'assigned',
    posterId: 'user-3',
    workerId: 'user-2',
    applicants: ['user-2'],
    createdAt: new Date('2024-07-21T14:30:00Z'),
  },
  {
    id: 'job-3',
    title: 'Help with garden weeding',
    description: 'Looking for someone to help clear out weeds from my front yard garden for about 3-4 hours.',
    skills: ['Gardening'],
    payment: 1000,
    sos: false,
    location: 'San Francisco, CA',
    status: 'completed',
    posterId: 'user-4',
    workerId: 'user-1',
    applicants: ['user-1'],
    createdAt: new Date('2024-07-19T09:00:00Z'),
  },
    {
    id: 'job-4',
    title: 'Write 5 blog posts',
    description: 'Need a skilled writer for 5 blog posts on the topic of digital marketing. Each post should be around 1000 words.',
    skills: ['Content Writing', 'SEO'],
    payment: 7500,
    sos: false,
    location: 'San Jose, CA',
    status: 'open',
    posterId: 'user-1',
    applicants: [],
    createdAt: new Date('2024-07-22T11:00:00Z'),
  },
  {
    id: 'job-5',
    title: 'Design a new company logo',
    description: 'We are rebranding and need a modern and clean logo. We want a few variations to choose from.',
    skills: ['Graphic Design', 'Adobe Illustrator', 'Branding'],
    payment: 10000,
    sos: false,
    location: 'Remote',
    status: 'open',
    posterId: 'user-3',
    applicants: ['user-1'],
    createdAt: new Date('2024-07-23T09:00:00Z'),
  },
  {
    id: 'job-6',
    title: 'Assemble flat-pack furniture',
    description: 'Urgent help needed to assemble a new wardrobe and a bookshelf. Instructions and tools are available, but I need an extra pair of hands.',
    skills: ['Handyman', 'Furniture Assembly'],
    payment: 2000,
    sos: true,
    location: 'San Francisco, CA',
    status: 'open',
    posterId: 'user-4',
    applicants: [],
    createdAt: new Date('2024-07-23T18:00:00Z'),
  },
  {
    id: 'job-7',
    title: 'Virtual Assistant for Data Entry',
    description: 'Part-time virtual assistant needed for data entry and scheduling tasks. Must be proficient with Google Sheets and Google Calendar.',
    skills: ['Data Entry', 'Google Suite', 'Admin'],
    payment: 4000,
    sos: false,
    location: 'Remote',
    status: 'assigned',
    posterId: 'user-1',
    workerId: 'user-3',
    applicants: ['user-3'],
    createdAt: new Date('2024-07-18T12:00:00Z'),
  },
];

export const mockMessages: ChatMessage[] = [
    {
        id: 'msg-1',
        jobId: 'job-2',
        senderId: 'user-3',
        content: 'Hi Bob, thanks for accepting the job. When would be a good time to come by?',
        timestamp: new Date('2024-07-21T15:00:00Z'),
    },
    {
        id: 'msg-2',
        jobId: 'job-2',
        senderId: 'user-2',
        content: 'Hi Charlie! I can be there tomorrow around 10 AM. Does that work for you?',
        timestamp: new Date('2024-07-21T15:05:00Z'),
    },
    {
        id: 'msg-3',
        jobId: 'job-2',
        senderId: 'user-3',
        content: '10 AM works perfectly. See you then!',
        timestamp: new Date('2024-07-21T15:06:00Z'),
    },
];

// Mock API functions
export const getJobById = async (id: string): Promise<Job | undefined> => {
    return mockJobs.find(job => job.id === id);
}

export const getUserById = async (id: string): Promise<User | undefined> => {
    return mockUsers.find(user => user.id === id);
}

export const getMessagesForJob = async (jobId: string): Promise<ChatMessage[]> => {
    return mockMessages.filter(msg => msg.jobId === jobId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export const getJobs = async (): Promise<Job[]> => {
    return [...mockJobs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

type JobCreationData = {
    title: string;
    description: string;
    skills: string;
    payment: number;
    location: string;
    sos: boolean;
};

export const createJobInDb = async (data: JobCreationData): Promise<Job> => {
    const newJob: Job = {
        id: `job-${Date.now()}`,
        title: data.title,
        description: data.description,
        skills: data.skills.split(',').map(s => s.trim()).filter(s => s),
        payment: data.payment,
        sos: data.sos,
        location: data.location,
        status: 'open',
        posterId: 'user-1', // Mock current user as poster
        applicants: [],
        createdAt: new Date(),
    };
    mockJobs.unshift(newJob);
    return newJob;
};

export const applyToJobInDb = async (jobId: string, userId: string): Promise<void> => {
    const job = mockJobs.find(j => j.id === jobId);
    if (job && !job.applicants.includes(userId)) {
        job.applicants.push(userId);
    }
};

export const markJobCompleteInDb = async (jobId: string): Promise<void> => {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
        job.status = 'completed';
    }
};

export const selectApplicantForJobInDb = async (jobId: string, applicantId: string): Promise<void> => {
    const job = mockJobs.find(j => j.id === jobId);
    if (job) {
        job.workerId = applicantId;
        job.status = 'assigned';
    }
};
