import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchCargo,
  createCargo,
  updateCargo,
} from '../api/cargo';
import { fetchClients } from '../api/clients'; // ✅ Added import

const CargoManagement = () => {
  const [cargoItems, setCargoItems] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [clients, setClients] = useState([]); // ✅ Added state for clients

  const [formData, setFormData] = useState({
    id: null,
    description: '',
    weight: '',
    volume: '',
    client: '',
    cargo_type: 'general',
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
      alert('You must be logged in to view cargo items');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadCargo();
      loadClients(); // ✅ Fetch clients when user is set
    }
  }, [user]);

  const loadCargo = async () => {
    try {
      const res = await fetchCargo();
      setCargoItems(res.data);
    } catch (err) {
      console.error('Error loading cargo:', err);
    }
  };

  const loadClients = async () => {
    try {
      const res = await fetchClients();
      setClients(res.data);
    } catch (err) {
      console.error('Error loading clients:', err);
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
        await updateCargo(formData.id, formData);
      } else {
        await createCargo(formData);
      }
      loadCargo();
      resetForm();
    } catch (err) {
      console.error('Error saving cargo:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      description: '',
      weight: '',
      volume: '',
      client: '',
      cargo_type: 'general',
      is_active: true,
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (cargo) => {
    setFormData({
      id: cargo.id,
      description: cargo.description,
      weight: cargo.weight,
      volume: cargo.volume,
      client: cargo.client || '',
      cargo_type: cargo.cargo_type,
      is_active: cargo.is_active,
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleToggleActive = async (cargo) => {
    try {
      const updatedCargo = { ...cargo, is_active: !cargo.is_active };
      await updateCargo(cargo.id, updatedCargo);
      loadCargo();
    } catch (err) {
      console.error('Error toggling cargo status:', err);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const filteredCargo = cargoItems.filter((cargo) => {
    if (!isAdmin && !cargo.is_active) return false;
    if (selectedTypeFilter && cargo.cargo_type !== selectedTypeFilter) return false;
    return true;
  });

  const exportToExcel = () => {
    if (filteredCargo.length === 0) {
      alert('No cargo items to export!');
      return;
    }
    const dataToExport = filteredCargo.map((cargo) => ({
      Description: cargo.description,
      Weight: cargo.weight,
      Volume: cargo.volume,
      Client: cargo.client || 'N/A',
      Type: cargo.cargo_type,
      Active: cargo.is_active ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cargo');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'cargo_export.xlsx');
  };

  const exportToCSV = () => {
    if (filteredCargo.length === 0) {
      alert('No cargo items to export!');
      return;
    }
    const headers = ['Description', 'Weight', 'Volume', 'Client', 'Type', 'Active'];
    const rows = filteredCargo.map((cargo) => [
      cargo.description,
      cargo.weight,
      cargo.volume,
      cargo.client || 'N/A',
      cargo.cargo_type,
      cargo.is_active ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'cargo_export.csv');
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
      <h2 style={styles.heading}>Cargo Management</h2>

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Type: </label>
        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">-- All --</option>
          <option value="perishable">Perishable</option>
          <option value="dangerous">Dangerous</option>
          <option value="general">General</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button onClick={exportToExcel} style={styles.exportButton}>Export to Excel</button>
        <button onClick={exportToCSV} style={{ ...styles.exportButton, backgroundColor: '#f39c12' }}>Export to CSV</button>
      </div>

      {/* Add Cargo (Admin only) */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.buttonPrimary}>Add Cargo</button>
        </div>
      )}

      {/* Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            name="weight"
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Weight (kg)"
            required
          />
          <input
            name="volume"
            type="number"
            step="0.01"
            value={formData.volume}
            onChange={handleChange}
            placeholder="Volume (m³)"
          />
          {/* ✅ Changed Client input to dropdown */}
          <select
            name="client"
            value={formData.client}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name || `Client ${client.id}`}
              </option>
            ))}
          </select>
          <select name="cargo_type" value={formData.cargo_type} onChange={handleChange} required>
            <option value="perishable">Perishable</option>
            <option value="dangerous">Dangerous</option>
            <option value="general">General</option>
            <option value="other">Other</option>
          </select>
          <label>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active
          </label>

          <button type="submit">{editing ? 'Update' : 'Create'} Cargo</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      {/* Cargo List */}
      <ul style={styles.contactList}>
        {filteredCargo.length === 0 && <li>No cargo found.</li>}
        {filteredCargo.map((cargo) => (
          <li key={cargo.id} style={styles.contactItem}>
            <div>
              <strong>{cargo.description}</strong><br />
              Weight: {cargo.weight} kg<br />
              Volume: {cargo.volume || 'N/A'} m³<br />
              Client: {cargo.client || 'N/A'}<br />
              Type: {cargo.cargo_type}<br />
              Status: <span style={{ color: cargo.is_active ? 'green' : 'red' }}>{cargo.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            {isAdmin && (
              <div style={styles.contactActions}>
                <button onClick={() => handleEdit(cargo)} style={styles.actionButton}>Edit</button>
                <button
                  onClick={() => handleToggleActive(cargo)}
                  style={{
                    ...styles.actionButton,
                    ...(cargo.is_active ? styles.actionButtonDanger : {})
                  }}
                >
                  {cargo.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CargoManagement;
