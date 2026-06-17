import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send HTTP-only cookie on every request
})

export default api
