

import type { User, Job, ChatMessage } from './types';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, deleteDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { storage } from './firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

// --- Firestore Data Functions ---

export const getJobsFromDb = async (searchQuery?: string): Promise<Job[]> => {
    const jobsCol = collection(db, 'jobs');
    // We only sort by creation date now and do all status filtering client-side
    // This avoids needing multiple composite indexes for different status filters.
    let q = query(jobsCol, orderBy('createdAt', 'desc'));

    const jobSnapshot = await getDocs(q);
    let jobs = jobSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Convert Firestore Timestamps to JS Dates
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Job;
    });
    
    // Do not filter by status here anymore, return all jobs that aren't canceled
    jobs = jobs.filter(job => job.status !== 'canceled');

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        jobs = jobs.filter(job =>
            job.title.toLowerCase().includes(lowercasedQuery) ||
            job.skills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
        );
    }
    
    return jobs;
};

export const getCompletedJobsForUserFromDb = async (userId: string): Promise<Job[]> => {
    const jobsCol = collection(db, 'jobs');
    // Query only by workerId to avoid needing a composite index.
    const q = query(jobsCol, where('workerId', '==', userId));
    const jobSnapshot = await getDocs(q);

    const allUserJobs = jobSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Job;
    });

    // Filter and sort in memory
    const completedJobs = allUserJobs
        .filter(job => job.status === 'completed' || job.status === 'paid')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return completedJobs;
};


export const getJobByIdFromDb = async (id: string): Promise<Job | undefined> => {
    const jobRef = doc(db, 'jobs', id);
    const jobSnap = await getDoc(jobRef);
    if (!jobSnap.exists()) {
        return undefined;
    }
    const data = jobSnap.data();
    return {
        id: jobSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    } as Job;
};

export const getUsersFromDb = async (): Promise<User[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const getUserByIdFromDb = async (id: string): Promise<User | undefined> => {
    try {
        if (!id) return undefined;
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            return { 
                id: userSnap.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // Fallback for older users
            } as User;
        }
    } catch (error) {
        console.error(`Failed to fetch user by ID: ${id}`, error);
    }
    return undefined;
};

export const getMessagesForJobFromDb = async (jobId: string): Promise<ChatMessage[]> => {
    // Remove orderBy from query to avoid composite index requirement
    const messagesQuery = query(collection(db, 'messages'), where('jobId', '==', jobId));
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const messages = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        } as ChatMessage;
    });

    // Sort the messages in-memory by timestamp
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return messages;
};

type JobCreationData = {
    title: string;
    description: string;
    skills: string[];
    payment: number;
    location: string;
    sos: boolean;
    imageUrl?: string;
    posterId: string;
};

export const createJobInDb = async (data: JobCreationData) => {
    const newJobData = {
        ...data,
        status: 'open',
        applicants: [],
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'jobs'), newJobData);
    return { ...newJobData, id: docRef.id, createdAt: new Date() }; // Return a Job-like object
};

export const applyToJobInDb = async (jobId: string, userId: string) => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
        applicants: arrayUnion(userId)
    });
};

export const markJobCompleteInDb = async (jobId: string) => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, { status: 'completed' });
};

export const selectApplicantForJobInDb = async (jobId: string, applicantId: string) => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
        workerId: applicantId,
        status: 'assigned'
    });
};

export const createUserInDb = async (data: { id?: string; name: string; email: string; avatarUrl?: string }) => {
    const userId = data.id || data.email; // Use email as ID if not provided
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) return { id: userSnap.id, ...userSnap.data() } as User;
    
    const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || `https://i.pravatar.cc/150?u=${data.email}`,
        skills: [],
        location: 'Not Specified',
        phoneNumber: '987-654-3210', // Default phone number
        about: '',
        createdAt: new Date(),
    };
    await setDoc(userRef, newUser);
    return { id: userId, ...newUser };
};

export const updateUserInDb = async (data: { userId: string, name: string; location: string; skills: string[]; about?: string }) => {
    const userRef = doc(db, 'users', data.userId);
    const updateData: any = {
        name: data.name,
        location: data.location,
        skills: data.skills,
    };
    if (data.about !== undefined) {
        updateData.about = data.about;
    }
    await updateDoc(userRef, updateData);
};

export const cancelJobInDb = async (jobId: string) => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, { status: 'canceled' });
};

