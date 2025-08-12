// src/api/clients.js
import axios from '../pages/axios';

const BASE_URL = '/api/clients/';

export const fetchClients = () => axios.get(BASE_URL);
export const createClient = (data) => axios.post(BASE_URL, data);
export const updateClient = (id, data) => axios.put(`${BASE_URL}${id}/`, data);
export const deleteClient = (id) => axios.delete(`${BASE_URL}${id}/`);
