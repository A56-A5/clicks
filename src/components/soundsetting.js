export default class SoundSettings {
  constructor() {
    this.soundPacks = [];
    this.currentPack = null;
    this.audioBuffer = null;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.keyMap = {
      "`": "41", "1": "2","2":"3","3":"4","4":"5","5":"6","6":"7","7":"8","8":"9","9":"10","0":"11","-":"12","=":"13",
      "q":"16","w":"17","e":"18","r":"19","t":"20","y":"21","u":"22","i":"23","o":"24","p":"25","[":"26","]":"27","\\":"28",
      "a":"30","s":"31","d":"32","f":"33","g":"34","h":"35","j":"36","k":"37","l":"38",";":"39","'":"40",
      "z":"44","x":"45","c":"46","v":"47","b":"48","n":"49","m":"50",",":"51",".":"52","/":"53",
      " ":"57","Enter":"28","Shift":"42","Tab":"15","Control":"29","Alt":"56","Backspace":"14","CapsLock":"58"
    };

    this.initUI();
    this.loadSoundPacks();
  }

  initUI() {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.background = "rgba(0,0,0,0.5)";
    container.style.color = "white";
    container.style.padding = "5px";
    container.style.borderRadius = "5px";
    container.style.zIndex = 1000;

    const specialLabel = document.createElement("div");
    specialLabel.textContent = "Sound Pack";
    specialLabel.style.marginBottom = "4px";
    container.appendChild(specialLabel);

    this.select = document.createElement("select");
    this.select.style.background = "black";
    this.select.style.color = "white";
    this.select.addEventListener("change", () => this.selectPack(this.select.value));

    container.appendChild(this.select);
    document.body.appendChild(container);
  }

  async loadSoundPacks() {
    // List all sound packs
    const packs = [
      "cherrymx-black-abs",
      "cherrymx-black-pbt",
      "cherrymx-blue-abs",
      "cherrymx-blue-pbt",
      "cherrymx-red-abs",
      "cherrymx-red-pbt",
      "cherrymx-brown-abs",
      "cherrymx-brown-pbt"
    ];

    for (const packName of packs) {
      try {
        const configResp = await fetch(`/key_sounds/${packName}/config.json`);
        const config = await configResp.json();
        this.soundPacks.push({ name: config.name, id: packName, config });

        const option = document.createElement("option");
        option.value = packName;
        option.text = config.name;
        this.select.appendChild(option);

      } catch (e) {
        console.warn("Failed to load pack:", packName, e);
      }
    }
    const savedPack = localStorage.getItem("soundPack");
    if (savedPack) {
      this.select.value = savedPack;
      this.selectPack(savedPack);
    }else{
      const defaultPack =
      this.soundPacks.find(p => p.config.default) || this.soundPacks[0];

      this.select.value = defaultPack.id;
      this.selectPack(defaultPack.id);
    }
  }

  async selectPack(packId) {
    const pack = this.soundPacks.find(p => p.id === packId);
    if (!pack) return;

    this.currentPack = pack;
    localStorage.setItem("soundPack", packId); //store local choice

    try {
      const audioResp = await fetch(`/key_sounds/${packId}/${pack.config.sound}`);
      const arrayBuffer = await audioResp.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error("Failed to load audio file for pack:", packId, e);
    }
  }

  playKey(key) {
    if (!this.currentPack || !this.audioBuffer) return;

    // Map key to config id and get start and length
    const keyId = this.keyMap[key] || this.keyMap[key.toLowerCase()];
    const def = this.currentPack.config.defines[keyId];
    if (!def) {
      console.warn("No key mapping for:", key);
      return;
    }

    const [start, length] = def;
    const startSec = start / 1000;
    const durationSec = length / 1000;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0, startSec, durationSec);
    } catch (e) {
      console.error("Error playing key:", key, e);
    }   
  }
}
