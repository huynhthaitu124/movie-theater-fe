import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://your-api-base-url.com', // Replace with your API base URL
    timeout: 10000, // Set a timeout for requests
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // You can add custom headers or modify the request config here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        // You can handle the response data here
        return response.data;
    },
    (error) => {
        // You can handle errors here
        return Promise.reject(error);
    }
);

export default axiosClient;