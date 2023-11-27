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

camera.position.z = 5;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//const stereoEffect = new THREE.StereoEffect(renderer);
//stereoEffect.eyeSeparation = 0.06; // Ajusta la separación de los ojos según sea necesario

//const controls = new THREE.DeviceOrientationControls(camera);

function animate() {
    requestAnimationFrame(animate);

    /////////////////////////////////////////////////////////////////

    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children );

    for ( let i = 0; i < intersects.length; i ++ ) {

        intersects[ i ].object.material.color.set( 0xff0000 );
    
    }

    ////////////////////////////////////////////////////////////////


     // Rotación de los cubos
    scene.children.forEach(function (cubo) {
        cubo.rotation.x += 0.01;
        cubo.rotation.y += 0.01;
    });

    //stereoEffect.render(scene, camera);
    //renderer.render( scene, camera );

    //controls.update();
    
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


