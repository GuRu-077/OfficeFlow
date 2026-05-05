'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Resource } from '@/lib/types';
import { MonitorSpeaker, Plus, MoreVertical, Edit2, Trash2, X } from 'lucide-react';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({});
  
  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () => {
    setLoading(true);
    db.getResources().then(r => {
      setResources(r);
      setLoading(false);
    });
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResource.name || !currentResource.type) return;

    if (modalMode === 'add') {
      const newResource = await db.createResource({
        name: currentResource.name,
        type: currentResource.type,
        quantity: Number(currentResource.quantity) || 1,
        availableCount: Number(currentResource.quantity) || 1, // Fresh resource
        status: currentResource.status || 'active'
      });
      setResources([...resources, newResource]);
    } else if (modalMode === 'edit' && currentResource.id) {
      // Find old to adjust available count if total changed
      const oldRes = resources.find(r => r.id === currentResource.id);
      const newQty = Number(currentResource.quantity);
      let newAvailable = currentResource.availableCount;
      if (oldRes && newQty !== oldRes.quantity) {
        const diff = newQty - oldRes.quantity;
        newAvailable = Math.max(0, oldRes.availableCount + diff);
      }

      const updatedResource = await db.updateResource(currentResource.id, {
        name: currentResource.name,
        type: currentResource.type,
        quantity: newQty,
        availableCount: newAvailable,
        status: currentResource.status
      });
      setResources(resources.map(r => r.id === updatedResource.id ? updatedResource : r));
    }

    setShowModal(false);
    setCurrentResource({});
  };

  const handleDelete = async (id: string) => {
    await db.deleteResource(id);
    setResources(resources.filter(r => r.id !== id));
    setShowDeleteConfirm(null);
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resources Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage shared office equipment like projectors and laptops.</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button 
            onClick={() => { setModalMode('add'); setCurrentResource({ status: 'active', quantity: 1 }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Resource Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Total Quantity</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Available</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                {(user?.role === 'Admin' || user?.role === 'Manager') && (
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {resources.map(res => (
                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                        <MonitorSpeaker className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{res.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{res.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{res.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${res.availableCount === 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {res.availableCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${res.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
                      {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                    </span>
                  </td>
                  {(user?.role === 'Admin' || user?.role === 'Manager') && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setModalMode('edit'); setCurrentResource(res); setShowModal(true); }}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(res.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalMode === 'add' ? 'Add New Resource' : 'Edit Resource'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveResource} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Name</label>
                <input required type="text" value={currentResource.name || ''} onChange={e => setCurrentResource({...currentResource, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <input required type="text" placeholder="e.g. Laptop" value={currentResource.type || ''} onChange={e => setCurrentResource({...currentResource, type: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Quantity</label>
                  <input required type="number" min="1" value={currentResource.quantity || ''} onChange={e => setCurrentResource({...currentResource, quantity: e.target.value as any})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={currentResource.status || 'active'} onChange={e => setCurrentResource({...currentResource, status: e.target.value as any})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Save Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Resource?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete this resource? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
