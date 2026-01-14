// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-4 pt-20 md:pt-0 md:flex md:items-center md:justify-center">
      {children}
    </main>
  );
}
