import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchPorts,
  createPort,
  updatePort,
  deletePort,
} from '../api/port';

const PortManagement = () => {
  const [ports, setPorts] = useState([]);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    port_name: '',
    location: '',
    capacity: '',
    contact_email: '',
  });

  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
      setUser(session.user);
    } else {
      alert('You must be logged in to view ports');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadPorts();
    }
  }, [user]);

  const loadPorts = async () => {
    try {
      const res = await fetchPorts();
      setPorts(res.data);
    } catch (err) {
      console.error('Error loading ports:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updatePort(formData.id, formData);
      } else {
        await createPort(formData);
      }
      loadPorts();
      resetForm();
    } catch (err) {
      console.error('Error saving port:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      port_name: '',
      location: '',
      capacity: '',
      contact_email: '',
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (port) => {
    setFormData({
      id: port.id,
      port_name: port.port_name,
      location: port.location,
      capacity: port.capacity,
      contact_email: port.contact_email,
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this port?')) {
      try {
        await deletePort(id);
        loadPorts();
      } catch (err) {
        console.error('Error deleting port:', err);
      }
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Export to Excel
  const exportToExcel = () => {
    if (ports.length === 0) {
      alert('No ports to export!');
      return;
    }
    const dataToExport = ports.map((port) => ({
      PortName: port.port_name,
      Location: port.location,
      Capacity: port.capacity,
      ContactEmail: port.contact_email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ports');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'ports_export.xlsx');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (ports.length === 0) {
      alert('No ports to export!');
      return;
    }
    const headers = ['Port Name', 'Location', 'Capacity', 'Contact Email'];
    const rows = ports.map((port) => [
      port.port_name,
      port.location,
      port.capacity,
      port.contact_email,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'ports_export.csv');
  };

  const styles = {
    container: { maxWidth: 900, margin: '2rem auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333', padding: '0 1rem' },
    heading: { textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' },
    buttonPrimary: { backgroundColor: '#3498db', color: 'white', padding: '0.5rem 1.1rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
    contactList: { listStyle: 'none', paddingLeft: 0, maxWidth: 900, margin: '0 auto' },
    contactItem: { backgroundColor: '#fff', padding: '1rem 1.5rem', marginBottom: '0.7rem', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
    contactActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    actionButton: { backgroundColor: '#2980b9', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
    actionButtonDanger: { backgroundColor: '#c0392b' },
    exportButton: { backgroundColor: '#27ae60', color: 'white', padding: '0.5rem 1.1rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Port Management</h2>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button onClick={exportToExcel} style={styles.exportButton}>Export to Excel</button>
        <button onClick={exportToCSV} style={{ ...styles.exportButton, backgroundColor: '#f39c12' }}>Export to CSV</button>
      </div>

      {/* Add Port (Admin only) */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.buttonPrimary}>Add Port</button>
        </div>
      )}

      {/* Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            name="port_name"
            value={formData.port_name}
            onChange={handleChange}
            placeholder="Port Name"
            required
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            required
          />
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Capacity"
            required
          />
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            placeholder="Contact Email"
            required
          />
          <button type="submit">{editing ? 'Update' : 'Create'} Port</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      {/* Port List */}
      <ul style={styles.contactList}>
        {ports.length === 0 && <li>No ports found.</li>}
        {ports.map((port) => (
          <li key={port.id} style={styles.contactItem}>
            <div>
              <strong>{port.port_name}</strong><br />
              Location: {port.location}<br />
              Capacity: {port.capacity}<br />
              Contact Email: {port.contact_email}
            </div>
            {isAdmin && (
              <div style={styles.contactActions}>
                <button onClick={() => handleEdit(port)} style={styles.actionButton}>Edit</button>
                <button
                  onClick={() => handleDelete(port.id)}
                  style={{ ...styles.actionButton, ...styles.actionButtonDanger }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortManagement;
