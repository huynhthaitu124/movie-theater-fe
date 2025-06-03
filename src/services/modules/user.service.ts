import axios from '../api/axiosClient';
import { UserResponse, UpdateUserResponse } from '../types/response.types';
import { USER_ENDPOINT } from '../api/endpoints';

export class UserService {
    async getUser(userId: string): Promise<UserResponse> {
        const response = await axios.get(`${USER_ENDPOINT}/${userId}`);
        return response.data;
    }

    async updateUser(userId: string, userData: any): Promise<UpdateUserResponse> {
        const response = await axios.put(`${USER_ENDPOINT}/${userId}`, userData);
        return response.data;
    }
}