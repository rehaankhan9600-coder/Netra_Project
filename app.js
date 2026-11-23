/* ═════════════════════════════════════════════════════════════════
   NETRA GCS — Ground Control Station Main Controller
   Includes 3D Opening Rover Showcase & Mission Control Dashboard
═════════════════════════════════════════════════════════════════ */

'use strict';

// ── GLOBAL TELEMETRY STATE ──
const state = {
  armed: true,
  mode: 'AUTO',
  viewMode: 'simple', // 'simple' (beginner friendly) or 'pro' (engineering)
  speedPreset: 1.5,
  metSeconds: 5058, // T+ 01:24:18
  speed: 2.38,
  targetSpeed: 1.50,
  linearVel: 0.0,
  angularVel: 0.0,
  brake: false,
  pitch: 2.4,
  roll: -0.8,
  yaw: 142.6,
  altitude: 48.24,
  voltage: 24.58,
  current: 11.42,
  batteryPct: 78,
  wheelRPMs: [184, 182, 183, 184, 185, 183],
  currentWP: 5,
  distToWP: 14.2,
  lat: 23.02254,
  lng: 72.57142,
  roverPos: { x: 295, y: 102 },
  targetPos: null,
  logs: []
};

// ── TOAST NOTIFICATION UTILITY FOR USER FEEDBACK ──
function showToast(msg, type = 'info', duration = 2800) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  let icon = 'info-circle';
  if (type === 'warn') icon = 'exclamation-circle';
  if (type === 'danger') icon = 'exclamation-triangle';
  if (type === 'success') icon = 'check-circle';
  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideToastOut 0.25s ease forwards';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ── INITIALIZE APPLICATION ON LOAD ──
window.addEventListener('DOMContentLoaded', () => {
  initOpeningPortal();
  initMissionClocks();
  initTabNavigation();
  initTeleopControls();
  initBeginnerFeatures();
  initMapNavigation();
  initModeAndArming();
  initThreeViewport();
  startTelemetrySimulation();
  initLogStream();
  initExportAndClear();
  initFullscreen();
});

/* ═════════════════════════════════════════════════════════════════
   OPENING FULLSCREEN 3D ROVER PORTAL SHOWCASE
   Interactive 3D Rover that unlocks GCS on Tap / Click
═════════════════════════════════════════════════════════════ */
function initOpeningPortal() {
  const portal = document.getElementById('opening-portal');
  const canvas = document.getElementById('portal-canvas');
  const enterBtn = document.getElementById('btn-enter-mission');
  const enterSimpleBtn = document.getElementById('btn-enter-simple');
  const openPortalBtn = document.getElementById('btn-open-portal');
  const targetCue = document.getElementById('portal-target-cue');

  if (!portal || !canvas || !window.THREE) return;

  // Three.js Scene Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04070c);
  scene.fog = new THREE.FogExp2(0x04070c, 0.07);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(3.8, 2.2, 4.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Lighting (Dramatic Aerospace Studio Lighting)
  const ambientLight = new THREE.AmbientLight(0x0e1726, 2.2);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(5, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  scene.add(keyLight);

  const cyanRimLight = new THREE.PointLight(0x06b6d4, 3.5, 14);
  cyanRimLight.position.set(-4, 3, -4);
  scene.add(cyanRimLight);

  const greenBeacon = new THREE.PointLight(0x10b981, 2.0, 8);
  greenBeacon.position.set(0, 1.8, 0);
  scene.add(greenBeacon);

  // Atmospheric Space Dust Particles
  const particleCount = 600;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 16;
    particlePos[i + 1] = Math.random() * 6;
    particlePos[i + 2] = (Math.random() - 0.5) * 16;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0x0ea5e9,
    size: 0.04,
    transparent: true,
    opacity: 0.6
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // High-Tech Circular Landing Pad with Rings
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x05080f,
    roughness: 0.85,
    metalness: 0.2
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Concentric Metric Platform Rings
  function addRing(rInner, rOuter, color, opacity) {
    const rGeo = new THREE.RingGeometry(rInner, rOuter, 64);
    const rMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    rMesh.rotation.x = -Math.PI / 2;
    rMesh.position.y = 0.005;
    scene.add(rMesh);
  }
  addRing(1.8, 1.83, 0x10b981, 0.4);
  addRing(2.6, 2.62, 0x06b6d4, 0.3);
  addRing(3.4, 3.42, 0x1e293b, 0.5);

  // Cross Alignment Lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.25 });
  const linePts = [new THREE.Vector3(-4, 0.006, 0), new THREE.Vector3(4, 0.006, 0)];
  const crossX = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), lineMat);
  const linePtsZ = [new THREE.Vector3(0, 0.006, -4), new THREE.Vector3(0, 0.006, 4)];
  const crossZ = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePtsZ), lineMat);
  scene.add(crossX);
  scene.add(crossZ);

  // ── BUILD REALISTIC HIGH-DETAIL 3D ROVER MODEL ──
  const roverModel = createRoverModel();
  scene.add(roverModel);

  // Interactivity: Raycasting for Direct Tap on the Rover
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let orbit = { theta: 0.7, phi: 1.15, radius: 5.4 };
  let autoRotate = true;
  let isEntering = false;

  function updatePortalCamera() {
    orbit.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, orbit.phi));
    camera.position.x = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
    camera.position.y = orbit.radius * Math.cos(orbit.phi);
    camera.position.z = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
    camera.lookAt(0, 0.45, 0);
  }
  updatePortalCamera();

  // Pointer Events (Mouse & Touch)
  let pointerDownPos = { x: 0, y: 0 };

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    autoRotate = false;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    pointerDownPos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointerup', (e) => {
    isDragging = false;
    // Check if it was a quick click/tap on the 3D rover model
    const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    if (distMoved < 6 && !isEntering && portal && !portal.classList.contains('portal-hidden')) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(roverModel.children, true);
      if (intersects.length > 0) {
        enterMissionControl();
      }
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    orbit.theta -= deltaX * 0.007;
    orbit.phi   -= deltaY * 0.007;

    updatePortalCamera();
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbit.radius = Math.max(2.8, Math.min(10.0, orbit.radius + e.deltaY * 0.004));
    updatePortalCamera();
  }, { passive: false });

  // ── CINEMATIC ENTER TRANSITION ──
  function enterMissionControl() {
    if (isEntering) return;
    isEntering = true;

    if (targetCue) targetCue.style.opacity = '0';

    // Camera dive-in animation
    let progress = 0;
    const startRadius = orbit.radius;
    const startPhi = orbit.phi;
    const startY = camera.position.y;

    const zoomInterval = setInterval(() => {
      progress += 0.05;
      orbit.radius = THREE.MathUtils.lerp(startRadius, 1.8, progress);
      orbit.phi = THREE.MathUtils.lerp(startPhi, 1.35, progress);
      updatePortalCamera();

      if (progress >= 1) {
        clearInterval(zoomInterval);
        portal.classList.add('portal-hidden');
        appendLog('/system/portal', 'INFO', 'Ground Control Station initialized from 3D showcase.');

        // Trigger resize on GCS 3D canvas
        if (window.__resizeThreeCanvas) {
          window.__resizeThreeCanvas();
        }
        isEntering = false;
      }
    }, 20);
  }

  // Button clicks
  if (enterSimpleBtn) {
    enterSimpleBtn.addEventListener('click', () => {
      if (window.setAppMode) window.setAppMode('simple');
      enterMissionControl();
    });
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      if (window.setAppMode) window.setAppMode('pro');
      enterMissionControl();
    });
  }

  // Return to 3D Showcase Portal Button
  if (openPortalBtn) {
    openPortalBtn.addEventListener('click', () => {
      portal.classList.remove('portal-hidden');
      if (targetCue) targetCue.style.opacity = '0.85';
      orbit.radius = 5.4;
      orbit.phi = 1.15;
      updatePortalCamera();
      autoRotate = true;
    });
  }

  // Animation Loop for Portal 3D Scene
  let clock = 0;
  function animatePortal() {
    requestAnimationFrame(animatePortal);
    clock += 0.015;

    // Subtle idle floating / suspension breathing
    roverModel.position.y = Math.sin(clock * 1.5) * 0.015;

    // Slow cinematic auto-rotate when not dragging
    if (autoRotate && !isEntering) {
      orbit.theta += 0.003;
      updatePortalCamera();
    }

    // Drift space dust particles
    const positions = particleGeo.attributes.position.array;
    for (let i = 1; i < particleCount * 3; i += 3) {
      positions[i] -= 0.003;
      if (positions[i] < 0) positions[i] = 6;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Spin rover LiDAR sensor
    if (roverModel.__lidarPuck) {
      roverModel.__lidarPuck.rotation.y += 0.08;
    }
    if (roverModel.__lidarCone) {
      roverModel.__lidarCone.rotation.z += 0.08;
    }

    // Pulse beacon light
    greenBeacon.intensity = 1.6 + Math.sin(clock * 3) * 0.8;

    renderer.render(scene, camera);
  }
  animatePortal();
}

