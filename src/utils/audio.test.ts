import { TimerAudio } from "./audio";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("TimerAudio", () => {
	let timerAudio: TimerAudio;

	beforeEach(() => {
		// @ts-expect-error: private property override for testing
		TimerAudio.instance = undefined;

		timerAudio = TimerAudio.getInstance();

		globalThis.AudioContext = class {
			state = "suspended";

			resume = vi.fn().mockResolvedValue(undefined);

			// Mocks the oscillator node
			createOscillator = vi.fn().mockReturnValue({
				type: "",
				frequency: {
					setValueAtTime: vi.fn(),
				},
				connect: vi.fn(),
				disconnect: vi.fn(),
				start: vi.fn(),
				stop: vi.fn(),
			});

			// Mocks the gain node
			createGain = vi.fn().mockReturnValue({
				gain: {
					setValueAtTime: vi.fn(),
				},
				connect: vi.fn(),
				disconnect: vi.fn(),
			});

			// The final output node
			destination = {};
		} as unknown as typeof AudioContext;
	});

	afterEach(() => {
		// Stop the sound after each test to reset any internal state
		timerAudio.stop();
	});

	it("should create a singleton instance", () => {
		const anotherInstance = TimerAudio.getInstance();
		expect(timerAudio).toBe(anotherInstance);
	});

	it("should initialize audio context when play() is called", async () => {
		await timerAudio.play();
		// The 'audioContext' field should now be set
		expect(timerAudio["audioContext"]).not.toBeNull();
	});

	it("should play sound", async () => {
		// Spy on the 'play' method itself
		const playSpy = vi.spyOn(timerAudio, "play");
		await timerAudio.play();

		expect(playSpy).toHaveBeenCalledTimes(1);

		// Optional: you can check that createOscillator was called
		const audioCtx = timerAudio["audioContext"] as unknown as AudioContext;
		expect(audioCtx.createOscillator).toHaveBeenCalled();
		expect(audioCtx.createGain).toHaveBeenCalled();
	});

	it("should stop and cleanup resources", async () => {
		await timerAudio.play();
		timerAudio.stop();

		// The oscillator and gainNode should be null
		expect(timerAudio["oscillator"]).toBeNull();
		expect(timerAudio["gainNode"]).toBeNull();
	});

	it("should handle errors during play", async () => {
		// We'll force an error by mocking AudioContext to throw
		const OriginalAudioContext = globalThis.AudioContext;
		globalThis.AudioContext = vi.fn().mockImplementation(() => {
			throw new Error("AudioContext error");
		}) as unknown as typeof AudioContext;

		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		await timerAudio.play();

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Failed to play audio:",
			expect.any(Error),
		);

		// Restore the original mock
		globalThis.AudioContext = OriginalAudioContext;
	});
});
