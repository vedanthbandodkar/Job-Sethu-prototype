// src/components/ui/google-icon.tsx

import * as React from "react"

/**
 * A simple, inline SVG component for the Google logo.
 * This is used to fix the error in the sign-in page.
 */
export function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      {...props}
    >
      <path fill="#ea4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.15 31.14 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.75 17.65 9.5 24 9.5z" />
      <path fill="#4285f4" d="M46.7 24.5c0-.64-.06-1.25-.17-1.85H24v7.35h12.42c-.41 2.1-1.63 3.99-3.32 5.37l6.57 5.1c3.85-3.56 6.13-8.85 6.13-15.65z" />
      <path fill="#fbbc05" d="M10.53 28.52c-.22-.61-.35-1.25-.35-1.92s.13-1.3.35-1.92v-6.19l-7.98-6.19c-1.21 2.4-1.92 5.12-1.92 8.08s.71 5.68 1.92 8.08l7.98-6.19z" />
      <path fill="#34a853" d="M24 48c6.48 0 11.97-2.13 15.96-5.89l-6.57-5.1c-1.87 1.5-4.52 2.4-7.39 2.4-5.46 0-10.37-3.23-12.75-7.95l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}