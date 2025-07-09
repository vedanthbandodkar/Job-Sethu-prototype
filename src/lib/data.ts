import type { User, Job, ChatMessage } from './types';

const initialMockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Vedanth Bandodkar',
    email: 'vedanth@example.com',
    avatarUrl: 'https://i.pravatar.cc/100?u=a042581f4e29026704d',
    skills: ['React', 'Node.js', 'Web Design'],
    location: 'Panjim, Goa',
  },
  {
    id: 'user-2',
    name: 'Pranav Kokitkar',
    email: 'pranav@example.com',
    avatarUrl: 'https://i.pravatar.cc/100?u=a042581f4e29026704e',
    skills: ['Gardening', 'Landscaping'],
    location: 'Margao, Goa',
  },
  {
    id: 'user-3',
    name: 'Shubham Galave',
    email: 'shubham@example.com',
    avatarUrl: 'https://i.pravatar.cc/100?u=a042581f4e29026704f',
    skills: ['Content Writing', 'SEO', 'Digital Marketing'],
    location: 'Vasco, Goa',
  },
    {
    id: 'user-4',
    name: 'Moksh Jain',
    email: 'moksh@example.com',
    avatarUrl: 'https://i.pravatar.cc/100?u=a042581f4e29026704a',
    skills: ['Event Management', 'Volunteering'],
    location: 'Mapusa, Goa',
  },
  {
    id: 'user-5',
    name: 'Namir Khan',
    email: 'namir@example.com',
    avatarUrl: 'https://i.pravatar.cc/100?u=a042581f4e29026704b',
    skills: ['Photography', 'Video Editing', 'Data Entry'],
    location: 'Ponda, Goa',
  },
];

const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

const initialMockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'Simple Website for a Local Cafe',
    description: 'Need a student to build a one-page responsive website using basic HTML/CSS. No complex backend needed, just a simple, attractive online presence.',
    skills: ['HTML', 'CSS', 'Web Design'],
    payment: 4000,
    sos: false,
    location: 'Panjim, Goa',
    status: 'open',
    posterId: 'user-1',
    applicants: ['user-3'],
    createdAt: daysAgo(1),
  },
  {
    id: 'job-2',
    title: 'Help with Garden Maintenance',
    description: 'Looking for a student to help with basic gardening tasks like watering plants, weeding, and clearing leaves for a few hours. Very urgent for the weekend.',
    skills: ['Gardening'],
    payment: 1000,
    sos: true,
    location: 'Margao, Goa',
    status: 'assigned',
    posterId: 'user-3',
    workerId: 'user-2',
    applicants: ['user-2'],
    createdAt: daysAgo(2),
  },
  {
    id: 'job-3',
    title: 'Volunteer for College Fest',
    description: 'Need enthusiastic volunteers for our annual college festival. Tasks include registration desk, coordinating events, and managing stalls. Great experience!',
    skills: ['Event Management', 'Volunteering'],
    payment: 500,
    sos: false,
    location: 'Mapusa, Goa',
    status: 'completed',
    posterId: 'user-4',
    workerId: 'user-1',
    applicants: ['user-1'],
    createdAt: daysAgo(4),
  },
    {
    id: 'job-4',
    title: 'Write Content for a Travel Blog',
    description: 'Seeking a student to write 3 short blog posts about tourist spots in Goa. Each post should be 500 words. Good writing skills are a must.',
    skills: ['Content Writing', 'Blogging'],
    payment: 2500,
    sos: false,
    location: 'Vasco, Goa',
    status: 'open',
    posterId: 'user-1',
    applicants: [],
    createdAt: daysAgo(1),
  },
  {
    id: 'job-5',
    title: 'Create Social Media Posters',
    description: 'Design 5-6 posters for our Instagram page using Canva. We will provide the content and branding guidelines. Looking for creative designs.',
    skills: ['Graphic Design', 'Canva', 'Social Media'],
    payment: 1500,
    sos: false,
    location: 'Remote',
    status: 'open',
    posterId: 'user-3',
    applicants: ['user-1'],
    createdAt: daysAgo(2),
  },
  {
    id: 'job-6',
    title: 'Data Entry for a Small Shop',
    description: 'Urgent help needed to enter sales data from paper receipts into an Excel sheet. Basic computer skills and attention to detail required.',
    skills: ['Data Entry', 'Microsoft Excel'],
    payment: 1200,
    sos: true,
    location: 'Panjim, Goa',
    status: 'open',
    posterId: 'user-4',
    applicants: [],
    createdAt: daysAgo(0),
  },
  {
    id: 'job-7',
    title: 'Translate Menu from English to Konkani',
    description: 'Need a student fluent in Konkani to translate our restaurant menu. The document is short, about 2 pages.',
    skills: ['Translation', 'Konkani', 'English'],
    payment: 800,
    sos: false,
    location: 'Margao, Goa',
    status: 'assigned',
    posterId: 'user-1',
    workerId: 'user-3',
    applicants: ['user-3'],
    createdAt: daysAgo(3),
  },
  {
    id: 'job-8',
    title: 'File and Document Organization',
    description: 'Looking for a responsible student to help organize and file office documents for a day. Simple administrative task.',
    skills: ['Organization', 'Admin'],
    payment: 700,
    sos: false,
    location: 'Ponda, Goa',
    status: 'open',
    posterId: 'user-2',
    applicants: [],
    createdAt: daysAgo(1),
  },
  {
    id: 'job-9',
    title: 'Assist with a Photography Session',
    description: 'Need an assistant for a photoshoot. Main tasks will be carrying equipment and helping with lighting reflectors. No prior experience needed.',
    skills: ['Photography', 'Assistant'],
    payment: 1000,
    sos: false,
    location: 'Panjim, Goa',
    status: 'open',
    posterId: 'user-5',
    applicants: ['user-1'],
    createdAt: daysAgo(2),
  },
  {
    id: 'job-10',
    title: 'Urgent: Edit a Short College Project Video',
    description: 'Need a student with video editing skills to quickly edit a 5-minute project video. Just need to trim clips and add background music.',
    skills: ['Video Editing'],
    payment: 1500,
    sos: true,
    location: 'Remote',
    status: 'assigned',
    posterId: 'user-4',
    workerId: 'user-5',
    applicants: ['user-5'],
    createdAt: daysAgo(0),
  },
  {
    id: 'job-11',
    title: 'Digital Marketing Intern',
    description: 'Looking for an intern to help with basic digital marketing tasks like managing social media comments and scheduling posts.',
    skills: ['Digital Marketing', 'Social Media'],
    payment: 3000,
    sos: false,
    location: 'Remote',
    status: 'open',
    posterId: 'user-3',
    applicants: [],
    createdAt: daysAgo(3),
  },
  {
    id: 'job-12',
    title: 'Home Tutoring for Basic Computer Skills',
    description: 'Need a patient student to teach basic computer skills (MS Word, Internet) to a senior citizen. Two sessions a week.',
    skills: ['Tutoring', 'MS Office'],
    payment: 2000,
    sos: false,
    location: 'Mapusa, Goa',
    status: 'open',
    posterId: 'user-5',
    applicants: ['user-1'],
    createdAt: daysAgo(2),
  },
  {
    id: 'job-13',
    title: 'Event Photographer for a Birthday Party',
    description: 'Photographer needed for a small birthday party on Saturday. Should be friendly and good with people. Deliver 50 edited photos.',
    skills: ['Photography', 'Event Photography'],
    payment: 2500,
    sos: false,
    location: 'Vasco, Goa',
    status: 'completed',
    posterId: 'user-1',
    workerId: 'user-5',
    applicants: ['user-5'],
    createdAt: daysAgo(4),
  }
];

const initialMockMessages: ChatMessage[] = [
    {
        id: 'msg-1',
        jobId: 'job-2',
        senderId: 'user-3',
        content: 'Hi Brendon, thanks for accepting the gardening job. When would be a good time to come by?',
        timestamp: new Date('2024-07-21T15:00:00Z'),
    },
    {
        id: 'msg-2',
        jobId: 'job-2',
        senderId: 'user-2',
        content: 'Hi Chris! I can be there tomorrow around 10 AM. Does that work for you?',
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

export const getUsers = async (): Promise<User[]> => {
    return [...mockUsers];
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
    const newId = `user-${Date.now()}`;
    const newUser: User = {
        id: newId,
        name: data.name,
        email: data.email,
        avatarUrl: `https://i.pravatar.cc/100?u=${newId}`,
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