/* ═════════════════════════════════════════════════════════════════
   ROVER 3D GEOMETRY BUILDER (Procedural High-Detail Assembly)
═════════════════════════════════════════════════════════════ */
function createRoverModel() {
  const root = new THREE.Group();

  // Engineering Materials
  const matChassis = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
  const matAccent  = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.6, roughness: 0.35 });
  const matSolar   = new THREE.MeshStandardMaterial({ color: 0x0a1128, metalness: 0.95, roughness: 0.1 });
  const matRubber  = new THREE.MeshStandardMaterial({ color: 0x11161f, metalness: 0.1, roughness: 0.85 });
  const matRims    = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
  const matSensor  = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });

  // 1. Main Avionics Chassis Deck
  const chassisGeom = new THREE.BoxGeometry(1.4, 0.22, 0.9);
  const chassisMesh = new THREE.Mesh(chassisGeom, matChassis);
  chassisMesh.position.set(0, 0.45, 0);
  chassisMesh.castShadow = true;
  root.add(chassisMesh);

  // Top Solar Array Deck
  const solarGeom = new THREE.BoxGeometry(1.2, 0.02, 0.76);
  const solarMesh = new THREE.Mesh(solarGeom, matSolar);
  solarMesh.position.set(-0.04, 0.57, 0);
  root.add(solarMesh);

  // Solar Grid Divider Lines
  const solarLineGeom = new THREE.BoxGeometry(1.18, 0.025, 0.01);
  for (let z = -0.3; z <= 0.3; z += 0.15) {
    const sLine = new THREE.Mesh(solarLineGeom, matAccent);
    sLine.position.set(-0.04, 0.575, z);
    root.add(sLine);
  }

  // 2. Sensor Mast & Pan-Tilt Turret
  const mastPoleGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 12);
  const mastPole = new THREE.Mesh(mastPoleGeom, matSensor);
  mastPole.position.set(0.52, 0.78, 0);
  root.add(mastPole);

  const gimbalHead = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.16), matChassis);
  gimbalHead.position.set(0.52, 1.03, 0);
  root.add(gimbalHead);

  // Stereo Lenses
  const lensGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
  lensGeom.rotateZ(Math.PI / 2);
  const lensL = new THREE.Mesh(lensGeom, matRims);
  lensL.position.set(0.60, 1.03, 0.045);
  const lensR = new THREE.Mesh(lensGeom, matRims);
  lensR.position.set(0.60, 1.03, -0.045);
  root.add(lensL);
  root.add(lensR);

  // Spinning LiDAR Puck on top of the mast
  const lidarGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16);
  const lidarPuck = new THREE.Mesh(lidarGeom, new THREE.MeshStandardMaterial({ color: 0x090d14, metalness: 0.9, roughness: 0.2 }));
  lidarPuck.position.set(0.52, 1.12, 0);
  root.add(lidarPuck);
  root.__lidarPuck = lidarPuck;

  // Simulated LiDAR Ray Scan Fan
  const lidarFanGeom = new THREE.ConeGeometry(1.6, 0.05, 32, 1, true);
  lidarFanGeom.rotateX(Math.PI / 2);
  const lidarFanMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.25 });
  const lidarFan = new THREE.Mesh(lidarFanGeom, lidarFanMat);
  lidarFan.position.set(0.52, 1.12, 0);
  root.add(lidarFan);
  root.__lidarCone = lidarFan;

  // 3. High-Gain Antenna Dish
  const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8), matSensor);
  antPole.position.set(-0.55, 0.72, 0.25);
  root.add(antPole);

  const dishGeom = new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const dishMesh = new THREE.Mesh(dishGeom, matRims);
  dishMesh.position.set(-0.55, 0.90, 0.25);
  dishMesh.rotation.x = -Math.PI / 3;
  dishMesh.rotation.y = Math.PI / 6;
  root.add(dishMesh);

  // 4. 6 Treaded Wheels & Hub Assemblies (Rocker-Bogie)
  const wheelOffsets = [
    { x:  0.68, z:  0.58 }, // Front-Left
    { x:  0.00, z:  0.64 }, // Mid-Left
    { x: -0.68, z:  0.58 }, // Rear-Left
    { x:  0.68, z: -0.58 }, // Front-Right
    { x:  0.00, z: -0.64 }, // Mid-Right
    { x: -0.68, z: -0.58 }  // Rear-Right
  ];

  root.__wheels = [];

  wheelOffsets.forEach(pos => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, 0.22, pos.z);

    // Tread Tire
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 24), matRubber);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Anodized Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.15, 12), matRims);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);

    // Hub Center
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.17, 8), matAccent);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    // Rocker-Bogie Suspension Link Arm
    const armGeom = new THREE.BoxGeometry(0.05, 0.05, Math.abs(pos.z) - 0.42);
    const armMesh = new THREE.Mesh(armGeom, matChassis);
    armMesh.position.set(0, 0.16, pos.z > 0 ? -0.06 : 0.06);
    wheelGroup.add(armMesh);

    root.add(wheelGroup);
    root.__wheels.push({ group: wheelGroup, tire });
  });

  return root;
}

