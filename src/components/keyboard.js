import {
  Mesh,
  MeshPhongMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader
} from "three";
import loaderManager from "../managers/loaderManager.js";

export default class Keyboard {
  constructor(scene, color = 0x000000) {
    this.scene = scene;
    this.color = color;
    this.keyStates = {};
    this.init();
  }

  init() {
    //edit this according to your model dimensions (this one is mine)
    this.sizes = {
      qwerty: 18, Backspace: 32, Enter: 41.5, Shift: 41.5, Tab: 28.5,
      Caps: 32, Spacebar: 118, Ctrl: 18, Win: 18, Alt: 18, Fn: 18, Menu: 18,
      "`": 18,"1":18,"2":18,"3":18,"4":18,"5":18,"6":18,"7":18,"8":18,"9":18,"0":18,
      "-":18,"=":18,"q":18,"w":18,"e":18,"r":18,"t":18,"y":18,"u":18,"i":18,"o":18,"p":18,
      "[":18, "]":18, "\\":18,"a":18,"s":18,"d":18,"f":18,"g":18,"h":18,"j":18,"k":18,"l":18,
      ";":18,"'":18,"z":18,"x":18,"c":18,"v":18,"b":18,"n":18,"m":18,",":18,".":18,"/":18
    };

    this.mat = new MeshPhongMaterial({ color: this.color });

    this.baseGeoms = {};
    Object.keys(this.sizes).forEach(k => this.baseGeoms[k] = this.getGeom(k));

    this.createKeyboard();
  }

  getGeom(name) {
    let e = loaderManager.assets[name] || loaderManager.assets["qwerty"];
    if (!e || !e.geometry) e = loaderManager.assets["qwerty"];
    const g = e.geometry.clone();
    g.computeVertexNormals();
    g.center();
    g.computeBoundingBox();
    return g;
  }

  createLabelTexture(text,color = "white") {
    text = text.toLowerCase();
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    if (text.length > 8) {
      canvas.width = 256;
    }
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0, canvas.width, 32);
    ctx.fillStyle = color;
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, 32);
    const tex = new TextureLoader().load(canvas.toDataURL());
    tex.needsUpdate = true;
    return tex;
  }

  makeKey(name, x, y) {
    if (name == "backspace") name = "e";
    const geom = this.baseGeoms[name];
    const mesh = new Mesh(geom.clone(), new MeshPhongMaterial({ color: this.color }));
    mesh.position.set(x + this.sizes[name]/2, y, 0);
    
    this.scene.add(mesh);

    const keyName = name.toLowerCase();
    if (!this.keyStates[keyName]) this.keyStates[keyName] = [];
    this.keyStates[keyName].push({
      mesh,
      defaultZ: 0,
      pressedZ: -3,
      targetZ: 0,
      currentZ: 0,
      velocity: 0
    });

    if(name !== "Spacebar") {
      const labelTex = this.createLabelTexture(name.length>1?name:name.toUpperCase());
      const labelMat = new MeshBasicMaterial({ map: labelTex, transparent:true });
      const labelGeom = new PlaneGeometry(this.sizes[name]*0.6,10);
      const labelMesh = new Mesh(labelGeom, labelMat);
      const zOffset = geom.boundingBox ? geom.boundingBox.max.z + 1 : 6;
      labelMesh.position.set(0,0,zOffset-1.81);
      labelMesh.rotation.x = -0.15;
      if (name == "Backspace") {
        labelMesh.position.z += 0.5;
        labelMesh.rotation.x = 0;

      }
      mesh.add(labelMesh);
    }

    return this.sizes[name];
  }

  createKeyboard() {
    let cursorY = 0, spacingY = 20;
    //keyboard layout (edit as you want)
    const rows = [
      ["`","1","2","3","4","5","6","7","8","9","0","-","=","Backspace"],
      ["Tab","q","w","e","r","t","y","u","i","o","p","[","]","\\"],
      ["Caps","a","s","d","f","g","h","j","k","l",";","'","Enter"],
      ["Shift","z","x","c","v","b","n","m",",",".","/","Shift"],
      ["Ctrl","Win","Alt","Spacebar","Alt","Fn","Menu"]
    ];

    rows.forEach(row => {
      let cursorX = -row.reduce((a,k)=>a+this.sizes[k]+2,0)/2;
      row.forEach(k => { cursorX += this.makeKey(k,cursorX,cursorY)+2; });
      cursorY -= spacingY;
    });
  }

  pressKey(k) {
    if (k === "capslock") k = "caps";
    k = k.toLowerCase();
    if (this.keyStates[k]) this.keyStates[k].forEach(s => s.targetZ = -2);
    else if(k===' ') this.keyStates['spacebar'].forEach(s => s.targetZ=-2);
    else if(k==='enter') this.keyStates['enter'].forEach(s => s.targetZ=-2);
    else if(k==='shift') this.keyStates['shift'].forEach(s => s.targetZ=-2);
    else if(k==='tab') this.keyStates['tab'].forEach(s => s.targetZ=-2);
  }

  releaseKey(k) {
    if (k === "capslock") k = "caps";
    k = k.toLowerCase();
    if (this.keyStates[k]) this.keyStates[k].forEach(s => s.targetZ = 0);
    else if(k===' ') this.keyStates['spacebar'].forEach(s => s.targetZ=0);
    else if(k==='enter') this.keyStates['enter'].forEach(s => s.targetZ=0);
    else if(k==='shift') this.keyStates['shift'].forEach(s => s.targetZ=0);
    else if(k==='tab') this.keyStates['tab'].forEach(s => s.targetZ=0);
  }

  updateKeyPositions() {
    Object.values(this.keyStates).forEach(arr => {
      arr.forEach(s => {
        if (!s || !s.mesh) return;

        const stiff = 0.2, damp = 0.15;
        const f = (s.targetZ - s.currentZ) * stiff;

        s.velocity += f;
        s.velocity *= (1 - damp);
        s.currentZ += s.velocity;

        s.mesh.position.z = s.currentZ;
      });
    });
  }

  setColor(hex) {
    Object.values(this.keyStates).forEach(arr => {
      arr.forEach(s => {
        if (s && s.mesh) {
          s.mesh.material.color.set(hex);
        }
      });
    });
  }
}
