/**
 * Runs on the audio rendering thread — just forwards raw mic frames to the
 * main thread in small batches. Resampling/encoding happens on the main
 * thread (voice-demo/page.tsx) to keep this file simple; the audio-thread
 * side only needs to avoid dropping frames, which posting raw Float32
 * batches accomplishes without doing any real work here.
 */
class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel && channel.length > 0) {
      this.port.postMessage(channel.slice());
    }
    return true;
  }
}
registerProcessor('mic-processor', MicProcessor);
