import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    'Content-Type': 'application/json',
    "X-Page-Path": window.location.pathname
  },
  timeout: 5000,
  withCredentials: true,
});

export const fetchHealth = async () => {
  console.log("Fetching health");
  return await api.get("/health");
}
