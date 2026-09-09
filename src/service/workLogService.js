import axios from 'axios';

const API_URL = 'http://localhost:8080/api/work-logs';

export const workLogService = {
  getAllLogs: async () => {
    // Calls GET /api/work-logs
    const response = await axios.get(API_URL);
    return response.data;
  },

  addLog: async (logData) => {
    // Calls POST /api/work-logs
    const response = await axios.post(API_URL, logData);
    return response.data;
  }
};
