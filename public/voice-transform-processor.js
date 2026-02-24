// Voice Transform AudioWorklet Processor
// This runs in a separate audio processing thread for better performance

class VoiceTransformProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    // Get configuration from options
    this.targetSampleRate = options.processorOptions?.targetSampleRate || 16000;
    this.inputSampleRate = sampleRate; // Global AudioWorkletGlobalScope variable
    this.shouldProcess = false;
    
    console.log(`[PROCESSOR] Initialized with input: ${this.inputSampleRate}Hz, target: ${this.targetSampleRate}Hz`);
    
    // Listen for control messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'start') {
        this.shouldProcess = true;
        console.log('[PROCESSOR] Started processing');
      } else if (event.data.type === 'stop') {
        this.shouldProcess = false;
        console.log('[PROCESSOR] Stopped processing');
      } else if (event.data.type === 'updateSampleRate') {
        this.targetSampleRate = event.data.targetSampleRate;
        console.log(`[PROCESSOR] Updated target sample rate to ${this.targetSampleRate}Hz`);
      }
    };
  }

  /**
   * Resample audio using linear interpolation
   * @param {Float32Array} input - Input audio samples
   * @param {number} inputSampleRate - Input sample rate
   * @param {number} outputSampleRate - Output sample rate
   * @returns {Float32Array} Resampled audio
   */
  resampleAudio(input, inputSampleRate, outputSampleRate) {
    if (inputSampleRate === outputSampleRate) {
      return input;
    }
    
    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Float32Array(outputLength);
    
    // Linear interpolation for better quality
    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
      const fraction = srcIndex - srcIndexFloor;
      
      // Interpolate between two samples
      output[i] = input[srcIndexFloor] * (1 - fraction) + input[srcIndexCeil] * fraction;
    }
    
    return output;
  }

  /**
   * Convert Float32 audio samples to PCM16 (16-bit integers)
   * @param {Float32Array} float32Array - Input float samples (-1.0 to 1.0)
   * @returns {Int16Array} PCM16 samples
   */
  float32ToPCM16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp value between -1 and 1
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit integer
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  /**
   * Convert ArrayBuffer to Base64 string
   * Note: btoa() is not available in AudioWorklet, so we send raw data to main thread
   * @param {ArrayBuffer} buffer
   * @returns {Uint8Array}
   */
  prepareForTransfer(buffer) {
    return new Uint8Array(buffer);
  }

  /**
   * Main audio processing function
   * Called automatically by the browser for each audio block (128 frames)
   * @param {Float32Array[][]} inputs - Input audio channels
   * @param {Float32Array[][]} outputs - Output audio channels (not used)
   * @param {Object} parameters - Audio parameters (not used)
   * @returns {boolean} true to keep processor alive, false to destroy it
   */
  process(inputs, outputs, parameters) {
    // Don't process if not started
    if (!this.shouldProcess) {
      return true;
    }

    const input = inputs[0];
    
    // If no input or no channel data, keep processor alive but don't send data
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }

    try {
      // Get first channel (mono audio)
      let inputData = input[0];
      
      // Check if we have actual audio (not silence)
      // Increased threshold for mobile devices (higher noise floor)
      const silenceThreshold = 0.005;
      const hasAudio = inputData.some(sample => Math.abs(sample) > silenceThreshold);
      
      if (!hasAudio) {
        // Skip processing silent audio
        return true;
      }
      
      // Resample if input and target sample rates differ
      if (this.inputSampleRate !== this.targetSampleRate) {
        inputData = this.resampleAudio(inputData, this.inputSampleRate, this.targetSampleRate);
      }
      
      // Convert Float32 to PCM16
      const pcm16 = this.float32ToPCM16(inputData);
      
      // Send audio data to main thread
      // Try transferable objects first, fall back to copy if not supported
      try {
        this.port.postMessage({
          type: 'audioData',
          data: pcm16.buffer
        }, [pcm16.buffer]);
      } catch (e) {
        // Fall back to non-transferable if not supported
        this.port.postMessage({
          type: 'audioData',
          data: pcm16.buffer.slice(0)
        });
      }
      
    } catch (error) {
      // Log errors (will appear in main thread console if port.onmessageerror is set)
      this.port.postMessage({
        type: 'error',
        error: error.message
      });
    }

    // Return true to keep the processor alive
    return true;
  }
}

// Register the processor with the audio worklet
registerProcessor('voice-transform-processor', VoiceTransformProcessor);
