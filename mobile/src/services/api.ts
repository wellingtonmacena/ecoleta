import axios  from 'axios'

const api = axios.create({
    baseURL: "192.168.1.35:4001"
})

export default api;