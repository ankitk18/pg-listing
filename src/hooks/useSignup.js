import { useState } from 'react';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const signup = async (name, email, password, phone, profileUrl) => {
    setLoading(true);
    setError(null);
    const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone, profileUrl }),
    });
    const data = await response.json();
    if(!response.ok) {
      setLoading(false);
      setError(data.message || 'Something went wrong');
      return;
    }
    if(response.ok){
        setLoading(false);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
  };

  return { signup, error, loading };
}