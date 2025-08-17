import axios from 'axios';

export const fetchDistanceOnly = async (origin, radius) => {
  const requestBody = { origin };
  if (radius) {
    requestBody.radius = radius;
  }
  
  const response = await axios.post("http://localhost:5000/api/distances-only", requestBody);
  return response.data;
};
