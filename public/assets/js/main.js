import { Vector3, Vector2, Raycaster, Color, Clock } from '/three/build/three.module.js';
import * as THREE from 'three'
import { World, System, Component, TagComponent, Types } from 'ecsy'
import Stats from '/three/examples/jsm/libs/stats.module.js';
import PRNG from './prng/prng.js';
import Map from './Map.js';
import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';
import { UnrealBloomPass } from '/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from '/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/three/examples/jsm/postprocessing/RenderPass.js';
import { GUI } from '/three/examples/jsm/libs/dat.gui.module.js';
import Background from './Background.js';

import { Acceleration, Position, Sprite, Burning } from './Components/Components.js';
import { MovableSystem, SpriteSystem, BurningSystem } from './Systems/System.js';
import { LogLuvEncoding } from 'three';


const socket = io({ transports: ['websocket'], upgrade: false, autoConnect: true, reconnection: false });

socket.onAny((event, ...args) => {
    console.log(event, args);
});


if (!socket.connected) {
    socket.connect();
    console.log("connected");
}

//init all variables
let scene, camera, renderer, deltaTime, controls, clock, prng, stats, stopRender = false,
    composer, world, map, seed = 2926662221;

const postprocessingValues = {
    exposure: 1,
    bloomStrength: 0.2,
    bloomThreshold: 0.6,
    bloomRadius: 0.01
}

function initThree() {
    //init three js 
    scene = new THREE.Scene();
    //add orthographic camera with zoom variable
    let zoom = 50;
    camera = new THREE.OrthographicCamera(-window.innerWidth / zoom, window.innerWidth / zoom, window.innerHeight / zoom, -window.innerHeight / zoom, 1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xff0000, 0);
    renderer.anisotropy = 4;

    document.body.appendChild(renderer.domElement);

    //bloom
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85);
    bloomPass.threshold = postprocessingValues.bloomThreshold;
    bloomPass.strength = postprocessingValues.bloomStrength;
    bloomPass.radius = postprocessingValues.bloomRadius;

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloomPass);

    //init controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableRotate = false;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;

    clock = new Clock();
    clock.start();

    //set control position and look at
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    controls.object.position.set(0, 0, 20);
    controls.update();

    stats = Stats()
    document.body.appendChild(stats.dom)

    prng = new PRNG(seed);


    addGUI(bloomPass);

}

function addGUI(bloomPass) {
    const gui = new GUI();

    gui.add(postprocessingValues, 'bloomThreshold', 0.0, 1.0).onChange(function(value) {

        bloomPass.threshold = Number(value);

    });

    gui.add(postprocessingValues, 'bloomStrength', 0.0, 3.0).onChange(function(value) {

        bloomPass.strength = Number(value);

    });

    gui.add(postprocessingValues, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function(value) {

        bloomPass.radius = Number(value);

    });
}

function initWorld() {
    world = new World();
    world
        .registerComponent(Acceleration)
        .registerComponent(Position)
        .registerComponent(Sprite)
        .registerComponent(Burning)

    let texture = new THREE.TextureLoader().load("/assets/sprites/tileset.png");

    map = new Map(scene, world, 16384, texture, 310, 350, 10, 10, seed, prng);

    // world
    //         .createEntity()
    //         .addComponent(Position, new Vector3(x, y, 0))

    world
        .registerSystem(MovableSystem)
        .registerSystem(SpriteSystem)
        .registerSystem(BurningSystem)

    animate();
}

//create animation loop
function animate() {

    if (stopRender) {

    } else {
        requestAnimationFrame(animate);
    }

    controls.update();
    deltaTime = clock.getDelta();

    world.execute(deltaTime, 0);
    renderer.render(scene, camera);
    stats.update()
    composer.render();
}

//on key press 1
document.addEventListener('keydown', (event) => {
    if (event.keyCode === 49) {
        console.log(prng.getRandomInt(0, map.tiles.length));
        let tile = map.tiles[prng.getRandomInt(0, map.tiles.length)]
        if (tile) {
            tile.burn();
        }
    }
});

//mouse move 
document.addEventListener('mousemove', (event) => {
    //mouse to world position
    let mouse = new Vector2(event.clientX, event.clientY);
    let TileToPixelRatio = 25;
    let zoom = controls.object.zoom
    let playerPosition = controls.object.position;

    //set mouse position to center of screen
    mouse.x = (mouse.x - (window.innerWidth / 2)) / zoom;
    mouse.y = ((window.innerHeight / 2) - mouse.y) / zoom;


    //convert mouse position to tile position
    let tileX = Math.floor(mouse.x / TileToPixelRatio) + Math.floor(playerPosition.x);
    let tileY = Math.floor(mouse.y / TileToPixelRatio) + Math.floor(playerPosition.y);

    //get tile
    let tile = map.getTileFromTilePosition(tileX, tileY);
    if (tile) {
        map.changeTile(tile.matrixId, null, null, 0.2);
    }

});



initThree();
initWorld();