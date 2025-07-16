
'use server'

import { generateJobImage } from '@/ai/flows/generate-job-image-flow';
import { createJobInDb, applyToJobInDb, markJobCompleteInDb, selectApplicantForJobInDb, createUserInDb, updateUserInDb, cancelJobInDb, createMessageInDb } from '@/lib/data'
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
    // Explicitly separate userId from the rest of the job data.
    const { userId, ...jobDetails } = data;
    const imageUrl = await generateJobImage(jobDetails.title);

    // The userId is the posterId for the new job
    // Pass the correct structure to the database function.
    const result = await createJobInDb({ ...jobDetails, imageUrl, posterId: userId });
    
    if (result) {
        revalidatePath('/');
        revalidatePath('/dashboard');
        return { success: true };
    }
    return { success: false, message: 'Failed to create job.' };
  } catch (error) {
    console.error('Failed to create job:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function applyForJobAction(jobId: string, userId: string) {
    await applyToJobInDb(jobId, userId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function markJobCompleteAction(jobId: string) {
    await markJobCompleteInDb(jobId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    revalidatePath('/');
}

export async function selectApplicantAction(jobId: string, applicantId: string) {
    await selectApplicantForJobInDb(jobId, applicantId);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/dashboard');
    revalidatePath('/');
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
}

export async function sendMessageAction(jobId: string, senderId: string, content: string) {
    await createMessageInDb({ jobId, senderId, content });
    revalidatePath(`/jobs/${jobId}`);
}
