
import { useState } from "react"


export const useLogin = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
        setLoading(false);
        setError(data.message || 'Something went wrong');
        return false;
        }
        if (response.ok) {
        setLoading(false);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
        }
    };
    
    return { login, error, loading };
    }   