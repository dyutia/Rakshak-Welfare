import { useEffect, useState } from "react";
import { apiRequest, apiRequestForm } from "./api";

const initialRegister = {
	name: "",
	email: "",
	password: "",
	governmentIdType: "Aadhaar",
	governmentId: "",
	age: "",
	gender: "",
	caste: "",
	annualIncome: "",
	state: "",
	district: "",
	familyId: "",
	documentsHeld: [],
};

const initialProfile = {
	name: "",
	age: "",
	gender: "",
	caste: "",
	annualIncome: "",
	state: "",
	district: "",
	familyId: "",
};

const INDIA_STATES = [
	"Andhra Pradesh",
	"Arunachal Pradesh",
	"Assam",
	"Bihar",
	"Chhattisgarh",
	"Goa",
	"Gujarat",
	"Haryana",
	"Himachal Pradesh",
	"Jharkhand",
	"Karnataka",
	"Kerala",
	"Madhya Pradesh",
	"Maharashtra",
	"Manipur",
	"Meghalaya",
	"Mizoram",
	"Nagaland",
	"Odisha",
	"Punjab",
	"Rajasthan",
	"Sikkim",
	"Tamil Nadu",
	"Telangana",
	"Tripura",
	"Uttar Pradesh",
	"Uttarakhand",
	"West Bengal",
	"Andaman and Nicobar Islands",
	"Chandigarh",
	"Dadra and Nagar Haveli and Daman and Diu",
	"Delhi",
	"Jammu and Kashmir",
	"Ladakh",
	"Lakshadweep",
	"Puducherry",
];

const INDIA_DISTRICTS = {
	"Andhra Pradesh": [
		"Anantapur",
		"Chittoor",
		"East Godavari",
		"Guntur",
		"Krishna",
		"Kurnool",
		"Prakasam",
		"Srikakulam",
		"Visakhapatnam",
		"West Godavari",
	],
	Assam: [
		"Baksa",
		"Barpeta",
		"Bongaigaon",
		"Cachar",
		"Darrang",
		"Dhemaji",
		"Dhubri",
		"Dibrugarh",
		"Goalpara",
		"Kamrup",
		"Nagaon",
		"Sonitpur",
	],
	Bihar: [
		"Araria",
		"Bhagalpur",
		"Darbhanga",
		"Gaya",
		"Muzaffarpur",
		"Nalanda",
		"Patna",
		"Purnia",
		"Saran",
		"Siwan",
	],
	Delhi: [
		"Central Delhi",
		"East Delhi",
		"New Delhi",
		"North Delhi",
		"North East Delhi",
		"North West Delhi",
		"Shahdara",
		"South Delhi",
		"South East Delhi",
		"South West Delhi",
		"West Delhi",
	],
	Gujarat: [
		"Ahmedabad",
		"Banaskantha",
		"Bharuch",
		"Bhavnagar",
		"Gandhinagar",
		"Jamnagar",
		"Junagadh",
		"Kheda",
		"Mehsana",
		"Rajkot",
		"Surat",
		"Vadodara",
	],
	Haryana: [
		"Ambala",
		"Faridabad",
		"Gurugram",
		"Hisar",
		"Karnal",
		"Kurukshetra",
		"Panipat",
		"Rohtak",
		"Sonipat",
	],
	Karnataka: [
		"Bengaluru Urban",
		"Bengaluru Rural",
		"Belagavi",
		"Ballari",
		"Davanagere",
		"Dharwad",
		"Kalaburagi",
		"Mysuru",
		"Tumakuru",
		"Udupi",
	],
	Kerala: [
		"Alappuzha",
		"Ernakulam",
		"Idukki",
		"Kannur",
		"Kasaragod",
		"Kollam",
		"Kottayam",
		"Kozhikode",
		"Malappuram",
		"Palakkad",
		"Thiruvananthapuram",
		"Thrissur",
	],
	"Madhya Pradesh": [
		"Bhopal",
		"Gwalior",
		"Indore",
		"Jabalpur",
		"Rewa",
		"Sagar",
		"Satna",
		"Ujjain",
	],
	Maharashtra: [
		"Ahmednagar",
		"Aurangabad",
		"Kolhapur",
		"Mumbai City",
		"Mumbai Suburban",
		"Nagpur",
		"Nashik",
		"Pune",
		"Solapur",
		"Thane",
	],
	Odisha: [
		"Angul",
		"Balasore",
		"Bargarh",
		"Cuttack",
		"Ganjam",
		"Khordha",
		"Mayurbhanj",
		"Puri",
		"Sundargarh",
	],
	Punjab: [
		"Amritsar",
		"Bathinda",
		"Ferozepur",
		"Gurdaspur",
		"Hoshiarpur",
		"Jalandhar",
		"Ludhiana",
		"Patiala",
	],
	Rajasthan: [
		"Ajmer",
		"Alwar",
		"Bharatpur",
		"Bikaner",
		"Jaipur",
		"Jodhpur",
		"Kota",
		"Udaipur",
	],
	"Tamil Nadu": [
		"Chennai",
		"Coimbatore",
		"Erode",
		"Madurai",
		"Salem",
		"Tiruchirappalli",
		"Tirunelveli",
		"Vellore",
	],
	Telangana: [
		"Adilabad",
		"Hyderabad",
		"Karimnagar",
		"Khammam",
		"Mahabubnagar",
		"Medchal",
		"Nalgonda",
		"Nizamabad",
		"Ranga Reddy",
		"Warangal",
	],
	"Uttar Pradesh": [
		"Agra",
		"Aligarh",
		"Allahabad",
		"Bareilly",
		"Gautam Buddha Nagar",
		"Ghaziabad",
		"Kanpur Nagar",
		"Lucknow",
		"Meerut",
		"Varanasi",
	],
	"West Bengal": [
		"Bankura",
		"Darjeeling",
		"Howrah",
		"Kolkata",
		"Malda",
		"Murshidabad",
		"North 24 Parganas",
		"South 24 Parganas",
	],
};

