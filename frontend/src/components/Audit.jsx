import { useMemo, useRef, useState } from "react";
import { apiRequestForm } from "../api";

const isCoarsePointer = () => {
	if (typeof window === "undefined") return false;
	return window.matchMedia?.("(pointer: coarse)")?.matches || false;
};

export default function Audit({
	token,
	auditDocType,
	setAuditDocType,
	setEligibleData,
	setMessage,
	setError,
}) {
	const fileInputRef = useRef(null);
	const [scanning, setScanning] = useState(false);
	const [localFile, setLocalFile] = useState(null);
	const [auditResults, setAuditResults] = useState(null);
	const isMobile = useMemo(() => isCoarsePointer(), []);

	const startPick = () => fileInputRef.current?.click();

	const onFilePicked = async (file) => {
		if (!file) return;
		setLocalFile(file);
		if (!auditDocType) {
			setError("Please select a document type first.");
			return;
		}

		setScanning(true);
		setError("");
		setMessage("");
		setAuditResults(null);
		try {
			const formData = new FormData();
			formData.append("document", file);
			formData.append("docType", auditDocType);

			const data = await apiRequestForm("/api/audit/audit-upload", {
				method: "POST",
				token,
				body: formData,
			});

			if (data?.success && data?.schemes) {
				setEligibleData({
					...data.schemes,
					userDocuments: data.userDocuments,
				});
			}

			setAuditResults(data?.results);

			if (data?.results?.isValid) {
				setMessage(`${auditDocType} verified successfully.`);
			} else {
				setError(
					data?.results?.warnings?.[0] ||
						"Could not verify this document. Please retake photo clearly.",
				);
			}
		} catch (err) {
			setError(err.message || "Audit failed");
		} finally {
			setScanning(false);
		}
	};

	return (
		<div className="form-section">
			<h3>Document Audit</h3>
			<p className="text-sm text-slate-400 mb-6">
				{isMobile 
					? "Take a clear photo using your camera. We'll check if the document matches your details."
					: "Upload a scan or photo. We will check if the document matches your details."
				}
			</p>

			<div className="space-y-4">
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
						<option value="Domicile Certificate">Domicile Certificate</option>
						<option value="Ration Card">Ration Card</option>
						<option value="E-Shram Card">E-Shram Card</option>
						<option value="Kisan Credit Card">Kisan Credit Card</option>
						<option value="7/12 Extract">7/12 Extract</option>
						<option value="Disability Certificate">Disability Certificate</option>
						<option value="Student ID">Student ID</option>
						<option value="Marriage Certificate">Marriage Certificate</option>
						<option value="Aadhaar Card">Aadhaar Card</option>
						<option value="PAN Card">PAN Card</option>
						<option value="Voter ID">Voter ID</option>
					</select>
				</div>

				<input
					ref={fileInputRef}
					className="hidden"
					type="file"
					accept={isMobile ? "image/*" : "image/*,application/pdf"}
					capture={isMobile ? "environment" : undefined}
					onChange={(e) => onFilePicked(e.target.files?.[0] || null)}
				/>

				<button
					type="button"
					onClick={startPick}
					disabled={scanning}
					className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${
						scanning 
							? "bg-slate-700 text-slate-400 cursor-not-allowed" 
							: auditResults?.isValid 
								? "bg-green-500 text-white hover:bg-green-400"
								: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed"
					}`}
				>
					{scanning ? (
						<div className="flex items-center justify-center gap-3">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
							<div>Scanning & Verifying...</div>
						</div>
					) : auditResults?.isValid ? (
						<div className="flex items-center justify-center gap-2">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							{auditDocType} Verified
						</div>
					) : (
						<div className="flex items-center justify-center gap-2">
							{isMobile ? (
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							) : (
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
							)}
							{isMobile ? "Take Photo" : "Upload Document"}
						</div>
					)}
				</button>

				{scanning && (
					<div className="space-y-3">
						<div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
							<div>Scanning & Verifying...</div>
						</div>
						<div className="text-xs text-slate-400 space-y-1">
							<div>• Extracting text from document...</div>
							<div>• Verifying your identity...</div>
							<div>• Checking document authenticity...</div>
						</div>
					</div>
				)}

				{auditResults && !scanning && (
					<div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-medium text-slate-200">Verification Results</h4>
							<div className={`px-2 py-1 rounded-full text-xs font-medium ${
								auditResults.isValid 
									? "bg-green-500/20 text-green-400 border border-green-500/30" 
									: "bg-red-500/20 text-red-400 border border-red-500/30"
							}`}>
								{auditResults.isValid ? "Verified" : "Failed"}
							</div>
						</div>
						
						{auditResults.verificationChecks && auditResults.verificationChecks.length > 0 && (
							<div className="space-y-2">
								<div className="text-xs text-slate-400 font-medium">Verification Checks:</div>
								{auditResults.verificationChecks.map((check, index) => (
									<div key={index} className="flex items-center gap-2 text-xs">
										<div className={`w-3 h-3 rounded-full flex-shrink-0 ${
											check.passed ? "bg-green-500" : "bg-red-500"
										}`} />
										<span className="text-slate-300">{check.description}</span>
									</div>
								))}
							</div>
						)}

						{auditResults.confidenceScore !== undefined && (
							<div className="pt-2 border-t border-slate-800">
								<div className="flex items-center justify-between text-xs">
									<span className="text-slate-400">Confidence Score:</span>
									<span className="text-slate-200 font-medium">
										{Math.round(auditResults.confidenceScore * 100)}%
									</span>
								</div>
							</div>
						)}
					</div>
				)}

				{localFile && !scanning && (
					<div className="text-xs text-slate-400">
						Last selected: <span className="text-slate-200">{localFile.name}</span>
					</div>
				)}
			</div>
		</div>
	);
}

