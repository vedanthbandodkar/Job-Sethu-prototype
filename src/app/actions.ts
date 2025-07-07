'use server'

import { createJobInDb, applyToJobInDb, markJobCompleteInDb, selectApplicantForJobInDb } from '@/lib/data'

type JobFormValues = {
  title: string;
  description: string;
  skills: string;
  payment: number;
  location: string;
  sos: boolean;
}

export async function createJobAction(data: JobFormValues) {
  try {
    await createJobInDb(data);
    return { success: true };
  } catch (error) {
    console.error('Failed to create job:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function applyForJobAction(jobId: string, userId: string) {
    await applyToJobInDb(jobId, userId);
}

export async function markJobCompleteAction(jobId: string) {
    await markJobCompleteInDb(jobId);
}

export async function selectApplicantAction(jobId: string, applicantId: string) {
    await selectApplicantForJobInDb(jobId, applicantId);
}
