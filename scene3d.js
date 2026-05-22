/* ==========================================
   Anti-Gravity Café - Three.js WebGL Engine
   Cinematic Space Outpost & Robotics
   ========================================== */

// Main global variables for Three.js
let scene, camera, renderer;
let stars, core, coreRings = [], baristaArm, levitatingCup, drones = [];
let planet;

// Mouse coordinates for parallax tracking
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Timing helper
let clock = new THREE.Clock();

function init() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // 1. Scene setup
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030308, 0.015);

  // 2. Camera setup
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 80;
  camera.position.y = 10;

  // 3. Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(scene.fog.color);
  container.appendChild(renderer.domElement);

  // 4. Lights
  const ambientLight = new THREE.AmbientLight(0x0a102b, 1.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(50, 100, 50);
  scene.add(dirLight);

  const neonCyanLight = new THREE.PointLight(0x00f0ff, 4, 150);
  neonCyanLight.position.set(0, 0, 0);
  scene.add(neonCyanLight);

  const neonPurpleLight = new THREE.PointLight(0xb026ff, 3, 100);
  neonPurpleLight.position.set(40, -20, 20);
  scene.add(neonPurpleLight);

  // 5. Build Scene Objects
  createStarfield();
  createPlanet();
  createEnergyCore();
  createLevitatingCup();
  createRoboticArm();
  createDrones();

  // 6. Listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);

  // 7. Start Loop
  animate();
}

// --------------------------------------------------
// Creating Objects
// --------------------------------------------------

function createStarfield() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 4000;
  const positions = new Float32Array(starsCount * 3);
  const colors = new Float32Array(starsCount * 3);

  const colorCyan = new THREE.Color(0x00f0ff);
  const colorPurple = new THREE.Color(0xb026ff);
  const colorWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < starsCount * 3; i += 3) {
    // Random position in a large sphere
    const radius = 300 + Math.random() * 500;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);

    // Mixed star colors
    let starColor = colorWhite;
    const rand = Math.random();
    if (rand < 0.25) starColor = colorCyan;
    else if (rand < 0.45) starColor = colorPurple;

    colors[i] = starColor.r;
    colors[i + 1] = starColor.g;
    colors[i + 2] = starColor.b;
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Small square particles
  const starsMaterial = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

function createPlanet() {
  // A glowing gas giant in the background
  const geom = new THREE.SphereGeometry(35, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x090f2b,
    roughness: 0.8,
    metalness: 0.2,
    emissive: 0x050a1a,
    flatShading: true
  });

  planet = new THREE.Mesh(geom, mat);
  planet.position.set(-150, -40, -180);
  scene.add(planet);

  // Rings
  const ringGeom = new THREE.RingGeometry(45, 60, 64);
  // Rotate ring geometry to lie flat
  ringGeom.rotateX(Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.1,
    wireframe: true
  });

  const rings = new THREE.Mesh(ringGeom, ringMat);
  planet.add(rings);
}

