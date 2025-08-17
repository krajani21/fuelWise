import axios from 'axios';

export const fetchVolumeBased = async (origin, budget, efficiency, radius) => {
  const requestBody = { origin, budget, efficiency };
  if (radius) {
    requestBody.radius = radius;
  }
  
  const response = await axios.post("http://localhost:5000/api/volume-based", requestBody);
  return response.data;
};
