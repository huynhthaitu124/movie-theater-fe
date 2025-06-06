// services/api/endpoints.ts

export const API_ENDPOINTS = {
    // Account endpoints
    ACCOUNT: {
        LOGIN: '/api/Authentication/login',
        REGISTER: '/api/Authentication/register',
        ME: '/api/Authentication/me',
        LOGOUT: '/api/Authentication/logout',
        GET_ALL: '/api/Account',
        CREATE: '/api/Account',
        UPDATE: (id: string) => `/api/Account/${id}`,
        GET_BY_ID: (id: string) => `/api/Account/${id}`,
        DELETE: (id: string) => `/api/Account/${id}`,
    },

    // Category endpoints
    CATEGORY: {
        GET_ALL: '/api/Category',
        CREATE: '/api/Category',
        UPDATE: '/api/Category',
        GET_BY_ID: (id: string) => `/api/Category/${id}`,
        DELETE: (id: string) => `/api/Category/${id}`,
    },

    // Member endpoints
    MEMBER: {
        GET_ALL: '/api/Member',
        CREATE: '/api/Member/CreateMember',
    },

    // Movie endpoints
    MOVIE: {
        GET_ALL: '/api/Movie',
        CREATE: '/api/Movie',
        UPDATE: '/api/Movie',
    },

    // MovieCategory endpoints
    MOVIE_CATEGORY: {
        ADD: '/api/MovieCategory/add',
        GET_BY_MOVIE: (movieId: string) => `/api/MovieCategory/by-movie/${movieId}`,
        DELETE: '/api/MovieCategory/delete',
    },

    // Rating endpoints
    RATING: {
        GET_ALL: '/api/Ratings',
        CREATE: '/api/Ratings',
        GET_BY_MOVIE_AND_ACCOUNT: (movieId: string, accountId: string) => `/api/Ratings/${movieId}/${accountId}`,
        UPDATE_BY_MOVIE_AND_ACCOUNT: (movieId: string, accountId: string) => `/api/Ratings/${movieId}/${accountId}`,
        DELETE_BY_MOVIE_AND_ACCOUNT: (movieId: string, accountId: string) => `/api/Ratings/${movieId}/${accountId}`,
    },

    // Staff endpoints
    STAFF: {
        GET_ALL: '/api/Staff/GetAllStaff',
        CREATE: '/api/Staff/CreateStaffAdmin',
        UPDATE: (id: string) => `/api/Staff/${id}`,
        GET_BY_ID: (id: string) => `/api/Staff/${id}`,
        GET_BY_ACCOUNT_ID: (id: string) => `/api/Staff/Account/${id}`,
        DELETE: (id: string) => `/api/Staff/${id}`,
    },

    // Subtitle endpoints
    SUBTITLE: {
        GET_ALL: '/api/Subtitle',
        CREATE: '/api/Subtitle',
        UPDATE: '/api/Subtitle',
        GET_BY_MOVIE: (movieId: string) => `/api/Subtitle/movie/${movieId}`,
        DELETE: (subtitleId: string) => `/api/Subtitle/${subtitleId}`,
    },

    // Role endpoints
    ROLE: {
        GET_ALL: '/api/Role/All',
        CREATE: '/api/Role/Create',
        UPDATE: '/api/Role/Update',
        GET_BY_ID: (id: string) => `/api/Role/${id}`,
        DELETE: (id: string) => `/api/Role/${id}`,
    },
};