import { WebGLRenderer, Scene, Color , PerspectiveCamera, Mesh, Points } from 'three';
import Stats from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CircleGeometry } from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { DirectionalLight } from 'three';
import { AmbientLight } from 'three';
import { BufferGeometry } from 'three';
import { Vector3 } from 'three';
import { PointsMaterial } from 'three';
import { BufferAttribute } from 'three';
import { randFloat } from 'three/src/math/MathUtils.js';

export default class MainScene {
    #canvas
    #renderer
    #scene
    #camera
    #controls
    #stats
    #width
    #height
    #mesh

    constructor() {
        this.#canvas = document.querySelector('.scene')
        this.init()
    }

    init = async () => {
        this.setStats()
        this.setScene()
        this.setRender()
        this.setCamera()
        this.setControls()

        this.setLights()
        this.setReflector()
        this.setSky()

        this.handleResize()
        
        this.events()
    }
    setLights(){
        const directionalLight = new DirectionalLight(0xffffff,0.5)
        directionalLight.position.x = 1
        this.#scene.add(directionalLight)

        const ambientLIght = new AmbientLight(0x8888888)
        this.#scene.add(ambientLIght)
    }

    setReflector() {
        let geometry ,material

        geometry = new CircleGeometry(40,64)
        this.groundMirror = new Reflector(geometry,{
          clipBias: 0.003,
          textureWidth: window.innerWidth * window.devicePixelRatio,
          textureHeight: window.innerHeight * window.devicePixelRatio,
          color: 0xb5b5b5b5,
        })
        this.groundMirror.position.y = 0
        this.groundMirror.rotateX(-Math.PI / 2)
        this.#scene.add(this.groundMirror)
    }   
    
    setSky() {
        const geometry = new BufferGeometry();
        const vertices = [];
        const range = 1200;
        for(let i = 0; i < 1000; i++){
            const point = new Vector3(randFloat(-range, range), randFloat(100,200), randFloat(-range, range))
            vertices.push(...point)
        }
        const material = new PointsMaterial({ color: 0xffffff });
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        const mesh = new Points(geometry, material)

        this.#scene.add(mesh)
    }

    setControls() {
        this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement)
        this.#controls.enableDamping = true
    }

    setStats() {
        this.#stats = new Stats()
        document.body.appendChild(this.#stats.dom)
    }
    setRender() {
      this.#renderer = new WebGLRenderer({
        canvas: this.#canvas,
        antialias: true,
      })
    }
    setCamera() {
        const aspectRatio = this.#width / this.#height
        const fieldOfView = 60
        const nearPlane = 0.1
        const farPlane = 10000
    
        this.#camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
        this.#camera.position.y = 5
        this.#camera.position.x = 5
        this.#camera.position.z = 5
        this.#camera.lookAt(0, 0, 0)
    
        this.#scene.add(this.#camera)
    }
    setScene() {
      this.#scene = new Scene()
      this.#scene.background = new Color(0x000000)
    }
    draw = () => {
      this.#stats.begin()

      if (this.#controls) this.#controls.update() 
      this.#renderer.render(this.#scene, this.#camera)

      this.#stats.end()
      this.raf = window.requestAnimationFrame(this.draw)
    }
    handleResize = () => {
        this.#width = window.innerWidth
        this.#height = window.innerHeight

        this.#camera.aspect = this.#width / this.#height
        this.#camera.updateProjectionMatrix()

        const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1

        this.#renderer.setPixelRatio(DPR)
        this.#renderer.setSize(this.#width, this.#height)
    }
    events() {
      window.addEventListener('resize', this.handleResize, { passive: true })
      this.draw(0)
    }
}