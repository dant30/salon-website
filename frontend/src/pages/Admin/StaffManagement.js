import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../components/common/Toast/Toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import './Admin.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await staffService.getStaff();
      const data = res.data?.results || res.data || [];
      const safeData = Array.isArray(data) ? data : [];  // Safety check
      setStaff(safeData);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (staffMember) => {
    try {
      if (isCreating) {
        await staffService.createStaff(staffMember);
        toast.success('Staff created');
      } else {
        await staffService.updateStaff(staffMember.id, staffMember);
        toast.success('Staff updated');
      }
      fetchStaff();
      setEditingStaff(null);
      setIsCreating(false);
    } catch (err) {
      toast.error('Failed to save staff');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this staff member?')) {
      try {
        await staffService.deleteStaff(id);
        setStaff(staff.filter(s => s.id !== id));
        toast.success('Staff deleted');
      } catch (err) {
        toast.error('Failed to delete staff');
      }
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  const safeStaff = Array.isArray(staff) ? staff : [];

  return (
    <div className="admin-page">
      <div className="page-container">
        <div className="admin-header">
          <h1>Staff Management</h1>
          <p>Manage staff members and schedules</p>
        </div>

        <button className="btn btn-primary" onClick={() => { setIsCreating(true); setEditingStaff({}); }}><FiPlus /> Add Staff</button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeStaff.map(member => (
              <tr key={member.id}>
                <td>{member.user?.full_name}</td>
                <td>{member.title}</td>
                <td>{member.user?.email}</td>
                <td>
                  <button onClick={() => setEditingStaff(member)}><FiEdit /></button>
                  <button onClick={() => handleDelete(member.id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(editingStaff || isCreating) && (
          <div className="modal">
            <div className="modal-content">
              <h3>{isCreating ? 'Add Staff' : 'Edit Staff'}</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(editingStaff); }}>
                <input type="text" placeholder="First Name" value={editingStaff.user?.first_name || ''} onChange={(e) => setEditingStaff({ ...editingStaff, user: { ...editingStaff.user, first_name: e.target.value } })} required />
                <input type="text" placeholder="Last Name" value={editingStaff.user?.last_name || ''} onChange={(e) => setEditingStaff({ ...editingStaff, user: { ...editingStaff.user, last_name: e.target.value } })} required />
                <input type="email" placeholder="Email" value={editingStaff.user?.email || ''} onChange={(e) => setEditingStaff({ ...editingStaff, user: { ...editingStaff.user, email: e.target.value } })} required />
                <input type="text" placeholder="Title" value={editingStaff.title || ''} onChange={(e) => setEditingStaff({ ...editingStaff, title: e.target.value })} required />
                <button type="submit">Save</button>
                <button onClick={() => { setEditingStaff(null); setIsCreating(false); }}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;