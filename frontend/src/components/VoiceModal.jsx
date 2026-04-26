import { useState, useEffect, useRef } from "react";
import { apiRequest, apiRequestForm } from "../api";

const VoiceModal = ({ isOpen, onClose, token, onLanguageDetected }) => {
	const [isListening, setIsListening] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [audioUrl, setAudioUrl] = useState("");
	const [detectedLanguage, setDetectedLanguage] = useState(null);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [noAudioDetected, setNoAudioDetected] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	
	const audioRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const audioChunksRef = useRef([]);
	const silenceTimerRef = useRef(null);
	const recordingTimerRef = useRef(null);

	// Auto-play instructional audio when modal opens
	useEffect(() => {
		if (isOpen) {
			playInstructionalAudio();
		}
		return () => {
			stopRecording();
			clearAllTimers();
		};
	}, [isOpen]);

	const playInstructionalAudio = async () => {
		try {
			setIsProcessing(true);
			// Get Hindi instructional audio from backend
			const response = await apiRequest("/api/voice/instructional-audio", {
				method: "GET",
				token,
			});

			if (response.audioBase64) {
				// Convert base64 to blob and create URL
				const audioBlob = base64ToBlob(response.audioBase64, 'audio/wav');
				const url = URL.createObjectURL(audioBlob);
				setAudioUrl(url);

				// Auto-play the audio
				if (audioRef.current) {
					audioRef.current.src = url;
					audioRef.current.play().catch(error => {
						console.error("Auto-play failed:", error);
						// Fallback: show manual play button
					});
				}
			}
		} catch (error) {
			console.error("Failed to get instructional audio:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const base64ToBlob = (base64, mimeType) => {
		const byteCharacters = atob(base64);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		return new Blob([byteArray], { type: mimeType });
	};

	const clearAllTimers = () => {
		if (silenceTimerRef.current) {
			clearTimeout(silenceTimerRef.current);
		}
		if (recordingTimerRef.current) {
			clearInterval(recordingTimerRef.current);
		}
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ 
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 16000
				} 
			});

			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'audio/webm'
			});

			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
				await processAudio(audioBlob);
			};

			mediaRecorder.start();
			setIsListening(true);
			setNoAudioDetected(false);
			setRecordingTime(0);

			// Start recording timer
			recordingTimerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);

			// Set up 5-second silence detection
			silenceTimerRef.current = setTimeout(() => {
				handleNoAudioDetected();
			}, 5000);

			// Haptic feedback when recording starts
			if (navigator.vibrate) {
				navigator.vibrate(60);
			}

		} catch (error) {
			console.error("Error accessing microphone:", error);
			alert("Please allow microphone access to use voice detection.");
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isListening) {
			mediaRecorderRef.current.stop();
			mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
			setIsListening(false);
			clearAllTimers();
		}
	};

	const handleNoAudioDetected = async () => {
		setNoAudioDetected(true);
		stopRecording();
		
		// Play follow-up Marathi/Hindi prompt
		try {
			const response = await apiRequest("/api/voice/followup-audio", {
				method: "GET",
				token,
			});

			if (response.audioBase64) {
				const audioBlob = base64ToBlob(response.audioBase64, 'audio/wav');
				const url = URL.createObjectURL(audioBlob);
				
				if (audioRef.current) {
					audioRef.current.src = url;
					await audioRef.current.play();
				}
			}
		} catch (error) {
			console.error("Failed to play follow-up audio:", error);
		}
	};

	const processAudio = async (audioBlob) => {
		try {
			setIsProcessing(true);

			// Convert webm to wav for better compatibility
			const wavBlob = await convertWebmToWav(audioBlob);
			
			// Send to backend for language detection
			const formData = new FormData();
			formData.append("audio", wavBlob, "recording.wav");

			const response = await apiRequestForm("/api/voice/detect-language", {
				method: "POST",
				token,
				body: formData,
			});

			if (response.success) {
				setDetectedLanguage(response.result);
				setShowConfirmation(true);
			} else {
				throw new Error(response.error || "Language detection failed");
			}
		} catch (error) {
			console.error("Error processing audio:", error);
			alert("Failed to detect language. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const convertWebmToWav = async (webmBlob) => {
		// For now, return the webm blob as is
		// In production, you'd use a proper WebM to WAV converter
		return webmBlob;
	};

	const confirmLanguage = () => {
		if (detectedLanguage) {
			onLanguageDetected(detectedLanguage);
			onClose();
		}
	};

	const retryRecording = () => {
		setDetectedLanguage(null);
		setShowConfirmation(false);
		setNoAudioDetected(false);
		setRecordingTime(0);
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
				<div className="text-center">
					<h3 className="text-xl font-semibold text-slate-100 mb-4">
						{showConfirmation ? "Language Detected" : "Voice Setup"}
					</h3>

					{/* Audio player for instructional prompts */}
					{audioUrl && (
						<audio
							ref={audioRef}
							className="hidden"
							onEnded={() => {
								if (!showConfirmation && !isListening) {
									// Auto-start recording after instruction
									setTimeout(startRecording, 500);
								}
							}}
						/>
					)}

					{!showConfirmation ? (
						<>
							{/* Recording Interface */}
							<div className="mb-6">
								{isListening ? (
									<div className="flex flex-col items-center space-y-4">
										{/* Pulse/Waveform Animation */}
										<div className="relative">
											<div className="w-20 h-20 bg-emerald-500 rounded-full animate-pulse" />
											<div className="absolute inset-0 w-20 h-20 bg-emerald-400 rounded-full animate-ping opacity-75" />
										</div>
										
										<div className="text-emerald-400 font-medium">
											🎤 Listening...
										</div>
										
										<div className="text-slate-400 text-sm">
											{formatTime(recordingTime)}
										</div>
										
										<button
											onClick={stopRecording}
											className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
										>
											Stop Recording
										</button>
									</div>
								) : noAudioDetected ? (
									<div className="text-amber-400">
										<p className="mb-4">No audio detected. Please try again.</p>
										<button
											onClick={retryRecording}
											className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
										>
											Retry
										</button>
									</div>
								) : isProcessing ? (
									<div className="text-blue-400">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
										<p>Processing your voice...</p>
									</div>
								) : (
									<div className="text-slate-400">
										<p>Click the button below and speak in your preferred language.</p>
									</div>
								)}
							</div>

							{/* Manual audio controls if auto-play fails */}
							{audioUrl && !isListening && !isProcessing && (
								<button
									onClick={() => audioRef.current?.play()}
									className="mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
								>
									🔊 Play Instruction
								</button>
							)}
						</>
					) : (
						/* Language Confirmation */
						<div className="space-y-4">
							{detectedLanguage && (
								<div className="bg-slate-800 rounded-lg p-4">
									<p className="text-slate-300 mb-2">
										Detected: <span className="font-semibold text-emerald-400">{detectedLanguage.languageName}</span>
									</p>
									<p className="text-slate-400 text-sm">
										Confidence: {Math.round(detectedLanguage.confidence * 100)}%
									</p>
									{detectedLanguage.transcript && (
										<p className="text-slate-500 text-xs mt-2 italic">
											"{detectedLanguage.transcript}"
										</p>
									)}
								</div>
							)}

							<div className="flex gap-3 justify-center">
								<button
									onClick={confirmLanguage}
									className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
								>
									✓ Correct
								</button>
								<button
									onClick={retryRecording}
									className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
								>
									Try Again
								</button>
							</div>
						</div>
					)}

					{/* Close button */}
					<button
						onClick={onClose}
						className="mt-6 text-slate-500 hover:text-slate-300 text-sm transition-colors"
					>
						Skip for now
					</button>
				</div>
			</div>
		</div>
	);
};

export default VoiceModal;
