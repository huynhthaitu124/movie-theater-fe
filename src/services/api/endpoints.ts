// services/api/endpoints.ts

export const API_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GET_ACCOUNT: '/api/Account',
    UPDATE_ACCOUNT: '/api/Account/',
};

export const USER_ENDPOINT = {
    GET_USER_BY_ID: (userId: string) => `/api/Account/${userId}`,
    GET_ALL_USERS: '/api/Account',
    UPDATE_USER: (userId: string) => `/api/Account/${userId}`,
    DELETE_USER: (userId: string) => `/api/Account/${userId}`,
}