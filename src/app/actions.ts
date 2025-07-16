
'use server'

import { generateJobImage } from '@/ai/flows/generate-job-image-flow';
import { createJobInDb, applyToJobInDb, markJobCompleteInDb, selectApplicantForJobInDb, createUserInDb, updateUserInDb, cancelJobInDb, createMessageInDb } from '@/lib/data'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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

    const imageUrl = await generateJobImage(jobDetails.title);
    const newJobData = { ...jobDetails, imageUrl, posterId: userId };
    
    const result = await createJobInDb(newJobData);
    
    if (result) {
        revalidatePath('/');
        revalidatePath('/dashboard');
        redirect(`/dashboard?userId=${userId}&tab=postings`);
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

export async function cancelJobAction(jobId: string, userId: string) {
    await cancelJobInDb(jobId);
    revalidatePath('/dashboard');
    revalidatePath('/');
    revalidatePath(`/jobs/${jobId}`);
    // Redirect only if called from the job detail page, on dashboard it will just revalidate
    // A better approach for general use might be to not redirect here,
    // and let the client-side component handle it.
    // For now, revalidation should handle most cases.
}

export async function sendMessageAction(jobId: string, senderId: string, content: string) {
    await createMessageInDb({ jobId, senderId, content });
    revalidatePath(`/jobs/${jobId}`);
}
