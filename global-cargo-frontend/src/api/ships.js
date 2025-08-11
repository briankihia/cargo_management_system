// // src/api/contacts.js
// import axios from './axios'; // Corrected import path

// export const fetchContacts = () => axios.get('/api/contacts/');
// export const createContact = (data) => axios.post('/api/contacts/', data);
// export const updateContact = (id, data) => axios.put(`/api/contacts/${id}/`, data);
// export const deleteContact = (id) => axios.delete(`/api/contacts/${id}/`);
// export const updateContact = (id, data) => axios.put(`${BASE_URL}${id}/`, data);
// export const deleteContact = (id) => axios.delete(`${BASE_URL}${id}/`);


import axios from '../pages/axios';

const BASE_URL = '/api/ships/';

export const fetchShips = () => axios.get(BASE_URL);
export const createShip = (data) => axios.post(BASE_URL, data);
export const updateShip = (id, data) => axios.put(`${BASE_URL}${id}/`, data);
export const deleteShip = (id) => axios.delete(`${BASE_URL}${id}/`);