// services/types/request.types.ts
import type { Movie } from '../../types/movie';

type OmitAutoFields<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
    email: string;
    verifyOtp: string;
}

export interface LoginGoogle {
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
    famaily_name?: string;
    given_name?: string;
}

export interface AccountRequest {
    roleid: string;
    displayname: string;
    username: string;
    email: string;
    phonenumber: string;
    password: string;
    address: string;
    dateofbirth: string;
    preferredlanguage?: string;
    avatar?: string;
    gender?: string;
    identityCard: string;
}

export interface RegisterRequest extends AccountRequest {}

export interface LoginRequest {
    keyword: string;
    password: string;
}

export interface StaffRequest {
    accountid: string;
    position: string;
    hiredate: string;
    salary: number;
}

export interface StaffResponse {
    data: string;
    message: string;
    status: string;
}

export interface CategoryRequest extends OmitAutoFields<{
    name: string;
    description: string;
}> {}

export interface MovieRequest extends OmitAutoFields<Movie> {}

export interface RatingRequest extends OmitAutoFields<{
    movieId: string;
    accountId: string;
    score: number;
    comment: string;
}> {}

export interface SubtitleRequest extends OmitAutoFields<{
    movieId: string;
    language: string;
    filePath: string;
}> {}

export interface RoleRequest {
    name: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
}

export interface MemberRequest {
    displayName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}

// Add these types
export interface CinemaCreateDto {
  cinemaname: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  totalroom: number;
  opentime: string;
  closetime: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  isactive: boolean;
}

export interface CinemaResponse {
  cinemaid: string;
  cinemaname: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  totalroom: number;
  opentime: string;
  closetime: string;
  status: string;
  isactive: boolean;
  createdat: string;
  updatedat: string;
}

export interface CinemaUpdateDto extends CinemaCreateDto {
  cinemaid: string;
}

export interface RoomCreateDto {
  cinemaid: string;
  roomtypeid: string;
  roomnumber: number;  
  capacity: number;
  seatRows: number,      // <-- Add this
  seatColumns: number // <-- Add this
}

export interface RoomUpdateDto {
  roomId: string;
  roomtypeid: string;
  roomnumber: number;
  capacity: number;
}

export interface RoomResponse {
  roomId: string;
  cinemaname: string;
  roomtypeid: string;
  roomnumber: number;
  capacity: number;
  isactive: boolean;
  createdat: string;
  updatedat: string;
  cinema: null;
  roomtype: null;
  rows: number;
  columns: number;
  schedules: any[];
  seats: any[];
}

export interface RoomTypeResponse {
  roomtypeid: string;
  typename: string;
  issingle: boolean;
  status: string;
  isactive: boolean;
  createdat: string;
  updatedat: string;
}
