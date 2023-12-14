import * as THREE from './three.module.js';
import { VRButton } from '/libraries/VRButton.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const cameraMin = 0.0001;

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, cameraMin, 1000);

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

const selectable = [];

function crearCubos() {
  const cantidadDeCubos = 100;

  for (var i = 0; i < cantidadDeCubos; i++) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const Cubo = new THREE.Mesh(geometry, material);

    // Asigna posiciones aleatorias a los cubos
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

function onSelectStart(event) {
  const controller = event.target;
  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const object = intersections[0].object;
    const index = selectable.findIndex((item) => item.object === object);

    if (index !== -1 && !selectable[index].selected) {
      selectable[index].action();
      selectable[index].selected = true;
    }
  }
}

function onSelectEnd(event) {
  const controller = event.target;
  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const object = intersections[0].object;
    const index = selectable.findIndex((item) => item.object === object);

    if (index !== -1) {
      selectable[index].selected = false;
    }
  }
}

function getIntersections(controller) {
  raycaster2.ray.origin.copy(controller.position);
  raycaster2.ray.direction.set(0, 0, -1).applyQuaternion(controller.quaternion);

  return selectable
    .filter((item) => item.object.visible)
    .map((item) => {
      const intersects = raycaster2.intersectObject(item.object);
      return {
        object: item.object,
        intersects,
      };
    })
    .filter((item) => item.intersects.length > 0)
    .sort((a, b) => a.intersects[0].distance - b.intersects[0].distance);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Rotación de los cubos
  scene.children.forEach(function (cubo) {
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
  });

  if (!firstRun) {
    const intersections = getIntersections(renderer.xr.getController(0));
    const selected = intersections.length > 0;

    cursor.material.color.set(selected ? new THREE.Color("crimson") : new THREE.Color("white"));

    intersections.forEach((intersection) => {
      const { object } = intersection;
      object.material.color.set(selected ? 0xff0000 : 0x00ff00);
    });
  }

  // Cambia el color del cursor aquí si es necesario
  cursor.material.color.set(selectable.some(obj => obj.selected) ? new THREE.Color("crimson") : new THREE.Color("white"));

  firstRun = false;
}

renderer.setAnimationLoop(function () {
  animate();
  renderer.render(scene, camera);
});

crearCubos();
animate();
