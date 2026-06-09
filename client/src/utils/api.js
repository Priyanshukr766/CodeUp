import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : 'http://localhost:3001/api';

const api = axios.create({ baseURL });

export async function fetchProblem(token) {
  const res = await api.get(`/problem/${encodeURIComponent(token)}`);
  return res.data;
}

export async function runCode({ code, language, tests }) {
  const res = await api.post('/run', { code, language, tests });
  return res.data;
}

export async function fetchContest(contestId) {
  const res = await api.get(`/contest/${contestId}`);
  return res.data;
}
