import {
  WebGLRenderer,
  Scene,
  Color,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  HemisphereLight,
  Raycaster,
  Vector2,
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
import TimerSettings from "./timersetting.js";


export default class SceneMain {
  #canvas; #renderer; #scene; #camera; #controls; #stats; #width; #height; raf;

  #raycaster = new Raycaster();
  #mouse = new Vector2();

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
    this.timerSettings = new TimerSettings(this);

    try{ await this.soundSettings.loadSoundPacks();}
    catch(e){console.warn("Some Sound packs failed to load:",e);}

    this.handleResize();
    this.events();
  };

  setScene() {
    this.#scene = new Scene();
    this.#scene.background = new Color(0x222222);
  }

  get scene() { return this.#scene; } 

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

  checkKeyHover() {
    this.#raycaster.setFromCamera(this.#mouse, this.#camera);

    const keyMeshes = [];
    Object.values(this.keyboard.keyStates).forEach(arr => {
      arr.forEach(s => keyMeshes.push(s.mesh));
    });

    const intersects = this.#raycaster.intersectObjects(keyMeshes);

    keyMeshes.forEach(mesh => {
      if (!intersects.find(i => i.object === mesh)) mesh.userData.hovered = false;
    });

    intersects.forEach(i => {
      const mesh = i.object;
      if (!mesh.userData.hovered) {
        mesh.userData.hovered = true;
      }
    });
  
    Object.values(this.keyboard.keyStates).forEach(arr => {
      arr.forEach(s => {
        s.targetZ = s.mesh.userData.hovered ? -1.5 : (s.targetZ === -1.5 ? 0 : s.targetZ);
      });
    });
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

    window.addEventListener("mousemove", (e) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      this.#mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.#mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.checkKeyHover();
    });


    this.draw();
  }
}
