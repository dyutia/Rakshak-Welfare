import { useEffect, useState } from "react";
import { apiRequest, apiRequestForm } from "./api";
import Audit from "./components/Audit";

const onlyDigits = (value) => (value || "").toString().replace(/\D/g, "");

const getDocStatus = (docName, documentsHeld, verifiedDocuments) => {
	if (verifiedDocuments?.includes(docName)) return "verified";
	if (documentsHeld?.includes(docName)) return "unverified";
	return "missing";
};

const initialRegister = {
	name: "",
	phoneNumber: "",
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

function App() {
	const [activeTab, setActiveTab] = useState("login");
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const [loginForm, setLoginForm] = useState({
		phoneNumber: "",
		otp: "",
	});
	const [otpStep, setOtpStep] = useState("request"); // request | verify
	const [registerForm, setRegisterForm] = useState(initialRegister);
	const [profileForm, setProfileForm] = useState(initialProfile);
	const [registerDistrictSelect, setRegisterDistrictSelect] = useState("");
	const [profileDistrictSelect, setProfileDistrictSelect] = useState("");
	const [recoveryForm, setRecoveryForm] = useState({
		aadhaarNumber: "",
		newPhoneNumber: "",
		document: null,
	});

	const [eligibleData, setEligibleData] = useState(null);
	const [auditDocType, setAuditDocType] = useState("");

	useEffect(() => {
		const savedToken = localStorage.getItem("rw_token");

		if (savedToken) {
			setToken(savedToken);
			setActiveTab("eligibility");
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
			const normalizedPhone = loginForm.phoneNumber?.toString().trim();
			if (!/^\d{10}$/.test(normalizedPhone || "")) {
				throw new Error("Phone number must be exactly 10 digits.");
			}

			if (otpStep === "request") {
				const data = await apiRequest("/api/auth/login", {
					method: "POST",
					body: JSON.stringify({ phoneNumber: normalizedPhone }),
				});
				setOtpStep("verify");
				setMessage(data.message || "OTP sent. Please enter it to continue.");
				return;
			}

			const normalizedOtp = loginForm.otp?.toString().trim();
			if (!/^\d{6}$/.test(normalizedOtp || "")) {
				throw new Error("OTP must be exactly 6 digits.");
			}

			const data = await apiRequest("/api/auth/verify-otp", {
				method: "POST",
				body: JSON.stringify({ phoneNumber: normalizedPhone, otp: normalizedOtp }),
			});

			updateToken(data.token);
			setOtpStep("request");
			setLoginForm({ phoneNumber: "", otp: "" });
			setMessage("Logged in successfully.");
			setActiveTab("eligibility");
		} catch (err) {
			setError(err.message || "Login failed");
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
			const normalizedPhone = registerForm.phoneNumber?.toString().trim();
			if (!/^\d{10}$/.test(normalizedPhone || "")) {
				throw new Error("Phone number must be exactly 10 digits.");
			}

			const payload = {
				...registerForm,
				phoneNumber: normalizedPhone,
				aadhaarNumber: registerForm.governmentId?.toString().trim(),
				governmentIdType: "Aadhaar",
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

			setMessage(
				data.message || "Registration successful. Please login to receive OTP.",
			);
			setActiveTab("login");
		} catch (err) {
			setError(err.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	const handleRecovery = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setMessage("");

		try {
			const aadhaarNumber = recoveryForm.aadhaarNumber?.toString().trim();
			const newPhoneNumber = recoveryForm.newPhoneNumber?.toString().trim();

			if (!aadhaarNumber) throw new Error("Aadhaar number is required.");
			if (!/^\d{10}$/.test(newPhoneNumber || "")) {
				throw new Error("New phone number must be exactly 10 digits.");
			}
			if (!recoveryForm.document) {
				throw new Error("Please upload a photo of your Aadhaar card.");
			}

			const form = new FormData();
			form.append("aadhaarNumber", aadhaarNumber);
			form.append("newPhoneNumber", newPhoneNumber);
			form.append("document", recoveryForm.document);

			const data = await apiRequestForm("/api/auth/recover-phone", {
				method: "POST",
				body: form,
			});

			setMessage(data.message || "Recovery request submitted.");
			setRecoveryForm({ aadhaarNumber: "", newPhoneNumber: "", document: null });
			setActiveTab("login");
		} catch (err) {
			setError(err.message || "Recovery request failed");
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
			setEligibleData({
				...data.schemes,
				userDocuments: data.userDocuments,
			});
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
		{ id: "recover", label: "Recover Account" },
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
										Phone Number <span className="text-emerald-400">*</span>
									</label>
									<input
										className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
										type="tel"
										inputMode="numeric"
										pattern="[0-9]{10}"
										maxLength={10}
										placeholder="Enter 10-digit phone number"
										value={loginForm.phoneNumber}
										onChange={(e) => {
											const value = onlyDigits(e.target.value).slice(0, 10);
											setLoginForm((prev) => ({ ...prev, phoneNumber: value }));
										}}
										required
									/>
								</div>
								{otpStep === "verify" && (
									<div className="space-y-2">
										<label className="text-sm font-medium text-slate-300">
											OTP <span className="text-emerald-400">*</span>
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="tel"
											inputMode="numeric"
											pattern="[0-9]{6}"
											maxLength={6}
											placeholder="Enter 6-digit OTP"
											value={loginForm.otp}
											onChange={(e) => {
												const value = onlyDigits(e.target.value).slice(0, 6);
												setLoginForm((prev) => ({ ...prev, otp: value }));
											}}
											required
										/>
									</div>
								)}
							</div>
							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading}
							>
								{loading
									? otpStep === "request"
										? "Sending OTP..."
										: "Verifying OTP..."
									: otpStep === "request"
										? "Send OTP"
										: "Verify & Login"}
							</button>
							{otpStep === "verify" && (
								<div className="mt-3 text-center text-sm text-slate-400">
									<button
										type="button"
										onClick={() => {
											setOtpStep("request");
											setLoginForm((prev) => ({ ...prev, otp: "" }));
										}}
										className="font-medium text-emerald-400 hover:text-emerald-200"
										disabled={loading}
									>
										Change phone / resend OTP
									</button>
								</div>
							)}
						</form>
					</div>
				)}

				{activeTab === "recover" && (
					<div className="form-section">
						<h3>Recover Your Account</h3>
						<p className="text-sm text-slate-400 mb-6">
							If you lost your phone, upload your Aadhaar card photo. An auditor
							will verify it and link your new phone number.
						</p>

						<form onSubmit={handleRecovery} className="space-y-6">
							<div className="form-grid">
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-300">
										Aadhaar Number <span className="text-emerald-400">*</span>
									</label>
									<input
										className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
										type="text"
										inputMode="numeric"
										placeholder="Enter your Aadhaar number"
										value={recoveryForm.aadhaarNumber}
										onChange={(e) =>
											setRecoveryForm((prev) => ({
												...prev,
												aadhaarNumber: e.target.value,
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-300">
										New Phone Number{" "}
										<span className="text-emerald-400">*</span>
									</label>
									<input
										className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
										type="tel"
										inputMode="numeric"
										pattern="[0-9]{10}"
										maxLength={10}
										placeholder="Enter 10-digit new phone number"
										value={recoveryForm.newPhoneNumber}
										onChange={(e) =>
											setRecoveryForm((prev) => ({
												...prev,
												newPhoneNumber: onlyDigits(e.target.value).slice(0, 10),
											}))
										}
										required
									/>
								</div>
								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium text-slate-300">
										Aadhaar Photo <span className="text-emerald-400">*</span>
									</label>
									<input
										className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-slate-200 hover:file:bg-slate-700"
										type="file"
										accept="image/*"
										onChange={(e) =>
											setRecoveryForm((prev) => ({
												...prev,
												document: e.target.files?.[0] || null,
											}))
										}
										required
									/>
								</div>
							</div>

							<button
								type="submit"
								className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
								disabled={loading}
							>
								{loading ? "Submitting..." : "Submit Recovery Request"}
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
											Phone Number <span className="text-emerald-400">*</span>
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="tel"
											inputMode="numeric"
											pattern="[0-9]{10}"
											maxLength={10}
											placeholder="Enter 10-digit phone number"
											value={registerForm.phoneNumber}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													phoneNumber: onlyDigits(e.target.value).slice(0, 10),
												}))
											}
											required
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
											Aadhaar Number{" "}
											<span className="text-emerald-400">*</span>
										</label>
										<input
											className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
											type="text"
											inputMode="numeric"
											placeholder="Enter Aadhaar number"
											value={registerForm.governmentId}
											onChange={(e) =>
												setRegisterForm((prev) => ({
													...prev,
													governmentId: e.target.value,
												}))
											}
											required
										/>
										<p className="text-xs text-slate-500">
											Used to prevent duplicate accounts.
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
														<div className="flex items-center justify-between">
															<div className="font-medium text-amber-200">
																{item.schemeName}
															</div>
															{item.eligibilityPercentage && (
																<div className="flex items-center gap-2">
																	<div className="text-xs text-amber-300 font-medium">
																		{item.eligibilityPercentage}% Match
																	</div>
																	<div className="w-12 h-2 bg-amber-800/50 rounded-full overflow-hidden">
																		<div 
																			className="h-full bg-amber-400 transition-all duration-300"
																			style={{ width: `${item.eligibilityPercentage}%` }}
																		/>
																	</div>
																</div>
															)}
														</div>
														{item.description && (
															<div className="text-xs text-slate-400 mt-1">
																{item.description}
															</div>
														)}
														{item.requiredDocuments?.length > 0 && (
															<div className="mt-3 rounded-md border border-slate-700 bg-slate-950/40 p-3">
																<div className="text-xs font-semibold text-slate-200 mb-2">
																	Documents
																</div>
																<div className="space-y-2">
																	{item.requiredDocuments.map((docName) => {
																		const status = getDocStatus(
																			docName,
																			eligibleData.userDocuments?.documentsHeld,
																			eligibleData.userDocuments?.verifiedDocuments,
																		);

																		if (status === "verified") {
																			return (
																				<div
																					key={docName}
																					className="flex items-center justify-between gap-3 text-xs"
																				>
																					<div className="text-slate-200">
																						{docName}
																					</div>
																					<div className="flex items-center gap-2 text-green-300 font-medium">
																						<span
																							aria-hidden="true"
																							className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"
																						></span>
																						<span aria-hidden="true">✓</span>
																						<span>Verified</span>
																					</div>
																				</div>
																			);
																		}

																		if (status === "unverified") {
																			return (
																				<div
																					key={docName}
																					className="flex items-center justify-between gap-3 text-xs"
																				>
																					<div className="text-slate-200">
																						{docName}
																					</div>
																					<button
																						type="button"
																						onClick={() => {
																							setAuditDocType(docName);
																							setActiveTab("audit");
																							setMessage(
																								`Take photo for: ${docName}`,
																							);
																						}}
																						className="rounded-md border border-yellow-500/70 bg-yellow-500/10 px-3 py-1.5 text-yellow-200 font-medium hover:bg-yellow-500/20"
																					>
																						Take Photo
																					</button>
																				</div>
																			);
																		}

																		return (
																			<div
																				key={docName}
																				className="flex items-center justify-between gap-3 text-xs"
																			>
																				<div className="text-slate-200">{docName}</div>
																				<div className="flex items-center gap-2 text-red-300 font-medium">
																					<span
																						aria-hidden="true"
																						className="inline-block h-2.5 w-2.5 rounded-full bg-red-500"
																					></span>
																					<span>Do you have this?</span>
																				</div>
																			</div>
																		);
																	})}
																</div>
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
					<Audit
						token={token}
						auditDocType={auditDocType}
						setAuditDocType={setAuditDocType}
						setEligibleData={setEligibleData}
						setMessage={setMessage}
						setError={setError}
					/>
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
