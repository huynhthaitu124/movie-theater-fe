import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5250', // Replace with your API base URL
    timeout: 10000, // Set a timeout for requests
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // You can add custom headers or modify the request config here
        // For example, adding an Authorization header
        // if (localStorage.getItem('token')) {
        //     config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        // }
        if (!config.headers) {
            config.headers = new axios.AxiosHeaders();
        }
        config.headers['Content-Type'] = 'application/json'; // Set default content type
        config.headers['Accept'] = 'application/json'; // Set default accept type
        // You can also log the request or perform other actions
        console.log('Request made with ', config);
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