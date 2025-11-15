// SoundPackManager.js
import loaderManager from "./LoaderManager.js";

export default class SoundPackManager {
  constructor(basePath="/key_sounds/") {
    this.basePath = basePath;
    this.activePack = null;
    this.audioBuffer = null;
    this.audioCtx = null;
  }

  async loadPack(packName) {
    const jsonUrl = `${this.basePath}${packName}/config.json`;
    const soundUrl = `${this.basePath}${packName}/sound.ogg`;

    const res = await fetch(jsonUrl);
    const config = await res.json();
    this.activePack = config;

    await loaderManager.loadAudio(soundUrl, packName);
    this.audioBuffer = loaderManager.assets[packName].audio;
    this.audioCtx = loaderManager.assets[packName].audioCtx;

    console.log("Loaded sound pack:", config.name);
  }

  playKey(key) {
    if(!this.activePack || !this.audioBuffer) return;
    const def = this.activePack.defines[key] || this.activePack.defines[key.toLowerCase()];
    if(!def) return;

    const [startSample, lengthSample] = def;
    const source = this.audioCtx.createBufferSource();
    const buffer = this.audioCtx.createBuffer(
      this.audioBuffer.numberOfChannels,
      lengthSample,
      this.audioBuffer.sampleRate
    );

    for(let ch=0; ch<this.audioBuffer.numberOfChannels; ch++){
      const channelData = this.audioBuffer.getChannelData(ch).slice(startSample, startSample+lengthSample);
      buffer.copyToChannel(channelData, ch, 0);
    }

    source.buffer = buffer;
    source.connect(this.audioCtx.destination);
    source.start();
  }
}
