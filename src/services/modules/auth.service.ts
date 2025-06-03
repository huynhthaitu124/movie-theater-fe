// import axios from '../api/axiosClient';
// import { LoginResponse, LogoutResponse } from '../types/response.types';
// import { LOGIN_ENDPOINT, LOGOUT_ENDPOINT } from '../api/endpoints';

// export class AuthService {
//     async login(username: string, password: string): Promise<LoginResponse> {
//         const response = await axios.post(LOGIN_ENDPOINT, { username, password });
//         return response.data;
//     }

//     async logout(): Promise<LogoutResponse> {
//         const response = await axios.post(LOGOUT_ENDPOINT);
//         return response.data;
//     }
// }