/* ═════════════════════════════════════════════════════════════════
   MISSION ELAPSED TIME & UTC CLOCK
═════════════════════════════════════════════════════════════ */
function initMissionClocks() {
  const metEl = document.getElementById('hdr-timer');
  const utcEl = document.getElementById('hdr-utc');

  function update() {
    state.metSeconds++;
    const h = String(Math.floor(state.metSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((state.metSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(state.metSeconds % 60).padStart(2, '0');
    if (metEl) metEl.textContent = `T+ ${h}:${m}:${s}`;

    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMins  = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSecs  = String(now.getUTCSeconds()).padStart(2, '0');
    if (utcEl) utcEl.textContent = `${utcHours}:${utcMins}:${utcSecs} UTC`;
  }

  update();
  setInterval(update, 1000);
}

/* ═════════════════════════════════════════════════════════════════
   TABBED NAVIGATION & VIEW RESIZING
═════════════════════════════════════════════════════════════ */
function initTabNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.gcs-page');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = 'page-' + tab.dataset.tab;

      navTabs.forEach(t => t.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPage = document.getElementById(targetId);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      // If switching to 3D Digital Twin, trigger canvas layout update
      if (tab.dataset.tab === 'twin3d' && window.__resizeThreeCanvas) {
        window.__resizeThreeCanvas();
      }
    });
  });
}

/* ═════════════════════════════════════════════════════════════════
   SYSTEM ARMING, FLIGHT MODES & EMERGENCY STOP
═════════════════════════════════════════════════════════════ */
function initModeAndArming() {
  const armBtn = document.getElementById('arm-toggle-btn');
  const armText = document.getElementById('arm-state-text');
  const modeSelect = document.getElementById('mode-select');
  const estopBtn = document.getElementById('estop-btn');
  const modal = document.getElementById('confirm-modal');
  const modalMsg = document.getElementById('dialog-msg');
  const confirmBtn = document.getElementById('dialog-confirm-btn');
  const cancelBtn = document.getElementById('dialog-cancel-btn');

  let pendingAction = null;

  // Arm/Disarm Toggle
  armBtn.addEventListener('click', () => {
    if (state.armed) {
      modalMsg.textContent = 'SAFETY CHECK: Are you sure you want to DISARM rover traction inverters?';
      pendingAction = () => {
        state.armed = false;
        armBtn.classList.remove('armed');
        armBtn.classList.add('disarmed');
        armText.textContent = 'DISARMED';
        appendLog('/core/safety', 'WARN', 'Motors Disarmed. Inverters disabled.');
      };
      modal.showModal();
    } else {
      state.armed = true;
      armBtn.classList.remove('disarmed');
      armBtn.classList.add('armed');
      armText.textContent = 'ARMED';
      appendLog('/core/safety', 'INFO', 'Motors ARMED. Inverters energized.');
    }
  });

  // Emergency Stop (E-STOP)
  estopBtn.addEventListener('click', () => {
    modalMsg.textContent = 'CRITICAL EMERGENCY: Execute immediate HARDWARE E-STOP and disarm all actuators?';
    pendingAction = () => {
      state.armed = false;
      state.speed = 0.0;
      state.linearVel = 0.0;
      state.angularVel = 0.0;
      state.brake = true;
      state.wheelRPMs = [0, 0, 0, 0, 0, 0];
      armBtn.classList.remove('armed');
      armBtn.classList.add('disarmed');
      armText.textContent = 'DISARMED';
      modeSelect.value = 'HOLD';
      state.mode = 'HOLD';
      appendLog('/safety/estop', 'ERR', 'HARDWARE E-STOP ASSERTED! Traction killed.');
      updateUI();
    };
    modal.showModal();
  });

  confirmBtn.addEventListener('click', () => {
    if (pendingAction) pendingAction();
    modal.close();
  });

  cancelBtn.addEventListener('click', () => {
    modal.close();
  });

  // Nav Mode Selector
  modeSelect.addEventListener('change', (e) => {
    state.mode = e.target.value;
    appendLog('/guidance/nav_mode', 'INFO', `Nav mode switched to: ${state.mode}`);
    if (state.mode === 'HOLD') {
      state.speed = 0.0;
      state.linearVel = 0.0;
      state.angularVel = 0.0;
    }
    updateUI();
  });
}

