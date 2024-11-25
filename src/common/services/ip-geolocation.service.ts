import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IpGeolocationService {
  private readonly apiUrl = process.env.API_URL; // Example API

  async getLocation(ipAddress: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}${ipAddress}/json/`);
      const data = response.data;
      return `${data.city}, ${data.region}, ${data.country_name}`;
    } catch (error) {
      return 'Unknown Location';
    }
  }
}