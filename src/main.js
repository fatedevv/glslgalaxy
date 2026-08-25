import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pane } from 'tweakpane';

import vertexShader from './shaders/galaxy/vertex.glsl';
import fragmentShader from './shaders/galaxy/fragment.glsl';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const pane = new Pane({
  title: 'Conf'
});



// Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.z = 5;
camera.position.y = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.NeutralToneMapping
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);


// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;



// ==================== GALAXY CODE =================================

//params
const parameters = {};
parameters.count = {value: 1000000};
parameters.size = {value: 1};
parameters.radius = {value: 5}
parameters.branches = {value: 3}
parameters.randomness = {value: 0.3}
parameters.randomnessPower = {value: 0.9}
parameters.inColor = { value: '#e29079'}
parameters.outColor = { value: '#1b3984'}


//
let geometry = null;
let material = null;
let points = null;


const galaxyGenerator = () => {

  // destrying previous data
  if(points !== null) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }




  /**
   * Geometry 
   */
     geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count.value * 3)
    const colors = new Float32Array(parameters.count.value * 3)
    const scales = new Float32Array(parameters.count.value)
    const randomness = new Float32Array(parameters.count.value * 3)

    const angles = new Float32Array(parameters.count.value);
    const radii = new Float32Array(parameters.count.value);

    const inColor = new THREE.Color(parameters.inColor.value)
    const outColor = new THREE.Color(parameters.outColor.value)
      
    for(let i = 0; i < parameters.count.value; i++)
      {
        const i3 = i * 3;


        // Positions 
        const radius = Math.random() * parameters.radius.value;
        const branchesAngle = (i % parameters.branches.value) / parameters.branches.value * Math.PI * 2;

        const scatter = Math.pow(Math.random(), parameters.randomnessPower.value) * parameters.randomness.value * (radius + 1);

        // 
        const u = Math.random() * Math.PI * 2; // Full circle around the arm (0 to 360°)
        const v = Math.acos((Math.random() * 2) - 1); // Tilt from top to bottom (prevents pole bunching)

        //
        angles[i] = branchesAngle;
        radii[i] = radius;

        // 4. 
        positions[i3 + 0] = Math.cos(branchesAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchesAngle) * radius

        //
        const randomX = scatter * Math.sin(v) * Math.cos(u);
        const randomY = scatter * Math.cos(v) * 0.4; // 
        const randomZ = scatter * Math.sin(v) * Math.sin(u);

        randomness[i3 + 0] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        // Colors
        const mixedColors = inColor.clone()
        mixedColors.lerp(outColor, radius / parameters.radius.value)

        colors[i3 + 0] = mixedColors.r
        colors[i3 + 1] = mixedColors.g
        colors[i3 + 2] = mixedColors.b


        // Sizes
        scales[i] = Math.random() * parameters.size.value

      }
    
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    )
    geometry.setAttribute(
      'aScale', 
      new THREE.BufferAttribute(scales, 1)
    )
    geometry.setAttribute(
      'aRandomness',
      new THREE.BufferAttribute(randomness, 3)
    )
    geometry.setAttribute(
      'aAngle',
       new THREE.BufferAttribute(angles, 1)
    )
    geometry.setAttribute(
      'aRadius', 
      new THREE.BufferAttribute(radii, 1)
    )


  /**
   * Material
   */
    material = new THREE.ShaderMaterial({
      depthWrite: false,
      vertexColors: true,

      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneMinusDstColorFactor,
      blendDst: THREE.OneFactor,

      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      uniforms: {
        uTime: {value: 0},
        uSize: {value: 15 * renderer.getPixelRatio()},

      }
    })




  /**
   * Points
   */
    points = new THREE.Points(geometry, material)
    scene.add(points)
  

}

galaxyGenerator()



// gui ====================== 
pane.addBinding(parameters.count, 'value', {
  min: 20000,
  max: 2000000,
  step: 100,
  label: 'count'
 }).on('change', (ev) => {
  // this ev.last becomes true when the slider is released so then it calls galaxyGerator func again with updated params
  if (ev.last) {
    galaxyGenerator();
  }
 });
pane.addBinding( parameters.size, 'value', {
  min: 0.5,
  max: 3,
  step: 0.1,
  label: 'size'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator();
  }
});
pane.addBinding(parameters.radius, 'value', {
  min: 0.1,
  max: 20,
  step: 0.01,
  label: 'radius'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator()
  }
})
pane.addBinding(parameters.branches, 'value', {
  min: 2,
  max: 20,
  step: 1,
  label: 'branches'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator()
  }
})
pane.addBinding(parameters.randomness, 'value', {
  min: 0,
  max: 1,
  step: 0.001,
  label: 'randomness'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator()
  }
})
pane.addBinding(parameters.randomnessPower, 'value', {
  min: 0.4,
  max: 3,
  step: 0.1,
  label: 'randomnessPower'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator()
  }
})
pane.addBinding(parameters.inColor, 'value', {
  label: 'inColor'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator()
  }
})
pane.addBinding(parameters.outColor, 'value', {
  label: 'outColor'
}).on('change', (ev) => {
  if(ev.last) {
    galaxyGenerator()
  }
})




// light
const light = new THREE.DirectionalLight(parameters.inColor.value, 10)
const spotLight = new THREE.DirectionalLight(parameters.inColor.value, 1)
spotLight.position.z = 2
spotLight.position.y = 0
scene.add(light)


const group = new THREE.Group()
scene.add(group)
group.add(spotLight)

// duck
let duckModel;

const Loader = new GLTFLoader();
Loader.load('/duck.glb', (gltf) => {
  const duck = gltf.scene
  duck.position.z = 2;
  duck.position.y = 1;
  duck.scale.setScalar(0.5)

  duck.rotation.y = Math.PI/2

  group.add(duck)

  duckModel = duck;

  light.target = duck;
  spotLight.target = duck;

  light.target.updateMatrixWorld();
})








// Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


//  Animation Loop
const clock = new THREE.Clock()

renderer.setAnimationLoop((timestamp) =>{

  const elapsedTime = clock.getElapsedTime();

  if (elapsedTime) {
    material.uniforms.uTime.value = elapsedTime + 200.0;
  }

  
  group.rotation.y += - 0.005

  if (duckModel) {
    
    duckModel.rotation.x += 0.01;
    duckModel.rotation.y += 0.001;
  }

  // Update controls
  controls.update();

  // Render scene
  renderer.render(scene, camera);
})

