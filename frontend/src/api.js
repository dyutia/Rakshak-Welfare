const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function apiRequest(path, options = {}) {
	const { token, headers: customHeaders, ...restOptions } = options;

	const res = await fetch(`${API_BASE}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(customHeaders || {}),
		},
		credentials: "include", // Send cookies with all requests
		...restOptions,
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || data.message || "Request failed");
	}

	return data;
}

export async function apiRequestForm(path, options = {}) {
	const { token, headers: customHeaders, ...restOptions } = options;

	const res = await fetch(`${API_BASE}${path}`, {
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(customHeaders || {}),
		},
		credentials: "include", // Send cookies with all requests
		...restOptions,
	});

	const data = await res.json();
	if (!res.ok) {
		throw new Error(data.error || data.message || "Request failed");
	}

	return data;
}