/* ═════════════════════════════════════════════════════════════════
   TELEOPERATION & KEYBOARD VELOCITY COMMANDS (/cmd_vel)
   Supports Arrow Keys, WASD, Touch & Big On-Screen Buttons
═════════════════════════════════════════════════════════════ */
function initTeleopControls() {
  const roLinear = document.getElementById('ro-linear');
  const roAngular = document.getElementById('ro-angular');
  const roBrake = document.getElementById('ro-brake');
  const deckStatus = document.getElementById('deck-status-badge');

  // Easy D-Pad buttons
  const easyFwd   = document.getElementById('btn-easy-fwd');
  const easyRev   = document.getElementById('btn-easy-rev');
  const easyLeft  = document.getElementById('btn-easy-left');
  const easyRight = document.getElementById('btn-easy-right');
  const easyStop  = document.getElementById('btn-easy-stop');

  // Pro Compact D-Pad buttons
  const btnFwd   = document.getElementById('btn-drive-fwd');
  const btnRev   = document.getElementById('btn-drive-rev');
  const btnLeft  = document.getElementById('btn-drive-left');
  const btnRight = document.getElementById('btn-drive-right');
  const btnBrake = document.getElementById('btn-drive-brake');

  function updateStatusBadge(lin, ang, isBraking) {
    if (!deckStatus) return;
    if (isBraking) {
      deckStatus.innerHTML = '<i class="fas fa-hand-paper text-red"></i> BRAKING / STOPPED';
      deckStatus.className = 'deck-state-badge text-red';
    } else if (lin > 0) {
      deckStatus.innerHTML = `<i class="fas fa-arrow-up text-green"></i> FORWARD (${lin.toFixed(1)} m/s)`;
      deckStatus.className = 'deck-state-badge text-green';
    } else if (lin < 0) {
      deckStatus.innerHTML = `<i class="fas fa-arrow-down text-yellow"></i> REVERSING (${Math.abs(lin).toFixed(1)} m/s)`;
      deckStatus.className = 'deck-state-badge text-yellow';
    } else if (ang !== 0) {
      const dir = ang > 0 ? 'RIGHT' : 'LEFT';
      deckStatus.innerHTML = `<i class="fas fa-redo text-cyan"></i> STEERING ${dir}`;
      deckStatus.className = 'deck-state-badge text-cyan';
    } else {
      deckStatus.innerHTML = '<i class="fas fa-circle text-green"></i> READY TO DRIVE';
      deckStatus.className = 'deck-state-badge text-green';
    }
  }

  function sendCmdVel(linear, angular) {
    if (!state.armed) {
      appendLog('/cmd_vel', 'WARN', 'Command ignored: System is DISARMED');
      showToast('⚠️ Rover is DISARMED. Click Arm or switch to Manual.', 'warn');
      return;
    }
    state.linearVel = linear;
    state.angularVel = angular;
    state.brake = (linear === 0 && angular === 0);

    if (roLinear) roLinear.textContent = `${linear.toFixed(2)} m/s`;
    if (roAngular) roAngular.textContent = `${angular.toFixed(2)} rad/s`;
    if (roBrake) {
      roBrake.textContent = state.brake ? 'ENGAGED' : 'DISENGAGED';
      roBrake.className = state.brake ? 'text-yellow' : 'text-green';
    }

    updateStatusBadge(linear, angular, state.brake && activeKeys[' ']);

    // Dynamic wheel response
    const baseRPM = Math.round(linear * 80);
    state.wheelRPMs = [
      Math.max(0, baseRPM - Math.round(angular * 20)),
      Math.max(0, baseRPM - Math.round(angular * 20)),
      Math.max(0, baseRPM - Math.round(angular * 20)),
      Math.max(0, baseRPM + Math.round(angular * 20)),
      Math.max(0, baseRPM + Math.round(angular * 20)),
      Math.max(0, baseRPM + Math.round(angular * 20)),
    ];
    updateWheelMetrics();
  }

  // Keyboard binds (Arrow keys + WASD + Space)
  const activeKeys = {};
  const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];

  function updateKeyVisuals() {
    const isUp = activeKeys['ArrowUp'] || activeKeys['w'] || activeKeys['W'];
    const isDown = activeKeys['ArrowDown'] || activeKeys['s'] || activeKeys['S'];
    const isLeft = activeKeys['ArrowLeft'] || activeKeys['a'] || activeKeys['A'];
    const isRight = activeKeys['ArrowRight'] || activeKeys['d'] || activeKeys['D'];
    const isSpace = activeKeys[' '];

    if (easyFwd) easyFwd.classList.toggle('active-press', !!isUp);
    if (easyRev) easyRev.classList.toggle('active-press', !!isDown);
    if (easyLeft) easyLeft.classList.toggle('active-press', !!isLeft);
    if (easyRight) easyRight.classList.toggle('active-press', !!isRight);
    if (easyStop) easyStop.classList.toggle('active-press', !!isSpace);

    if (btnFwd) btnFwd.classList.toggle('active-press', !!isUp);
    if (btnRev) btnRev.classList.toggle('active-press', !!isDown);
    if (btnLeft) btnLeft.classList.toggle('active-press', !!isLeft);
    if (btnRight) btnRight.classList.toggle('active-press', !!isRight);
    if (btnBrake) btnBrake.classList.toggle('active-press', !!isSpace);
  }

  window.addEventListener('keydown', (e) => {
    if (validKeys.includes(e.key)) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      activeKeys[e.key] = true;
      updateKeyVisuals();
      processDriveKeys();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (validKeys.includes(e.key)) {
      delete activeKeys[e.key];
      updateKeyVisuals();
      processDriveKeys();
    }
  });

  function processDriveKeys() {
    let lin = 0;
    let ang = 0;
    const maxSpeed = state.speedPreset || 1.5;

    if (activeKeys[' ']) {
      sendCmdVel(0, 0);
      updateStatusBadge(0, 0, true);
      return;
    }

    if (activeKeys['ArrowUp'] || activeKeys['w'] || activeKeys['W']) lin += maxSpeed;
    if (activeKeys['ArrowDown'] || activeKeys['s'] || activeKeys['S']) lin -= (maxSpeed * 0.6);
    if (activeKeys['ArrowLeft'] || activeKeys['a'] || activeKeys['A']) ang -= 0.8;
    if (activeKeys['ArrowRight'] || activeKeys['d'] || activeKeys['D']) ang += 0.8;

    sendCmdVel(lin, ang);
  }

  // Bind Mouse & Touch to Button elements
  function bindDriveButton(el, linVal, angVal) {
    if (!el) return;
    const startHandler = (e) => {
      e.preventDefault();
      el.classList.add('active-press');
      const speed = state.speedPreset || 1.5;
      const actualLin = linVal === 0 ? 0 : (linVal > 0 ? speed : -speed * 0.6);
      sendCmdVel(actualLin, angVal);
    };
    const endHandler = (e) => {
      e.preventDefault();
      el.classList.remove('active-press');
      sendCmdVel(0, 0);
      updateStatusBadge(0, 0, false);
    };

    el.addEventListener('mousedown', startHandler);
    el.addEventListener('mouseup', endHandler);
    el.addEventListener('mouseleave', endHandler);
    el.addEventListener('touchstart', startHandler, { passive: false });
    el.addEventListener('touchend', endHandler, { passive: false });
  }

  // Easy D-Pad binding
  bindDriveButton(easyFwd, 1.0, 0);
  bindDriveButton(easyRev, -1.0, 0);
  bindDriveButton(easyLeft, 0.4, -0.8);
  bindDriveButton(easyRight, 0.4, 0.8);
  if (easyStop) {
    easyStop.addEventListener('click', () => {
      sendCmdVel(0, 0);
      updateStatusBadge(0, 0, true);
      showToast('🛑 Rover Braked & Stopped', 'warn', 1500);
      setTimeout(() => updateStatusBadge(0, 0, false), 1500);
    });
  }

  // Pro D-Pad binding
  bindDriveButton(btnFwd, 1.0, 0);
  bindDriveButton(btnRev, -1.0, 0);
  bindDriveButton(btnLeft, 0.4, -0.8);
  bindDriveButton(btnRight, 0.4, 0.8);
  if (btnBrake) {
    btnBrake.addEventListener('click', () => {
      sendCmdVel(0, 0);
      updateStatusBadge(0, 0, true);
    });
  }
}

