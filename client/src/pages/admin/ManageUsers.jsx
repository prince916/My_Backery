import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { adminService } from '../../services/index';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]   = useState('');
  const [roleModal, setRoleModal] = useState({ open: false, user: null });
  const [newRole, setNewRole]     = useState('user');
  const [saving, setSaving]       = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAllUsers({ page, search: search || undefined, limit: 20 });
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleRoleUpdate = async () => {
    try {
      setSaving(true);
      await adminService.updateUserRole(roleModal.user._id, newRole);
      toast.success('User role updated');
      setRoleModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await adminService.deactivateUser(id);
      toast.success('User deactivated');
      fetchUsers();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      <Helmet><title>Manage Users — Admin</title></Helmet>
      <h1 className="section-title">Users</h1>

      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search users..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-9 py-2 text-sm" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-border">
              <tr>
                {['User','Email','Phone','Role','Joined','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-dark-border rounded animate-pulse" /></td>)}</tr>
                ))
              ) : users.map((user) => (
                <tr key={user._id} className={`hover:bg-gray-50/50 dark:hover:bg-dark-border/30 ${!user.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setRoleModal({ open: true, user }); setNewRole(user.role); }}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Role
                      </button>
                      {user.isActive && (
                        <button onClick={() => handleDeactivate(user._id)} className="text-xs text-red-400 hover:underline font-medium">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={roleModal.open} onClose={() => setRoleModal({ open: false, user: null })} title="Update User Role" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{roleModal.user?.name} ({roleModal.user?.email})</p>
          <div>
            <label className="label">Role</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-field">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setRoleModal({ open: false, user: null })} className="flex-1">Cancel</Button>
            <Button onClick={handleRoleUpdate} isLoading={saving} className="flex-1">Update Role</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
