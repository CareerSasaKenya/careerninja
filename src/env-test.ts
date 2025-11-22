// Simple environment variable test
export const testEnvVars = () => {
  console.log('Testing environment variables...');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  
  if (!import.meta.env.VITE_SUPABASE_URL) {
    console.error('VITE_SUPABASE_URL is not set!');
  }
  
  if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    console.error('VITE_SUPABASE_PUBLISHABLE_KEY is not set!');
  }
  
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  };
};