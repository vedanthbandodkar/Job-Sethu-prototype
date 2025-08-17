// src/app/(auth)/layout.tsx

import React from 'react';

/**
 * A basic layout component for the authentication pages.
 * It simply renders its children and is required by Next.js for
 * some route groups to function correctly.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}