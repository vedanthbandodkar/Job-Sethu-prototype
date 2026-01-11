
'use server'

import { revalidatePath } from 'next/cache';
import { adminFirestore } from '@/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';

type JobFormValues = {
  title: string;
  description: string;
  skills: string;
  payment: number;
  location: string;
  sos: boolean;
}

export async function createJobAction(data: JobFormValues, userId: string) {
  if (!userId) {
    return { success: false, message: 'You must be logged in to create a job.' };
  }

  try {
    const newJobData = {
      ...data,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      posterId: userId,
      imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
      createdAt: FieldValue.serverTimestamp(),
      status: 'open',
      applicantIds: [],
    };
    
    const docRef = await adminFirestore.collection('jobs').add(newJobData);
    
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true, jobId: docRef.id };

  } catch (error) {
    console.error('Failed to create job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message: errorMessage };
  }
}

export async function applyForJobAction(jobId: string, userId: string) {
    if (!userId) {
        return { success: false, message: "Authentication required." };
    }
    const jobRef = adminFirestore.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
        return { success: false, message: "Job not found." };
    }
    const jobData = jobDoc.data()!;
    if (jobData.posterId === userId) {
        return { success: false, message: "You cannot apply to your own job." };
    }
    
    await jobRef.update({
        applicantIds: FieldValue.arrayUnion(userId)
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    return { success: true };
}

export async function markJobCompleteAction(jobId: string, userId: string) {
    if (!userId) {
        return { success: false, message: "Authentication required." };
    }
    const jobRef = adminFirestore.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists || jobDoc.data()?.workerId !== userId) {
        return { success: false, message: "Unauthorized or job not found." };
    }
    
    await jobRef.update({ status: 'completed' });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    return { success: true };
}

export async function selectApplicantAction(jobId: string, applicantId: string, posterId: string) {
    if (!posterId) {
        return { success: false, message: "Authentication required." };
    }
    const jobRef = adminFirestore.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists || jobDoc.data()?.posterId !== posterId) {
        return { success: false, message: "Unauthorized or job not found." };
    }

    await jobRef.update({
        workerId: applicantId,
        status: 'assigned'
    });
    
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    return { success: true };
}

type OnboardingFormValues = {
    name: string;
    location: string;
    skills: string;
}

export async function completeOnboardingAction(data: OnboardingFormValues, userId: string, email: string | null, photoURL: string | null) {
    if (!userId) {
        return { success: false, message: "Authentication required." };
    }

    try {
        const userRef = adminFirestore.collection('users').doc(userId);
        await userRef.set({
            name: data.name,
            email: email,
            avatarUrl: photoURL || `https://i.pravatar.cc/150?u=${email}`,
            location: data.location,
            skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        }, { merge: true });

        revalidatePath('/dashboard');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function cancelJobAction(jobId: string, userId: string) {
    if (!userId) {
        return { success: false, message: "Authentication required." };
    }
    const jobRef = adminFirestore.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists || jobDoc.data()?.posterId !== userId) {
        return { success: false, message: "Unauthorized or job not found." };
    }
    
    await jobRef.update({ status: 'canceled' });

    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
}

export async function sendMessageAction(jobId: string, senderId: string, content: string) {
    if (!senderId) {
        return { success: false, message: "Authentication required." };
    }
    
    const jobRef = adminFirestore.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) return { success: false, message: "Job not found." };
    
    const jobData = jobDoc.data()!;
    const isPoster = jobData.posterId === senderId;
    const isWorker = jobData.workerId === senderId;

    if (!isPoster && !isWorker) {
        return { success: false, message: "You are not authorized to chat for this job." };
    }

    const message = {
        jobId,
        senderId,
        content,
        timestamp: FieldValue.serverTimestamp()
    };
    
    await adminFirestore.collection('jobs').doc(jobId).collection('messages').add(message);
    
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, message };
}

export async function deleteMessageAction(jobId: string, messageId: string, userId: string) {
    if (!userId) {
        return { success: false, message: "Authentication required." };
    }
    
    const messageRef = adminFirestore.collection('jobs').doc(jobId).collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists || messageDoc.data()?.senderId !== userId) {
        return { success: false, message: "Unauthorized or message not found." };
    }

    await messageRef.delete();
    
    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
}
