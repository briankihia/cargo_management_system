import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchCrew,
  createCrew,
  updateCrew,
} from '../api/crew';

const CrewManagement = () => {
  const [crewMembers, setCrewMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    ship: '',
    first_name: '',
    last_name: '',
    role: 'Captain',
    phone_number: '',
    nationality: '',
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
      alert('You must be logged in to view crew members');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadCrew();
    }
  }, [user]);

  const loadCrew = async () => {
    try {
      const res = await fetchCrew();
      setCrewMembers(res.data);
    } catch (err) {
      console.error('Error loading crew:', err);
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
        await updateCrew(formData.id, formData);
      } else {
        await createCrew(formData);
      }
      loadCrew();
      resetForm();
    } catch (err) {
      console.error('Error saving crew member:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      ship: '',
      first_name: '',
      last_name: '',
      role: 'Captain',
      phone_number: '',
      nationality: '',
      is_active: true,
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (member) => {
    setFormData({
      id: member.id,
      ship: member.ship || '',
      first_name: member.first_name,
      last_name: member.last_name,
      role: member.role,
      phone_number: member.phone_number,
      nationality: member.nationality || '',
      is_active: member.is_active,
    });
    setEditing(true);
    setShowForm(true);
  };

  const handleToggleActive = async (member) => {
    try {
      const updatedMember = { ...member, is_active: !member.is_active };
      await updateCrew(member.id, updatedMember);
      loadCrew();
    } catch (err) {
      console.error('Error toggling crew status:', err);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const filteredCrew = crewMembers.filter((member) => {
    if (!isAdmin && !member.is_active) return false;
    if (selectedRoleFilter && member.role !== selectedRoleFilter) return false;
    return true;
  });

  // Export to Excel
  const exportToExcel = () => {
    if (filteredCrew.length === 0) {
      alert('No crew members to export!');
      return;
    }
    const dataToExport = filteredCrew.map((member) => ({
      FirstName: member.first_name,
      LastName: member.last_name,
      Role: member.role,
      Phone: member.phone_number,
      Nationality: member.nationality || 'N/A',
      Ship: member.ship || 'N/A',
      Active: member.is_active ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Crew');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'crew_export.xlsx');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredCrew.length === 0) {
      alert('No crew members to export!');
      return;
    }
    const headers = ['First Name', 'Last Name', 'Role', 'Phone', 'Nationality', 'Ship', 'Active'];
    const rows = filteredCrew.map((member) => [
      member.first_name,
      member.last_name,
      member.role,
      member.phone_number,
      member.nationality || 'N/A',
      member.ship || 'N/A',
      member.is_active ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'crew_export.csv');
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
      <h2 style={styles.heading}>Crew Management</h2>

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Role: </label>
        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">-- All --</option>
          <option value="Captain">Captain</option>
          <option value="Chief Officer">Chief Officer</option>
          <option value="Able Seaman">Able Seaman</option>
          <option value="Ordinary Seaman">Ordinary Seaman</option>
          <option value="Engine Cadet">Engine Cadet</option>
          <option value="Radio Officer">Radio Officer</option>
          <option value="Chief Cook">Chief Cook</option>
          <option value="Steward">Steward</option>
          <option value="Deckhand">Deckhand</option>
        </select>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button onClick={exportToExcel} style={styles.exportButton}>Export to Excel</button>
        <button onClick={exportToCSV} style={{ ...styles.exportButton, backgroundColor: '#f39c12' }}>Export to CSV</button>
      </div>

      {/* Add Crew (Admin only) */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button onClick={() => setShowForm(true)} style={styles.buttonPrimary}>Add Crew</button>
        </div>
      )}

      {/* Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="Captain">Captain</option>
            <option value="Chief Officer">Chief Officer</option>
            <option value="Able Seaman">Able Seaman</option>
            <option value="Ordinary Seaman">Ordinary Seaman</option>
            <option value="Engine Cadet">Engine Cadet</option>
            <option value="Radio Officer">Radio Officer</option>
            <option value="Chief Cook">Chief Cook</option>
            <option value="Steward">Steward</option>
            <option value="Deckhand">Deckhand</option>
          </select>
          <input
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
          <input
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            placeholder="Nationality"
          />
          <input
            name="ship"
            value={formData.ship}
            onChange={handleChange}
            placeholder="Ship ID"
          />
          <label>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} /> Active
          </label>

          <button type="submit">{editing ? 'Update' : 'Create'} Crew</button>
          <button type="button" onClick={resetForm}>Cancel</button>
        </form>
      )}

      {/* Crew List */}
      <ul style={styles.contactList}>
        {filteredCrew.length === 0 && <li>No crew members found.</li>}
        {filteredCrew.map((member) => (
          <li key={member.id} style={styles.contactItem}>
            <div>
              <strong>{member.first_name} {member.last_name}</strong><br />
              Role: {member.role}<br />
              Phone: {member.phone_number}<br />
              Nationality: {member.nationality || 'N/A'}<br />
              Ship: {member.ship || 'N/A'}<br />
              Status: <span style={{ color: member.is_active ? 'green' : 'red' }}>{member.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            {isAdmin && (
              <div style={styles.contactActions}>
                <button onClick={() => handleEdit(member)} style={styles.actionButton}>Edit</button>
                <button
                  onClick={() => handleToggleActive(member)}
                  style={{
                    ...styles.actionButton,
                    ...(member.is_active ? styles.actionButtonDanger : {})
                  }}
                >
                  {member.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrewManagement;
