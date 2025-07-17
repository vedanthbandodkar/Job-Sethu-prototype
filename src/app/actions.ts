
'use server'

import { generateJobImage } from '@/ai/flows/generate-job-image-flow';
import { suggestReplies, type SuggestRepliesInput } from '@/ai/flows/suggest-reply-flow';
import { createJobInDb, applyToJobInDb, markJobCompleteInDb, selectApplicantForJobInDb, createUserInDb, updateUserInDb, cancelJobInDb, createMessageInDb, seedDatabase, deleteMessageFromDb, getJobsFromDb, getJobByIdFromDb, getUserByIdFromDb, getUsersFromDb, getMessagesForJobFromDb } from '@/lib/data'
import { revalidatePath } from 'next/cache';

// This type now correctly includes the userId
type JobFormValues = {
  title: string;
  description: string;
  skills: string;
  payment: number;
  location: string;
  sos: boolean;
  userId: string;
}

export async function createJobAction(data: JobFormValues) {
  try {
    const { userId, ...jobDetails } = data;

    if (!userId) {
      throw new Error("User ID is required to create a job.");
    }

    // Temporarily use a placeholder image to avoid Firestore size limits
    const imageUrl = `https://placehold.co/600x400.png`;
    
    const newJobData = { 
      ...jobDetails, 
      imageUrl, 
      posterId: userId,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
    };
    
    const result = await createJobInDb(newJobData);
    
    if (result) {
        revalidatePath('/');
        revalidatePath('/dashboard');
        return { success: true, jobId: result.id, userId: userId };
    }
    return { success: false, message: 'Failed to create job.' };
  } catch (error) {
    console.error('Failed to create job:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message: errorMessage };
  }
}

export async function applyForJobAction(jobId: string, userId: string) {
    await applyToJobInDb(jobId, userId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
}

export async function markJobCompleteAction(jobId: string) {
    await markJobCompleteInDb(jobId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
}

export async function selectApplicantAction(jobId: string, applicantId: string) {
    await selectApplicantForJobInDb(jobId, applicantId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
}

type SignupFormValues = {
  name: string;
  email: string;
}

export async function signupAction(data: SignupFormValues) {
  try {
    const newUser = await createUserInDb({ name: data.name, email: data.email });
    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

type OnboardingFormValues = {
    userId: string;
    name: string;
    location: string;
    skills: string;
}

export async function completeOnboardingAction(data: OnboardingFormValues) {
    try {
        await updateUserInDb({
            userId: data.userId,
            name: data.name,
            location: data.location,
            skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        });
        revalidatePath('/dashboard');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        console.error('Failed to update user profile:', error);
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

export async function cancelJobAction(jobId: string) {
    await cancelJobInDb(jobId);
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath(`/jobs/${jobId}`);
}

export async function sendMessageAction(jobId: string, senderId: string, content: string) {
    const newMessage = await createMessageInDb({ jobId, senderId, content });
    revalidatePath(`/jobs/${jobId}`);
    return newMessage;
}

export async function deleteMessageAction(messageId: string) {
    await deleteMessageFromDb(messageId);
    revalidatePath(`/jobs/*`); // Revalidate all job detail pages
}

export async function seedDatabaseAction() {
    await seedDatabase();
    revalidatePath('/');
    revalidatePath('/dashboard');
}

export async function suggestRepliesAction(input: SuggestRepliesInput) {
    try {
        const result = await suggestReplies(input);
        return { success: true, suggestions: result.suggestions };
    } catch (error) {
        console.error('Failed to get suggestions:', error);
        return { success: false, message: 'Could not fetch suggestions.' };
    }
}
