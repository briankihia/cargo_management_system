import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchShips,
  createShip,
  updateShip,
} from '../api/ships';

const Ships = () => {
  const [ships, setShips] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    registration_number: '',
    capacity_in_tonnes: '',
    type: 'cargo ship',
    status: 'active',
    is_active: true,
  });

  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
      setUser(session.user);
    } else {
      alert('You must be logged in to view ships');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadShips();
    }
  }, [user]);

  const loadShips = async () => {
    try {
      const res = await fetchShips();
      setShips(res.data);
    } catch (err) {
      console.error('Error loading ships:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateShip(formData.id, formData);
      } else {
        await createShip(formData);
      }
      loadShips();
      resetForm();
    } catch (err) {
      console.error('Error saving ship:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      registration_number: '',
      capacity_in_tonnes: '',
      type: 'cargo ship',
      status: 'active',
      is_active: true,
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (ship) => {
    setFormData({
      id: ship.id,
      name: ship.name,
      registration_number: ship.registration_number,
      capacity_in_tonnes: ship.capacity_in_tonnes,
      type: ship.type,
      status: ship.status,
      is_active: ship.is_active,
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleToggleActive = async (ship) => {
    try {
      const updatedShip = { ...ship, is_active: !ship.is_active };
      await updateShip(ship.id, updatedShip);
      loadShips();
    } catch (err) {
      console.error('Error toggling ship status:', err);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const filteredShips = ships.filter((ship) => {
    if (!isAdmin && !ship.is_active) return false;
    if (selectedStatusFilter && ship.status !== selectedStatusFilter) return false;
    return true;
  });

  // Export to Excel
  const exportToExcel = () => {
    if (filteredShips.length === 0) {
      alert('No ships to export!');
      return;
    }
    const dataToExport = filteredShips.map((ship) => ({
      Name: ship.name,
      "Registration Number": ship.registration_number,
      "Capacity (tonnes)": ship.capacity_in_tonnes,
      Type: ship.type,
      Status: ship.status,
      Active: ship.is_active ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ships');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'ships_export.xlsx');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredShips.length === 0) {
      alert('No ships to export!');
      return;
    }
    const headers = ['Name', 'Registration Number', 'Capacity (tonnes)', 'Type', 'Status'];
    const rows = filteredShips.map((ship) => [
      ship.name,
      ship.registration_number,
      ship.capacity_in_tonnes,
      ship.type,
      ship.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'ships_export.csv');
  };

  const styles = {
    container: { maxWidth: 900, margin: '2rem auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333', padding: '0 1rem' },
    heading: { textAlign: 'center', marginBottom: '1.5rem', color: '#2c3e50' },
    select: { padding: '0.4rem 0.6rem', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem', minWidth: 200 },
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
      <h2 style={styles.heading}>Ships</h2>

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Status: </label>
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">-- All --</option>
          <option value="active">Active</option>
          <option value="under maintenance">Under Maintenance</option>
          <option value="decommissioned">Decommissioned</option>
        </select>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button onClick={exportToExcel} style={styles.exportButton}>Export to Excel</button>
        <button onClick={exportToCSV} style={{ ...styles.exportButton, backgroundColor: '#f39c12' }}>Export to CSV</button>
      </div>

      {/* Add Ship (Admin only) */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.buttonPrimary}>Add Ship</button>
        </div>
      )}

      {/* Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Ship Name" required />
          <input name="registration_number" value={formData.registration_number} onChange={handleChange} placeholder="Registration Number" required />
          <input name="capacity_in_tonnes" type="number" step="0.01" value={formData.capacity_in_tonnes} onChange={handleChange} placeholder="Capacity in Tonnes" required />
          
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="cargo ship">Cargo Ship</option>
            <option value="passenger ship">Passenger Ship</option>
            <option value="military ship">Military Ship</option>
            <option value="icebreaker">Icebreaker</option>
            <option value="fishing vessel">Fishing Vessel</option>
            <option value="barge ship">Barge Ship</option>
          </select>

          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="active">Active</option>
            <option value="under maintenance">Under Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </select>

          <label>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active
          </label>

          <button type="submit">{editing ? 'Update' : 'Create'} Ship</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      {/* Ship List */}
      <ul style={styles.contactList}>
        {filteredShips.length === 0 && <li>No ships found.</li>}
        {filteredShips.map((ship) => (
          <li key={ship.id} style={styles.contactItem}>
            <div>
              <strong>{ship.name}</strong> ({ship.registration_number})<br />
              Capacity: {ship.capacity_in_tonnes} tonnes<br />
              Type: {ship.type}<br />
              Status: <span style={{ color: ship.is_active ? 'green' : 'red' }}>{ship.status}</span>
            </div>
            {isAdmin && (
              <div style={styles.contactActions}>
                <button onClick={() => handleEdit(ship)} style={styles.actionButton}>Edit</button>
                <button
                  onClick={() => handleToggleActive(ship)}
                  style={{
                    ...styles.actionButton,
                    ...(ship.is_active ? styles.actionButtonDanger : {})
                  }}
                >
                  {ship.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ships;
