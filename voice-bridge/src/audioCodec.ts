/**
 * G.711 mu-law <-> linear PCM16 conversion, plus simple resampling between
 * Twilio's 8kHz mu-law and Gemini Live's 16kHz PCM16 input / 24kHz PCM16
 * output. This is not broadcast-quality DSP (linear interpolation / block
 * averaging, no anti-aliasing filter) — good enough for a phone call, and
 * avoids pulling in a native/ffmpeg dependency for an MVP.
 */

const BIAS = 0x84;
const MAX_SAMPLE = 32767;

export function muLawByteToLinear(muByte: number): number {
  const inverted = ~muByte & 0xff;
  const sign = inverted & 0x80;
  const exponent = (inverted >> 4) & 0x07;
  const mantissa = inverted & 0x0f;
  let sample = ((mantissa << 3) + BIAS) << exponent;
  sample -= BIAS;
  return sign ? -sample : sample;
}

export function linearToMuLawByte(sampleIn: number): number {
  let sample = sampleIn;
  const sign = (sample >> 8) & 0x80;
  if (sign !== 0) sample = -sample;
  if (sample > MAX_SAMPLE) sample = MAX_SAMPLE;
  sample += BIAS;

  let exponent = 7;
  for (let mask = 0x4000; (sample & mask) === 0 && exponent > 0; exponent--, mask >>= 1) {
    // find the position of the highest set bit
  }

  const mantissa = (sample >> (exponent + 3)) & 0x0f;
  const muByte = ~(sign | (exponent << 4) | mantissa);
  return muByte & 0xff;
}

/** Twilio's base64 mu-law/8kHz payload -> PCM16 samples at 8kHz. */
export function muLawBase64ToPcm8k(base64: string): Int16Array {
  const bytes = Buffer.from(base64, 'base64');
  const pcm = new Int16Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) pcm[i] = muLawByteToLinear(bytes[i]);
  return pcm;
}

/** PCM16 samples at 8kHz -> base64 mu-law/8kHz payload for Twilio. */
export function pcm8kToMuLawBase64(pcm: Int16Array): string {
  const bytes = Buffer.alloc(pcm.length);
  for (let i = 0; i < pcm.length; i++) bytes[i] = linearToMuLawByte(pcm[i]);
  return bytes.toString('base64');
}

/** Linear-interpolation upsample, e.g. 8kHz -> 16kHz (factor 2). */
export function upsampleLinear(pcm: Int16Array, factor: number): Int16Array {
  if (factor === 1) return pcm;
  const out = new Int16Array(pcm.length * factor);
  for (let i = 0; i < pcm.length; i++) {
    const cur = pcm[i];
    const next = i + 1 < pcm.length ? pcm[i + 1] : cur;
    for (let j = 0; j < factor; j++) {
      out[i * factor + j] = Math.round(cur + ((next - cur) * j) / factor);
    }
  }
  return out;
}

/** Block-averaging downsample, e.g. 24kHz -> 8kHz (factor 3). */
export function downsampleAverage(pcm: Int16Array, factor: number): Int16Array {
  if (factor === 1) return pcm;
  const outLen = Math.floor(pcm.length / factor);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    let sum = 0;
    for (let j = 0; j < factor; j++) sum += pcm[i * factor + j];
    out[i] = Math.round(sum / factor);
  }
  return out;
}

export function pcm16ToBase64(pcm: Int16Array): string {
  return Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength).toString('base64');
}

export function base64ToPcm16(base64: string): Int16Array {
  const buf = Buffer.from(base64, 'base64');
  // Copy into a fresh, aligned ArrayBuffer — the Buffer's underlying buffer
  // may be a pooled slab with an offset that isn't a multiple of 2.
  const aligned = new Uint8Array(buf.length);
  aligned.set(buf);
  return new Int16Array(aligned.buffer);
}

/** Twilio mu-law/8kHz base64 -> Gemini PCM16/16kHz base64. */
export function twilioAudioToGeminiInput(muLawBase64: string): string {
  const pcm8k = muLawBase64ToPcm8k(muLawBase64);
  const pcm16k = upsampleLinear(pcm8k, 2);
  return pcm16ToBase64(pcm16k);
}

/** Gemini PCM16/24kHz base64 -> Twilio mu-law/8kHz base64. */
export function geminiOutputToTwilioAudio(pcm24kBase64: string): string {
  const pcm24k = base64ToPcm16(pcm24kBase64);
  const pcm8k = downsampleAverage(pcm24k, 3);
  return pcm8kToMuLawBase64(pcm8k);
}
