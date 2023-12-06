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

// Agregamos el objeto marker
const marker = new THREE.Mesh(
    new THREE.CircleGeometry(0.05, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
marker.visible = false;
scene.add(marker);

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

// Ajusta la posición inicial de la cámara
camera.position.set(0, 0, -3);

const raycaster = new THREE.Raycaster();
const controller = renderer.xr.getController(0); // Solo se utiliza un controlador para simplificar

// Añade el controlador a la escena
scene.add(controller);

// Escucha los eventos del controlador
controller.addEventListener('selectstart', onSelectStart);
controller.addEventListener('selectend', onSelectEnd);

function onSelectStart(event) {
    const intersections = getIntersections();

    if (intersections.length > 0) {
        const point = intersections[0].point;
        marker.position.copy(point);
        marker.visible = true;
    }
}

function onSelectEnd() {
    marker.visible = false;
}

function getIntersections() {
    raycaster.setFromController(controller);

    return raycaster.intersectObjects(scene.children);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotación de los cubos
    scene.children.forEach(function (cubo) {
        cubo.rotation.x += 0.01;
        cubo.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

crearCubos();
