import axios from "axios";


let accessToken = null;
let isRefreshing = false;
let refreshPromise = null;

async function fetchNewToken() {
  const res = await axios.post(`${process.env.BASE_URL}?grant_type=password&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&username=${process.env.SUSERNAME}&password=${process.env.PASSWORD}`);

  accessToken = res.data.access_token;
}

async function getAccessToken() {
  if (accessToken) return accessToken;

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetchNewToken().finally(() => {
      isRefreshing = false;
    });
  }

  await refreshPromise;
  return accessToken;
}

export { getAccessToken, fetchNewToken };