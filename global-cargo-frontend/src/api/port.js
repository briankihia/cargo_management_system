import axios from '../pages/axios';

const BASE_URL = '/api/ports/';

export const fetchPorts = () => axios.get(BASE_URL);
export const createPort = (data) => axios.post(BASE_URL, data);
export const updatePort = (id, data) => axios.put(`${BASE_URL}${id}/`, data);
export const deletePort = (id) => axios.delete(`${BASE_URL}${id}/`);