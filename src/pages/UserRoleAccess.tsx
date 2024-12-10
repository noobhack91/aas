// src/pages/UserRoleAccess.tsx  
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as api from '../api';

export const UserRoleAccess: React.FC = () => {  
  const [users, setUsers] = useState<any[]>([]); // Store the list of users  
  const [selectedUser, setSelectedUser] = useState<any>(null); // Store the currently selected user  
  const [showModal, setShowModal] = useState(false); // Modal visibility state  
  const [newRoles, setNewRoles] = useState<string[]>([]); // Store the selected roles for the user  
  const [loading, setLoading] = useState(true); // Loading state for fetching users  

  // Fetch users on component mount  
  useEffect(() => {  
    fetchUsers();  
  }, []);  

  // Fetch all users from the API  
  const fetchUsers = async () => {  
    try {  
      const response = await api.getAllUsers();  
      setUsers(response.data);  
    } catch (error) {  
      toast.error('Failed to fetch users');  
    } finally {  
      setLoading(false); // Stop loading after fetching users  
    }  
  };  

  // Handle updating user roles  
  const handleUpdateRoles = async () => {  
    if (newRoles.length === 0) {  
      toast.error('Please select at least one role');  
      return;  
    }  

    try {  
      await api.updateUserRoles(selectedUser.id, newRoles); // Send updated roles to the API  
      toast.success('User roles updated successfully');  
      fetchUsers(); // Refresh the user list  
      setShowModal(false); // Close the modal  
    } catch (error) {  
      toast.error('Failed to update user roles');  
    }  
  };  

  // Handle role selection/deselection  
  const handleRoleChange = (role: string) => {  
    setNewRoles((prevRoles) =>  
      prevRoles.includes(role)  
        ? prevRoles.filter((r) => r !== role) // Remove role if already selected  
        : [...prevRoles, role] // Add role if not selected  
    );  
  };  

  // Render loading spinner while fetching users  
  if (loading) {  
    return (  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>  
      </div>  
    );  
  }  

  return (  
    <div className="max-w-7xl mx-auto px-4 py-8">  
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Role Access</h1>  
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
          {users.map((user) => (  
            <tr key={user.id}>  
              <td className="py-2 px-4">{user.username}</td>  
              <td className="py-2 px-4">{user.email}</td>  
              <td className="py-2 px-4">{user.roles.join(', ')}</td>  
              <td className="py-2 px-4">  
                <button  
                  onClick={() => {  
                    setSelectedUser(user);  
                    setNewRoles(user.roles); // Pre-fill with existing roles  
                    setShowModal(true);  
                  }}  
                  className="bg-blue-500 text-white px-4 py-2 rounded"  
                >  
                  Edit Roles  
                </button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </table>  

      {/* Modal for editing roles */}  
      {showModal && selectedUser && (  
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">  
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">  
            <h2 className="text-xl font-bold mb-4">Edit Roles for {selectedUser.username}</h2>  
            <div className="space-y-4">  
              {['super_admin', 'admin', 'logistics', 'challan', 'installation', 'invoice'].map((role) => (  
                <div key={role} className="flex items-center">  
                  <input  
                    type="checkbox"  
                    id={role}  
                    name="roles"  
                    value={role}  
                    checked={newRoles.includes(role)} // Check if the role is selected  
                    onChange={() => handleRoleChange(role)} // Handle role selection  
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"  
                  />  
                  <label htmlFor={role} className="ml-2 text-sm text-gray-700">  
                    {role}  
                  </label>  
                </div>  
              ))}  
            </div>  
            <div className="mt-6 flex justify-end">  
              <button  
                onClick={() => setShowModal(false)}  
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"  
              >  
                Cancel  
              </button>  
              <button  
                onClick={handleUpdateRoles}  
                className="bg-blue-500 text-white px-4 py-2 rounded"  
              >  
                Save  
              </button>  
            </div>  
          </div>  
        </div>  
      )}  
    </div>  
  );  
};  