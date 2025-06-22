// services/api/endpoints.ts

export const API_ENDPOINTS = {
    // Account endpoints
    ACCOUNT: {
        LOGIN: '/api/Authentication/login',
        REGISTER: '/api/Authentication/register',
        LOGIN_GOOGLE: '/api/Authentication/login-google',
        SEND_OTP_REGISTER: '/api/Authentication/SendOtpRegister',
        VERIFY_OTP: '/api/Authentication/verify-otp',
        VERIFY_OTP_REGISTER: '/api/Authentication/VerifyOtpRegister',
        ME: '/api/Authentication/me',
        CHECK_EMAIL_EXIST: '/api/Account/check-email',
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
        GET_ALL: '/api/Member/GetAllMembers',
        CREATE: '/api/Member/CreateMember',
        UPDATE: (id: string) => `/api/Member/${id}`,
        GET_BY_ID: (id: string) => `/api/Member/${id}`,
        DELETE: (id: string) => `/api/Member/${id}`,
        DELETE_SOFT: (id: string) => `/api/Member/SoftDeleteMember/${id}`,
        REACTIVATE: (id: string) => `/api/Member/ReactivateMember/${id}`,
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
        DELETE_SOFT: (id: string) => `/api/Staff/SoftDeleteStaff/${id}`,
        REACTIVATE: (id: string) => `/api/Staff/ReactiveStaff/${id}`,
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

    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        GOOGLE: '/auth/google',  // Google authentication endpoint
        LOGOUT: '/auth/logout',
    },

    // Cinema endpoints
    CINEMA: {
        GET_ALL: '/api/Cinema/GetAllCinema',
        CREATE: '/api/Cinema',
        UPDATE: '/api/Cinema',
        DELETE: '/api/Cinema',
    },

    // Room endpoints
    ROOM: {
        GET_ALL: '/api/Room',
        CREATE: '/api/Room',
        UPDATE: '/api/Room',
        DELETE: '/api/Room',
    },

    // RoomType endpoints
    ROOMTYPE: {
        GET_ALL: '/api/Roomtype',
        CREATE: '/api/Roomtype',
        UPDATE: '/api/Roomtype',
        DELETE: '/api/Roomtype',
    },

    // Seat endpoints
    SEAT: {
        GET_ALL: '/api/Seat',
        CREATE: '/api/Seat',
        UPDATE: '/api/Seat',
        DELETE: '/api/Seat',
        GET_BY_ROOM: (roomId: string) => `/api/Seat/room?roomId=${roomId}`,
    },

};