import {
  WebGLRenderer,
  Scene,
  Color,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  BufferGeometry,
  Vector3,
  Matrix4,
  Points,
  PointsMaterial,
  BufferAttribute,
  PlaneGeometry,
  CircleGeometry,
  TextureLoader,
  IcosahedronGeometry,
  Clock,
  RepeatWrapping,
  MeshPhongMaterial,
  PointLight,
  LoadingManager,
  WebGLRenderTarget,
  ShaderMaterial,
} from "three";
import * as THREE from 'three';
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Refractor } from "three/addons/objects/Refractor.js";
import { WaterRefractionShader } from "three/addons/shaders/WaterRefractionShader.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { Mesh } from "three";
import { ShaderChunk } from "three";
import loaderManager from "../managers/LoaderManager.js";

export default class MainScene {
  #canvas;
  #renderer;
  #scene;
  #camera;
  #controls;
  #stats;
  #width;
  #height;

  constructor() {
    this.#canvas = document.querySelector(".scene");
    this.clock = new Clock();
    this.init();
  }

  init = async () => {

    const assets = [
      {
        name: "waterdudv",
        texture: "/textures/waterdudv.jpg"
      }
    ]

    await loaderManager.load(assets);
    this.setStats();
    this.setScene();
    this.setRender();
    this.setCamera();
    this.setControls();
    this.setLights();
    
    this.setReflector();
    this.setSky();
    this.handleResize();
    this.events();
  };

  setLights() {
    const d = new DirectionalLight(0xffffff, 0.0);
    d.position.set(1, 1, 1);
    d.visible = false;
    this.#scene.add(d);

    const a = new AmbientLight(0x666666);
    this.#scene.add(a);

  }

