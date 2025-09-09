export const float32ArrayToBlobWithMimeType = async (
  audioData: Float32Array,
  sampleRate: number
): Promise<{ blob: Blob; mimeType: string }> => {
  const audioBuffer = await float32ArrayToAudioBuffer(audioData, sampleRate);
  const wavData = audioBufferToWav(audioBuffer);

  // Create a Blob with MIME type `audio/wav`
  const blob = new Blob([wavData], { type: 'audio/wav' });
  const mimeType = blob.type;

  return { blob, mimeType };
};

const float32ArrayToAudioBuffer = async (
  audioData: Float32Array,
  sampleRate: number
): Promise<AudioBuffer> => {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const audioBuffer = audioContext.createBuffer(
    1,
    audioData.length,
    sampleRate
  );
  audioBuffer.copyToChannel(
    new Float32Array(audioData.buffer as ArrayBuffer),
    0
  );
  return audioBuffer;
};

const audioBufferToWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numChannels;
  const wavBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(wavBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length * 2, true);

  let offset = 44;
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return wavBuffer;
};

const writeString = (view: DataView, offset: number, str: string): void => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
};
