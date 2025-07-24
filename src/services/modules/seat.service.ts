import axios from 'axios';
import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { SeatResponse, SeatType, SeatCreateRequest, Seat } from '../../types/seat';

const API_BASE_URL = 'https://movietheater-api.calmbeach-b063071e.eastasia.azurecontainerapps.io/api';


export const seatService = {
  async getAll() {
    // Call the real API
    const response = await axiosClient.get('/api/Seat');
    // Your API returns { message, data }
    return response.data;
  },

  async getByRoomId(roomId: string) {
    // Fetch all seats, then filter by roomId (if your API doesn't support filtering)
    const allSeats = await this.getAll() as { message: string; data: Seat[] };
    return {
      data: allSeats.data.filter((seat: any) => seat.roomId === roomId)
    };
  },

  async create(data: {
    seattypeid: string;
    roomid: string;
    number: string;
    row: string;
  }) {
    return axiosClient.post('/api/Seat', data);
  },

  async createMultiple(seats: SeatCreateRequest[]) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },

  update: async (data: any) => {
  return axiosClient.put('/api/Seat', data); // data must be { seatUpdateDto: { ... } }
},

  async delete(seatId: string) {
    // Your backend expects seatId as a query param
    return axiosClient.delete(`/api/Seat?seatId=${seatId}`);
  },

  linkSeats: async (firstSeatId: string, secondSeatId: string) => {
    return axiosClient.put('/api/Seat/LinkSeat', {
      firstSeatId,
      secondSeatId,
    });
  },

  unlinkSeats: async (firstSeatId: string, secondSeatId: string) => {
    return axiosClient.put('/api/Seat/UnLinkSeat', {
      firstSeatId,
      secondSeatId,
    });
  },
};

export const seatTypeService = {
  // Get all seat types
  getAll: async (): Promise<{ message: string; data: SeatType[] }> => {
    const response = await axiosClient.get('api/SeatType');
    return response.data as { message: string; data: SeatType[] };
  },

  // Get seat type by ID
  getById: async (seatTypeId: string): Promise<{ message: string; data: SeatType }> => {
    const response = await axiosClient.get(`api/SeatType/${seatTypeId}`);
    return response.data as { message: string; data: SeatType }
  },

  create: async (data: { name: string; price: number; isactive: boolean }) => {
    return axiosClient.post('api/SeatType', data);
  },
  update: async (seattypeid: string, data: { name: string; price: number; isactive: boolean }) => {
    return axiosClient.put(`api/SeatType?seatTypeId=${seattypeid}`, data);
  },
  delete: async (seattypeid: string) => {
    return axiosClient.delete(`api/SeatType?seatTypeId=${seattypeid}`);
  },
};