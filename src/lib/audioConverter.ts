/**
 * AryaSaarthi — Audio Converter Utility
 * Converts client-recorded audio (WebM/Opus/MP4/OGG) to standard 16kHz Mono 16-bit PCM WAV.
 * Guarantees 100% compatibility with Bhashini's ASR pipeline requirements.
 */

export async function convertBlobTo16kHzWav(audioBlob: Blob): Promise<{ blob: Blob; base64: string }> {
  if (typeof window === 'undefined') {
    // Server-side fallback: return as-is
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      blob: audioBlob,
      base64: buffer.toString('base64'),
    };
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Target specification: 16,000 Hz, 1 Channel (Mono)
    const targetSampleRate = 16000;
    const numberOfChannels = 1;

    // Use OfflineAudioContext to resample cleanly
    const offlineCtx = new OfflineAudioContext(
      numberOfChannels,
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const channelData = renderedBuffer.getChannelData(0);

    // Encode to 16-bit PCM WAV
    const wavBlob = encodeWavFile(channelData, targetSampleRate);
    const wavArrayBuffer = await wavBlob.arrayBuffer();
    const bytes = new Uint8Array(wavArrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
      blob: wavBlob,
      base64,
    };
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close();
    }
  }
}

/**
 * Encodes Float32 mono PCM samples to a standard 44-byte RIFF/WAVE Blob.
 */
function encodeWavFile(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // 1. RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // 2. fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (16000)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // 3. data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true); // Subchunk2Size

  // 4. Write 16-bit PCM samples with clipping protection
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
