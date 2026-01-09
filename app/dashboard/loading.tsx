// src/app/(dashboard)/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}
