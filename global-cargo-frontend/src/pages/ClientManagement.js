import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchClients,
  createClient,
  updateClient,
} from '../api/clients';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);
  const [sortField, setSortField] = useState('company_name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [formData, setFormData] = useState({
    id: null,
    company_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });

  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load session and user
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
      setUser(session.user);
    } else {
      alert('You must be logged in to view clients');
      window.location.href = '/login';
    }
  }, []);

  // Load clients when user is set
  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const res = await fetchClients();
      setClients(res.data);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateClient(formData.id, formData);
      } else {
        await createClient(formData);
      }
      loadClients();
      resetForm();
    } catch (err) {
      console.error('Error saving client:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      company_name: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      address: '',
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (client) => {
    setFormData({
      id: client.id,
      company_name: client.company_name,
      contact_person: client.contact_person,
      contact_email: client.contact_email,
      contact_phone: client.contact_phone,
      address: client.address,
    });
    setEditing(true);
    setShowForm(true);
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Sort clients
  const sortedClients = [...clients].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (sortField === 'registered_date') {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (clients.length === 0) {
      alert('No clients to export!');
      return;
    }
    const dataToExport = clients.map((c) => ({
      Company: c.company_name,
      ContactPerson: c.contact_person,
      Email: c.contact_email,
      Phone: c.contact_phone,
      Address: c.address,
      Registered: c.registered_date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'clients.xlsx');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (clients.length === 0) {
      alert('No clients to export!');
      return;
    }
    const headers = ['Company', 'ContactPerson', 'Email', 'Phone', 'Address', 'Registered'];
    const rows = clients.map((c) => [
      c.company_name,
      c.contact_person,
      c.contact_email,
      c.contact_phone,
      c.address,
      c.registered_date,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'clients.csv');
  };

  const styles = {
    container: { maxWidth: 900, margin: '2rem auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333', padding: '0 1rem' },
    heading: { textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { borderBottom: '2px solid #ccc', cursor: 'pointer', padding: '0.5rem' },
    td: { borderBottom: '1px solid #eee', padding: '0.5rem' },
    buttonPrimary: { backgroundColor: '#3498db', color: 'white', padding: '0.5rem 1.1rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
    exportButton: { backgroundColor: '#27ae60', color: 'white', padding: '0.5rem 1.1rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Client Management</h2>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button onClick={exportToExcel} style={styles.exportButton}>Export to Excel</button>
        <button onClick={exportToCSV} style={{ ...styles.exportButton, backgroundColor: '#f39c12' }}>Export to CSV</button>
      </div>

      {/* Add Client */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.buttonPrimary}>Add Client</button>
        </div>
      )}

      {/* Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Company Name" required />
          <input name="contact_person" value={formData.contact_person} onChange={handleChange} placeholder="Contact Person" required />
          <input name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} placeholder="Contact Email" required />
          <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} placeholder="Contact Phone" required />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />

          <button type="submit">{editing ? 'Update' : 'Create'} Client</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      {/* Clients Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => handleSortChange('company_name')}>Company {sortField === 'company_name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
            <th style={styles.th} onClick={() => handleSortChange('contact_person')}>Contact Person {sortField === 'contact_person' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Address</th>
            <th style={styles.th} onClick={() => handleSortChange('registered_date')}>Registered {sortField === 'registered_date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
            {isAdmin && <th style={styles.th}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedClients.length === 0 && (
            <tr><td colSpan={isAdmin ? 7 : 6}>No clients found.</td></tr>
          )}
          {sortedClients.map((client) => (
            <tr key={client.id}>
              <td style={styles.td}>{client.company_name}</td>
              <td style={styles.td}>{client.contact_person}</td>
              <td style={styles.td}>{client.contact_email}</td>
              <td style={styles.td}>{client.contact_phone}</td>
              <td style={styles.td}>{client.address}</td>
              <td style={styles.td}>{client.registered_date}</td>
              {isAdmin && (
                <td style={styles.td}>
                  <button onClick={() => handleEdit(client)} style={{ marginRight: '0.5rem' }}>Edit</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientManagement;
