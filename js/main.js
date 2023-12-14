import * as THREE from './three.module.js';
import { VRButton } from '/libraries/VRButton.js';
import { OrbitControls } from './orbitcontrols.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const cameraMin = 0.0001;

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, cameraMin, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = false;
controls.enableKeys = false;

const scene = new THREE.Scene();

camera.position.z = 5;

scene.add(camera);

scene.background = new THREE.CubeTextureLoader()
  .setPath('Materials/')
  .load([
    'rainbow_lf.png',
    'rainbow_rt.png',
    'rainbow_up.png',
    'rainbow_dn.png',
    'rainbow_ft.png',
    'rainbow_bk.png'
  ]);

const BackgroundGeometry = new THREE.SphereGeometry(100, 32, 16);

const light = new THREE.PointLight(0xffffff, 1, 100);
scene.add(light);
const Ambientlight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(Ambientlight);

const selectable = [];

function crearCubos() {
  const cantidadDeCubos = 100;

  for (var i = 0; i < cantidadDeCubos; i++) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const Cubo = new THREE.Mesh(geometry, material);

    Cubo.position.x = (Math.random() - 0.5) * 10;
    Cubo.position.y = (Math.random() - 0.5) * 10;
    Cubo.position.z = (Math.random() - 0.5) * 10;

    scene.add(Cubo);

    selectable.push({
      selected: false,
      object: Cubo,
      action() {
        console.log("Cubo selected");
      },
    });
  }
}

const cursorSize = 1;
const cursorThickness = 1.5;
const cursorGeometry = new THREE.RingBufferGeometry(
  cursorSize * cameraMin,
  cursorSize * cameraMin * cursorThickness,
  32,
  0,
  Math.PI * 0.5,
  Math.PI * 2
);
const cursorMaterial = new THREE.MeshBasicMaterial({ color: "white" });
const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);

cursor.position.z = -cameraMin * 50;

camera.add(cursor);

const raycaster2 = new THREE.Raycaster();
let firstRun = true;

function animate() {
  requestAnimationFrame(animate);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  controls.update();

  scene.children.forEach(function (cubo) {
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
  });

  if (!firstRun) {
    updateSelection();
  }

  cursor.material.color.set(selectable.some(obj => obj.selected) ? new THREE.Color("crimson") : new THREE.Color("white"));

  firstRun = false;
}

function updateSelection() {
  for (let i = 0, length = selectable.length; i < length; i++) {
    const camPosition = camera.position.clone();
    const objectPosition = selectable[i].object.position.clone();
    raycaster2.set(camPosition, camera.getWorldDirection(objectPosition));

    const intersects2 = raycaster2.intersectObject(selectable[i].object);

    const selected = intersects2.length > 0;

    cursor.material.color.set(selected ? new THREE.Color("crimson") : new THREE.Color("white"));

    if (selected) {
      selectable[i].object.material.color.set(0xff0000);
    } else {
      selectable[i].object.material.color.set(0x00ff00);
    }

    if (selected && !selectable[i].selected) {
      selectable[i].action();
    }
    selectable[i].selected = selected;
  }
}

function onPointerMove(event) {
  // Puedes agregar lógica adicional aquí si es necesario
}

// Manejar eventos de puntero según estés en modo VR o no
if (renderer.xr.isPresenting) {
  // En modo VR
  renderer.xr.addEventListener('selectstart', onSelectStart);
} else {
  // Fuera del modo VR
  window.addEventListener('pointermove', onPointerMove);
}

function onSelectStart(event) {
  // Lógica para manejar eventos de selección en modo VR
}

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
});

crearCubos();
animate();
