import axios from 'axios'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log(`Axios request to ${config.url} with method ${config.method}:`, {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        })
    }
    console.log(`[Axios] Sending request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
})

export default instance
