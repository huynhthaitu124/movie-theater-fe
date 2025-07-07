import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export interface SeatScheduleResponse {
  status: number;
  message: string;
  data: SeatSchedule[];
}

export interface SeatSchedule {
  seatScheduleId: string;
  scheduleId: string;
  seatId: string;
  status: string; // "AVAILABLE", "BOOKED", etc.
  row: string;
  number: string;
  seatTypeName: string;
  price: number;
}

export const seatScheduleService = {
  getByScheduleId: async (scheduleId: string): Promise<SeatScheduleResponse> => {
    try {
      console.log(`Fetching seat schedule for scheduleId: ${scheduleId}`);
      const response = await axiosClient.get<any>(
        API_ENDPOINTS.SEAT_SCHEDULE.GET_BY_SCHEDULE_ID(scheduleId)
      );
      
      // More detailed logging of the API response
      console.log('Seat schedule raw response:', JSON.stringify(response.data));
      
      // Check the structure of the response
      let schedulesData = [];
      
      // Handle different response structures
      if (response.data.data && response.data.data.data) {
        // Handle nested data structure
        schedulesData = response.data.data.data;
      } else if (response.data.data) {
        // Handle simpler structure
        schedulesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Handle direct array response
        schedulesData = response.data;
      }
      
      // Log the extracted data
      console.log(`Found ${schedulesData.length} seat schedules`);
      
      // Create a properly formatted response
      const formattedResponse: SeatScheduleResponse = {
        status: response.data.status || 200,
        message: response.data.message || 'Success',
        data: schedulesData
      };
      
      return formattedResponse;
    } catch (error) {
      console.error('Error fetching seat schedule:', error);
      throw error;
    }
  }
};
