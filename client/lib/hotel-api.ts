import {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  CreateReservationRequest,
  CreateReservationResponse,
  GetReservationsResponse,
  UpdateReservationRequest,
  DeleteReservationResponse,
  GetRoomsResponse,
  ApiError
} from "@shared/hotel-api";

class HotelApiService {
  private baseUrl = '/api';
  private token: string | null = null;

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('hotel-auth-token', token);
  }

  // Get authentication token
  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('hotel-auth-token');
    }
    return this.token;
  }

  // Clear authentication
  clearAuth() {
    this.token = null;
    localStorage.removeItem('hotel-auth-token');
  }

  // Generic fetch helper
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await this.fetchApi<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // Reservations
  async getReservations(): Promise<GetReservationsResponse> {
    return this.fetchApi<GetReservationsResponse>('/reservations');
  }

  async createReservation(
    reservation: CreateReservationRequest
  ): Promise<CreateReservationResponse> {
    return this.fetchApi<CreateReservationResponse>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  }

  async updateReservation(
    id: number,
    updates: Partial<UpdateReservationRequest>
  ): Promise<CreateReservationResponse> {
    return this.fetchApi<CreateReservationResponse>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async deleteReservation(id: number): Promise<DeleteReservationResponse> {
    return this.fetchApi<DeleteReservationResponse>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  // Rooms
  async getRooms(): Promise<GetRoomsResponse> {
    return this.fetchApi<GetRoomsResponse>('/rooms');
  }

  async getRoomByReservation(reservationId: number) {
    return this.fetchApi(`/reservations/${reservationId}/room`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.clearAuth();
  }
}

// Create singleton instance
export const hotelApi = new HotelApiService();

// React hooks for easy usage
export const useHotelApi = () => {
  return hotelApi;
};
