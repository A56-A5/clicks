import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import { TextureLoader } from "three"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"

class LoaderManager {
  #assets = {}
  #textureLoader = new TextureLoader()
  #GLTFLoader = new GLTFLoader()
  #OBJLoader = new OBJLoader()
  #DRACOLoader = new DRACOLoader()
  #FontLoader = new FontLoader()
  #STLLoader = new STLLoader()

  constructor() {
    this.#assets = {}
  }

  get assets() {
    return this.#assets
  }

  load = (data) =>
    new Promise((resolve) => {
      const promises = []

      for (let i = 0; i < data.length; i++) {
        const { name, gltf, texture, img, font, obj, stl } = data[i]

        if (!this.#assets[name]) this.#assets[name] = {}

        if (gltf) promises.push(this.loadGLTF(gltf, name))
        if (texture) promises.push(this.loadTexture(texture, name))
        if (img) promises.push(this.loadImage(img, name))
        if (font) promises.push(this.loadFont(font, name))
        if (obj) promises.push(this.loadObj(obj, name))
        if (stl) promises.push(this.loadSTL(stl, name)) 
      }

      Promise.all(promises).then(() => resolve())
    })

  loadGLTF(url, name) {
    return new Promise((resolve) => {
      this.#DRACOLoader.setDecoderPath(
        "https://www.gstatic.com/draco/v1/decoders/"
      )
      this.#GLTFLoader.setDRACOLoader(this.#DRACOLoader)

      this.#GLTFLoader.load(url, (result) => {
        this.#assets[name].gltf = result
        resolve(result)
      })
    })
  }

  loadTexture(url, name) {
    return new Promise((resolve) => {
      this.#textureLoader.load(url, (result) => {
        this.#assets[name].texture = result
        resolve(result)
      })
    })
  }

  loadImage(url, name) {
    return new Promise((resolve) => {
      const image = new Image()
      image.onload = () => {
        this.#assets[name].img = image
        resolve(image)
      }
      image.src = url
    })
  }

  loadFont(url, name) {
    return new Promise((resolve) => {
      this.#FontLoader.load(url, (font) => {
        this.#assets[name].font = font
        resolve(font)
      })
    })
  }

  loadObj(url, name) {
    return new Promise((resolve) => {
      this.#OBJLoader.load(url, (object) => {
        this.#assets[name].obj = object
        resolve(object)
      })
    })
  }

  loadSTL(url, name) {
    return new Promise((resolve) => {
      this.#STLLoader.load(
        url,
        (geometry) => {
          this.#assets[name].geometry = geometry
          resolve(geometry)
        },
        undefined,
        (err) => console.error("STL load error:", err)
      )
    })
  }

  loadAudio(url, name, audioCtx = new (window.AudioContext || window.webkitAudioContext)()) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          if (!this.#assets[name]) this.#assets[name] = {};
          this.#assets[name].audio = audioBuffer;
          this.#assets[name].audioCtx = audioCtx;
          resolve(audioBuffer);
        })
        .catch(err => reject(err));
    });
  }

}
export default new LoaderManager()