function EyeIcon({ open }) {
	if (open) {
		return (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				className="h-4 w-4"
				aria-hidden="true"
			>
				<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			className="h-4 w-4"
			aria-hidden="true"
		>
			<path d="M3 3l18 18" />
			<path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
			<path d="M9.9 5.1A11.3 11.3 0 0 1 12 5c6.5 0 10 7 10 7a16.6 16.6 0 0 1-3.2 4.2" />
			<path d="M6.1 6.1A16.7 16.7 0 0 0 2 12s3.5 7 10 7a11.3 11.3 0 0 0 5.9-1.7" />
		</svg>
	);
}

function App() {
	const [activeTab, setActiveTab] = useState("login");
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const [loginForm, setLoginForm] = useState({ email: "", password: "" });
	const [forgotEmail, setForgotEmail] = useState("");
	const [resetForm, setResetForm] = useState({
		email: "",
		token: "",
		password: "",
	});
	const [resetUrl, setResetUrl] = useState("");
	const [verifyForm, setVerifyForm] = useState({ email: "" });
	const [verifyStatus, setVerifyStatus] = useState("idle");
	const [registerForm, setRegisterForm] = useState(initialRegister);
	const [profileForm, setProfileForm] = useState(initialProfile);
	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showRegisterPassword, setShowRegisterPassword] = useState(false);
	const [showResetPassword, setShowResetPassword] = useState(false);
	const [registerDistrictSelect, setRegisterDistrictSelect] = useState("");
	const [profileDistrictSelect, setProfileDistrictSelect] = useState("");

	const [eligibleData, setEligibleData] = useState(null);
	const [auditData, setAuditData] = useState(null);
	const [auditFile, setAuditFile] = useState(null);
	const [auditDocType, setAuditDocType] = useState("");

	useEffect(() => {
		const savedToken = localStorage.getItem("rw_token");
		const params = new URLSearchParams(window.location.search);
		const tokenFromUrl = params.get("token");
		const emailFromUrl = params.get("email");
		const pathname = window.location.pathname;

		if (savedToken) {
			setToken(savedToken);
			if (
				!tokenFromUrl &&
				!emailFromUrl &&
				pathname !== "/verify-email" &&
				pathname !== "/verify" &&
				pathname !== "/reset-password"
			) {
				setActiveTab("eligibility");
			}
		}
	}, []);

	const verifyEmailByToken = async (token) => {
		setLoading(true);
		setError("");
		setMessage("");
		setVerifyStatus("pending");
		try {
			const data = await apiRequest("/api/auth/verify-email", {
				method: "POST",
				body: JSON.stringify({ token }),
			});
			setVerifyStatus("success");
			setMessage(data.message || "Email verified successfully.");
		} catch (err) {
			setVerifyStatus("error");
			setError(err.message || "Email verification failed");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tokenFromUrl = params.get("token");
		const emailFromUrl = params.get("email");
		const pathname = window.location.pathname;

		if (
			(pathname === "/verify-email" || pathname === "/verify") &&
			tokenFromUrl
		) {
			setVerifyForm((prev) => ({ ...prev, email: emailFromUrl || prev.email }));
			setActiveTab("verify-email");
			verifyEmailByToken(tokenFromUrl);
			return;
		}

		if (tokenFromUrl || emailFromUrl) {
			setResetForm((prev) => ({
				...prev,
				token: tokenFromUrl || prev.token,
				email: emailFromUrl || prev.email,
			}));
			setActiveTab("reset-password");
		}
	}, []);

	const updateToken = (newToken) => {
		setToken(newToken);
		if (newToken) {
			localStorage.setItem("rw_token", newToken);
		} else {
			localStorage.removeItem("rw_token");
		}
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const data = await apiRequest("/api/auth/login", {
				method: "POST",
				body: JSON.stringify(loginForm),
			});
			updateToken(data.token);
			setMessage("Login successful. Token saved.");
			setActiveTab("eligibility");
		} catch (err) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = async (e) => {
		e?.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");
		setResetUrl("");

		try {
			const data = await apiRequest("/api/auth/forgot-password", {
				method: "POST",
				body: JSON.stringify({ email: forgotEmail }),
			});
			setMessage(data.message || "Password reset request sent.");
			setResetForm((prev) => ({ ...prev, email: forgotEmail }));
			if (data.resetUrl) {
				setActiveTab("reset-password");
			}
			if (data.resetUrl) {
				setResetUrl(data.resetUrl);
			}
		} catch (err) {
			setError(err.message || "Password reset request failed");
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			if (!resetForm.token) {
				throw new Error(
					"Reset link is missing or expired. Please use the link from your email.",
				);
			}

			const data = await apiRequest("/api/auth/reset-password", {
				method: "POST",
				body: JSON.stringify(resetForm),
			});
			updateToken(data.token);
			setMessage(data.message || "Password reset successful.");
			setActiveTab("login");
		} catch (err) {
			setError(err.message || "Password reset failed");
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const payload = {
				...registerForm,
				age: registerForm.age === "" ? undefined : Number(registerForm.age),
				annualIncome:
					registerForm.annualIncome === ""
						? undefined
						: Number(registerForm.annualIncome),
			};

			const data = await apiRequest("/api/auth/register", {
				method: "POST",
				body: JSON.stringify(payload),
			});

			setVerifyForm({
				email: registerForm.email.trim(),
			});
			setVerifyStatus("idle");
			setMessage(
				data.message ||
					"Registration successful. Please verify your email before login.",
			);
			setActiveTab("verify-email");
		} catch (err) {
			setError(err.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	const handleResendVerification = async (email = verifyForm.email) => {
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const data = await apiRequest("/api/auth/resend-verification", {
				method: "POST",
				body: JSON.stringify({ email }),
			});
			setVerifyForm((prev) => ({
				...prev,
				email,
			}));
			setVerifyStatus("idle");
			setMessage(data.message || "Verification email sent.");
			setActiveTab("verify-email");
		} catch (err) {
			setError(err.message || "Failed to resend verification email");
		} finally {
			setLoading(false);
		}
	};

	const handleEligibility = async () => {
		setLoading(true);
		setError("");
		setMessage("");
		setEligibleData(null);

		try {
			const data = await apiRequest("/api/schemes/eligible", {
				method: "GET",
				token,
			});
			setEligibleData(data);
		} catch (err) {
			setError(err.message || "Eligibility fetch failed");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === "eligibility" && token) {
			handleEligibility();
		}
	}, [activeTab, token]);

	const handleAudit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");
		setAuditData(null);

		try {
			if (!auditFile) {
				throw new Error("Please choose a document image");
			}
			if (!auditDocType) {
				throw new Error("Please select a document type");
			}

			const formData = new FormData();
			formData.append("document", auditFile);
			formData.append("docType", auditDocType);

			const data = await apiRequestForm("/api/audit/audit-upload", {
				method: "POST",
				token,
				body: formData,
			});
			setAuditData(data);
		} catch (err) {
			setError(err.message || "Audit failed");
		} finally {
			setLoading(false);
		}
	};

	const handleProfileUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");
		setEligibleData(null);

		try {
			const payload = {
				...profileForm,
				age: profileForm.age === "" ? undefined : Number(profileForm.age),
				annualIncome:
					profileForm.annualIncome === ""
						? undefined
						: Number(profileForm.annualIncome),
			};

			const data = await apiRequest("/api/users/me", {
				method: "PATCH",
				token,
				body: JSON.stringify(payload),
			});
			setEligibleData(data.schemes);
			setMessage("Profile updated and eligibility recalculated.");
		} catch (err) {
			setError(err.message || "Profile update failed");
		} finally {
			setLoading(false);
		}
	};

	const tabs = [
		{ id: "login", label: "Login" },
		{ id: "register", label: "Register" },
		{ id: "verify-email", label: "Verify Email" },
		{ id: "forgot-password", label: "Forgot Password" },
		{ id: "eligibility", label: "Eligibility" },
		{ id: "audit", label: "Audit" },
		{ id: "profile", label: "Profile Update" },
	];

	const registerDistrictOptions = INDIA_DISTRICTS[registerForm.state] || [];
	const profileDistrictOptions = INDIA_DISTRICTS[profileForm.state] || [];

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-10">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="text-xl font-bold tracking-tight text-emerald-400">
							Rakshak Welfare
						</div>
						<div className="hidden sm:block text-xs text-slate-500">
							Government Scheme Eligibility Platform
						</div>
					</div>

					<nav className="flex flex-wrap gap-2">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`tab-button rounded-full border px-4 py-2 text-sm font-medium transition-all ${
									activeTab === tab.id
										? "tab-button active border-emerald-500 bg-emerald-500 text-slate-950 shadow-lg"
										: "border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
								}`}
							>
								{tab.label}
							</button>
						))}
					</nav>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 text-xs">
							<div
								className={`w-2 h-2 rounded-full ${token ? "bg-emerald-500" : "bg-slate-600"}`}
							></div>
							<span className="text-slate-400">
								{token ? "Authenticated" : "Not logged in"}
							</span>
						</div>
						{token && (
							<button
								onClick={() => updateToken("")}
								className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
								title="Logout"
							>
								Logout
							</button>
						)}
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-10">
				{(error || message) && (
					<div className="mb-6 space-y-3">
						{error && (
							<div className="status-message status-error">
								<strong>Error:</strong> {error}
							</div>
						)}
						{message && (
							<div className="status-message status-success">
								<strong>Success:</strong> {message}
							</div>
						)}
					</div>
				)}

				{activeTab === "login" && (
					<div className="form-section">
						<h3>Login to Your Account</h3>
						<form onSubmit={handleLogin} className="space-y-4">
							<div className="form-grid">
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-300">
										Email Address <span className="text-emerald-400">*</span>
									</label>
									<input
										className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
										type="email"
										placeholder="Enter your email"
										value={loginForm.email}
										onChange={(e) =>
											setLoginForm((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-300">
										Password <span className="text-emerald-400">*</span>
									</label>
									<div className="relative">
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-16 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type={showLoginPassword ? "text" : "password"}
											placeholder="Enter your password"
											value={loginForm.password}
											onChange={(e) =>
												setLoginForm((prev) => ({
													...prev,
													password: e.target.value,
												}))
											}
											required
										/>
										<button
											type="button"
											onClick={() => setShowLoginPassword((prev) => !prev)}
											className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:text-slate-100"
											aria-label={
												showLoginPassword ? "Hide password" : "Show password"
											}
										>
											<EyeIcon open={showLoginPassword} />
										</button>
									</div>
								</div>
							</div>
							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading}
							>
								{loading ? "Logging in..." : "Login"}
							</button>
							<div className="mt-3 text-center text-sm text-slate-400">
								<button
									type="button"
									onClick={() => setActiveTab("forgot-password")}
									className="font-medium text-emerald-400 hover:text-emerald-200"
								>
									Forgot password?
								</button>
								<span className="mx-2 text-slate-600">|</span>
								<button
									type="button"
									onClick={() =>
										handleResendVerification(loginForm.email.trim())
									}
									className="font-medium text-emerald-400 hover:text-emerald-200"
									disabled={loading || !loginForm.email.trim()}
								>
									Resend verification email
								</button>
							</div>
						</form>
					</div>
				)}

				{activeTab === "verify-email" && (
					<div className="form-section">
						<h3>Verify Your Email</h3>
						<p className="text-sm text-slate-400 mb-6">
							Check your inbox and click the verification link to activate your
							account.
						</p>
						<form className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-300">
									Email Address <span className="text-emerald-400">*</span>
								</label>
								<input
									className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
									type="email"
									placeholder="Enter your registered email"
									value={verifyForm.email}
									onChange={(e) =>
										setVerifyForm((prev) => ({
											...prev,
											email: e.target.value,
										}))
									}
									required
								/>
							</div>
							<button
								type="button"
								onClick={() =>
									handleResendVerification(verifyForm.email.trim())
								}
								className="w-full rounded-lg border border-slate-600 px-4 py-3 text-slate-200 font-medium hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading || !verifyForm.email.trim()}
							>
								{loading ? "Sending..." : "Resend Verification Email"}
							</button>
							{verifyStatus === "pending" && (
								<div className="status-message status-success">
									Verifying your email...
								</div>
							)}
							{verifyStatus === "success" && (
								<button
									type="button"
									onClick={() => setActiveTab("login")}
									className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 transition-all"
								>
									Continue to Login
								</button>
							)}
						</form>
					</div>
				)}

				{activeTab === "forgot-password" && (
					<div className="form-section">
						<h3>Forgot Password</h3>
						<p className="text-sm text-slate-400 mb-6">
							Enter your account email and we will send a password reset link.
						</p>

						<form onSubmit={handleForgotPassword} className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-300">
									Email Address <span className="text-emerald-400">*</span>
								</label>
								<input
									className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
									type="email"
									placeholder="Enter your registered email"
									value={forgotEmail}
									onChange={(e) => setForgotEmail(e.target.value)}
									required
								/>
							</div>

							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading}
							>
								{loading ? "Sending reset request..." : "Send Reset Link"}
							</button>

							{resetUrl && (
								<div className="status-message status-success text-sm break-all">
									<strong>Reset Link:</strong>{" "}
									<a
										href={resetUrl}
										target="_blank"
										rel="noreferrer"
										className="text-emerald-300 underline"
									>
										{resetUrl}
									</a>
								</div>
							)}
						</form>
					</div>
				)}

				{activeTab === "reset-password" && (
					<div className="form-section">
						<h3>Reset Password</h3>
						<p className="text-sm text-slate-400 mb-6">
							Open your reset link from email, then set a new password.
						</p>

						<form onSubmit={handleResetPassword} className="space-y-4">
							<div className="form-grid">
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-300">
										Email Address <span className="text-emerald-400">*</span>
									</label>
									<input
										className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
										type="email"
										placeholder="Enter your registered email"
										value={resetForm.email}
										onChange={(e) =>
											setResetForm((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium text-slate-300">
										New Password <span className="text-emerald-400">*</span>
									</label>
									<div className="relative">
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-16 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type={showResetPassword ? "text" : "password"}
											placeholder="Create a strong new password"
											value={resetForm.password}
											onChange={(e) =>
												setResetForm((prev) => ({
													...prev,
													password: e.target.value,
												}))
											}
											required
										/>
										<button
											type="button"
											onClick={() => setShowResetPassword((prev) => !prev)}
											className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:text-slate-100"
											aria-label={
												showResetPassword ? "Hide password" : "Show password"
											}
										>
											<EyeIcon open={showResetPassword} />
										</button>
									</div>
								</div>
							</div>

							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading}
							>
								{loading ? "Resetting password..." : "Reset Password"}
							</button>
						</form>
					</div>
				)}

				{activeTab === "register" && (
					<div className="form-section">
						<h3>Create New Account</h3>
						<p className="text-sm text-slate-400 mb-6">
							Fields marked with <span className="text-emerald-400">*</span> are
							required.
						</p>

						<form onSubmit={handleRegister} className="space-y-6">
							{/* Personal Information */}
							<div className="space-y-4">
								<h4 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
									Personal Information
								</h4>
								<div className="form-grid">
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Full Name <span className="text-emerald-400">*</span>
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="text"
											placeholder="Enter your full name"
											value={registerForm.name}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Email Address <span className="text-emerald-400">*</span>
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="email"
											placeholder="Enter your email"
											value={registerForm.email}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													email: e.target.value,
												}))
											}
											required
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Password <span className="text-emerald-400">*</span>
										</label>
										<div className="relative">
											<input
												className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-16 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
												type={showRegisterPassword ? "text" : "password"}
												placeholder="Create a strong password"
												value={registerForm.password}
												onChange={(e) =>
													setRegisterForm((prev) => ({
														...prev,
														password: e.target.value,
													}))
												}
												required
											/>
											<button
												type="button"
												onClick={() => setShowRegisterPassword((prev) => !prev)}
												className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-300 hover:text-slate-100"
												aria-label={
													showRegisterPassword
														? "Hide password"
														: "Show password"
												}
											>
												<EyeIcon open={showRegisterPassword} />
											</button>
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Age
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="number"
											placeholder="Enter your age"
											value={registerForm.age}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													age: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Gender
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={registerForm.gender}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													gender: e.target.value,
												}))
											}
										>
											<option value="">Select gender</option>
											<option value="Male">Male</option>
											<option value="Female">Female</option>
											<option value="Transgender">Transgender</option>
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Caste Category
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={registerForm.caste}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													caste: e.target.value,
												}))
											}
										>
											<option value="">Select caste category</option>
											<option value="SC">SC (Scheduled Caste)</option>
											<option value="ST">ST (Scheduled Tribe)</option>
											<option value="OBC">OBC (Other Backward Class)</option>
											<option value="General">General</option>
											<option value="EWS">
												EWS (Economically Weaker Section)
											</option>
											<option value="EBC">
												EBC (Extremely Backward Class)
											</option>
											<option value="Minority">Minority</option>
										</select>
									</div>
								</div>
							</div>

							{/* Government ID */}
							<div className="space-y-4">
								<h4 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
									Government ID Verification
								</h4>
								<div className="form-grid">
									<div className="space-y-2 md:col-span-2">
										<label className="text-sm font-medium text-slate-300">
											ID Type & Number{" "}
											<span className="text-emerald-400">*</span>
										</label>
										<div className="grid gap-3 md:grid-cols-[140px_1fr]">
											<select
												className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
												value={registerForm.governmentIdType}
												onChange={(e) =>
													setRegisterForm((prev) => ({
														...prev,
														governmentIdType: e.target.value,
													}))
												}
											>
												<option value="Aadhaar">Aadhaar</option>
												<option value="Voter ID">Voter ID</option>
												<option value="PAN">PAN</option>
											</select>
											<input
												className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
												type="text"
												placeholder="Enter ID number"
												value={registerForm.governmentId}
												onChange={(e) =>
													setRegisterForm((prev) => ({
														...prev,
														governmentId: e.target.value,
													}))
												}
												required
											/>
										</div>
										<p className="text-xs text-slate-500">
											Select the ID type, then enter the ID number for
											verification.
										</p>
									</div>
								</div>
							</div>

							{/* Location & Income */}
							<div className="space-y-4">
								<h4 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
									Location and Income Details
								</h4>
								<div className="form-grid">
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Annual Income (₹)
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="number"
											placeholder="Enter annual income"
											value={registerForm.annualIncome}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													annualIncome: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											State/UT
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={registerForm.state}
											onChange={(e) => {
												const nextState = e.target.value;
												setRegisterForm((prev) => ({
													...prev,
													state: nextState,
													district: "",
												}));
												setRegisterDistrictSelect("");
											}}
										>
											<option value="">Select state/UT</option>
											{INDIA_STATES.map((state) => (
												<option key={state} value={state}>
													{state}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											District
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={registerDistrictSelect}
											onChange={(e) => {
												const value = e.target.value;
												setRegisterDistrictSelect(value);
												if (value !== "__other__") {
													setRegisterForm((prev) => ({
														...prev,
														district: value,
													}));
												} else {
													setRegisterForm((prev) => ({
														...prev,
														district: "",
													}));
												}
											}}
											disabled={!registerForm.state}
										>
											<option value="">
												{registerForm.state
													? "Select district"
													: "Select state first"}
											</option>
											{registerDistrictOptions.map((district) => (
												<option key={district} value={district}>
													{district}
												</option>
											))}
											<option value="__other__">Other (type manually)</option>
										</select>
										{registerDistrictSelect === "__other__" && (
											<input
												className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
												type="text"
												placeholder="Enter district name"
												value={registerForm.district}
												onChange={(e) =>
													setRegisterForm((prev) => ({
														...prev,
														district: e.target.value,
													}))
												}
											/>
										)}
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Family ID (Optional)
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="text"
											placeholder="Ration card family number"
											value={registerForm.familyId}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													familyId: e.target.value,
												}))
											}
										/>
										<p className="text-xs text-slate-500">
											Use ration card family number or household ID if
											available.
										</p>
									</div>
								</div>
							</div>

							{/* Additional Documents */}
							<div className="space-y-4">
								<h4 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
									Additional Documents
								</h4>
								<p className="text-sm text-slate-400">
									Select any additional documents you currently hold. This helps
									us determine your eligibility for more schemes.
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{[
										"Income Certificate",
										"Caste Certificate",
										"Domicile Certificate",
										"Ration Card",
										"E-Shram Card",
										"Kisan Credit Card",
										"7/12 Extract",
										"Disability Certificate",
										"Student ID",
										"Marriage Certificate",
									].map((doc) => (
										<label
											key={doc}
											className="flex items-center space-x-2 cursor-pointer"
										>
											<input
												type="checkbox"
												className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/20"
												checked={registerForm.documentsHeld.includes(doc)}
												onChange={(e) => {
													const checked = e.target.checked;
													setRegisterForm((prev) => ({
														...prev,
														documentsHeld: checked
															? [...prev.documentsHeld, doc]
															: prev.documentsHeld.filter((d) => d !== doc),
													}));
												}}
											/>
											<span className="text-sm text-slate-300">{doc}</span>
										</label>
									))}
								</div>
							</div>

							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading}
							>
								{loading ? "Creating account..." : "Create Account"}
							</button>
						</form>
					</div>
				)}

				{activeTab === "eligibility" && (
					<div className="form-section">
						<h3>Check Your Eligibility</h3>
						<p className="text-sm text-slate-400 mb-6">
							Find out which government schemes you qualify for based on your
							profile.
						</p>

						<div className="space-y-4">
							<button
								onClick={handleEligibility}
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading || !token}
							>
								{loading ? "Checking eligibility..." : "Check Eligible Schemes"}
							</button>

							{!token && (
								<div className="status-message status-error">
									<strong>Authentication Required:</strong> Please login or
									register first to check eligibility.
								</div>
							)}

							{eligibleData && (
								<div className="grid gap-6 md:grid-cols-2">
									<div className="space-y-3">
										<h4 className="text-md font-semibold text-emerald-400 flex items-center gap-2">
											Eligible Schemes
										</h4>
										<div className="space-y-2">
											{eligibleData.eligible?.length ? (
												eligibleData.eligible.map((item) => (
													<div
														key={item.schemeId}
														className="rounded-lg border border-emerald-700 bg-emerald-900/20 px-4 py-3 text-sm"
													>
														<div className="font-medium text-emerald-200">
															{item.schemeName}
														</div>
														{item.description && (
															<div className="text-xs text-slate-400 mt-1">
																{item.description}
															</div>
														)}
														{item.reasons?.length > 0 && (
															<div className="mt-2 text-xs text-slate-300">
																<strong>Notes:</strong>
																<ul className="list-disc pl-5 mt-1">
																	{item.reasons.map((reason, index) => (
																		<li key={index}>{reason}</li>
																	))}
																</ul>
															</div>
														)}
													</div>
												))
											) : (
												<div className="text-slate-400 text-sm italic">
													No eligible schemes found.
												</div>
											)}
										</div>
									</div>

									<div className="space-y-3">
										<h4 className="text-md font-semibold text-amber-400 flex items-center gap-2">
											Potential Schemes
										</h4>
										<div className="space-y-2">
											{eligibleData.potential?.length ? (
												eligibleData.potential.map((item) => (
													<div
														key={item.schemeId}
														className="rounded-lg border border-amber-700 bg-amber-900/20 px-4 py-3 text-sm"
													>
														<div className="font-medium text-amber-200">
															{item.schemeName}
														</div>
														{item.description && (
															<div className="text-xs text-slate-400 mt-1">
																{item.description}
															</div>
														)}
														{item.reasons?.length > 0 && (
															<div className="mt-2 text-xs text-slate-300">
																<strong>Potential reason:</strong>
																<ul className="list-disc pl-5 mt-1">
																	{item.reasons.map((reason, index) => (
																		<li key={index}>{reason}</li>
																	))}
																</ul>
															</div>
														)}
													</div>
												))
											) : (
												<div className="text-slate-400 text-sm italic">
													No potential schemes found.
												</div>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{activeTab === "audit" && (
					<div className="form-section">
						<h3>Document Audit</h3>
						<p className="text-sm text-slate-400 mb-6">
							Upload government documents for verification and authenticity
							check.
						</p>

						<form onSubmit={handleAudit} className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-300">
									Document Type <span className="text-emerald-400">*</span>
								</label>
								<select
									className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
									value={auditDocType}
									onChange={(e) => setAuditDocType(e.target.value)}
									required
								>
									<option value="">Select document type</option>
									<option value="Income Certificate">Income Certificate</option>
									<option value="Caste Certificate">Caste Certificate</option>
									<option value="Domicile Certificate">
										Domicile Certificate
									</option>
									<option value="Ration Card">Ration Card</option>
									<option value="E-Shram Card">E-Shram Card</option>
									<option value="Kisan Credit Card">Kisan Credit Card</option>
									<option value="7/12 Extract">7/12 Extract</option>
									<option value="Disability Certificate">
										Disability Certificate
									</option>
									<option value="Student ID">Student ID</option>
									<option value="Marriage Certificate">
										Marriage Certificate
									</option>
									<option value="Aadhaar Card">Aadhaar Card</option>
									<option value="PAN Card">PAN Card</option>
									<option value="Voter ID">Voter ID</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-300">
									Document Image <span className="text-emerald-400">*</span>
								</label>
								<input
									className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
									type="file"
									accept="image/*"
									onChange={(e) => setAuditFile(e.target.files?.[0] || null)}
									required
								/>
								<p className="text-xs text-slate-500">
									Supported formats: JPG, PNG, GIF. Max size: 5MB
								</p>
							</div>

							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading || !token}
							>
								{loading ? "Analyzing document..." : "Upload and Audit"}
							</button>

							{!token && (
								<div className="status-message status-error">
									<strong>Authentication Required:</strong> Please login first
									to use document audit.
								</div>
							)}

							{auditData && (
								<div className="space-y-3">
									<h4 className="text-md font-semibold text-slate-200">
										Audit Results
									</h4>
									<div
										className={`rounded-lg border px-4 py-3 text-sm ${
											auditData.results?.isValid
												? "border-emerald-700 bg-emerald-900/20 text-emerald-200"
												: "border-rose-700 bg-rose-900/20 text-rose-200"
										}`}
									>
										<div className="flex items-center gap-2 mb-2">
											<span className="text-lg">
												{auditData.results?.isValid ? "Yes" : "No"}
											</span>
											<span className="font-medium">
												Document is{" "}
												{auditData.results?.isValid ? "Valid" : "Invalid"}
											</span>
										</div>
										<div className="text-xs text-slate-400">
											Confidence Score:{" "}
											{auditData.results?.confidenceScore ?? "N/A"}
										</div>
										{auditData.results?.warnings?.length > 0 && (
											<div className="mt-2 text-xs">
												<div className="font-medium text-amber-400">
													Warnings:
												</div>
												<ul className="mt-1 space-y-1">
													{auditData.results.warnings.map((warning, index) => (
														<li key={index} className="text-slate-300">
															• {warning}
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</div>
							)}
						</form>
					</div>
				)}

				{activeTab === "profile" && (
					<div className="form-section">
						<h3>Update Your Profile</h3>
						<p className="text-sm text-slate-400 mb-6">
							Update your information to get more accurate eligibility results.
						</p>

						<form onSubmit={handleProfileUpdate} className="space-y-6">
							{/* Personal Information */}
							<div className="space-y-4">
								<h4 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
									Personal Details
								</h4>
								<div className="form-grid">
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Full Name
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="text"
											placeholder="Enter your full name"
											value={profileForm.name}
											onChange={(e) =>
												setProfileForm((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Age
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="number"
											placeholder="Enter your age"
											value={profileForm.age}
											onChange={(e) =>
												setProfileForm((prev) => ({
													...prev,
													age: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Gender
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={profileForm.gender}
											onChange={(e) =>
												setProfileForm((prev) => ({
													...prev,
													gender: e.target.value,
												}))
											}
										>
											<option value="">Select gender</option>
											<option value="Male">Male</option>
											<option value="Female">Female</option>
											<option value="Transgender">Transgender</option>
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Caste Category
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={profileForm.caste}
											onChange={(e) =>
												setProfileForm((prev) => ({
													...prev,
													caste: e.target.value,
												}))
											}
										>
											<option value="">Select caste category</option>
											<option value="SC">SC (Scheduled Caste)</option>
											<option value="ST">ST (Scheduled Tribe)</option>
											<option value="OBC">OBC (Other Backward Class)</option>
											<option value="General">General</option>
											<option value="EWS">
												EWS (Economically Weaker Section)
											</option>
											<option value="EBC">
												EBC (Extremely Backward Class)
											</option>
											<option value="Minority">Minority</option>
										</select>
									</div>
								</div>
							</div>

							{/* Financial & Location */}
							<div className="space-y-4">
								<h4 className="text-md font-semibold text-slate-200 border-b border-slate-700 pb-2">
									Financial & Location Details
								</h4>
								<div className="form-grid">
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Annual Income (₹)
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="number"
											placeholder="Enter annual income"
											value={profileForm.annualIncome}
											onChange={(e) =>
												setProfileForm((prev) => ({
													...prev,
													annualIncome: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											Family ID
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="text"
											placeholder="Ration card family number"
											value={profileForm.familyId}
											onChange={(e) =>
												setProfileForm((prev) => ({
													...prev,
													familyId: e.target.value,
												}))
											}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											State/UT
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={profileForm.state}
											onChange={(e) => {
												const nextState = e.target.value;
												setProfileForm((prev) => ({
													...prev,
													state: nextState,
													district: "",
												}));
												setProfileDistrictSelect("");
											}}
										>
											<option value="">Select state/UT</option>
											{INDIA_STATES.map((state) => (
												<option key={state} value={state}>
													{state}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											District
										</label>
										<select
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											value={profileDistrictSelect}
											onChange={(e) => {
												const value = e.target.value;
												setProfileDistrictSelect(value);
												if (value !== "__other__") {
													setProfileForm((prev) => ({
														...prev,
														district: value,
													}));
												} else {
													setProfileForm((prev) => ({ ...prev, district: "" }));
												}
											}}
											disabled={!profileForm.state}
										>
											<option value="">
												{profileForm.state
													? "Select district"
													: "Select state first"}
											</option>
											{profileDistrictOptions.map((district) => (
												<option key={district} value={district}>
													{district}
												</option>
											))}
											<option value="__other__">Other (type manually)</option>
										</select>
										{profileDistrictSelect === "__other__" && (
											<input
												className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
												type="text"
												placeholder="Enter district name"
												value={profileForm.district}
												onChange={(e) =>
													setProfileForm((prev) => ({
														...prev,
														district: e.target.value,
													}))
												}
											/>
										)}
									</div>
								</div>
							</div>

							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading || !token}
							>
								{loading
									? "Updating profile..."
									: "Update and Recalculate Eligibility"}
							</button>

							{!token && (
								<div className="status-message status-error">
									<strong>Authentication Required:</strong> Please login first
									to update your profile.
								</div>
							)}
						</form>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
