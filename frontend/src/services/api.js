const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getAccessToken() {
    return localStorage.getItem("accessToken");
}

function setAccessToken(token) {
    if (token) {
        localStorage.setItem("accessToken", token);
    } else {
        localStorage.removeItem("accessToken");
    }
}

async function refreshToken() {
    try {
        const res = await fetch(`${BASE_URL}/users/refresh-token`, {
            method: "POST",
            credentials: "include",
        });
        if (!res.ok) throw new Error("Refresh failed");
        const json = await res.json();
        const newToken = json.data?.accessToken;
        setAccessToken(newToken);
        return newToken;
    } catch {
        setAccessToken(null);
        return null;
    }
}

async function request(endpoint, options = {}) {
    const token = getAccessToken();
    const headers = { ...options.headers };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    let res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
    });

    // If 401, try refreshing the token once
    if (res.status === 401 && endpoint !== "/users/login" && endpoint !== "/users/register") {
        const newToken = await refreshToken();
        if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
            res = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: "include",
            });
        }
    }

    let json;
    try {
        json = await res.json();
    } catch {
        throw new Error(`Server error (${res.status})`);
    }
    if (!res.ok) {
        throw new Error(json.message || "Request failed");
    }
    return json;
}

const api = {
    get: (endpoint) => request(endpoint, { method: "GET" }),
    post: (endpoint, body) =>
        request(endpoint, {
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    put: (endpoint, body) =>
        request(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        }),
    patch: (endpoint, body) =>
        request(endpoint, {
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export { api, getAccessToken, setAccessToken };
