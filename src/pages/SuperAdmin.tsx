// src/pages/SuperAdmin.tsx  
import React, { useEffect, useState } from 'react';  
import { toast } from 'react-toastify';  
import * as api from '../api';  

export const SuperAdmin: React.FC = () => {  
  const [users, setUsers] = useState([]);  
  const [loading, setLoading] = useState(true);  

  useEffect(() => {  
    fetchUsers();  
  }, []);  

  const fetchUsers = async () => {  
    try {  
      const response = await api.getAllUsers();  
      setUsers(response.data);  
      setLoading(false);  
    } catch (error) {  
      toast.error('Failed to fetch users');  
      setLoading(false);  
    }  
  };  

  const handleUpdateRoles = async (userId: string, roles: string[]) => {  
    try {  
      await api.updateUserRoles(userId, roles);  
      toast.success('User roles updated successfully');  
      fetchUsers(); // Refresh user list  
    } catch (error) {  
      toast.error('Failed to update user roles');  
    }  
  };  

  return (  
    <div className="max-w-7xl mx-auto px-4 py-8">  
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>  
      {loading ? (  
        <div>Loading...</div>  
      ) : (  
        <table className="min-w-full bg-white">  
          <thead>  
            <tr>  
              <th className="py-2 px-4">Username</th>  
              <th className="py-2 px-4">Email</th>  
              <th className="py-2 px-4">Roles</th>  
              <th className="py-2 px-4">Actions</th>  
            </tr>  
          </thead>  
          <tbody>  
            {users.map((user: any) => (  
              <tr key={user.id}>  
                <td className="py-2 px-4">{user.username}</td>  
                <td className="py-2 px-4">{user.email}</td>  
                <td className="py-2 px-4">{user.roles.join(', ')}</td>  
                <td className="py-2 px-4">  
                  <button  
                    onClick={() => handleUpdateRoles(user.id, ['admin', 'logistics'])}  
                    className="bg-blue-500 text-white px-4 py-2 rounded"  
                  >  
                    Update Roles  
                  </button>  
                </td>  
              </tr>  
            ))}  
          </tbody>  
        </table>  
      )}  
    </div>  
  );  
};  