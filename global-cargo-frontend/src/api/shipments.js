import axios from '../pages/axios';

const BASE_URL = '/api/shipments/';

export const fetchShipments = () => axios.get(BASE_URL);
export const createShipment = (data) => axios.post(BASE_URL, data);
export const updateShipment = (id, data) => axios.put(`${BASE_URL}${id}/`, data);
export const deleteShipment = (id) => axios.delete(`${BASE_URL}${id}/`);