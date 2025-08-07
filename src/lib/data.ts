
import type { User, Job, ChatMessage } from './types';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, deleteDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';

// --- Firestore Data Functions ---

export const getJobsFromDb = async (searchQuery?: string): Promise<Job[]> => {
    const jobsCol = collection(db, 'jobs');
    let q = query(jobsCol, orderBy('createdAt', 'desc'));

    const jobSnapshot = await getDocs(q);
    let jobs = jobSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Job;
    });
    
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

export const getCompletedJobsForUser = async (userId: string): Promise<Job[]> => {
    const jobsCol = collection(db, 'jobs');
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
    return userSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
    } as User));
};

export const getUserByIdFromDb = async (id: string): Promise<User | null> => {
    try {
        if (!id) return null;
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            return { 
                id: userSnap.id, 
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            } as User;
        }
    } catch (error) {
        console.error(`Failed to fetch user by ID: ${id}`, error);
    }
    return null;
};

export const getMessagesForJobFromDb = async (jobId: string): Promise<ChatMessage[]> => {
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
    return { ...newJobData, id: docRef.id, createdAt: new Date() };
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
    const userId = data.id || data.email;
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) return { id: userSnap.id, ...userSnap.data() } as User;
    
    const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || `https://i.pravatar.cc/150?u=${data.email}`,
        skills: [],
        location: 'Not Specified',
        phoneNumber: '987-654-3210',
        about: '',
        createdAt: new Date(),
    };
    await setDoc(userRef, newUser);
    return { id: userId, ...newUser };
};

export const updateUserInDb = async (data: { 
    userId: string;
    name: string;
    location: string;
    skills: string[];
    about?: string;
    avatarUrl?: string; 
}) => {
    const userRef = doc(db, 'users', data.userId);
    const updateData: any = {
        name: data.name,
        location: data.location,
        skills: data.skills,
    };
    if (data.about !== undefined) {
        updateData.about = data.about;
    }
    if (data.avatarUrl) {
        updateData.avatarUrl = data.avatarUrl;
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
    return { ...newMessageData, id: docRef.id, timestamp: new Date() };
};

export const deleteMessageFromDb = async (messageId: string) => {
    await deleteDoc(doc(db, 'messages', messageId));
};

const getInitialMockData = () => ({
    users: [
        {
            id: 'user-1', name: 'Vedanth Bandodkar', email: 'vedanth@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-1',
            skills: ['React', 'Node.js', 'Web Design'], location: 'Panjim, Goa', phoneNumber: '987-654-3210',
            about: "I'm a passionate web developer and student, skilled in the MERN stack. I enjoy building responsive and user-friendly applications. I've completed several projects on this platform and am always eager to take on new challenges.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        },
        {
            id: 'user-2', name: 'Pranav Kokitkar', email: 'pranav@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-2',
            skills: ['Gardening', 'Landscaping'], location: 'Margao, Goa', phoneNumber: '987-654-3211',
            about: 'I have a green thumb and love transforming outdoor spaces. Whether it\'s regular maintenance or a complete garden makeover, I\'m your person. Reliable and hardworking.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
        },
        {
            id: 'user-3', name: 'Shubham Galave', email: 'shubham@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-3',
            skills: ['Content Writing', 'SEO', 'Digital Marketing'], location: 'Vasco, Goa', phoneNumber: '987-654-3212',
            about: 'Creative writer with a knack for digital marketing. I can help your brand grow with engaging content and smart SEO strategies. Let\'s connect!',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        },
        {
            id: 'user-4', name: 'Moksh Jain', email: 'moksh@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-4',
            skills: ['Event Management', 'Volunteering'], location: 'Mapusa, Goa', phoneNumber: '987-654-3213',
            about: 'Experienced in organizing events and coordinating teams. I am enthusiastic, organized, and love bringing people together for a great cause.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        },
        {
            id: 'user-5', name: 'Namir Khan', email: 'namir@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=user-5',
            skills: ['Photography', 'Video Editing', 'Data Entry'], location: 'Ponda, Goa', phoneNumber: '987-654-3214',
            about: 'Detail-oriented and versatile, with skills in media and data management. I capture moments beautifully and ensure data is handled with precision.',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150),
        },
    ],
    jobs: [
        {
            id: 'job-1', title: 'Simple Website for a Local Cafe',
            description: 'Need a student to build a one-page responsive website using basic HTML/CSS. No complex backend needed, just a simple, attractive online presence.',
            skills: ['HTML', 'CSS', 'Web Design'], payment: 4000, sos: false, location: 'Panjim, Goa', status: 'open', posterId: 'user-1', applicants: ['user-3'],
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), imageUrl: 'https://lh3.googleusercontent.com/d/1mbyfw76Ub9IP7ueO7ZArHGCCnxdKKSbH',
        },
        // ... (rest of mock jobs)
    ],
    messages: [
        // ... (mock messages)
    ],
});

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
        const fullJobData: any = {
            ...jobData,
            createdAt: Timestamp.fromDate(job.createdAt),
        };
        if (jobData.workerId) {
            fullJobData.workerId = jobData.workerId;
        }
        await setDoc(doc(db, 'jobs', id), fullJobData);
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

// Aliases for easier refactoring
export const getJobs = getJobsFromDb;
export const getJobById = getJobByIdFromDb;
export const getUsers = getUsersFromDb;
export const getUserById = getUserByIdFromDb;
export const getMessagesForJob = getMessagesForJobFromDb;
