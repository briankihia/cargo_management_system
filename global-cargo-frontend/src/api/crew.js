import axios from '../pages/axios';

const BASE_URL = '/api/crew/';

export const fetchCrew = () => axios.get(BASE_URL);
export const createCrew = (data) => axios.post(BASE_URL, data);
export const updateCrew = (id, data) => axios.put(`${BASE_URL}${id}/`, data);
export const deleteCrew = (id) => axios.delete(`${BASE_URL}${id}/`);