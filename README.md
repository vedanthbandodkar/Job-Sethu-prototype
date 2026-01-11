# Hire Ups

This is a Next.js starter application built in Firebase Studio. It's a job marketplace designed to connect skilled workers with local opportunities.

## Technology Stack

### Core Framework & Language

*   **Next.js 14 (with App Router)**: The foundation of the application. It's a full-stack React framework that provides server-side rendering, static site generation, and a powerful server environment. The App Router is used for file-based routing and allows for a mix of Server Components (for performance) and Client Components (for interactivity).
*   **React 18**: The UI library used to build the user interface as a collection of components. It leverages features like Hooks for state management and effects.
*   **TypeScript**: The primary programming language. It's a superset of JavaScript that adds static typing, which helps prevent bugs, improves code quality, and makes the codebase easier to maintain.

### Backend Services & Database

The entire backend is powered by Google's Firebase platform.

*   **Firebase Authentication**: Manages user identity. It provides secure sign-up and login functionality, supporting both traditional email/password and OAuth providers like Google Sign-In.
*   **Firestore**: A flexible, scalable NoSQL database used as the primary data store for the application. It holds all the job postings, user profiles, applications, and chat messages. Its real-time capabilities are leveraged via custom hooks (`useDoc`, `useCollection`) to create a live, reactive UI.
*   **Cloud Storage for Firebase**: Used for storing large binary files, specifically the images associated with job postings. The application uploads images here and stores only the lightweight URL in Firestore, which is the best practice for handling user-uploaded content.
*   **Firebase Admin SDK (`firebase-admin`)**: Used exclusively on the server-side within Next.js Server Actions. It allows the backend logic to perform privileged operations like writing to the database, uploading files to storage, and bypassing client-side security rules when necessary.

### UI & Styling

*   **ShadCN UI**: A collection of reusable UI components (like `Card`, `Button`, `Dialog`, `Form`) that are copied directly into the project. This provides a professional look and feel while allowing for full customization. These are located in `src/components/ui`.
*   **Tailwind CSS**: A utility-first CSS framework used for all styling. It allows for rapid development of custom designs without writing traditional CSS. The application's theme (colors, fonts) is configured in `tailwind.config.ts`.
*   **Radix UI**: The underlying, unstyled, and accessible component primitives that power ShadCN UI.
*   **Lucide React**: Provides the clean and consistent set of icons used throughout the application (e.g., `MapPin`, `Search`, `Briefcase`).
*   **`next-themes`**: Manages theme switching, enabling seamless support for both light and dark modes.

### Form Handling

*   **React Hook Form**: A performant and flexible library for managing form state, validation, and submissions. It is used for all major forms, including login, signup, onboarding, and job creation.
*   **Zod**: A TypeScript-first schema declaration and validation library. It is used to define the expected shape and rules for form data, ensuring that only valid data is submitted to the server.
