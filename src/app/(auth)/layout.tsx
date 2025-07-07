export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
