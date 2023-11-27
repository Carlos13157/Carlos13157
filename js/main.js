import {VRButton} from '/libraries/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild( VRButton.createButton( renderer ) );

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

    const BackgroundGeometry = new THREE.SphereGeometry( 100, 32, 16 );

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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

// Objeto estático
const staticGeometry = new THREE.SphereGeometry(0.005, 32, 32);
const staticMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Cambiado el color para diferenciarlo
const staticSphere = new THREE.Mesh(staticGeometry, staticMaterial);
scene.add(staticSphere);


//camera.position.z = -5;
camera.position.set(0, 0, -3); // Ajusta la posición inicial de la cámara


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


function animate() {
    requestAnimationFrame(animate);

    /////////////////////////////////////////////////////////////////

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj !== staticSphere));

    for ( let i = 0; i < intersects.length; i ++ ) {

        intersects[ i ].object.material.color.set( 0xff0000 );
    
    }
    ////////////////////////////////////////////////////////////////
     // Rotación de los cubos
    scene.children.forEach(function (cubo) {
        cubo.rotation.x += 0.01;
        cubo.rotation.y += 0.01;
    });

    // Asigna la posición de la cámara al objeto estático
    staticSphere.position.copy(camera.position);

    // Obtiene la dirección de la cámara en el espacio del mundo y la usa para establecer la orientación del staticSphere
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    staticSphere.lookAt(staticSphere.position.clone().add(cameraDirection));

    // Ajusta la posición del staticSphere para que esté siempre en frente de la cámara
    const distance = 0.15; // Ajusta la distancia según sea necesario
    const newPosition = camera.position.clone().add(cameraDirection.multiplyScalar(distance));
    staticSphere.position.copy(newPosition);

    window.addEventListener( 'pointermove', onPointerMove );
}

function onPointerMove( event ) {
	pointer.x = 0;
	pointer.y = 0;
}

renderer.setAnimationLoop( function () {
	renderer.render( scene, camera );
} );

crearCubos();
animate();