/* ═════════════════════════════════════════════════════════════════
   BEGINNER & SIMPLE MODE FEATURES (SPEED, ACTIONS, MODALS)
═════════════════════════════════════════════════════════════ */
function initBeginnerFeatures() {
  const btnSimple = document.getElementById('btn-mode-simple');
  const btnPro = document.getElementById('btn-mode-pro');
  const appShell = document.getElementById('gcs-app');

  // App Mode Switcher (Simple vs Pro)
  window.setAppMode = function(mode) {
    state.viewMode = mode;
    if (mode === 'simple') {
      if (appShell) {
        appShell.classList.add('simple-mode');
        appShell.classList.remove('pro-mode');
      }
      if (btnSimple) btnSimple.classList.add('active');
      if (btnPro) btnPro.classList.remove('active');
      showToast('🟢 Simple Mode: Clean layout & easy drive controls active', 'success');
    } else {
      if (appShell) {
        appShell.classList.remove('simple-mode');
        appShell.classList.add('pro-mode');
      }
      if (btnSimple) btnSimple.classList.remove('active');
      if (btnPro) btnPro.classList.add('active');
      showToast('⚙️ Pro Mode: Full engineering telemetry & raw logs active', 'info');
    }
  };

  if (btnSimple) btnSimple.addEventListener('click', () => window.setAppMode('simple'));
  if (btnPro) btnPro.addEventListener('click', () => window.setAppMode('pro'));

  // Tutorial / Quick Guide Modal
  const tutorialModal = document.getElementById('tutorial-modal');
  const btnQuickHelp = document.getElementById('btn-quick-help');
  const btnOpenTut = document.getElementById('btn-open-tutorial');
  const btnCloseTut = document.getElementById('btn-close-tutorial');
  const btnGotIt = document.getElementById('btn-got-it');
  const btnDismissHelper = document.getElementById('btn-dismiss-helper');
  const helperBar = document.getElementById('beginner-helper-bar');

  if (btnQuickHelp && tutorialModal) btnQuickHelp.addEventListener('click', () => tutorialModal.showModal());
  if (btnOpenTut && tutorialModal) btnOpenTut.addEventListener('click', () => tutorialModal.showModal());
  if (btnCloseTut && tutorialModal) btnCloseTut.addEventListener('click', () => tutorialModal.close());
  if (btnGotIt && tutorialModal) btnGotIt.addEventListener('click', () => tutorialModal.close());
  if (btnDismissHelper && helperBar) {
    btnDismissHelper.addEventListener('click', () => {
      helperBar.style.display = 'none';
      showToast('Guide dismissed. Click "Help / Guide" anytime in top bar to view again.', 'info', 2500);
    });
  }

  // Speed Presets
  const speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseFloat(btn.dataset.speed) || 1.5;
      state.speedPreset = val;
      state.targetSpeed = val;
      showToast(`⚡ Speed preset: ${btn.textContent.trim()}`, 'info');
    });
  });

  // One-Touch Mission Actions
  const btnActManual = document.getElementById('btn-act-manual');
  const btnActAuto   = document.getElementById('btn-act-autopatrol');
  const btnActRtl    = document.getElementById('btn-act-rtl');
  const btnActEstop  = document.getElementById('btn-act-estop');
  const modeSelect   = document.getElementById('mode-select');

  function updateActionButtons(mode) {
    document.querySelectorAll('.easy-action-btn').forEach(b => b.classList.remove('active'));
    if (mode === 'MANUAL' && btnActManual) btnActManual.classList.add('active');
    if (mode === 'AUTO' && btnActAuto) btnActAuto.classList.add('active');
    if (mode === 'RTL' && btnActRtl) btnActRtl.classList.add('active');
  }

  if (btnActManual) {
    btnActManual.addEventListener('click', () => {
      state.mode = 'MANUAL';
      if (modeSelect) modeSelect.value = 'MANUAL';
      updateActionButtons('MANUAL');
      showToast('🎮 Manual Drive: Use WASD / Arrow keys or buttons', 'success');
      appendLog('/mode', 'INFO', 'Switched to MANUAL drive via easy control deck.');
    });
  }

  if (btnActAuto) {
    btnActAuto.addEventListener('click', () => {
      state.mode = 'AUTO';
      if (modeSelect) modeSelect.value = 'AUTO';
      updateActionButtons('AUTO');
      showToast('🚀 Auto-Patrol: Rover driving along waypoint route', 'info');
      appendLog('/mode', 'INFO', 'Switched to AUTO (Waypoints) patrol.');
    });
  }

  if (btnActRtl) {
    btnActRtl.addEventListener('click', () => {
      state.mode = 'RTL';
      if (modeSelect) modeSelect.value = 'RTL';
      updateActionButtons('RTL');
      showToast('🏠 Return Home (RTL): Rover returning to base station', 'warn');
      appendLog('/mode', 'WARN', 'RTL asserted: Rover turning back towards starting dock.');
    });
  }

  if (btnActEstop) {
    btnActEstop.addEventListener('click', () => {
      const estopBtn = document.getElementById('estop-btn');
      if (estopBtn) estopBtn.click();
    });
  }

  // Toggle PFD Artificial Horizon View in Simple Mode
  const btnTogglePfd = document.getElementById('btn-toggle-pfd-view');
  const pfdWrapper = document.getElementById('pfd-horizon-wrapper');
  const pfdText = document.getElementById('pfd-toggle-text');
  if (btnTogglePfd && pfdWrapper) {
    let pfdShown = false;
    btnTogglePfd.addEventListener('click', () => {
      pfdShown = !pfdShown;
      pfdWrapper.classList.toggle('show-pfd', pfdShown);
      if (pfdText) pfdText.textContent = pfdShown ? 'Back to Drive Controls' : 'Show Artificial Horizon (PFD)';
    });
  }

  // Toggle Detailed Telemetry / Bottom Dock
  const btnToggleDiag = document.getElementById('btn-toggle-diagnostics');
  const bottomDock = document.getElementById('bottom-dock-grid');
  const diagChevron = document.getElementById('diag-chevron');
  const diagText = document.getElementById('diag-toggle-text');
  if (btnToggleDiag && bottomDock) {
    let collapsed = true;
    btnToggleDiag.addEventListener('click', () => {
      collapsed = !collapsed;
      bottomDock.classList.toggle('collapsed-dock', collapsed);
      if (diagChevron) diagChevron.className = collapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
      if (diagText) diagText.textContent = collapsed ? 'Show Detailed Telemetry & Logs' : 'Hide Detailed Telemetry & Logs';
    });
  }

  // Snapshot Button Feedback
  const btnSnapshot = document.getElementById('btn-snapshot');
  if (btnSnapshot) {
    btnSnapshot.addEventListener('click', () => {
      showToast('📸 High-Res Frame Captured & Logged to Storage', 'success');
      appendLog('/optics/capture', 'INFO', 'Snapshot saved: CAM01_20261123_102418.raw (12-bit)');
    });
  }
}