  setReflector() {
    const geometry = new PlaneGeometry(10000, 10000, 1, 1);

    const dudvEntry = loaderManager.assets['waterdudv'];
    const dudvMap = dudvEntry && dudvEntry.texture;
    if (dudvMap) {
      dudvMap.wrapS = dudvMap.wrapT = RepeatWrapping;
      dudvMap.repeat.set(4, 4);
    } else {
      console.warn("waterdudv texture not found in loaderManager.assets — water will use fallback color");
    }

    const uniforms = {
      tDudv: { value: dudvMap || null },
      time: { value: 0 },
      color: { value: new Color(0x0b3d91) },
      resolution: { value: new Vector3(window.innerWidth, window.innerHeight, 1) },
      tDiffuse: { value: null },
      uHasDudv: { value: dudvMap ? 1.0 : 0.0 }
    };

    // expose camera position to shader for fresnel computation
    uniforms.cameraPos = { value: new Vector3() };

    const vertexShader = `
      varying vec2 vUv;
      varying vec4 vProj;
      uniform mat4 textureMatrix;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vProj = textureMatrix * vec4(position, 1.0);
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      varying vec4 vProj;
      varying vec3 vWorldPos;
      uniform sampler2D tDudv;
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform vec3 color;
      uniform float uHasDudv;
      uniform vec3 cameraPos;

      void main() {
        vec2 uv = vUv;

        // compute dudv-based distortion
        vec2 distortion = vec2(0.0);
        if (uHasDudv > 0.5) {
          vec2 d1 = texture2D(tDudv, uv * 4.0 + vec2(time * 0.08, -time * 0.05)).rg * 2.0 - 1.0;
          vec2 d2 = texture2D(tDudv, uv * 2.0 + vec2(-time * 0.03, time * 0.06)).rg * 2.0 - 1.0;
          distortion = (d1 + d2 * 0.7) * 0.04;
        }

        // projective UV from mirrored camera and apply distortion scaled by clip.w
        vec4 proj = vProj;
        proj.xy += distortion * proj.w * 0.5;
        vec4 colSample = texture2DProj(tDiffuse, proj);

        // fresnel based on view direction and flat normal (0,1,0)
        vec3 viewDir = normalize(cameraPos - vWorldPos);
        vec3 normal = vec3(0.0, 1.0, 0.0);
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

        // water base color (kept very low) and blend primarily with the reflection
        vec3 base = color * 0.02;
        vec3 reflected = colSample.rgb;
        // favor reflection; fresnel increases reflection at glancing angles
        vec3 col = mix(base, reflected, clamp(0.05 + fresnel * 0.95, 0.0, 1.0));

        // minimal specular removed to avoid artificial bright spots in reflections
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: 2,
      transparent: true,
      depthWrite: false,
    });

    this.groundMirror = new Mesh(geometry, material);
    this.groundMirror.rotation.x = -Math.PI / 2;
    this.groundMirror.position.y = 0;
    this.groundMirror.receiveShadow = true;
    this.#scene.add(this.groundMirror);

  // create render target for reflection texture
  this.renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
  // mirror camera - create a fresh PerspectiveCamera with same params
  this.mirrorCamera = this.#camera.clone();
  this.mirrorCamera.matrixAutoUpdate = true;
  // add textureMatrix uniform for projective sampling
  uniforms.textureMatrix = { value: new Matrix4() };
  // wire tDiffuse to the material uniform
  this.groundMirror.material.uniforms.tDiffuse.value = this.renderTarget.texture;
  this.groundMirror.material.uniforms.textureMatrix = uniforms.textureMatrix;
  }

  setSky() {
    // Create stars on a large sphere and keep the Points mesh centered on the camera.
    // This makes the stars appear at 'infinite' distance and visible across the whole sky
    // even when the camera moves.
    const g = new BufferGeometry();
    const positions = [];
    const starCount = 2000; // adjust for quality/perf
    const radius = 4000; // large radius so stars appear far away

    for (let i = 0; i < starCount; i++) {
      // uniformly sample directions on a sphere surface
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      positions.push(x * radius, y * radius, z * radius);
    }

    g.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));

    const m = new PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const mesh = new Points(g, m);
    // disable frustum culling so stars are always rendered
    mesh.frustumCulled = false;
    // store reference so we can keep the star cloud centered on the camera each frame
    this.skyStars = mesh;
    this.#scene.add(mesh);
  }

  setControls() {
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    this.#controls.enableDamping = true;
  }

  setStats() {
    this.#stats = new Stats();
    document.body.appendChild(this.#stats.dom);
  }

  setRender() {
    this.#renderer = new WebGLRenderer({
      canvas: this.#canvas,
      antialias: true,
    });
  }

  setCamera() {
    const aspect = this.#width / this.#height;
    this.#camera = new PerspectiveCamera(60, aspect, 0.1, 10000);
    this.#camera.position.set(20, 50, 160);
    this.#camera.lookAt(0, 0, 0);
    this.#scene.add(this.#camera);
  }
  setScene() {
      this.#scene = new Scene();
      this.#scene.background = new Color(0x000000);
  }

  draw = () => {
    this.#stats.begin();

    const t = this.clock?.getElapsedTime() ?? 0;
    if (this.refractor?.material?.uniforms?.time) {
      this.refractor.material.uniforms.time.value = t;
    }
    // update groundMirror shader time
    if (this.groundMirror?.material?.uniforms?.time) {
      this.groundMirror.material.uniforms.time.value = t;
    }

    // render simple mirrored scene into renderTarget for reflection sampling
    if (this.renderTarget && this.mirrorCamera) {
      // hide water plane while rendering the reflection to avoid recursion
      this.groundMirror.visible = false;

      // compute proper mirrored camera across plane y=0
      const planeNormal = new Vector3(0, 1, 0);
      const planePoint = new Vector3(0, 0, 0);
      // reflect camera position across plane
      const camPos = this.#camera.position.clone();
      const toPoint = camPos.clone().sub(planePoint);
      const distance = toPoint.dot(planeNormal);
      const mirrorPos = camPos.clone().sub(planeNormal.clone().multiplyScalar(2 * distance));
      this.mirrorCamera.position.copy(mirrorPos);

      // reflect lookAt target (use world origin as approximate target)
      const target = new Vector3(0, 0, 0);
      const toT = target.clone().sub(planePoint);
      const tdist = toT.dot(planeNormal);
      const mirrorTarget = target.clone().sub(planeNormal.clone().multiplyScalar(2 * tdist));
      // reflect up vector
      const up = this.#camera.up.clone();
      const upDot = up.dot(planeNormal);
      const mirrorUp = up.clone().sub(planeNormal.clone().multiplyScalar(2 * upDot));
      this.mirrorCamera.up.copy(mirrorUp);
      this.mirrorCamera.lookAt(mirrorTarget);

      // ensure projection matrix matches main camera
      this.mirrorCamera.projectionMatrix.copy(this.#camera.projectionMatrix);

      // compute texture matrix: bias * projection * view * model
      const bias = new Matrix4();
      bias.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );

      // ensure mirror camera matrices are updated
      this.mirrorCamera.updateMatrixWorld();
      // compute matrixWorldInverse (view matrix)
      this.mirrorCamera.matrixWorldInverse.copy(this.mirrorCamera.matrixWorld).invert();

      const textureMatrix = new Matrix4();
      textureMatrix.multiplyMatrices(bias, this.mirrorCamera.projectionMatrix);
      textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);
      textureMatrix.multiply(this.groundMirror.matrixWorld);
      if (this.groundMirror.material.uniforms.textureMatrix) {
        this.groundMirror.material.uniforms.textureMatrix.value.copy(textureMatrix);
      }
      // update cameraPos uniform for fresnel
      if (this.groundMirror.material.uniforms.cameraPos) {
        this.groundMirror.material.uniforms.cameraPos.value.copy(this.#camera.position);
      }

      const prevRenderTarget = this.#renderer.getRenderTarget();
      this.#renderer.setRenderTarget(this.renderTarget);
      this.#renderer.clear();
      this.#renderer.render(this.#scene, this.mirrorCamera);
      this.#renderer.setRenderTarget(prevRenderTarget);

      this.groundMirror.visible = true;
    }
    

    if (!this.sphere) {
      const geo = new IcosahedronGeometry(5, 0);
      const mat = new MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x333333,
        flatShading: true,
      });
      this.sphere = new Mesh(geo, mat);
      this.#scene.add(this.sphere);
    }

    this.sphere.position.set(
      Math.cos(t) * 30,
      Math.abs(Math.cos(t * 2)) * 20 + 5,
      Math.sin(t) * 30
    );
    this.sphere.rotation.y = Math.PI / 2 - t;
    this.sphere.rotation.z = t * 8;

    if (this.#controls) this.#controls.update();
    // keep sky stars centered on the camera so they always fill the sky
    if (this.skyStars && this.#camera) {
      this.skyStars.position.copy(this.#camera.position);
    }
    this.#renderer.render(this.#scene, this.#camera);
    this.#stats.end();
    this.raf = window.requestAnimationFrame(this.draw);
  };

  handleResize = () => {
    this.#width = window.innerWidth;
    this.#height = window.innerHeight;
    this.#camera.aspect = this.#width / this.#height;
    this.#camera.updateProjectionMatrix();
    const dpr = window.devicePixelRatio || 1;
    this.#renderer.setPixelRatio(dpr);
    this.#renderer.setSize(this.#width, this.#height);
    // update render target and shader resolution when resizing
    if (this.renderTarget) {
      this.renderTarget.setSize(this.#width, this.#height);
    }
    if (this.groundMirror?.material?.uniforms?.resolution) {
      this.groundMirror.material.uniforms.resolution.value.set(this.#width, this.#height, 1);
    }
  };

  events() {
    window.addEventListener("resize", this.handleResize, { passive: true });
    this.draw();
  }
}
