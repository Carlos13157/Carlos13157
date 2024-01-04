import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.119.1/build/three.module.min.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/controls/OrbitControls.min.js";
import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/VRButton.min.js";
import { XRControllerModelFactory } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/XRControllerModelFactory.min.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;

document.body.appendChild(renderer.domElement);

let isVR = false;
document.body.appendChild(VRButton.createButton(renderer));

const cameraMin = 0.0001;

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, cameraMin, 1000);

camera.position.z = 5;

let xrCamera;

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableRotate = false;
// controls.enablePan = false;
// controls.enableZoom = false;
// controls.enableDamping = false;
// controls.enableKeys = false;

const scene = new THREE.Scene();

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

const light = new THREE.PointLight(0xffffff, 1, 100);
scene.add(light);
const Ambientlight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(Ambientlight);

const selectable = [];

function crearCubos() {
  let cubos = new Array(500);

  for (let i = 0; i < cubos.length; i++) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    cubos[i] = new THREE.Mesh(geometry, material);

    cubos[i].position.x = (Math.random() - 0.5) * 27.5;
    cubos[i].position.y = (Math.random() - 0.5) * 27.5;
    cubos[i].position.z = (Math.random() - 0.5) * 27.5;

    cubos[i].rotation.x = (Math.random() - 0.5) * 27.5;
    cubos[i].rotation.y = (Math.random() - 0.5) * 27.5;
    cubos[i].rotation.z = (Math.random() - 0.5) * 27.5;

    scene.add(cubos[i]);

    selectable.push({
      selected: false,
      object: cubos[i],
      action() {
        console.log("Cubo selected");
      },
    });
  }

  return cubos;
}

let cubos = crearCubos();

// const cursorSize = 1;
// const cursorThickness = 1.5;
// const cursorGeometry = new THREE.RingBufferGeometry(
//   cursorSize * cameraMin,
//   cursorSize * cameraMin * cursorThickness,
//   32,
//   0,
//   Math.PI * 0.5,
//   Math.PI * 2
// );
// const cursorMaterial = new THREE.MeshBasicMaterial({ color: "white" });

const cursorGeometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
const cursorMaterial = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: false } );

const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);

cursor.position.z = -0.0001*50;
cursor.scale.set(1, 1, 1); // Escala inicial del cursor



const raycaster2 = new THREE.Raycaster();
let firstRun = true;

// const arrowHelper = new THREE.ArrowHelper(camera.rotation, camera.position, 10, 0xFFFFFF);
// scene.add(arrowHelper);

function animate() {
  requestAnimationFrame(animate);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  controls.update();

  cubos.forEach(function (cubo) {
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
  });

  cursor.material.color.set(selectable.some(obj => obj.selected) ? new THREE.Color("crimson") : new THREE.Color("white"));

  firstRun = false;
  
  if (isVR) {
    // Si estás en modo VR, verifica si se está utilizando la cámara estéreo
    if (renderer.xr.getSession()) {
      xrCamera = renderer.xr.getCamera(camera); 
      if (xrCamera instanceof THREE.Camera) {
        console.log('Se está utilizando la cámara estéreo en modo VR');
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function updateSelection() {
  

    function onSessionStart() {
      isVR = true;
      // console.log('La sesión VR está activa');
      // Otras acciones necesarias al entrar en el modo VR

    }
    
    function onSessionEnd() {
      isVR = false;
      // console.log('La sesión VR no está activa');
      // Otras acciones necesarias al salir del modo VR
    }
    
    // Intenta obtener la sesión al inicio

    let currentCamera;
    const session = renderer.xr.getSession();
    if(session){
      onSessionStart();
      currentCamera = xrCamera;
    } else {
      onSessionEnd();
      currentCamera = camera;
      
    }

    camera.add(cursor);

    console.log(cursor.position);
    for (let i = 0, length = selectable.length; i < length; i++) {
      const camPosition = currentCamera.position.clone();
      const objectPosition = selectable[i].object.position.clone();
  
      raycaster2.set(camPosition, currentCamera.getWorldDirection(objectPosition));
      const intersects2 = raycaster2.intersectObject(selectable[i].object);
      const selected = intersects2.length > 0;
  
      cursor.material.color.set(selected ? new THREE.Color("orange") : new THREE.Color("white"));
  
      if (selected) {
        selectable[i].object.material.color.set(0xffb900);
        cursor.scale.set(1.2, 1.2, 1);
        
      } else {
        selectable[i].object.material.color.set(0x00ff00);
        cursor.scale.set(1, 1, 1);
      }
  
      if (selected && !selectable[i].selected) {
        selectable[i].action();
      }
      selectable[i].selected = selected;
    }
    
    // Manejo de eventos para cambios en la sesión
    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);

    
}

animate();

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
  updateSelection();
});



////////////////////////////////////////