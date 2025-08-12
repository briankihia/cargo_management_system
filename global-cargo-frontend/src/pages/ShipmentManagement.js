import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchShipments,
  createShipment,
  updateShipment,
  deleteShipment,
} from '../api/shipments';

const ShipmentManagement = () => {
  const [shipmentItems, setShipmentItems] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    cargo: '',
    ship: '',
    origin_port: '',
    destination_port: '',
    departure_date: '',
    arrival_estimate: '',
    actual_arrival_date: '',
    status: 'pending',
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
      alert('You must be logged in to view shipments');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadShipments();
    }
  }, [user]);

  const loadShipments = async () => {
    try {
      const res = await fetchShipments();
      setShipmentItems(res.data);
    } catch (err) {
      console.error('Error loading shipments:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateShipment(formData.id, formData);
      } else {
        await createShipment(formData);
      }
      loadShipments();
      resetForm();
    } catch (err) {
      console.error('Error saving shipment:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      cargo: '',
      ship: '',
      origin_port: '',
      destination_port: '',
      departure_date: '',
      arrival_estimate: '',
      actual_arrival_date: '',
      status: 'pending',
      is_active: true,
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (shipment) => {
    setFormData({
      id: shipment.id,
      cargo: shipment.cargo || '',
      ship: shipment.ship || '',
      origin_port: shipment.origin_port || '',
      destination_port: shipment.destination_port || '',
      departure_date: shipment.departure_date,
      arrival_estimate: shipment.arrival_estimate,
      actual_arrival_date: shipment.actual_arrival_date || '',
      status: shipment.status,
      is_active: shipment.is_active,
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleToggleActive = async (shipment) => {
    try {
      const updatedShipment = { ...shipment, is_active: !shipment.is_active };
      await updateShipment(shipment.id, updatedShipment);
      loadShipments();
    } catch (err) {
      console.error('Error toggling shipment status:', err);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const filteredShipments = shipmentItems.filter((shipment) => {
    if (!isAdmin && !shipment.is_active) return false;
    if (selectedStatusFilter && shipment.status !== selectedStatusFilter) return false;
    return true;
  });

  // Export to Excel
  const exportToExcel = () => {
    if (filteredShipments.length === 0) {
      alert('No shipments to export!');
      return;
    }
    const dataToExport = filteredShipments.map((s) => ({
      Cargo: s.cargo || 'N/A',
      Ship: s.ship || 'N/A',
      Origin: s.origin_port || 'N/A',
      Destination: s.destination_port || 'N/A',
      Departure: s.departure_date,
      ETA: s.arrival_estimate,
      Arrival: s.actual_arrival_date || 'N/A',
      Status: s.status,
      Active: s.is_active ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipments');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'shipments_export.xlsx');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredShipments.length === 0) {
      alert('No shipments to export!');
      return;
    }
    const headers = ['Cargo', 'Ship', 'Origin', 'Destination', 'Departure', 'ETA', 'Arrival', 'Status', 'Active'];
    const rows = filteredShipments.map((s) => [
      s.cargo || 'N/A',
      s.ship || 'N/A',
      s.origin_port || 'N/A',
      s.destination_port || 'N/A',
      s.departure_date,
      s.arrival_estimate,
      s.actual_arrival_date || 'N/A',
      s.status,
      s.is_active ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    saveAs(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'shipments_export.csv');
  };

  const styles = {
    container: { maxWidth: 900, margin: '2rem auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    heading: { textAlign: 'center', marginBottom: '1.5rem' },
    select: { padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem', minWidth: 200 },
    buttonPrimary: { backgroundColor: '#3498db', color: 'white', padding: '0.5rem 1.1rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
    contactList: { listStyle: 'none', paddingLeft: 0 },
    contactItem: { backgroundColor: '#fff', padding: '1rem', marginBottom: '0.7rem', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' },
    contactActions: { display: 'flex', gap: '0.5rem' },
    exportButton: { backgroundColor: '#27ae60', color: 'white', padding: '0.5rem 1.1rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Shipment Management</h2>

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Status: </label>
        <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} style={styles.select}>
          <option value="">-- All --</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button onClick={exportToExcel} style={styles.exportButton}>Export to Excel</button>
        <button onClick={exportToCSV} style={{ ...styles.exportButton, backgroundColor: '#f39c12' }}>Export to CSV</button>
      </div>

      {/* Add Shipment (Admin only) */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.buttonPrimary}>Add Shipment</button>
        </div>
      )}

      {/* Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <input name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Cargo ID" required />
          <input name="ship" value={formData.ship} onChange={handleChange} placeholder="Ship ID" required />
          <input name="origin_port" value={formData.origin_port} onChange={handleChange} placeholder="Origin Port ID" required />
          <input name="destination_port" value={formData.destination_port} onChange={handleChange} placeholder="Destination Port ID" required />
          <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} required />
          <input type="date" name="arrival_estimate" value={formData.arrival_estimate} onChange={handleChange} required />
          <input type="date" name="actual_arrival_date" value={formData.actual_arrival_date} onChange={handleChange} />
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="delayed">Delayed</option>
          </select>
          <label>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active
          </label>
          <button type="submit">{editing ? 'Update' : 'Create'} Shipment</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      {/* Shipment List */}
      <ul style={styles.contactList}>
        {filteredShipments.length === 0 && <li>No shipments found.</li>}
        {filteredShipments.map((s) => (
          <li key={s.id} style={styles.contactItem}>
            <div>
              <strong>Shipment {s.id}</strong><br />
              Cargo: {s.cargo || 'N/A'}<br />
              Ship: {s.ship || 'N/A'}<br />
              From: {s.origin_port || 'N/A'} → {s.destination_port || 'N/A'}<br />
              Departure: {s.departure_date} | ETA: {s.arrival_estimate}<br />
              Arrival: {s.actual_arrival_date || 'N/A'}<br />
              Status: {s.status}<br />
              Active: <span style={{ color: s.is_active ? 'green' : 'red' }}>{s.is_active ? 'Yes' : 'No'}</span>
            </div>
            {isAdmin && (
              <div style={styles.contactActions}>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleToggleActive(s)}>{s.is_active ? 'Deactivate' : 'Activate'}</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShipmentManagement;
