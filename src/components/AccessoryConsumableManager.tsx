// src/components/AccessoryConsumableManager.tsx  
import React, { useEffect, useState } from 'react';  
import { Plus, Edit, Trash2 } from 'lucide-react';  
import { toast } from 'react-toastify';  
import * as api from '../api';  
import { Accessory, Consumable } from '../types';  

interface AccessoryConsumableManagerProps {  
  type: 'accessory' | 'consumable';  
}  

export const AccessoryConsumableManager: React.FC<AccessoryConsumableManagerProps> = ({ type }) => {  
  const [items, setItems] = useState<(Accessory | Consumable)[]>([]);  
  const [newItemName, setNewItemName] = useState('');  
  const [editingItem, setEditingItem] = useState<Accessory | Consumable | null>(null);  
  const [loading, setLoading] = useState(false);  

  const fetchItems = async () => {  
    setLoading(true);  
    try {  
      const response = await (type === 'accessory' ? api.getAccessories() : api.getConsumables());  
      setItems(response.data);  
    } catch (error) {  
      toast.error(`Failed to fetch ${type}s`);  
    } finally {  
      setLoading(false);  
    }  
  };  

  useEffect(() => {  
    fetchItems();  
  }, [type]);  

  const handleAdd = async () => {  
    if (!newItemName.trim()) return;  

    try {  
      const response = await (type === 'accessory'   
        ? api.createAccessory({ name: newItemName })  
        : api.createConsumable({ name: newItemName })  
      );  
      setItems([...items, response.data]);  
      setNewItemName('');  
      toast.success(`${type} added successfully`);  
    } catch (error) {  
      toast.error(`Failed to add ${type}`);  
    }  
  };  

  const handleUpdate = async (id: string, name: string) => {  
    try {  
      const response = await (type === 'accessory'  
        ? api.updateAccessory(id, { name })  
        : api.updateConsumable(id, { name })  
      );  
      setItems(items.map(item => item.id === id ? response.data : item));  
      setEditingItem(null);  
      toast.success(`${type} updated successfully`);  
    } catch (error) {  
      toast.error(`Failed to update ${type}`);  
    }  
  };  

  const handleDelete = async (id: string) => {  
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;  

    try {  
      await (type === 'accessory' ? api.deleteAccessory(id) : api.deleteConsumable(id));  
      setItems(items.filter(item => item.id !== id));  
      toast.success(`${type} deleted successfully`);  
    } catch (error) {  
      toast.error(`Failed to delete ${type}`);  
    }  
  };  

  return (  
    <div className="bg-white rounded-lg shadow p-6">  
      <h2 className="text-xl font-semibold mb-4">Manage {type === 'accessory' ? 'Accessories' : 'Consumables'}</h2>  

      {/* Add new item */}  
      <div className="flex gap-2 mb-4">  
        <input  
          type="text"  
          value={newItemName}  
          onChange={(e) => setNewItemName(e.target.value)}  
          placeholder={`Enter ${type} name`}  
          className="flex-1 rounded-md border-gray-300 shadow-sm"  
        />  
        <button  
          onClick={handleAdd}  
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"  
        >  
          <Plus className="w-4 h-4 mr-1" />  
          Add  
        </button>  
      </div>  

      {/* List items */}  
      {loading ? (  
        <div className="flex justify-center py-4">  
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>  
        </div>  
      ) : (  
        <div className="space-y-2">  
          {items.map(item => (  
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">  
              {editingItem?.id === item.id ? (  
                <input  
                  type="text"  
                  value={editingItem.name}  
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}  
                  className="flex-1 rounded-md border-gray-300 shadow-sm mr-2"  
                />  
              ) : (  
                <span>{item.name}</span>  
              )}  

              <div className="flex gap-2">  
                {editingItem?.id === item.id ? (  
                  <>  
                    <button  
                      onClick={() => handleUpdate(item.id, editingItem.name)}  
                      className="text-green-600 hover:text-green-800"  
                    >  
                      Save  
                    </button>  
                    <button  
                      onClick={() => setEditingItem(null)}  
                      className="text-gray-600 hover:text-gray-800"  
                    >  
                      Cancel  
                    </button>  
                  </>  
                ) : (  
                  <>  
                    <button  
                      onClick={() => setEditingItem(item)}  
                      className="text-blue-600 hover:text-blue-800"  
                    >  
                      <Edit className="w-4 h-4" />  
                    </button>  
                    <button  
                      onClick={() => handleDelete(item.id)}  
                      className="text-red-600 hover:text-red-800"  
                    >  
                      <Trash2 className="w-4 h-4" />  
                    </button>  
                  </>  
                )}  
              </div>  
            </div>  
          ))}  
        </div>  
      )}  
    </div>  
  );  
};  