function createEnergyCore() {
  // Neon core container group
  core = new THREE.Group();
  core.position.set(0, 0, 0);

  // Inner sphere
  const sphereGeom = new THREE.SphereGeometry(6, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const innerCore = new THREE.Mesh(sphereGeom, sphereMat);
  core.add(innerCore);

  // Outer orbital rings
  const ringCount = 3;
  for (let i = 0; i < ringCount; i++) {
    const ringRadius = 10 + i * 4;
    const ringTorusGeom = new THREE.TorusGeometry(ringRadius, 0.2, 8, 48);
    const ringTorusMat = new THREE.MeshBasicMaterial({
      color: i === 1 ? 0xb026ff : 0x00f0ff,
      transparent: true,
      opacity: 0.6
    });
    const torus = new THREE.Mesh(ringTorusGeom, ringTorusMat);
    torus.rotation.x = Math.random() * Math.PI;
    torus.rotation.y = Math.random() * Math.PI;
    core.add(torus);
    coreRings.push(torus);
  }

  scene.add(core);
}

function createLevitatingCup() {
  // Procedural 3D coffee mug floating near the right side of the hero section
  levitatingCup = new THREE.Group();
  levitatingCup.position.set(25, 5, 20);

  // Mug Body
  const bodyGeom = new THREE.CylinderGeometry(2.5, 2.0, 5, 24);
  const mugMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a1535,
    roughness: 0.1,
    metalness: 0.9,
    emissive: 0x002c44,
    flatShading: false
  });
  const body = new THREE.Mesh(bodyGeom, mugMaterial);
  levitatingCup.add(body);

  // Mug Handle
  const handleGeom = new THREE.TorusGeometry(1.5, 0.4, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeom, mugMaterial);
  handle.position.set(2.2, 0, 0);
  handle.rotation.z = -Math.PI / 2;
  levitatingCup.add(handle);

  // Hot Coffee Liquid Top
  const liquidGeom = new THREE.CylinderGeometry(2.3, 2.3, 0.2, 24);
  const liquidMat = new THREE.MeshBasicMaterial({ color: 0x5a3825 }); // Brown coffee color
  const liquid = new THREE.Mesh(liquidGeom, liquidMat);
  liquid.position.y = 2.45;
  levitatingCup.add(liquid);

  // Glowing base ring representing levitation lock
  const baseRingGeom = new THREE.TorusGeometry(3.0, 0.15, 8, 24);
  baseRingGeom.rotateX(Math.PI / 2);
  const baseRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.8
  });
  const baseRing = new THREE.Mesh(baseRingGeom, baseRingMat);
  baseRing.position.y = -3.2;
  levitatingCup.add(baseRing);

  scene.add(levitatingCup);
}

function createRoboticArm() {
  // Procedural multi-jointed robotic arm preparing coffee on the left side
  baristaArm = new THREE.Group();
  baristaArm.position.set(-25, -12, 10);

  // Base
  const baseGeom = new THREE.CylinderGeometry(4, 4.5, 3, 16);
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2330, metalness: 0.8, roughness: 0.2 });
  const base = new THREE.Mesh(baseGeom, metalMat);
  baristaArm.add(base);

  // Joint 1 Group
  const joint1Group = new THREE.Group();
  joint1Group.position.y = 2;
  baristaArm.add(joint1Group);

  const sphereJoint1 = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), new THREE.MeshStandardMaterial({ color: 0x00f0ff }));
  joint1Group.add(sphereJoint1);

  // Lower arm link
  const lowerLink = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 12, 16), metalMat);
  lowerLink.position.y = 6;
  lowerLink.rotation.x = 0.2; // slight bend
  joint1Group.add(lowerLink);

  // Joint 2 Group
  const joint2Group = new THREE.Group();
  joint2Group.position.set(0, 11.5, 2.2);
  joint1Group.add(joint2Group);

  const sphereJoint2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 16), new THREE.MeshStandardMaterial({ color: 0xb026ff }));
  joint2Group.add(sphereJoint2);

  // Upper arm link
  const upperLink = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8, 16), metalMat);
  upperLink.position.y = 4;
  upperLink.rotation.x = -0.4;
  joint2Group.add(upperLink);

  // End Effector (Coffee Portafilter Tool)
  const effectorGroup = new THREE.Group();
  effectorGroup.position.set(0, 7.5, -3.0);
  joint2Group.add(effectorGroup);

  const toolGeom = new THREE.CylinderGeometry(1.5, 1.5, 2, 16);
  const tool = new THREE.Mesh(toolGeom, new THREE.MeshStandardMaterial({ color: 0x3a3f55, metalness: 0.9 }));
  tool.rotation.x = Math.PI / 2;
  effectorGroup.add(tool);

  // Handle
  const handleGeom = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
  const handle = new THREE.Mesh(handleGeom, metalMat);
  handle.position.set(0, -1, 2);
  handle.rotation.x = Math.PI / 2;
  effectorGroup.add(handle);

  scene.add(baristaArm);
}

