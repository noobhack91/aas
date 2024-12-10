// Modified useAuth hook  
import { useEffect, useState, useCallback } from 'react';  
import { useLocation, useNavigate } from 'react-router-dom';  

interface User {  
  id: string;  
  username: string;  
  email: string;  
  roles: Array<'admin' | 'logistics' | 'challan' | 'installation' | 'invoice' | 'super_admin'>;  
}  

export const useAuth = () => {  
  const [isAuthenticated, setIsAuthenticated] = useState(false);  
  const [loading, setLoading] = useState(true);  
  const [user, setUser] = useState<User | null>(null);  
  const navigate = useNavigate();  
  const location = useLocation();  

  // Check authentication status on component mount  
  useEffect(() => {  
    checkAuth();  
  }, []);  

  // Improved authentication check  
  const checkAuth = useCallback(async () => {  
    try {  
      const token = localStorage.getItem('token');  
      const userData = localStorage.getItem('user');  

      if (!token || !userData) {  
        handleLogout();  
        return;  
      }  

      const parsedUser: User = JSON.parse(userData);  

      // Validate token and user data structure  
      if (!parsedUser.id || !parsedUser.roles || !Array.isArray(parsedUser.roles)) {  
        handleLogout();  
        return;  
      }  

      setIsAuthenticated(true);  
      setUser(parsedUser);  
    } catch (error) {  
      console.error('Auth check error:', error);  
      handleLogout();  
    } finally {  
      setLoading(false);  
    }  
  }, []);  

  // Improved login function  
  const login = useCallback(async (token: string, userData: User) => {  
    try {  
      // Validate user data before storing  
      if (!userData.id || !userData.roles || !Array.isArray(userData.roles)) {  
        throw new Error('Invalid user data structure');  
      }  

      localStorage.setItem('token', token);  
      localStorage.setItem('user', JSON.stringify(userData));  

      // Update states in sequence  
      await Promise.all([  
        setIsAuthenticated(true),  
        setUser(userData)  
      ]);  

      navigate('/tenders', { replace: true });  
    } catch (error) {  
      console.error('Login error:', error);  
      handleLogout();  
    }  
  }, [navigate]);  

  // Improved logout function  
  const handleLogout = useCallback(() => {  
    localStorage.removeItem('token');  
    localStorage.removeItem('user');  

    // Update states in sequence  
    setIsAuthenticated(false);  
    setUser(null);  
    setLoading(false);  
  }, []);  

  const logout = useCallback(() => {  
    handleLogout();  
    navigate('/login', { replace: true });  
  }, [navigate]);  

  return {  
    isAuthenticated,  
    loading,  
    user,  
    login,  
    logout,
    checkAuth  
  };  
};  