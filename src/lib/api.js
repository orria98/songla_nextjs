export async function loginUser(username, password) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to refresh token");
  const data = await res.json();
  return data.accessToken;
}

export async function fetchProtectedData(accessToken) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/daily`, {
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/daily`, {
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

export async function getAllSongs() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/allSongs`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to fetch all songs");
  }
}

export async function getLast7Songs() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/songsLast7Days`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to fetch last 7 songs");
  }
}

export async function getSongById(songId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/song/${songId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await res.json();
  if (res.ok) {
    return data;
  } else {
    throw new Error(data.message || "Failed to fetch song");
  }
}

export async function postSongStats(songId, won, guessNumber) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stats/${songId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ won, guessNumber }),
        credentials: "include",
      }
    );
    return res.ok;
  } catch (err) {
    console.error("Failed to post song stats:", err);
    return false;
  }
}

export async function getSongStats(songId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stats/${songId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch song stats:", err);
    return null;
  }
}