function createDrones() {
  // Creating 2 hovering dispatch drones
  for (let i = 0; i < 2; i++) {
    const drone = new THREE.Group();
    drone.position.set(i === 0 ? -40 : 45, 15 + i * 5, -20);
    
    // Core body
    const bodyGeom = new THREE.SphereGeometry(1.8, 12, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a2136,
      metalness: 0.9,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    drone.add(body);

    // Glowing core eye
    const eyeGeom = new THREE.SphereGeometry(0.5, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x00f0ff : 0xb026ff });
    const eye = new THREE.Mesh(eyeGeom, eyeMat);
    eye.position.set(0, 0, 1.5);
    drone.add(eye);

    // Four prop arms
    const armGeom = new THREE.BoxGeometry(4.0, 0.2, 0.4);
    const arm1 = new THREE.Mesh(armGeom, bodyMat);
    arm1.rotation.y = Math.PI / 4;
    drone.add(arm1);

    const arm2 = new THREE.Mesh(armGeom, bodyMat);
    arm2.rotation.y = -Math.PI / 4;
    drone.add(arm2);

    // Rotor glow disks
    const propMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    });
    const propRing = new THREE.TorusGeometry(0.9, 0.05, 4, 16);
    propRing.rotateX(Math.PI / 2);

    const positions = [
      [1.4, 0.2, 1.4],
      [-1.4, 0.2, 1.4],
      [1.4, 0.2, -1.4],
      [-1.4, 0.2, -1.4]
    ];

    positions.forEach(pos => {
      const ring = new THREE.Mesh(propRing, propMat);
      ring.position.set(pos[0], pos[1], pos[2]);
      drone.add(ring);
    });

    scene.add(drone);
    drones.push({
      mesh: drone,
      seed: Math.random() * 100,
      basePos: drone.position.clone()
    });
  }
}

// --------------------------------------------------
// Handlers & Event Loops
// --------------------------------------------------

function onMouseMove(event) {
  targetMouseX = (event.clientX - windowHalfX) * 0.05;
  targetMouseY = (event.clientY - windowHalfY) * 0.05;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();

  // 1. Camera Parallax Effect (smooth lerping)
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;
  camera.position.x = mouseX;
  camera.position.y = 10 - mouseY;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // 2. Space stars slowly rotating
  if (stars) {
    stars.rotation.y = time * 0.02;
    stars.rotation.x = time * 0.005;
  }

  // 3. Planet background rotation
  if (planet) {
    planet.rotation.y = time * 0.01;
  }

  // 4. Glowing energy core pulsing and spinning
  if (core) {
    const pulseFactor = 1.0 + Math.sin(time * 3) * 0.1;
    core.scale.set(pulseFactor, pulseFactor, pulseFactor);
    core.rotation.y = time * 0.3;
  }
  coreRings.forEach((ring, idx) => {
    ring.rotation.x += 0.005 * (idx + 1);
    ring.rotation.y += 0.008 * (idx + 1);
  });

  // 5. Levitating cup bouncing and rotating in space
  if (levitatingCup) {
    levitatingCup.position.y = 5 + Math.sin(time * 1.5) * 1.5;
    levitatingCup.rotation.y = time * 0.4;
    levitatingCup.rotation.x = Math.sin(time * 0.8) * 0.08;
    levitatingCup.rotation.z = Math.cos(time * 0.8) * 0.08;
  }

  // 6. Robotic arm simulating coffee preparation
  if (baristaArm) {
    // Joint 1 rotates back and forth
    const j1 = baristaArm.children[1];
    j1.rotation.y = Math.sin(time * 0.7) * 0.4;
    
    // Joint 2 pivots up and down
    const j2 = j1.children[2];
    j2.rotation.x = -0.4 + Math.sin(time * 1.2) * 0.2;
    
    // Effector tool turns
    const tool = j2.children[2];
    tool.rotation.y = time * 0.5;
  }

  // 7. Drones hovering dynamically along smooth path lines
  drones.forEach(d => {
    const t = time + d.seed;
    d.mesh.position.y = d.basePos.y + Math.sin(t * 2.0) * 1.8;
    d.mesh.position.x = d.basePos.x + Math.cos(t * 0.8) * 4.0;
    d.mesh.position.z = d.basePos.z + Math.sin(t * 0.8) * 4.0;

    // Pitch/roll angles tilting with direction changes
    d.mesh.rotation.z = Math.sin(t * 0.8) * 0.15;
    d.mesh.rotation.x = Math.cos(t * 2.0) * 0.08;
    // Rotors spin super fast
    d.mesh.children.forEach(child => {
      if (child.geometry && child.geometry.type === 'TorusGeometry') {
        child.rotation.y += 0.8;
      }
    });
  });

  // Render Scene
  renderer.render(scene, camera);
}

// Instantiate the scene on window load
window.addEventListener('DOMContentLoaded', init);
