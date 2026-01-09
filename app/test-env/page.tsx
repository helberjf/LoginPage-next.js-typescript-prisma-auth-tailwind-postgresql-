// Test script to check environment variables in Next.js context
export default function TestEnv() {
  return (
    <div className="p-4">
      <h1>Environment Variables Test</h1>
      <ul>
        <li>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'}</li>
        <li>GOOGLE_CLIENT_SECRET: {process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'}</li>
        <li>AUTH_SECRET: {process.env.AUTH_SECRET ? 'SET' : 'NOT SET'}</li>
        <li>DATABASE_URL: {process.env.DATABASE_URL ? 'SET' : 'NOT SET'}</li>
      </ul>
    </div>
  )
}