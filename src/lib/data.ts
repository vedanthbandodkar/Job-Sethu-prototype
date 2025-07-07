import type { User, Job, ChatMessage } from './types';

const initialMockUsers: User[] = [
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
  {
    id: 'user-5',
    name: 'Eve Davis',
    email: 'eve@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    skills: ['Photography', 'Video Editing'],
    location: 'Berkeley, CA',
  },
];

const initialMockJobs: Job[] = [
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
  {
    id: 'job-8',
    title: 'Pet Sitter for a Weekend',
    description: 'Looking for a reliable pet sitter for my two cats from Friday evening to Sunday evening. Must be comfortable with cats.',
    skills: ['Pet Sitting', 'Animal Care'],
    payment: 3000,
    sos: false,
    location: 'Oakland, CA',
    status: 'open',
    posterId: 'user-2',
    applicants: [],
    createdAt: new Date('2024-07-24T10:00:00Z'),
  },
  {
    id: 'job-9',
    title: 'Translate Document from English to Spanish',
    description: 'Need a fluent Spanish speaker to translate a 10-page business document. Accuracy is crucial.',
    skills: ['Translation', 'Spanish', 'English'],
    payment: 4500,
    sos: false,
    location: 'Remote',
    status: 'open',
    posterId: 'user-1',
    applicants: ['user-3'],
    createdAt: new Date('2024-07-24T12:00:00Z'),
  },
  {
    id: 'job-10',
    title: 'Emergency Website Fix',
    description: 'Our e-commerce website is down, and we need an experienced developer to debug and fix it immediately. Built on Node.js and React.',
    skills: ['Node.js', 'React', 'Debugging', 'E-commerce'],
    payment: 12000,
    sos: true,
    location: 'Remote',
    status: 'assigned',
    posterId: 'user-4',
    workerId: 'user-1',
    applicants: ['user-1'],
    createdAt: new Date('2024-07-25T08:00:00Z'),
  },
  {
    id: 'job-11',
    title: 'Social Media Manager',
    description: 'Looking for a creative social media manager to handle our Instagram and Twitter accounts. Experience with Canva is a plus.',
    skills: ['Social Media', 'Marketing', 'Canva'],
    payment: 8000,
    sos: false,
    location: 'Remote',
    status: 'open',
    posterId: 'user-3',
    applicants: [],
    createdAt: new Date('2024-07-25T10:00:00Z'),
  },
  {
    id: 'job-12',
    title: 'Home Tutoring for Mathematics',
    description: 'Need a math tutor for a 10th-grade student. Two sessions per week, focusing on algebra and geometry.',
    skills: ['Tutoring', 'Mathematics'],
    payment: 2500,
    sos: false,
    location: 'Berkeley, CA',
    status: 'open',
    posterId: 'user-5',
    applicants: ['user-1'],
    createdAt: new Date('2024-07-25T14:00:00Z'),
  },
  {
    id: 'job-13',
    title: 'Event Photographer',
    description: 'Photographer needed for a corporate event on Saturday. Must have your own professional equipment. Deliverables include 100 edited photos.',
    skills: ['Photography', 'Event Photography', 'Photo Editing'],
    payment: 9000,
    sos: false,
    location: 'San Francisco, CA',
    status: 'completed',
    posterId: 'user-1',
    workerId: 'user-5',
    applicants: ['user-5'],
    createdAt: new Date('2024-07-15T10:00:00Z'),
  }
];

const initialMockMessages: ChatMessage[] = [
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


// This is a workaround to persist mock data across hot reloads in development.
// In a real app, you would use a proper database.
declare global {
  var mockJobsStore: Job[];
  var mockUsersStore: User[];
  var mockMessagesStore: ChatMessage[];
}

let mockJobs: Job[];
let mockUsers: User[];
let mockMessages: ChatMessage[];


if (process.env.NODE_ENV === 'production') {
  mockJobs = initialMockJobs;
  mockUsers = initialMockUsers;
  mockMessages = initialMockMessages;
} else {
  if (!global.mockJobsStore) {
    global.mockJobsStore = initialMockJobs;
  }
  if (!global.mockUsersStore) {
    global.mockUsersStore = initialMockUsers;
  }
  if (!global.mockMessagesStore) {
    global.mockMessagesStore = initialMockMessages;
  }
  mockJobs = global.mockJobsStore;
  mockUsers = global.mockUsersStore;
  mockMessages = global.mockMessagesStore;
}

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
        posterId: 'user-5', // Mock current user as poster
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

export const createUserInDb = async (data: { name: string; email: string; }): Promise<User> => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        avatarUrl: `https://placehold.co/100x100.png`,
        skills: [],
        location: 'Not Specified',
    };
    mockUsers.push(newUser);
    return newUser;
};

export const updateUserInDb = async (data: { userId: string; name: string; location: string; skills: string[]; }): Promise<User | undefined> => {
    const userIndex = mockUsers.findIndex(u => u.id === data.userId);
    if (userIndex !== -1) {
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            name: data.name,
            location: data.location,
            skills: data.skills,
        };
        return mockUsers[userIndex];
    }
    return undefined;
};
