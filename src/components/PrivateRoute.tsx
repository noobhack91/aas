// Modified PrivateRoute.tsx  
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {  
  children: React.ReactNode;  
  adminOnly?: boolean;  
  requiredRoles?: Array<'admin' | 'super_admin' | 'logistics' | 'challan' | 'installation' | 'invoice'>;  
}  

export const PrivateRoute: React.FC<PrivateRouteProps> = ({   
  children,   
  adminOnly = false,  
  requiredRoles = []   
}) => {  
  const { isAuthenticated, user, loading, checkAuth } = useAuth();  

  // Recheck auth on mount  
  useEffect(() => {  
    checkAuth();  
  }, [checkAuth]);  

  if (loading) {  
    return (  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>  
      </div>  
    );  
  }  

  if (!isAuthenticated || !user) {  
    return <Navigate to="/login" replace />;  
  }  

  // Check for required roles  
  const hasRequiredRole = requiredRoles.length === 0 ||   
    requiredRoles.some(role => user.roles.includes(role));  
  console.log(hasRequiredRole,"role");
  
  // Check for admin access  
  const hasAdminAccess = !adminOnly || user.roles.some(role => ['admin', 'super_admin'].includes(role));  

  if (!hasRequiredRole || !hasAdminAccess) {  
    return <Navigate to="/unauthorized" replace />;  
  }  

  return <>{children}</>;  
};  