/* ═════════════════════════════════════════════════════════════════
   TACTICAL MAP INTERACTIVE POINT-AND-CLICK NAVIGATION
═════════════════════════════════════════════════════════════ */
function initMapNavigation() {
  const mapSvg = document.getElementById('tactical-map-svg');
  const targetMarker = document.getElementById('map-target-marker');
  const guidanceLine = document.getElementById('map-guidance-line');
  const roverMarker = document.getElementById('map-rover-marker');
  const coordDisplay = document.getElementById('coord-display');
  const recenterBtn = document.getElementById('map-recenter-btn');

  if (!mapSvg) return;

  mapSvg.addEventListener('click', (e) => {
    const rect = mapSvg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert screen coordinates to SVG viewBox (460 x 320)
    const svgX = Math.round((clickX / rect.width) * 460);
    const svgY = Math.round((clickY / rect.height) * 320);

    // Position the target marker
    if (targetMarker) {
      targetMarker.style.display = 'block';
      targetMarker.setAttribute('transform', `translate(${svgX}, ${svgY})`);
    }

    state.targetPos = { x: svgX, y: svgY };

    // Connect guidance line from rover position to target
    if (guidanceLine) {
      guidanceLine.setAttribute('x1', state.roverPos.x);
      guidanceLine.setAttribute('y1', state.roverPos.y);
      guidanceLine.setAttribute('x2', svgX);
      guidanceLine.setAttribute('y2', svgY);
      guidanceLine.setAttribute('opacity', '1');
    }

    // Convert to geographic coordinates
    const lat = (23.02254 + (160 - svgY) * 0.00008).toFixed(5);
    const lng = (72.57142 + (svgX - 230) * 0.00008).toFixed(5);
    if (coordDisplay) coordDisplay.textContent = `${lat}° N, ${lng}° E`;

    // Update WP status on strip
    const metWp = document.getElementById('met-wp');
    if (metWp) metWp.textContent = `TARGET [${svgX},${svgY}]`;

    showToast(`🎯 Destination set to (${svgX}, ${svgY}) · Rover Navigating`, 'success');
    appendLog('/nav/goal', 'INFO', `Tactical point selected: x=${svgX}, y=${svgY} (${lat}N, ${lng}E)`);

    // Steer towards target point smoothly
    const dx = svgX - state.roverPos.x;
    const dy = svgY - state.roverPos.y;
    const targetYaw = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    state.yaw = +targetYaw.toFixed(1);
    if (roverMarker) {
      roverMarker.setAttribute('transform', `translate(${state.roverPos.x}, ${state.roverPos.y}) rotate(${state.yaw})`);
    }
  });

  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
      showToast('📍 Map Recentered on NETRA Rover', 'info', 1800);
    });
  }
}

