// services/api/endpoints.ts

export const API_ENDPOINTS = {
    // Account endpoints
    ACCOUNT: {
        GET_ALL: '/api/Account',
        CREATE: '/api/Account',
        UPDATE: '/api/Account',
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
        UPDATE: '/api/Staff/UpdateStaffAdmin',
        DELETE: (staffId: string) => `/api/Staff/DeleteStaff/${staffId}`,
        CREATE: '/api/Staff/CreateStaffAdmin',
    },

    // Subtitle endpoints
    SUBTITLE: {
        GET_ALL: '/api/Subtitle',
        CREATE: '/api/Subtitle',
        UPDATE: '/api/Subtitle',
        GET_BY_MOVIE: (movieId: string) => `/api/Subtitle/movie/${movieId}`,
        DELETE: (subtitleId: string) => `/api/Subtitle/${subtitleId}`,
    },
};