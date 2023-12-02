import { VRButton } from '/libraries/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Retícula
const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.02, 0.04, 32).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

function crearCubos() {
  var cantidadDeCubos = 100;

  for (var i = 0; i < cantidadDeCubos; i++) {
    var geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cubo = new THREE.Mesh(geometry, material);

    // Asigna posiciones aleatorias a los cubos
    cubo.position.x = (Math.random() - 0.5) * 10;
    cubo.position.y = (Math.random() - 0.5) * 10;
    cubo.position.z = (Math.random() - 0.5) * 10;

    scene.add(cubo);
  }
}

camera.position.set(0, 0, -3);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.color.set(0xff0000);
  }

  scene.children.forEach(function (cubo) {
    cubo.rotation.x = 0.001;
    cubo.rotation.y = 0.001;
  });

  renderer.render(scene, camera);
}

function onPointerMove(event) {
  pointer.x = 0;
  pointer.y = 0;
}

window.addEventListener('pointermove', onPointerMove);

// Actualiza la posición de la retícula en el modo VR
function handleController(controller) {
  const tempMatrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  const inputSource = renderer.xr.getController(0).inputSource;

  if (inputSource) {
    inputSource.matrixWorld.decompose(position, quaternion, scale);
    reticle.position.setFromMatrixPosition(inputSource.matrixWorld);
    reticle.quaternion.setFromRotationMatrix(tempMatrix.extractRotation(inputSource.matrixWorld));
    reticle.scale.setFromMatrixScale(inputSource.matrixWorld);
  }
}

renderer.setAnimationLoop(() => {
  handleController(renderer.xr.getController(0));
  animate();
});

crearCubos();
