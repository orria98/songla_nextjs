export async function loginUser(username, password) {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });

  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const error = await res.json();
    throw new Error(error.message);
  }
}

export async function signUpUser(username, password) {
  const res = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });

  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    const error = await res.json();
    throw new Error(error.message);
  }
}

export async function refreshAccessToken() {
  const res = await fetch("http://localhost:3000/auth/refresh-token", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to refresh token");
  const data = await res.json();
  return data.accessToken;
}

export async function fetchProtectedData(accessToken) {
  const res = await fetch("http://localhost:3000/protected", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (res.status === 401) {
    const newAccessToken = await refreshAccessToken();
    return fetchProtectedData(newAccessToken); // retry
  }

  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export async function getMe(accessToken) {
  const res = await fetch("http://localhost:3000/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function postDailySong(songData, accessToken) {
  const res = await fetch("http://localhost:3000/api/daily", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(songData),
    credentials: "include",
  });
  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to post daily song");
  }
}

export async function getDailySong() {
  const res = await fetch("http://localhost:3000/api/daily", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to fetch daily song");
  }
}
