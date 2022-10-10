import * as THREE from 'three';
import { Color } from 'three';
import vertexShader from './Shaders/vertex.glsl';
import fragmentShader from './Shaders/fragment.glsl';
import atmosphereVertexShader from './Shaders/atmosphereVert.glsl';
import atmosphereFragmentShader from './Shaders/atmosphereFrag.glsl';
import './style.css';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
}); 

// Canvas
const canvas = document.querySelector('canvas.webgl')

//---------- Materials ----------//

const particlesGeometry = new THREE.BufferGeometry;
const particleCount = 20000;

const posArray = new Float32Array(particleCount * 3);

for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 6;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: .0035,
    blending: THREE.AdditiveBlending,
});
particleMaterial.color = new THREE.Color(0xffffff);

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

// Mesh
const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particleMesh);

//---------------------------------------------------------//

const sphere = new THREE.Mesh(new THREE.SphereGeometry(.9, 60, 60), new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    globeTexture: {
      value: new THREE.TextureLoader().load('./Textures/EarthUV.jpg'),
    }
  }
}));

scene.add(sphere);

camera.position.z = 3.3;

// Atmosphere Sphere
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(.9, 60, 60), new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
}));

atmosphere.scale.set(1.2, 1.2, 1.2)

scene.add(atmosphere);

//---------------------------------------------------------//

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

//---------------------------------------------------------//

document.addEventListener('mousemove', onDocumentMouseMove);

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

function onDocumentMouseMove(e) {
    mouseX = (e.clientX - windowHalfX);
    mouseY = (e.clientY - windowHalfY);
}

const clock = new THREE.Clock()

const tick = () =>
{
    targetX = mouseX * .007;
    targetY = mouseY * .0001;

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = .5 * elapsedTime;
    particleMesh.rotation.y = -.1 * elapsedTime;

    if(mouseX > 0 || mouseX < 0) {
        particleMesh.rotation.y = mouseY * (elapsedTime * 0.00007);
        particleMesh.rotation.x = mouseX * (elapsedTime * 0.00007);
        particleMesh.rotation.z = mouseY * (elapsedTime * 0.00007);
    }

    sphere.rotation.y += .5 * (targetX - sphere.rotation.y);
    sphere.rotation.x += .2 * (targetY - sphere.rotation.x);
    sphere.position.z += -.2 * (targetY - sphere.rotation.x);

    atmosphere.rotation.x += .2 * (targetY - atmosphere.rotation.x);

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
