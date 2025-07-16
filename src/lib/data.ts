
import type { User, Job, ChatMessage } from './types';

// This is an in-memory mock "database".
// In a real app, you'd use a proper database like Firebase, Supabase, or PostgreSQL.
const getInitialMockData = () => ({
    users: [
        {
            id: 'user-1',
            name: 'Vedanth Bandodkar',
            email: 'vedanth@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
            skills: ['React', 'Node.js', 'Web Design'],
            location: 'Panjim, Goa',
          },
          {
            id: 'user-2',
            name: 'Pranav Kokitkar',
            email: 'pranav@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
            skills: ['Gardening', 'Landscaping'],
            location: 'Margao, Goa',
          },
          {
            id: 'user-3',
            name: 'Shubham Galave',
            email: 'shubham@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
            skills: ['Content Writing', 'SEO', 'Digital Marketing'],
            location: 'Vasco, Goa',
          },
            {
            id: 'user-4',
            name: 'Moksh Jain',
            email: 'moksh@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
            skills: ['Event Management', 'Volunteering'],
            location: 'Mapusa, Goa',
          },
          {
            id: 'user-5',
            name: 'Namir Khan',
            email: 'namir@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-5',
            skills: ['Photography', 'Video Editing', 'Data Entry'],
            location: 'Ponda, Goa',
          },
    ],
    jobs: [
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1mbyfw76Ub9IP7ueO7ZArHGCCnxdKKSbH',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            imageUrl: 'https://lh3.googleusercontent.com/d/12u0BuUs3eFYcObCKA3-cyWKMmF2yTc4G',
          },
          {
            id: 'job-3',
            title: 'Volunteer for College Fest',
            description: 'Need enthusiastic volunteers for our annual college festival. Tasks include registration desk, coordinating events, and managing stalls. Great experience!',
            skills: ['Event Management', 'Volunteering'],
            payment: 500,
            sos: false,
            location: 'Mapusa, Goa',
            status: 'paid', // > 8 days ago
            posterId: 'user-4',
            workerId: 'user-1',
            applicants: ['user-1'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1PAPFWpd8XCj5EbDWb9WpUYeE5LJPVA2z',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            imageUrl: 'https://lh3.googleusercontent.com/d/19HBdh97VmITXRc_ExUGhHrto_OxJW2ka',
          },
          {
            id: 'job-5',
            title: 'Create Social Media Posters',
            description: 'Design 5-6 posters for our Instagram page using Canva. We will provide the content and branding guidelines. Looking for creative designs.',
            skills: ['Graphic Design', 'Canva', 'Social Media'],
            payment: 1500,
            sos: false,
            location: 'Remote',
            status: 'completed', // > 4 days ago
            posterId: 'user-3',
            workerId: 'user-1',
            applicants: ['user-1'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
            imageUrl: 'https://placehold.co/600x400.png',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1djhDqDX3YtrRqM7Z42o__z3RfCywFn0q',
          },
          {
            id: 'job-7',
            title: 'Translate Menu from English to Konkani',
            description: 'Need a student fluent in Konkani to translate our restaurant menu. The document is short, about 2 pages.',
            skills: ['Translation', 'Konkani', 'English'],
            payment: 800,
            sos: false,
            location: 'Margao, Goa',
            status: 'paid', // > 8 days ago
            posterId: 'user-1',
            workerId: 'user-3',
            applicants: ['user-3'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9), // 9 days ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1L0dhnfM1ntUtO8o55Ei-PfiDrx2lSqkE',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            imageUrl: 'https://placehold.co/600x400.png',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1xw3mhAzYmcFgi1ydJevbBZo_2R3C4Aed',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1OC1dPYBfOlPVetHtzy8zc01X2TfxnakQ',
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
            imageUrl: 'https://placehold.co/600x400.png',
          },
          {
            id: 'job-12',
            title: 'Home Tutoring for Basic Computer Skills',
            description: 'Need a patient student to teach basic computer skills (MS Word, Internet) to a senior citizen. Two sessions a week.',
            skills: ['Tutoring', 'MS Office'],
            payment: 2000,
            sos: false,
            location: 'Mapusa, Goa',
            status: 'completed', // > 4 days ago
            posterId: 'user-5',
            workerId: 'user-1',
            applicants: ['user-1'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1vRccrDeXDzVL1e9bZRApTeLx9nYuP2ME',
          },
          {
            id: 'job-13',
            title: 'Event Photographer for a Birthday Party',
            description: 'Photographer needed for a small birthday party on Saturday. Should be friendly and good with people. Deliver 50 edited photos.',
            skills: ['Photography', 'Event Photography'],
            payment: 2500,
            sos: false,
            location: 'Vasco, Goa',
            status: 'paid', // > 8 days ago
            posterId: 'user-1',
            workerId: 'user-5',
            applicants: ['user-5'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
            imageUrl: 'https://lh3.googleusercontent.com/d/1EhlFhobOk58I7X1jniYGuif8A4-G7zzF',
          }
    ],
    messages: [
        {
            id: 'msg-1',
            jobId: 'job-2',
            senderId: 'user-3',
            content: 'Hi Pranav, thanks for accepting the gardening job. When would be a good time to come by?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12 + 3600000),
        },
        {
            id: 'msg-2',
            jobId: 'job-2',
            senderId: 'user-2',
            content: 'Hi Shubham! I can be there tomorrow around 10 AM. Does that work for you?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12 + 3660000),
        },
        {
            id: 'msg-3',
            jobId: 'job-2',
            senderId: 'user-3',
            content: '10 AM works perfectly. See you then!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12 + 3720000),
        },
        {
          id: 'msg-job3-1',
          jobId: 'job-3',
          senderId: 'user-4',
          content: 'Hey Vedanth, thanks for volunteering. Please be at the main gate tomorrow at 9 AM for the briefing.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 3600000)
        },
        {
          id: 'msg-job3-2',
          jobId: 'job-3',
          senderId: 'user-1',
          content: 'Got it, Moksh. See you there!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 3700000)
        },
        {
          id: 'msg-job5-1',
          jobId: 'job-5',
          senderId: 'user-3',
          content: 'Hi Vedanth, I\'ve assigned you the poster design job. I\'ve sent the brand guidelines to your email.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 3600000)
        },
        {
          id: 'msg-job5-2',
          jobId: 'job-5',
          senderId: 'user-1',
          content: 'Great, I\'ve received them. I\'ll get started on the first drafts.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 3800000)
        },
         {
          id: 'msg-job7-1',
          jobId: 'job-7',
          senderId: 'user-1',
          content: 'Hi Shubham. I\'ve attached the menu document. Let me know if you have any questions.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9 + 3600000)
        },
        {
          id: 'msg-job7-2',
          jobId: 'job-7',
          senderId: 'user-3',
          content: 'Thanks Vedanth. Looks straightforward. I should have it done by tomorrow evening.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9 + 4000000)
        },
         {
          id: 'msg-job12-1',
          jobId: 'job-12',
          senderId: 'user-5',
          content: 'Hi Vedanth, are you available for the first tutoring session this Wednesday at 4 PM?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 3600000)
        },
        {
          id: 'msg-job12-2',
          jobId: 'job-12',
          senderId: 'user-1',
          content: 'Hi Namir, yes that works for me. See you on Wednesday!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 4200000)
        },
         {
          id: 'msg-job13-1',
          jobId: 'job-13',
          senderId: 'user-1',
          content: 'Hi Namir, just confirming the birthday party is at 7 PM on Saturday at the mentioned address.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 + 3600000)
        },
        {
          id: 'msg-job13-2',
          jobId: 'job-13',
          senderId: 'user-5',
          content: 'Confirmed, Vedanth. I\'ll be there!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 + 4300000)
        },
    ],
});

let mockDataStore = getInitialMockData();

// We need a way to reset the data, e.g. for testing.
// This is not a real database, so we just reset the in-memory object.
export const seedDatabase = async () => {
    console.log("Resetting mock data...");
    mockDataStore = getInitialMockData();
};

// The following functions simulate async database calls
export const getJobs = async (searchQuery?: string): Promise<Job[]> => {
    let jobs = [...mockDataStore.jobs];

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        jobs = jobs.filter(job => 
            job.title.toLowerCase().includes(lowercasedQuery) ||
            job.skills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
        );
    }
    
    // Sort by creation date, newest first
    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getJobById = async (id: string): Promise<Job | undefined> => {
    return mockDataStore.jobs.find(job => job.id === id);
};

export const getUsers = async (): Promise<User[]> => {
    return [...mockDataStore.users];
};

export const getUserById = async (id: string): Promise<User | undefined> => {
    const user = mockDataStore.users.find(user => user.id === id || user.email === id);
    return user;
};

export const getMessagesForJob = async (jobId: string): Promise<ChatMessage[]> => {
    return mockDataStore.messages
        .filter(msg => msg.jobId === jobId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

type JobCreationData = {
    title: string;
    description: string;
    skills: string;
    payment: number;
    location: string;
    sos: boolean;
    imageUrl?: string;
    posterId: string;
};

export const createJobInDb = async (data: JobCreationData) => {
    const newJob: Job = {
        id: `job-${Date.now()}`,
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        status: 'open',
        applicants: [],
        createdAt: new Date(),
    };
    mockDataStore.jobs.unshift(newJob);
    return newJob;
};

export const applyToJobInDb = (jobId: string, userId: string) => {
    const job = mockDataStore.jobs.find(j => j.id === jobId);
    if (job && !job.applicants.includes(userId)) {
        job.applicants.push(userId);
    }
};

export const markJobCompleteInDb = (jobId: string) => {
    const job = mockDataStore.jobs.find(j => j.id === jobId);
    if (job) {
        job.status = 'completed';
    }
};

export const selectApplicantForJobInDb = (jobId: string, applicantId: string) => {
    const job = mockDataStore.jobs.find(j => j.id === jobId);
    if (job) {
        job.workerId = applicantId;
        job.status = 'assigned';
    }
};

export const createUserInDb = async (data: { name: string; email: string; }) => {
    // Check if user already exists
    const existingUser = mockDataStore.users.find(u => u.email === data.email);
    if (existingUser) return existingUser;
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
        skills: [],
        location: 'Not Specified',
    };
    mockDataStore.users.push(newUser);
    return newUser;
};

export const updateUserInDb = async (data: { userId: string, name: string; location: string; skills: string[]; }) => {
    const user = mockDataStore.users.find(u => u.id === data.userId);
    if (user) {
        user.name = data.name;
        user.location = data.location;
        user.skills = data.skills;
    }
};

export const cancelJobInDb = (jobId: string) => {
    const job = mockDataStore.jobs.find(j => j.id === jobId);
    if (job) {
        job.status = 'canceled';
    }
};

export const createMessageInDb = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        ...message,
        timestamp: new Date(),
    };
    mockDataStore.messages.push(newMessage);
};
