import axios from '../api/axiosClient';
import { USER_ENDPOINT } from '../api/endpoints';

export default class UserService {
    async getUserById(userId: string) {
        const response = await axios.get(`${USER_ENDPOINT}/${userId}`);
        return response.data;
    }

    async getAllUsers() {
        const response = await axios.get(USER_ENDPOINT.GET_ALL_USERS);
        return response.data;
    }

    async updateUser(userId: string, userData: any) {
        const response = await axios.put(`${USER_ENDPOINT.UPDATE_USER(userId)}`, userData);
        return response.data;
    }
}