export const createMessageInDb = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessageData = {
        ...message,
        timestamp: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'messages'), newMessageData);
    return { ...newMessageData, id: docRef.id, timestamp: new Date() }; // Return a ChatMessage-like object
};

export const deleteMessageFromDb = async (messageId: string) => {
    await deleteDoc(doc(db, 'messages', messageId));
};


// --- Mock Data and Functions (for components not yet migrated) ---

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
            phoneNumber: '987-654-3210',
            about: "I'm a passionate web developer and student, skilled in the MERN stack. I enjoy building responsive and user-friendly applications. I've completed several projects on this platform and am always eager to take on new challenges.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90), // 90 days ago
          },
          {
            id: 'user-2',
            name: 'Pranav Kokitkar',
            email: 'pranav@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
            skills: ['Gardening', 'Landscaping'],
            location: 'Margao, Goa',
            phoneNumber: '987-654-3211',
            about: 'I have a green thumb and love transforming outdoor spaces. Whether it\'s regular maintenance or a complete garden makeover, I\'m your person. Reliable and hardworking.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120), // 120 days ago
          },
          {
            id: 'user-3',
            name: 'Shubham Galave',
            email: 'shubham@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
            skills: ['Content Writing', 'SEO', 'Digital Marketing'],
            location: 'Vasco, Goa',
            phoneNumber: '987-654-3212',
            about: 'Creative writer with a knack for digital marketing. I can help your brand grow with engaging content and smart SEO strategies. Let\'s connect!',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
          },
            {
            id: 'user-4',
            name: 'Moksh Jain',
            email: 'moksh@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
            skills: ['Event Management', 'Volunteering'],
            location: 'Mapusa, Goa',
            phoneNumber: '987-654-3213',
            about: 'Experienced in organizing events and coordinating teams. I am enthusiastic, organized, and love bringing people together for a great cause.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
          },
          {
            id: 'user-5',
            name: 'Namir Khan',
            email: 'namir@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?u=user-5',
            skills: ['Photography', 'Video Editing', 'Data Entry'],
            location: 'Ponda, Goa',
            phoneNumber: '987-654-3214',
            about: 'Detail-oriented and versatile, with skills in media and data management. I capture moments beautifully and ensure data is handled with precision.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150), // 150 days ago
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

// To prevent data from being reset on hot-reloads in development,
// we store the mock data in a global object.
const globalForMock = globalThis as unknown as {
    mockDataStore: ReturnType<typeof getInitialMockData> | undefined
}

const mockDataStore = globalForMock.mockDataStore ?? getInitialMockData();
if (process.env.NODE_ENV !== 'production') globalForMock.mockDataStore = mockDataStore


// We need a way to reset the data, e.g. for testing.
// This is not a real database, so we just reset the in-memory object.
export const seedDatabase = async () => {
    console.log("Seeding Firestore with mock data...");
    const initialData = getInitialMockData();
    
    // Seed users
    for (const user of initialData.users) {
        await setDoc(doc(db, 'users', user.id), {
            ...user,
            createdAt: Timestamp.fromDate(user.createdAt || new Date()),
        });
    }
    
    // Seed jobs
    for (const job of initialData.jobs) {
        const { id, ...jobData } = job;
        await setDoc(doc(db, 'jobs', id), {
            ...jobData,
            createdAt: Timestamp.fromDate(job.createdAt),
        });
    }

    // Seed messages
    for (const message of initialData.messages) {
        const { id, ...messageData } = message;
        await setDoc(doc(db, 'messages', id), {
            ...messageData,
            timestamp: Timestamp.fromDate(message.timestamp),
        });
    }
    console.log("Firestore seeding complete.");
};

// The following functions now call the Firestore functions
export const getJobs = async (searchQuery?: string): Promise<Job[]> => getJobsFromDb(searchQuery);
export const getCompletedJobsForUser = async (userId: string): Promise<Job[]> => getCompletedJobsForUserFromDb(userId);
export const getJobById = async (id: string): Promise<Job | undefined> => getJobByIdFromDb(id);
export const getUsers = async (): Promise<User[]> => getUsersFromDb();
export const getUserById = async (id: string): Promise<User | undefined> => getUserByIdFromDb(id);
export const getMessagesForJob = async (jobId: string): Promise<ChatMessage[]> => getMessagesForJobFromDb(jobId);

  

    



    