/* ═════════════════════════════════════════════════════════════════
   TELEMETRY REAL-TIME DATA STREAM SIMULATION
═════════════════════════════════════════════════════════════ */
function startTelemetrySimulation() {
  const metSpeed = document.getElementById('met-speed');
  const metCurrent = document.getElementById('met-current');
  const metHeading = document.getElementById('met-heading');
  const metAttitude = document.getElementById('met-attitude');
  const pfdSpeedTape = document.getElementById('pfd-speed-tape');
  const pfdAltTape = document.getElementById('pfd-alt-tape');
  const pfdHeadingTape = document.getElementById('pfd-heading-tape');
  const horizonDynamic = document.getElementById('horizon-dynamic-group');
  const roverMarker = document.getElementById('map-rover-marker');

  setInterval(() => {
    if (state.armed && state.mode !== 'HOLD') {
      // Natural sensor noise & fluctuations
      const speedJitter = (Math.random() - 0.49) * 0.08;
      state.speed = Math.max(0, +(state.targetSpeed + speedJitter).toFixed(2));
      state.current = +(11.2 + (state.speed * 1.8) + (Math.random() - 0.5) * 0.4).toFixed(2);
      state.pitch = +(2.4 + Math.sin(Date.now() / 2000) * 1.2).toFixed(1);
      state.roll = +(-0.8 + Math.cos(Date.now() / 2500) * 0.9).toFixed(1);
      state.yaw = +((state.yaw + 0.05) % 360).toFixed(1);
      state.altitude = +(48.2 + Math.sin(Date.now() / 6000) * 0.4).toFixed(1);
      state.voltage = +(24.6 - (state.metSeconds / 10000)).toFixed(2);
    } else {
      state.speed = 0.0;
      state.current = 2.14;
    }

    // Update KPI Header Readouts
    if (metSpeed) metSpeed.textContent = state.speed.toFixed(2);
    if (metCurrent) metCurrent.textContent = state.current.toFixed(2);
    if (metHeading) metHeading.textContent = `${state.yaw.toFixed(1)}°`;
    if (metAttitude) metAttitude.textContent = `${state.pitch > 0 ? '+' : ''}${state.pitch}°`;

    // Update Primary Flight Display (PFD)
    if (pfdSpeedTape) pfdSpeedTape.textContent = state.speed.toFixed(1);
    if (pfdAltTape) pfdAltTape.textContent = state.altitude.toFixed(1);
    if (pfdHeadingTape) pfdHeadingTape.textContent = `${Math.round(state.yaw)}° NE`;

    // Rotate & pitch artificial horizon (Scale: 1 deg pitch = 2.5px translation)
    if (horizonDynamic) {
      const pitchPx = state.pitch * 2.5;
      horizonDynamic.setAttribute('transform', `translate(160, ${110 + pitchPx}) rotate(${state.roll})`);
    }

    // Update Tactical Map Rover Marker Orientation & Coordinates
    if (roverMarker) {
      roverMarker.setAttribute('transform', `translate(295, 102) rotate(${state.yaw})`);
    }

    // Update 3D Model Euler Angles in Digital Twin Viewport
    const tp = document.getElementById('twin-pitch');
    const tr = document.getElementById('twin-roll');
    const ty = document.getElementById('twin-yaw');
    if (tp) tp.textContent = `${state.pitch > 0 ? '+' : ''}${state.pitch}°`;
    if (tr) tr.textContent = `${state.roll > 0 ? '+' : ''}${state.roll}°`;
    if (ty) ty.textContent = `${state.yaw}°`;

    if (window.__updateRoverAttitude) {
      window.__updateRoverAttitude(state.pitch, state.roll, state.yaw, state.speed);
    }
  }, 200);
}

function updateWheelMetrics() {
  const ids = ['fl', 'ml', 'rl', 'fr', 'mr', 'rr'];
  ids.forEach((id, idx) => {
    const el = document.getElementById(`wheel-${id}`);
    if (el) {
      const rpmEl = el.querySelector('.pod-rpm');
      const barEl = el.querySelector('.pod-bar');
      const rpm = state.wheelRPMs[idx] || 0;
      if (rpmEl) rpmEl.textContent = `${rpm} RPM`;
      if (barEl) barEl.style.width = `${Math.min(100, Math.round((rpm / 250) * 100))}%`;
    }
  });
}

function updateUI() {
  updateWheelMetrics();
}

/* ═════════════════════════════════════════════════════════════
   ROS2 TELEMETRY STREAM & LOG CONSOLE
═════════════════════════════════════════════════════════════ */
const sampleTopics = [
  { topic: '/imu/data', lvl: 'INFO', msg: 'Orientation quaternion filtered. EKF variance nominal.' },
  { topic: '/odom', lvl: 'INFO', msg: 'Pose estimate x: 142.52 y: 88.14 theta: 2.488 rad' },
  { topic: '/battery_state', lvl: 'INFO', msg: 'Cell balance: 4.10V, Pack temp: 31.4C, SOC: 78%' },
  { topic: '/cmd_vel', lvl: 'INFO', msg: 'Linear x: 2.38 m/s, angular z: 0.00 rad/s' },
  { topic: '/diagnostics', lvl: 'INFO', msg: 'CAN transceiver error count: 0 (TX: 148292, RX: 284102)' },
  { topic: '/obstacle_detector', lvl: 'WARN', msg: 'Disparity anomaly detected at range 8.4m [bearing: +14°]' },
  { topic: '/ekf/status', lvl: 'EKF', msg: 'GNSS fusion status: RTK_FIXED. Satellites: 19, HDOP: 0.6' }
];

function initLogStream() {
  const body1 = document.getElementById('live-terminal-body');
  const body2 = document.getElementById('full-terminal-output');

  // Initial seed logs
  sampleTopics.forEach(t => appendLog(t.topic, t.lvl, t.msg));

  // Stream new logs periodically
  let index = 0;
  setInterval(() => {
    const item = sampleTopics[index % sampleTopics.length];
    index++;
    appendLog(item.topic, item.lvl, item.msg);
  }, 4500);

  // Search filter
  const filterInput = document.getElementById('log-filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#live-terminal-body .log-entry').forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    });
  }
}

