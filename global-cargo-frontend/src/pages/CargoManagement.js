import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  fetchContacts,
  createContact,
  updateContact,
} from '../api/contacts';

import { getOrganizations } from '../api/organizations';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    organization: '',
    first_name: '',
    last_name: '',
    job_title: '',
    department: '',
    is_primary_contact: false,
    notes: '',
    email: '',
    office_phone_number: '',
    mobile_phone_number: '',
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
      alert('You must be logged in to view contacts');
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadContacts();
      loadOrganizations();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      const res = await fetchContacts();
      setContacts(res.data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  const loadOrganizations = async () => {
    try {
      const orgList = await getOrganizations();
      const activeOrgs = orgList.filter((org) => org.is_active);
      setOrgs(activeOrgs);
    } catch (err) {
      console.error('Error loading organizations:', err);
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
        await updateContact(formData.id, formData);
      } else {
        await createContact(formData);
      }

      loadContacts();
      resetForm();
    } catch (err) {
      console.error('Error saving contact:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      organization: '',
      first_name: '',
      last_name: '',
      job_title: '',
      department: '',
      is_primary_contact: false,
      notes: '',
      email: '',
      office_phone_number: '',
      mobile_phone_number: '',
      is_active: true,
    });
    setEditing(false);
    setShowForm(false);
  };

  const handleEdit = (contact) => {
    setFormData({
      id: contact.id,
      organization: contact.organization,
      first_name: contact.first_name,
      last_name: contact.last_name,
      job_title: contact.job_title || '',
      department: contact.department || '',
      is_primary_contact: contact.is_primary_contact || false,
      notes: contact.notes || '',
      email: contact.email,
      office_phone_number: contact.office_phone_number || '',
      mobile_phone_number: contact.mobile_phone_number || '',
      is_active: contact.is_active !== undefined ? contact.is_active : true,
    });
    setEditing(true);
    setShowForm(true);
  };

  // Toggle active status
  const handleToggleActive = async (contact) => {
    try {
      const updatedContact = { ...contact, is_active: !contact.is_active };
      await updateContact(contact.id, updatedContact);
      loadContacts();
    } catch (err) {
      console.error('Error toggling contact status:', err);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const filteredContacts = contacts.filter((contact) => {
    if (!isAdmin && !contact.is_active) {
      return false;
    }
    if (selectedOrgFilter && String(contact.organization) !== selectedOrgFilter) {
      return false;
    }
    return true;
  });

  // Export filtered contacts to Excel
  const exportToExcel = () => {
    if (filteredContacts.length === 0) {
      alert('No contacts to export!');
      return;
    }

    const dataToExport = filteredContacts.map((contact) => {
      const orgName = orgs.find((org) => org.id === contact.organization)?.name || 'N/A';
      return {
        'First Name': contact.first_name,
        'Last Name': contact.last_name,
        'Job Title': contact.job_title || '',
        'Department': contact.department || '',
        'Primary Contact': contact.is_primary_contact ? 'Yes' : 'No',
        'Notes': contact.notes || '',
        'Email': contact.email,
        'Office Phone': contact.office_phone_number || '',
        'Mobile Phone': contact.mobile_phone_number || '',
        'Active': contact.is_active ? 'Yes' : 'No',
        'Organization': orgName,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'contacts_export.xlsx');
  };

  // Export filtered contacts to CSV (basic fields: name, email, phone)
  const exportToCSV = () => {
    if (filteredContacts.length === 0) {
      alert('No contacts to export!');
      return;
    }

    const headers = ['First Name', 'Last Name', 'Email', 'Phone'];

    const rows = filteredContacts.map((contact) => {
      const phone = contact.mobile_phone_number || contact.office_phone_number || '';
      return [
        contact.first_name,
        contact.last_name,
        contact.email,
        phone,
      ];
    });

    const csvContent =
      [headers, ...rows]
        .map(row =>
          row
            .map(field => `"${String(field).replace(/"/g, '""')}"`) // Escape quotes
            .join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'contacts_export.csv');
  };

  // Styles
  const styles = {
    container: {
      maxWidth: 900,
      margin: '2rem auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
      padding: '0 1rem',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      color: '#2c3e50',
    },
    filterWrapper: {
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    select: {
      padding: '0.4rem 0.6rem',
      borderRadius: 4,
      border: '1px solid #ccc',
      fontSize: '1rem',
      minWidth: 200,
    },
    buttonPrimary: {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '0.5rem 1.1rem',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'background-color 0.3s ease',
    },
    form: {
      border: '1px solid #ddd',
      padding: '1.5rem',
      borderRadius: 6,
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fafafa',
      maxWidth: 600,
      margin: '1rem auto 2rem',
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      marginBottom: '1rem',
      borderRadius: 4,
      border: '1px solid #ccc',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.5rem',
      marginBottom: '1rem',
      borderRadius: 4,
      border: '1px solid #ccc',
      fontSize: '1rem',
      resize: 'vertical',
      minHeight: 80,
      boxSizing: 'border-box',
    },
    labelCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontWeight: '500',
      fontSize: '0.9rem',
      color: '#555',
      userSelect: 'none',
    },
    formButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-start',
    },
    cancelButton: {
      backgroundColor: '#bdc3c7',
      border: 'none',
      borderRadius: 4,
      color: '#2c3e50',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
    },
    contactList: {
      listStyle: 'none',
      paddingLeft: 0,
      maxWidth: 900,
      margin: '0 auto',
    },
    contactItem: {
      backgroundColor: '#fff',
      padding: '1rem 1.5rem',
      marginBottom: '0.7rem',
      borderRadius: 6,
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      fontSize: '1rem',
      color: '#2c3e50',
    },
    contactInfo: {
      flex: '1 1 60%',
      minWidth: 250,
    },
    contactActions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
    },
    actionButton: {
      backgroundColor: '#2980b9',
      color: 'white',
      border: 'none',
      padding: '0.4rem 0.8rem',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'background-color 0.3s ease',
    },
    actionButtonDanger: {
      backgroundColor: '#c0392b',
    },
    exportButton: {
      backgroundColor: '#27ae60',
      color: 'white',
      padding: '0.5rem 1.1rem',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'background-color 0.3s ease',
      marginBottom: '1rem',
      float: 'right',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contacts</h2>

      <div style={styles.filterWrapper}>
        <label htmlFor="orgFilter">Filter by Organization:</label>
        <select
          id="orgFilter"
          value={selectedOrgFilter}
          onChange={(e) => setSelectedOrgFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">-- All Organizations --</option>
          {orgs.map((org) => (
            <option key={org.id} value={String(org.id)}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginBottom: '1rem' }}>
        <button
          onClick={exportToExcel}
          style={styles.exportButton}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e8449')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#27ae60')}
          title="Export filtered contacts to Excel"
        >
          Export to Excel
        </button>

        <button
          onClick={exportToCSV}
          style={{
            ...styles.exportButton,
            backgroundColor: '#f39c12',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d78c0c')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f39c12')}
          title="Export filtered contacts to CSV"
        >
          Export to CSV
        </button>
      </div>

      {/* Admin-only Add Contact button */}
      {isAdmin && !showForm && (
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setShowForm(true)}
            style={styles.buttonPrimary}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
          >
            Add Contact
          </button>
        </div>
      )}

      {/* Admin-only Add/Edit Form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <select
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="">-- Select an Organization --</option>
            {orgs.map((org) => (
              <option key={org.id} value={String(org.id)}>
                {org.name}
              </option>
            ))}
          </select>

          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
            style={styles.input}
          />
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
            style={styles.input}
          />
          <input
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="Job Title"
            style={styles.input}
          />
          <input
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="Department"
            style={styles.input}
          />

          <label style={styles.labelCheckbox}>
            <input
              type="checkbox"
              name="is_primary_contact"
              checked={formData.is_primary_contact}
              onChange={handleChange}
            />
            Primary Contact
          </label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes"
            style={styles.textarea}
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            style={styles.input}
          />
          <input
            name="office_phone_number"
            value={formData.office_phone_number}
            onChange={handleChange}
            placeholder="Office Phone Number"
            style={styles.input}
          />
          <input
            name="mobile_phone_number"
            value={formData.mobile_phone_number}
            onChange={handleChange}
            placeholder="Mobile Phone Number"
            style={styles.input}
          />

          <label style={styles.labelCheckbox}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active
          </label>

          <div style={styles.formButtons}>
            <button
              type="submit"
              style={styles.buttonPrimary}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
            >
              {editing ? 'Update' : 'Create'} Contact
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contact List */}
      <ul style={styles.contactList}>
        {filteredContacts.length === 0 && (
          <li style={{ textAlign: 'center', color: '#777', padding: '1rem' }}>
            No contacts found.
          </li>
        )}
        {filteredContacts.map((contact) => (
          <li key={contact.id} style={styles.contactItem}>
            <div style={styles.contactInfo}>
              <strong>
                {contact.first_name} {contact.last_name}
              </strong>{' '}
              <br />
              <small>
                <em>{contact.job_title || 'N/A'}</em>
              </small>{' '}
              <br />
              Status:{' '}
              <span
                style={{
                  color: contact.is_active ? 'green' : 'red',
                  fontWeight: '600',
                }}
              >
                {contact.is_active ? 'Active' : 'Inactive'}
              </span>{' '}
              <br />
              Company: {orgs.find((org) => org.id === contact.organization)?.name || 'N/A'}
            </div>

            {/* Admin-only Edit/Activate/Deactivate */}
            {isAdmin && (
              <div style={styles.contactActions}>
                <button
                  onClick={() => handleEdit(contact)}
                  style={styles.actionButton}
                  title="Edit Contact"
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1c5980')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(contact)}
                  style={{
                    ...styles.actionButton,
                    ...(contact.is_active ? styles.actionButtonDanger : {}),
                  }}
                  title={contact.is_active ? 'Deactivate contact' : 'Activate contact'}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = contact.is_active
                      ? '#922b24'
                      : '#1c5980';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = contact.is_active
                      ? '#c0392b'
                      : '#2980b9';
                  }}
                >
                  {contact.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;