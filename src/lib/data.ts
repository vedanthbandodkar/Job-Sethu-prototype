import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, serverTimestamp, orderBy, limit, writeBatch } from "firebase/firestore";
import type { User, Job, ChatMessage } from './types';
import { db } from './firebase';
import type { Timestamp } from "firebase/firestore";

// This function converts Firestore Timestamps to JS Date objects in a document
function processDoc<T>(d: any): T {
    const data = d.data();
    for (const key in data) {
        if (data[key] instanceof Object && 'seconds' in data[key] && 'nanoseconds' in data[key]) {
             data[key] = (data[key] as Timestamp).toDate();
        }
    }
    return { id: d.id, ...data } as T;
}

// Mock API functions replaced with Firestore calls
export const getJobById = async (id:string): Promise<Job | undefined> => {
    const docRef = doc(db, "jobs", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return processDoc<Job>(docSnap);
    } else {
        return undefined;
    }
}

export const getUsers = async (): Promise<User[]> => {
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(d => processDoc<User>(d));
}

export const getUserById = async (id: string): Promise<User | undefined> => {
    try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return processDoc<User>(docSnap);
        } else {
            // Fallback for old email-based IDs if needed
            const q = query(collection(db, "users"), where("email", "==", id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return processDoc<User>(querySnapshot.docs[0]);
            }
            return undefined;
        }
    } catch (error) {
        console.error(`Error fetching user by ID: ${id}`, error);
        return undefined;
    }
}


export const getMessagesForJob = async (jobId: string): Promise<ChatMessage[]> => {
    const messagesCol = collection(db, "messages");
    const q = query(messagesCol, where("jobId", "==", jobId), orderBy("timestamp", "asc"));
    const messageSnapshot = await getDocs(q);
    return messageSnapshot.docs.map(d => processDoc<ChatMessage>(d));
}

export const getJobs = async (searchQuery?: string): Promise<Job[]> => {
    const jobsCol = collection(db, "jobs");
    let q;
    
    // Note: Firestore does not support native full-text search. 
    // This is a basic "start with" query. For real full-text search, use a third-party service like Algolia.
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        q = query(jobsCol, where('title_lowercase', '>=', lowerQuery), where('title_lowercase', '<=', lowerQuery + '\uf8ff'), orderBy("title_lowercase"), orderBy("createdAt", "desc"));
    } else {
        q = query(jobsCol, orderBy("createdAt", "desc"), limit(20));
    }
    
    const jobSnapshot = await getDocs(q);
    return jobSnapshot.docs.map(d => processDoc<Job>(d));
}

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

export const createJobInDb = async (data: JobCreationData): Promise<{ id: string }> => {
    const newJob = {
        title: data.title,
        description: data.description,
        payment: data.payment,
        location: data.location,
        sos: data.sos,
        imageUrl: data.imageUrl,
        posterId: data.posterId, // Ensure posterId is included
        skills: data.skills.split(',').map(s => s.trim()).filter(s => s),
        status: 'open',
        applicants: [],
        createdAt: serverTimestamp(),
        title_lowercase: data.title.toLowerCase() // for searching
    };
    const docRef = await addDoc(collection(db, "jobs"), newJob);
    return { id: docRef.id };
};


export const applyToJobInDb = async (jobId: string, userId: string): Promise<void> => {
    const jobRef = doc(db, "jobs", jobId);
    const jobDoc = await getDoc(jobRef);
    if (jobDoc.exists()) {
        const jobData = jobDoc.data() as Job;
        if (!jobData.applicants.includes(userId)) {
            const applicants = [...jobData.applicants, userId];
            await updateDoc(jobRef, { applicants });
        }
    }
};

export const markJobCompleteInDb = async (jobId: string): Promise<void> => {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, { status: 'completed' });
};

export const selectApplicantForJobInDb = async (jobId: string, applicantId: string): Promise<void> => {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, { workerId: applicantId, status: 'assigned' });
};

export const createUserInDb = async (data: { name: string; email: string; }): Promise<User> => {
    // Generate a more robust ID, but check for existence by email to prevent duplicates.
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", data.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // User already exists
      return processDoc<User>(querySnapshot.docs[0]);
    }

    // User doesn't exist, create a new one.
    const newUser: Omit<User, 'id'> = {
        name: data.name,
        email: data.email,
        avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
        skills: [],
        location: 'Not Specified',
    };
    const docRef = await addDoc(collection(db, "users"), newUser);
    return { id: docRef.id, ...newUser };
};

export const updateUserInDb = async (data: { userId: string; name: string; location: string; skills: string[]; }): Promise<void> => {
    const userRef = doc(db, "users", data.userId);
    await updateDoc(userRef, {
        name: data.name,
        location: data.location,
        skills: data.skills,
    });
};

export const cancelJobInDb = async (jobId: string): Promise<void> => {
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, { status: 'canceled' });
};

export const createMessageInDb = async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> => {
    await addDoc(collection(db, "messages"), {
        ...message,
        timestamp: serverTimestamp()
    });
};

// --- ONE-TIME SEED SCRIPT ---
// This script will populate your Firestore database with the initial mock data.
// You should run this from a client-side component, e.g., a temporary button in your app.

export async function seedDatabase() {
    console.log("Starting to seed database...");
    const batch = writeBatch(db);

    const initialMockData = getInitialMockData();

    // Seed Users
    console.log("Seeding users...");
    initialMockData.users.forEach(user => {
        const docRef = doc(db, "users", user.id);
        batch.set(docRef, user);
    });

    // Seed Jobs
    console.log("Seeding jobs...");
    initialMockData.jobs.forEach(job => {
        const docRef = doc(db, "jobs", job.id);
        batch.set(docRef, {
            ...job,
            title_lowercase: job.title.toLowerCase()
        });
    });

    // Seed Messages
    console.log("Seeding messages...");
    initialMockData.messages.forEach(message => {
        const docRef = doc(collection(db, "messages")); // auto-generate ID
        batch.set(docRef, message);
    });

    try {
        await batch.commit();
        console.log("Database seeded successfully!");
        alert("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database: ", error);
        alert("Error seeding database. Check console for details.");
    }
}

function getInitialMockData() {
    return {
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
};
}