function appendLog(topic, lvl, msg) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`;

  state.logs.push({ time, topic, lvl, msg });

  const html = `
    <div class="log-entry">
      <span class="log-t">${time}</span>
      <span class="log-topic">[${topic}]</span>
      <span class="log-lvl ${lvl}">${lvl}:</span>
      <span class="log-msg">${msg}</span>
    </div>
  `;

  const containers = [
    document.getElementById('live-terminal-body'),
    document.getElementById('full-terminal-output')
  ];

  containers.forEach(c => {
    if (c) {
      c.insertAdjacentHTML('beforeend', html);
      c.scrollTop = c.scrollHeight;
    }
  });
}

function initExportAndClear() {
  const clearBtn1 = document.getElementById('term-clear-btn');
  const clearBtn2 = document.getElementById('term-full-clear');
  const exportBtn1 = document.getElementById('term-export-btn');
  const exportBtn2 = document.getElementById('term-full-export');

  function clearLogs() {
    state.logs = [];
    const b1 = document.getElementById('live-terminal-body');
    const b2 = document.getElementById('full-terminal-output');
    if (b1) b1.innerHTML = '';
    if (b2) b2.innerHTML = '';
    appendLog('/gcs/terminal', 'INFO', 'Console log buffer cleared.');
  }

  function exportLogs() {
    const blob = new Blob([JSON.stringify(state.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NETRA_Telemetry_Log_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (clearBtn1) clearBtn1.addEventListener('click', clearLogs);
  if (clearBtn2) clearBtn2.addEventListener('click', clearLogs);
  if (exportBtn1) exportBtn1.addEventListener('click', exportLogs);
  if (exportBtn2) exportBtn2.addEventListener('click', exportLogs);
}

function initFullscreen() {
  const fsBtn = document.getElementById('fs-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
      } else {
        document.exitFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    });
  }
}

/* ═════════════════════════════════════════════════════════════════
   3D DIGITAL TWIN VIEWPORT (Three.js Engine)
   Realistic Engineering CAD Model of Netra 6-Wheel Rover
═════════════════════════════════════════════════════════════ */
function initThreeViewport() {
  const container = document.getElementById('three-container');
  const canvas = document.getElementById('three-canvas');
  if (!container || !canvas || !window.THREE) return;

  // Scene & Camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06090e);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(3.2, 2.2, 3.8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Resize Handler
  function resize() {
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 450;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.__resizeThreeCanvas = resize;
  resize();
  window.addEventListener('resize', resize);

  // Lighting (Clean Engineering Studio Lighting)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(6, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x0ea5e9, 1.0);
  rimLight.position.set(-6, 3, -4);
  scene.add(rimLight);

  // CAD Metric Grid Floor
  const gridHelper = new THREE.GridHelper(10, 20, 0x0284c7, 0x1e293b);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // Distance Radius Rings
  const ringGeom = new THREE.RingGeometry(1.98, 2.0, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, opacity: 0.18, transparent: true, side: THREE.DoubleSide });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.005;
  scene.add(ringMesh);

  // XYZ Axes Helper
  const axesHelper = new THREE.AxesHelper(1.2);
  axesHelper.position.set(0, 0.01, 0);
  scene.add(axesHelper);

  // ── PROCEDURAL 6-WHEEL ROVER ASSEMBLY ──
  const roverRoot = createRoverModel();
  scene.add(roverRoot);

  // ── ATTITUDE & KINEMATICS UPDATES ──
  window.__updateRoverAttitude = (pitch, roll, yaw, speed) => {
    // Convert Euler degrees to radians
    const pitchRad = (pitch * Math.PI) / 180;
    const rollRad  = (roll * Math.PI) / 180;
    const yawRad   = (yaw * Math.PI) / 180;

    roverRoot.rotation.x = pitchRad;
    roverRoot.rotation.z = rollRad;

    // Rotate tires based on speed
    if (roverRoot.__wheels) {
      roverRoot.__wheels.forEach(w => {
        w.tire.rotation.z += (speed * 0.04);
      });
    }

    // Rotate LiDAR puck continuously
    if (roverRoot.__lidarPuck) roverRoot.__lidarPuck.rotation.y += 0.12;
    if (roverRoot.__lidarCone) roverRoot.__lidarCone.rotation.z += 0.12;
  };

  // ── CAMERA CONTROLS (ORBIT & PRESETS) ──
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let spherical = { radius: 5.5, theta: 0.8, phi: 1.1 };

  function updateCamera() {
    spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi);
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 0.4, 0);
  }
  updateCamera();

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    spherical.theta -= deltaX * 0.008;
    spherical.phi   -= deltaY * 0.008;

    updateCamera();
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    spherical.radius = Math.max(2.2, Math.min(12.0, spherical.radius + e.deltaY * 0.005));
    updateCamera();
  }, { passive: false });

  // Camera Presets Buttons
  function setPreset(btnId, theta, phi, radius) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.twin-toolbar .tb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      spherical = { theta, phi, radius };
      updateCamera();
    });
  }

  setPreset('cam-preset-iso',   0.8, 1.1, 5.5);
  setPreset('cam-preset-top',   0.0, 0.1, 6.0);
  setPreset('cam-preset-front', 0.0, 1.4, 5.0);
  setPreset('cam-preset-side',  Math.PI / 2, 1.4, 5.0);
  setPreset('cam-preset-chase', Math.PI, 1.2, 5.0);

  const resetBtn = document.getElementById('twin-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      spherical = { radius: 5.5, theta: 0.8, phi: 1.1 };
      updateCamera();
    });
  }

  // Toggles (Wireframe, LiDAR, Axes)
  const chkWire = document.getElementById('chk-wireframe');
  if (chkWire) {
    chkWire.addEventListener('change', (e) => {
      roverRoot.traverse(node => {
        if (node.isMesh && node !== roverRoot.__lidarCone) {
          node.material.wireframe = e.target.checked;
        }
      });
    });
  }

  const chkLidar = document.getElementById('chk-lidar');
  if (chkLidar) {
    chkLidar.addEventListener('change', (e) => {
      if (roverRoot.__lidarCone) roverRoot.__lidarCone.visible = e.target.checked;
    });
  }

  const chkAxes = document.getElementById('chk-axes');
  if (chkAxes) {
    chkAxes.addEventListener('change', (e) => {
      axesHelper.visible = e.target.checked;
    });
  }

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}
