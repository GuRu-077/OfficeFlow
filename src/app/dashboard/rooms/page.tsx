'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Room } from '@/lib/types';
import { DoorOpen, Plus, MoreVertical, Edit2, Trash2, X } from 'lucide-react';

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
  
  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    db.getRooms().then(r => {
      setRooms(r);
      setLoading(false);
    });
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom.name || !currentRoom.capacity) return;

    if (modalMode === 'add') {
      const newRoom = await db.createRoom({
        name: currentRoom.name,
        capacity: Number(currentRoom.capacity) || 5,
        location: currentRoom.location || '',
        floor: currentRoom.floor || '',
        amenities: currentRoom.amenities ? (typeof currentRoom.amenities === 'string' ? (currentRoom.amenities as string).split(',').map(s => s.trim()) : currentRoom.amenities) : [],
        availability: currentRoom.availability || 'available',
        status: currentRoom.status || 'active'
      });
      setRooms([...rooms, newRoom]);
    } else if (modalMode === 'edit' && currentRoom.id) {
      const updatedRoom = await db.updateRoom(currentRoom.id, {
        name: currentRoom.name,
        capacity: Number(currentRoom.capacity),
        location: currentRoom.location,
        floor: currentRoom.floor,
        amenities: typeof currentRoom.amenities === 'string' ? currentRoom.amenities.split(',').map(s => s.trim()) : currentRoom.amenities,
        availability: currentRoom.availability,
        status: currentRoom.status
      });
      setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    }

    setShowModal(false);
    setCurrentRoom({});
  };

  const handleDelete = async (id: string) => {
    await db.deleteRoom(id);
    setRooms(rooms.filter(r => r.id !== id));
    setShowDeleteConfirm(null);
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage office conference rooms and workspaces.</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <button 
            onClick={() => { setModalMode('add'); setCurrentRoom({ availability: 'available', status: 'active', amenities: [] }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm relative group">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${room.availability === 'available' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                <DoorOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{room.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${room.availability === 'available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800'}`}>
                  {room.availability.charAt(0).toUpperCase() + room.availability.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Capacity</span>
                <span className="font-medium text-gray-900 dark:text-white">{room.capacity} people</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Location</span>
                <span className="font-medium text-gray-900 dark:text-white">{room.location}, Floor {room.floor}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2">Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map(amenity => (
                    <span key={amenity} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {(user?.role === 'Admin' || user?.role === 'Manager') && (
              <div className="mt-6 flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => { setModalMode('edit'); setCurrentRoom({ ...room, amenities: room.amenities.join(', ') as any }); setShowModal(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-transparent dark:border-indigo-800/30"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(room.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent dark:border-red-800/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalMode === 'add' ? 'Add New Room' : 'Edit Room'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Name</label>
                <input required type="text" value={currentRoom.name || ''} onChange={e => setCurrentRoom({...currentRoom, name: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input required type="number" min="1" value={currentRoom.capacity || ''} onChange={e => setCurrentRoom({...currentRoom, capacity: e.target.value as any})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor</label>
                  <input required type="text" value={currentRoom.floor || ''} onChange={e => setCurrentRoom({...currentRoom, floor: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input required type="text" value={currentRoom.location || ''} onChange={e => setCurrentRoom({...currentRoom, location: e.target.value})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenities (comma separated)</label>
                <input type="text" value={(currentRoom.amenities as any) || ''} onChange={e => setCurrentRoom({...currentRoom, amenities: e.target.value as any})} placeholder="e.g. Projector, Whiteboard" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
                <select value={currentRoom.availability || 'available'} onChange={e => setCurrentRoom({...currentRoom, availability: e.target.value as any})} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 text-gray-900 dark:text-white">
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Save Room</button>
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Room?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete this room? This action cannot be undone.</p>
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
