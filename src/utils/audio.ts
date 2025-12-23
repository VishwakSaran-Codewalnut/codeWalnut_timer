export class TimerAudio {
	private static instance: TimerAudio;
	private audioContext: AudioContext | null = null;
	private oscillator: OscillatorNode | null = null;
	private gainNode: GainNode | null = null;
	private isPlaying: boolean = false;

	// Ensure `stop` is always bound
	constructor() {
		this.stop = this.stop.bind(this);
	}

	static getInstance(): TimerAudio {
		if (!TimerAudio.instance) {
			TimerAudio.instance = new TimerAudio();
		}
		return TimerAudio.instance;
	}

	private async initializeAudioContext(): Promise<void> {
		if (!this.audioContext) {
			this.audioContext = new AudioContext();
		}

		if (this.audioContext.state === "suspended") {
			await this.audioContext.resume();
		}
	}

	async play(): Promise<void> {
		if (this.isPlaying) {
			return; // Prevent multiple overlapping sounds
		}

		this.isPlaying = true;

		try {
			await this.initializeAudioContext();

			if (!this.audioContext) {
				throw new Error("AudioContext not initialized");
			}

			// Create and configure oscillator
			this.oscillator = this.audioContext.createOscillator();
			this.gainNode = this.audioContext.createGain();

			this.oscillator.type = "sine";
			this.oscillator.frequency.setValueAtTime(
				880,
				this.audioContext.currentTime,
			); // A5 note

			// Set gain (volume)
			this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);

			// Connect nodes
			this.oscillator.connect(this.gainNode);
			this.gainNode.connect(this.audioContext.destination);

			// Start the oscillator
			this.oscillator.start();
		} catch (error) {
			console.error("Failed to play audio:", error);
		}
	}

	stop(): void {
		if (!this.isPlaying) return;

		try {
			this.isPlaying = false;
			this.cleanup();
		} catch (error) {
			console.error("Error while stopping the audio:", error);
		}
	}

	private cleanup(): void {
		if (this.oscillator) {
			try {
				this.oscillator.stop();
				this.oscillator.disconnect();
			} catch (error) {
				console.error("Error stopping or disconnecting oscillator:", error);
			}
			this.oscillator = null;
		}

		if (this.gainNode) {
			try {
				this.gainNode.disconnect();
			} catch (error) {
				console.error("Error disconnecting gain node:", error);
			}
			this.gainNode = null;
		}
	}
}
