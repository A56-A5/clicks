import {
  WebGLRenderer,
  Scene,
  Color,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  HemisphereLight,
  Clock
} from "three";

import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import loaderManager from "../managers/loaderManager.js";
import Keyboard from "./keyboard.js";
import TypingPanel from "./typingpanel.js"; 
import SoundSettings from "./soundsetting.js";
import KeyboardColorSettings from "./keyboardcolor.js";
import BackgroundSettings from "./backgroundsetting.js";

export default class SceneMain {
  #canvas; #renderer; #scene; #camera; #controls; #stats; #width; #height; raf;

  constructor() {
    this.#canvas = document.querySelector(".scene");
    this.clock = new Clock();
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;
    this.init();
  }

  init = async () => {

    const assets = [
      { name: "qwerty", stl: "./keys/qwerty.stl" },
      { name: "Backspace", stl: "./keys/Backspace.stl" },
      { name: "Enter", stl: "./keys/Enter.stl" },
      { name: "Shift", stl: "./keys/Shift.stl" },
      { name: "Tab", stl: "./keys/Tab.stl" },
      { name: "Caps", stl: "./keys/Caps.stl" },
      { name: "Spacebar", stl: "./keys/Spacebar.stl" },
      { name: "plastic", texture: "./textures/image.png" }
    ];

    try { await loaderManager.load(assets); }
    catch(e){ console.warn("Some STLs failed to load:", e); }

    this.setScene();
    this.setCamera();
    this.setRender();
    this.setStats();
    this.setLights();
    this.setControls();

    // MODULES
    this.keyboard = new Keyboard(this.#scene);
    this.typingPanel = new TypingPanel(this.#scene);
    this.soundSettings = new SoundSettings(this); 
    this.keyboardColorSettings = new KeyboardColorSettings(this);
    this.backgroundSettings = new BackgroundSettings(this);

    this.handleResize();
    this.events();
  };

  setScene() {
    this.#scene = new Scene();
    this.#scene.background = new Color(0x222222);
  }

  get scene() { return this.#scene; } // BackgroundSettings uses this

  setCamera() {
    this.#camera = new PerspectiveCamera(
      60, this.#width / this.#height,
      0.1, 5000
    );

    this.#camera.position.set(5.04, -91.67, 213.27);
    this.#camera.lookAt(0, 0, 0);
    this.#scene.add(this.#camera);
  }

  setLights() {
    const dir1 = new DirectionalLight(0xffffff, 1.2);
    dir1.position.set(200, 300, 200);
    this.#scene.add(dir1);

    const dir2 = new DirectionalLight(0xffffff, 0.8);
    dir2.position.set(-200, 300, 100);
    this.#scene.add(dir2);

    const dir3 = new DirectionalLight(0xffffff, 0.6);
    dir3.position.set(0, 300, -200);
    this.#scene.add(dir3);

    const amb = new AmbientLight(0xffffff, 0.5);
    this.#scene.add(amb);

    const hemi = new HemisphereLight(0xffffff, 0x222222, 0.4);
    hemi.position.set(0, 200, 0);
    this.#scene.add(hemi);
  }

  setRender() {
    this.#renderer = new WebGLRenderer({
      canvas: this.#canvas,
      antialias: true
    });

    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(this.#width, this.#height);
  }

  setControls() {
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
  }

  setStats() {
    this.#stats = new Stats();
    document.body.appendChild(this.#stats.dom);
  }

  draw = () => {
    this.#stats.begin();
    this.keyboard.updateKeyPositions();
    if (this.#controls) this.#controls.update();

    this.#renderer.render(this.#scene, this.#camera);
    this.#stats.end();

    this.raf = requestAnimationFrame(this.draw);
  }

  handleResize = () => {
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;

    this.#camera.aspect = this.#width / this.#height;
    this.#camera.updateProjectionMatrix();

    this.#renderer.setSize(this.#width, this.#height);
  }

  events() {
    window.addEventListener("resize", this.handleResize, { passive: true });

    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      this.keyboard.pressKey(e.key.toLowerCase());
      this.typingPanel.handleKey(e.key);
      if (this.soundSettings) this.soundSettings.playKey(e.key);
    });

    window.addEventListener("keyup", (e) => {
      e.preventDefault();
      this.keyboard.releaseKey(e.key.toLowerCase());
    });

    this.draw();
  }
}
