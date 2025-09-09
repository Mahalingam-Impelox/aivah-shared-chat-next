const audio = new Audio('/audios/silence.mp3');

export const setupAudioAuthorization = (): void => {
  const playEmptyAudio = (): void => {
    const audioPromise = audio.play();
    audioPromise.then().catch((err) => console.error(err))
    window.removeEventListener('click', playEmptyAudio);
  }
  window.addEventListener('click', playEmptyAudio);
}

export const setAudio = (audioUrl: string): HTMLAudioElement => {
  audio.src = audioUrl;
  return audio;
}

export function int16ArrayToWav(int16Array: Int16Array, sampleRate = 22300): Blob {
  int16Array = new Int16Array(int16Array);

  const numChannels = 1;
  const bytesPerSample = 2;
  const byteRate = sampleRate * numChannels * bytesPerSample;
  const blockAlign = numChannels * bytesPerSample;

  const wavHeaderSize = 44;
  const dataSize = int16Array.length * bytesPerSample;
  const bufferSize = wavHeaderSize + dataSize;

  const wavBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(wavBuffer);

  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false);

  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);

  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, dataSize, true);

  let offset = wavHeaderSize;
  for (let i = 0; i < int16Array.length; i++, offset += 2) {
    if (offset >= bufferSize) {
      console.error(
        'Offset out of bounds:',
        offset,
        'Buffer size:',
        bufferSize
      );
      break;
    }
    view.setInt16(offset, int16Array[i], true);
  }

  const wavData = new Uint8Array(wavBuffer);
  return new Blob([wavData], { type: 'audio/wav' });
}
