(() => {

// DOM элементы
const restartBtn = document.getElementById('__xYzRestartBtn');
const continueBtn = document.getElementById('continue-btn');
const healthFill = document.getElementById('health-fill');
const gameOverEl = document.getElementById('game-over');
const nitroBar = document.getElementById('nitro-bar');
const scoreEl = document.getElementById('score');
const nitroCount = document.getElementById('nitro-count');
const brakeFill = document.getElementById('brake-fill');
const pauseMenu = document.getElementById('pause-menu');
const countdownOverlay = document.getElementById('countdown-overlay');
const nitroFill = document.getElementById('nitro-fill');


// Главная сцена с окружением Three.js

const wrapper = document.getElementById('__xYzGameWrapper');
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias:true });
const scene = new THREE.Scene();

// Смена дня и ночи
const CYCLE_LENGTH = 2000;
const HALF_CYCLE = 1000;
const TRANSITION_LENGTH = 200;
const DUSK_START = HALF_CYCLE - TRANSITION_LENGTH;
const DUSK_END = HALF_CYCLE;
const DAWN_START = CYCLE_LENGTH - TRANSITION_LENGTH;
const DAWN_END = CYCLE_LENGTH;
const daySkyColor = new THREE.Color(0x87CEEB);
const nightSkyColor = new THREE.Color(0x000022);

// Звезды 
const starGeo = new THREE.BufferGeometry();
const starCount = 600;
const starVerts = [];
for (let i = 0; i < starCount; i++) {
  const x = (Math.random() - 0.5) * 400;
  const y = Math.random() * 100 + 20;
  const z = (Math.random() - 0.5) * 200 - 50;
  starVerts.push(x, y, z);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
const starMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.7, transparent:true, opacity:0 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);


// Облака
const clouds = [];
const NUM_CLOUDS = 28;
function spawnCloudCube(x, y, z) {
  const cloud = new THREE.Group();
  const cubes = Math.floor(Math.random()*5)+3;
  for (let i = 0; i < cubes; i++) {
    const size = Math.random()*3+2;
    const opacity = Math.random()*0.75+0.25;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshPhongMaterial({ color:0xffffff, transparent:true, opacity:opacity })
    );
    mesh.position.set(
      (Math.random()-0.5)*8,
      (Math.random()-0.5)*3,
      (Math.random()-0.5)*8
    );
    cloud.add(mesh);
  }
  cloud.position.set(x, y, z);
  scene.add(cloud);
  clouds.push(cloud);
}
for (let i = 0; i < NUM_CLOUDS; i++) {
  let cloudX = (Math.random()-0.5)*380;
  let cloudY = Math.random()*20 + 35;
  let cloudZ = (Math.random()-0.5)*180 - 60;
  spawnCloudCube(cloudX, cloudY, cloudZ);
}


// Камера
const camera = new THREE.PerspectiveCamera(60,1,0.1,1000);
camera.position.set(0,5,12);

// Свет
scene.add(new THREE.AmbientLight(0x444444));
const dirLight = new THREE.DirectionalLight(0xffffff,0.5);
dirLight.position.set(0,50,50);
scene.add(dirLight);

// Обработка размеров окна
window.addEventListener('resize', () => {
  const w = wrapper.clientWidth, h = wrapper.clientHeight;
  renderer.setSize(w,h);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
});
window.dispatchEvent(new Event('resize'));

// Дорога, ограждения и деревья
const ROAD_W = 14, SEG_L = 10, NUM_S = 40, LEFT_X = -(ROAD_W+4);
const mainRoad = new THREE.Group(), leftRoad = new THREE.Group();
scene.add(mainRoad, leftRoad);
const roadMat   = new THREE.MeshPhongMaterial({ color:0x111111 });
const stripeMat = new THREE.MeshPhongMaterial({ color:0xffffff });
for(let i=0;i<NUM_S;i++){
  const z = -i*SEG_L;
  const slab = new THREE.Mesh(new THREE.BoxGeometry(ROAD_W,0.1,SEG_L), roadMat);
  slab.position.set(0,0,z); mainRoad.add(slab);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1,0.05,SEG_L/4), stripeMat);
  stripe.position.set(0,0.06,z-SEG_L/2); mainRoad.add(stripe);
  const slabL = slab.clone(); slabL.position.x = LEFT_X; leftRoad.add(slabL);
  const stripeL = stripe.clone(); stripeL.position.x = LEFT_X; leftRoad.add(stripeL);
}
const guardrails = [];
const grMat = new THREE.MeshPhongMaterial({ color:0x555555 });
const grLen = NUM_S*SEG_L + 30;
const grZ = -NUM_S*SEG_L/2 + 15;
[0, LEFT_X].forEach(baseX => {
  [-1,1].forEach(side => {
    const x = baseX + side*(ROAD_W/2+0.1);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2,1,grLen), grMat);
    rail.position.set(x,0.5,grZ);
    scene.add(rail);
    guardrails.push(rail);
  });
});
const trunkMat = new THREE.MeshPhongMaterial({ color:0x332211 });
const leafMat  = new THREE.MeshPhongMaterial({ color:0x113311 });
for(let i=0;i<NUM_S;i++){
  const z = -i*SEG_L - Math.random()*SEG_L;
  [ROAD_W/2+5, LEFT_X-ROAD_W/2-5].forEach(x=>{
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,2), trunkMat);
    const l = new THREE.Mesh(new THREE.ConeGeometry(1.5,4,8), leafMat);
    t.position.set(x,1,z); l.position.set(x,3.5,z);
    (x>0? mainRoad : leftRoad).add(t,l);
  });
}
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(200, NUM_S*SEG_L + 60),
  new THREE.MeshPhongMaterial({ color:0x224422 })
);
grass.rotation.x = -Math.PI/2; grass.position.set(0,0,grZ);
scene.add(grass);
const houseMat = new THREE.MeshPhongMaterial({ color:0x8888bb });
const roofMat  = new THREE.MeshPhongMaterial({ color:0xaa4444 });
for(let i=0;i<6;i++){
  const z = -NUM_S*SEG_L - 50 - Math.random()*200;
  const isLeft = Math.random()<0.5;
  const margin = 40 - (isLeft?Math.abs(LEFT_X-ROAD_W/2-5):(ROAD_W/2+5));
  const x = isLeft
    ? (LEFT_X-ROAD_W/2-5) - Math.random()*margin
    : (ROAD_W/2+5) + Math.random()*margin;
  const h = new THREE.Mesh(new THREE.BoxGeometry(3,3,3), houseMat);
  const r = new THREE.Mesh(new THREE.ConeGeometry(2.2,1,4), roofMat);
  h.position.set(x,1.5,z); r.position.set(x,3.5,z); r.rotation.y=Math.PI/4;
  (isLeft? leftRoad: mainRoad).add(h,r);
}
for(let i=0;i<NUM_S;i+=4){
  const z = -i*SEG_L - SEG_L/2;
  [0, LEFT_X].forEach(baseX=>{
    const group = (baseX===0? mainRoad : leftRoad);
    const x = baseX + (baseX===0? ROAD_W/2+4 : -ROAD_W/2-4);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1,0.1,6),
      new THREE.MeshPhongMaterial({ color:0x222222 })
    );
    pole.position.set(x,3,z); group.add(pole);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.3,8,8),
      new THREE.MeshBasicMaterial({ color:0xffffe0 })
    );
    bulb.position.set(x,6,z); group.add(bulb);
    const pl = new THREE.PointLight(0xffffe0,1,20);
    pl.position.set(x,6,z); group.add(pl);
  });
};


// Класс частиц
    class Voxel {
  constructor(pos, color, size) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshBasicMaterial({ color: color, transparent: true })
    );
    this.mesh.position.copy(pos);
    this.vel = new THREE.Vector3();
    this.life = 1.0;
    this._startLife = this.life;
    scene.add(this.mesh);
  }
  update(dt) {
    this.mesh.position.addScaledVector(this.vel, dt);
    this.mesh.rotation.x += dt * 5;
    this.mesh.rotation.y += dt * 7;
    this.life -= dt;
    if (this.mesh.material) {
      this.mesh.material.opacity = Math.max(0, this.life / this._startLife);
    }
    if (this.life <= 0) {
      scene.remove(this.mesh);
      return false;
    }
    return true;
  }
}



// Игровые переменные
let car, npCars = [], voxels = [], shards = [];
let left=false, right=false, braking=false;
let brakeHeat=0, brakeOverheated=false, brakeCooldown=0, releaseTimer=0;
let speedFactor=1, score=0;
let spawnMain=0, spawnOpp=0;
let nextMain=Math.random()*2.5+0.5, nextOpp=Math.random()*2.5+0.5;
let extraSpawnMain=0, extraSpawnOpp=0;
let nextExtraMain=0.5+Math.random()*1.2, nextExtraOpp=0.5+Math.random()*1.2;
let voxelTimer=0, brakeParticleTimer=0;
const MAX_BTIME = 3, OVERHEAT_COOL_TIME = 5, RELEASE_DELAY = 1;
const HEAT_RATE = 100/MAX_BTIME, COOL_RATE = 100/OVERHEAT_COOL_TIME;
const MIN_SPEED = 0.3, LERP_TIME = 1.5;
const BRAKE_PARTICLE_INTERVAL = 0.1;
const BRAKE_PARTICLE_COLORS = [0x888888, 0xffffff];
const BRAKE_TILT = -0.1;
let nitroCharges = 0;
let nextChargeThreshold = 1000;
let nitroActive = false;
let nitroTimer = 0;
let nitroParticleTimer = 0;
const NITRO_DURATION = 5;
const NITRO_PARTICLE_INTERVAL = 0.05;
const NITRO_COLORS = [0xAFEEEE, 0x00CED1, 0x87CEFA, 0xFFFFFF];
const CAR_MAX_HEALTH = 100;
let carHealth = CAR_MAX_HEALTH;

// Функция обновления полосы здоровья
function updateHealthBar() {
  const pct = Math.max(0, Math.min(1, carHealth / CAR_MAX_HEALTH));
  healthFill.style.width = (pct*100)+"%";
  if (pct > 0.6) {
    healthFill.style.background = "#44ff44";
  } else if (pct > 0.3) {
    healthFill.style.background = "#fff044";
  } else {
    healthFill.style.background = "#ff4444";
  }
}
let isPaused = false;
let pauseSpinActive = false;
let pauseSpinAngle = 0;
let pauseSpinRadius = 14;
let pauseSpinHeight = 6;
let pauseSpinTarget = null;
let storedCamPos = new THREE.Vector3();
let storedCamQuat = new THREE.Quaternion();
let pauseSpinLastTs = 0;

// Нитро
let nitroFlight = false;
let nitroFlightTimer = 0;
const NITRO_FLIGHT_UP = 0.5;
const NITRO_FLIGHT_FLY = 4.0;
const NITRO_FLIGHT_DOWN = 0.5;
const NITRO_FLIGHT_TOTAL = NITRO_FLIGHT_UP + NITRO_FLIGHT_FLY + NITRO_FLIGHT_DOWN;
const NITRO_FLIGHT_HEIGHT = 0;
const NITRO_TILT = 0.15;


// Функции к нитро
function spawnNitroExplosion(pos) {
  const NITRO_EXPLOSION_COLORS = [0xffffff, 0xd3d3d3, 0x888888];
  for (let i = 0; i < 36; i++) {
    const color = NITRO_EXPLOSION_COLORS[Math.floor(Math.random()*NITRO_EXPLOSION_COLORS.length)];
    const size = 0.6 + Math.random() * 0.8;
    const p = new Voxel(pos.clone(), color, size);
    p.vel.set(
      (Math.random() - 0.5) * 7,
      Math.random() * 7 + 1,
      (Math.random() - 0.5) * 7 - 2
    );
    p.life = 0.7 + Math.random()*0.3;
    voxels.push(p);
  }
}

let nitroLiftExplosionFired = false;
let nitroLandExplosionFired = false;

// Управление
window.addEventListener('keydown', e => {
  if(isPaused) return;
  if(e.code === 'ArrowLeft') left = true;
  if(e.code === 'ArrowRight') right = true;
  if(e.code === 'ArrowDown'){
    e.preventDefault();
    if(!brakeOverheated) braking = true;
  }
  if(e.code === 'ArrowUp'){
    if(nitroCharges > 0 && !nitroActive && !nitroFlight){
      nitroCharges--;
      nitroCount.textContent = nitroCharges;
      nitroActive = true;
      nitroTimer = NITRO_DURATION;
      nitroBar.style.visibility = 'visible';
      nitroFill.style.width = '100%';
      nitroFlight = true;
      nitroFlightTimer = 0;
      nitroLiftExplosionFired = false;
      nitroLandExplosionFired = false;
    }
  }
  if(e.code === 'Escape'){
    if(!isPaused && !isGameOver){
      pauseGame();
      window.pauseGame = pauseGame;
    }
  }
});

window.addEventListener('keyup', e => {
  if(isPaused) return;
  if(e.code === 'ArrowLeft') left = false;
  if(e.code === 'ArrowRight') right = false;
  if(e.code === 'ArrowDown') braking = false;
});

// Перезапуск по кнопке
restartBtn.addEventListener('click', function(){
  if(isGameOver) restart();
}, window.restart = restart );


// Спавн НПС
function spawnNPC(x){
    let npc;
  if (Math.random() < 0.75) {
    npc = createNPCCar(); // 75% легковушка
  } else {
    npc = buildTruckCar(); // 25% грузовик
  }
  if(x < -14/2) npc.rotation.y = 0;
  const col = Math.random()*0xffffff;
  npc.children.forEach(c=>{
    if(c.geometry.parameters?.width === 3) c.material.color.setHex(col);
  });
  npc.position.set(x, 0, -40 * 10);
  scene.add(npc);
  npCars.push(npc);
}

// Плавный переход камеры
function animateCameraTransition(fromPos, toPos, fromQuat, toQuat, duration, onComplete) {
  const startTime = performance.now();
  function animateStep() {
    const now = performance.now();
    const t = Math.min((now - startTime) / duration, 1);
    camera.position.lerpVectors(fromPos, toPos, t);
    THREE.Quaternion.slerp(fromQuat, toQuat, camera.quaternion, t);
    renderer.render(scene, camera);
    if(t < 1) {
      requestAnimationFrame(animateStep);
    } else {
      if(onComplete) onComplete();
    }
  }
  animateStep();
}

// Вращение камеры при паузе
function pauseSpinLoop(ts) {
  if (!pauseSpinActive) return;
  if (!car) return;
  if (!pauseSpinTarget) {
    pauseSpinTarget = car.localToWorld(new THREE.Vector3(0, 1, 0));
  }
  if (!pauseSpinLastTs) pauseSpinLastTs = ts;
  let dAngle = ((ts - pauseSpinLastTs) / 1000) * 0.18 * Math.PI;
  pauseSpinAngle += dAngle;
  pauseSpinLastTs = ts;
  const x = pauseSpinTarget.x + pauseSpinRadius * Math.cos(pauseSpinAngle);
  const z = pauseSpinTarget.z + pauseSpinRadius * Math.sin(pauseSpinAngle);
  const y = pauseSpinTarget.y + pauseSpinHeight;
  camera.position.set(x, y, z);
  camera.lookAt(pauseSpinTarget.x, pauseSpinTarget.y + 1.0, pauseSpinTarget.z);
  renderer.render(scene, camera);
  requestAnimationFrame(pauseSpinLoop);
}

// Пауза игры
function pauseGame(){
  if(isPaused) return;
  isPaused = true;
  storedCamPos.copy(camera.position);
  storedCamQuat.copy(camera.quaternion);
  if (!car) {
    pauseMenu.style.display = 'block';
    openCustomBtn.style.display = 'block';
    return;
  }
  pauseSpinTarget = car.localToWorld(new THREE.Vector3(0, 1, 0));
  pauseSpinRadius = 14;
  pauseSpinHeight = 6;
  const rel = storedCamPos.clone().sub(pauseSpinTarget);
  pauseSpinAngle = Math.atan2(rel.z, rel.x);
  pauseSpinActive = true;
  pauseSpinLastTs = 0;
  pauseNickInput.value = playerNick;
  updatePauseRecord();
  pauseMenu.style.display = 'block';
  openCustomBtn.style.display = 'block';
  requestAnimationFrame(pauseSpinLoop);
}

// Продолжение игры
function resumeGame(){
  // Проверяем, введён ли ник
  let nick = pauseNickInput.value.trim();
  if (!nick) {
    pauseNickInput.focus();
    continueBtn.disabled = true;
    return;
  }
  pauseMenu.style.display = 'none';
  playerNick = nick;
  localStorage.setItem(KEY_NICK, playerNick);
  pauseSpinActive = false;
  let count = 3;
  countdownOverlay.style.display = 'block';
  countdownOverlay.textContent = count;
  const countInterval = 2000 / 3;
  const countdownTimer = setInterval(()=>{
    count--;
    if(count > 0) {
      countdownOverlay.textContent = count;
    } else {
      clearInterval(countdownTimer);
      countdownOverlay.style.display = 'none';
      // Возвращение камеры в исходное положение
      animateCameraTransition(
        camera.position.clone(), storedCamPos.clone(),
        camera.quaternion.clone(), storedCamQuat.clone(),
        500, ()=>{
          isPaused = false;
          clock.start();
          animate();
        }
      );
    }
  }, countInterval);
}
continueBtn.addEventListener('click', resumeGame);
const clock = new THREE.Clock();
let isGameOver = false;
function animate(){
  if (isPaused) return;
  if (isGameOver) return;
  const dt = clock.getDelta();

  if (car) {
    car.children.forEach(obj => {
      if(obj.userData.isFlag && obj.geometry instanceof THREE.PlaneGeometry){
        const t = performance.now() * 0.002;
        for(let i=0;i<obj.geometry.attributes.position.count;i++){
          const px = obj.geometry.attributes.position.getX(i);
          const py = obj.geometry.attributes.position.getY(i);
          const wave = Math.sin(t*4 + px*5) * 0.04 * (py+0.18);
          obj.geometry.attributes.position.setZ(i, wave);
        }
        obj.geometry.attributes.position.needsUpdate = true;
      }
      // ФИЗИКА ЦУРИКАВЫ
      if(obj.userData.isTsurikawa){
        const t = performance.now() * 0.003;
        obj.rotation.x = Math.sin(t)*0.7 + 0.4;
        obj.rotation.z = Math.cos(t*1.5)*0.2;
      }
    });
  }

  // Растягивание в нитро
  let nitroStretch = 1;
  if (nitroActive || nitroFlight) {
    nitroStretch = 1.5; // можно изменить на 2.0 или другое значение
  }
  // Плавное масштабирование вдоль Z
  if (car) {
    // Чтобы не было резких скачков, плавно lerp к цели:
    car.scale.z += (nitroStretch - car.scale.z) * 0.18;
    // Вернуть остальные оси к 1 на всякий случай
    car.scale.x += (1 - car.scale.x) * 0.18;
    car.scale.y += (1 - car.scale.y) * 0.18;
  }
  // --- конец изменений для растяжки ---

  let carLift = 0;
  if (nitroFlight) {
    nitroFlightTimer += dt;
    // НИЧЕГО не делаем с carLift (он всегда 0, взлетов больше нет)
    if(nitroFlightTimer<NITRO_FLIGHT_UP){
      if (!nitroLiftExplosionFired && car) {
        const pos = new THREE.Vector3();
        car.getWorldPosition(pos);
        pos.y = 0.9; 
        spawnNitroExplosion(pos);
        nitroLiftExplosionFired = true;
      }
    } else if(nitroFlightTimer<NITRO_FLIGHT_UP+NITRO_FLIGHT_FLY){
      // ничего
    } else if(nitroFlightTimer<NITRO_FLIGHT_TOTAL){
      if (!nitroLandExplosionFired && car) {
        const pos = new THREE.Vector3();
        car.getWorldPosition(pos);
        pos.y = 0.9;
        spawnNitroExplosion(pos);
        nitroLandExplosionFired = true;
      }
    } else {
      nitroFlight = false;
    }
    car.userData.nitroY = 0;
  } else {
    car.userData.nitroY = 0;
  }

  if(car){
    const c = (braking && !brakeOverheated) ? 0xff0000 : 0x550000;
    car.userData.brakeLights.forEach(l => l.material.color.setHex(c));
    const targetTilt =
      (nitroActive || nitroFlight) ? NITRO_TILT :
      (braking && !brakeOverheated) ? BRAKE_TILT : 0;
    car.rotation.x += (targetTilt - car.rotation.x) * dt * 5;
    let steerRollTarget = 0;
    if(left && !right) steerRollTarget = 0.32;
    else if(right && !left) steerRollTarget = -0.32;
    car.userData.currentRoll = car.userData.currentRoll + (steerRollTarget-car.userData.currentRoll)*dt*8;
    car.rotation.x += (targetTilt - car.rotation.x) * dt * 5;
    car.rotation.z = car.userData.currentRoll;
    car.position.y = 0.9; // фиксированная высота (раньше: car.userData.nitroY)
  }

  if (nitroFlight) {
    const carPos = new THREE.Vector3();
    car.getWorldPosition(carPos);
    let camTargetY = carPos.y + 4.8;
    let camTargetZ = camera.position.z;
    let camTargetX = car.position.x;
    camera.position.x += (camTargetX - camera.position.x) * dt * 3.5;
    camera.position.y += (camTargetY - camera.position.y) * dt * 3.5;
    camera.lookAt(carPos.x, carPos.y + 1.0, carPos.z - 6);
  } else {
    if (!isPaused && car) {
      let camTargetY = 5;
      let camTargetZ = 12;
      camera.position.y += (camTargetY - camera.position.y) * dt * 2;
      camera.position.z += (camTargetZ - camera.position.z) * dt * 2;
      camera.position.x += (car.position.x - camera.position.x) * dt * 3;
      camera.lookAt(car.position.x, car.position.y + 1.0, car.position.z - 6);
    }
  }

  if(!brakeOverheated){
    if(braking && !nitroFlight){
      releaseTimer = 0;
      brakeHeat += (100/MAX_BTIME) * dt;
      if(brakeHeat >= 100){
        brakeHeat = 100;
        brakeOverheated = true;
        braking = false;
        brakeCooldown = 0;
      }
    } else {
      releaseTimer += dt;
      if(releaseTimer > RELEASE_DELAY){
        brakeHeat -= (100/OVERHEAT_COOL_TIME) * dt;
        if(brakeHeat < 0) brakeHeat = 0;
      }
    }
  } else {
    brakeCooldown += dt;
    if(brakeCooldown >= OVERHEAT_COOL_TIME){
      brakeOverheated = false;
      brakeHeat = 0;
      releaseTimer = 0;
    }
  }
  const targetSpeed = (braking && !brakeOverheated && !nitroFlight) ? MIN_SPEED : 1;
  speedFactor += (targetSpeed - speedFactor) * (dt / LERP_TIME);
  brakeFill.style.width = brakeHeat + '%';
  if(brakeOverheated)       brakeFill.style.background = '#f00';
  else if(brakeHeat >= 50)  brakeFill.style.background = '#cc0';
  else                      brakeFill.style.background = '#fff';
  if(car){
    const c = (braking && !brakeOverheated) ? 0xff0000 : 0x550000;
    car.userData.brakeLights.forEach(l => l.material.color.setHex(c));
    const targetTilt = (braking && !brakeOverheated) ? BRAKE_TILT : 0;
    let steerRollTarget = 0;
    if(left && !right) steerRollTarget = 0.32;
    else if(right && !left) steerRollTarget = -0.32;
    car.userData.currentRoll = car.userData.currentRoll + (steerRollTarget-car.userData.currentRoll)*dt*8;
    car.rotation.x += (targetTilt - car.rotation.x) * dt * 5;
    car.rotation.z = car.userData.currentRoll;
    car.position.y = car.userData.nitroY;
  }
  if(braking && !brakeOverheated && !nitroFlight){
    brakeParticleTimer += dt;
    if(brakeParticleTimer > BRAKE_PARTICLE_INTERVAL){
      brakeParticleTimer = 0;
      car.userData.wheels.forEach(w => {
        const pos = new THREE.Vector3(); w.getWorldPosition(pos);
        for(const color of BRAKE_PARTICLE_COLORS){
          const size = 0.5 + Math.random()*0.3;
          const p = new Voxel(pos, color, size);
          p.vel.set((Math.random()-0.5)*5, Math.random()*2+2, -Math.random()*5);
          voxels.push(p);
        }
      });
    }
  }
  const effectiveSpeed = speedFactor * (nitroActive ? 3 : 1);
  score += 50 * effectiveSpeed * dt;
  const intScore = Math.floor(score);
  scoreEl.textContent = intScore;
  if(intScore >= nextChargeThreshold){
    nitroCharges++;
    nitroCount.textContent = nitroCharges;
    nextChargeThreshold += 1000;
  }
  if(nitroActive){
    nitroTimer -= dt;
    const pct = Math.max(nitroTimer / NITRO_DURATION * 100, 0);
    nitroFill.style.width = pct + '%';
    nitroParticleTimer += dt;
    if(nitroParticleTimer > NITRO_PARTICLE_INTERVAL){
      nitroParticleTimer = 0;
      const basePos = new THREE.Vector3(); car.getWorldPosition(basePos);
      basePos.y = car.position.y+0.2;
      for(let i=0; i<30; i++){
        const col = NITRO_COLORS[Math.floor(Math.random()*NITRO_COLORS.length)];
        const size = 0.1 + Math.random()*0.1;
        const p = new Voxel(basePos.clone(), col, size);
        p.mesh.position.x += (Math.random()*3 - 1.5);
        p.vel.set((Math.random()-0.5)*4, Math.random()*2, Math.random()*30+20);
        voxels.push(p);
      }
    }
    if(nitroTimer <= 0){
      nitroActive = false;
      nitroBar.style.visibility = 'hidden';
    }
  }
  const cyclePos = score % CYCLE_LENGTH;
  if(cyclePos <= DUSK_START){
    scene.background.copy(daySkyColor);
  } else if(cyclePos <= DUSK_END){
    const t = (cyclePos - DUSK_START) / TRANSITION_LENGTH;
    scene.background.copy(daySkyColor).lerp(nightSkyColor, t);
  } else if(cyclePos <= DAWN_START){
    scene.background.copy(nightSkyColor);
  } else {
    const t = (cyclePos - DAWN_START) / TRANSITION_LENGTH;
    scene.background.copy(nightSkyColor).lerp(daySkyColor, t);
  }
  if(cyclePos <= DUSK_START) starMat.opacity = 0;
  else if(cyclePos <= DUSK_END) starMat.opacity = (cyclePos - DUSK_START) / TRANSITION_LENGTH;
  else if(cyclePos <= DAWN_START) starMat.opacity = 1;
  else starMat.opacity = 1 - (cyclePos - DAWN_START) / TRANSITION_LENGTH;
  starMat.needsUpdate = true;
  const cloudMoveSpeed = 1.5 * dt;
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].position.x += cloudMoveSpeed * (0.5 + Math.random());
    if (clouds[i].position.x > 200) clouds[i].position.x = -200;
    let tNight = 0;
    if(cyclePos > DUSK_START && cyclePos <= DUSK_END){
      tNight = (cyclePos - DUSK_START) / TRANSITION_LENGTH;
    } else if(cyclePos > DUSK_END && cyclePos <= DAWN_START){
      tNight = 1;
    } else if(cyclePos > DAWN_START){
      tNight = Math.max(0, 1 - (cyclePos - DAWN_START) / TRANSITION_LENGTH);
    }
    clouds[i].children.forEach(mesh => {
      mesh.material.color.copy(new THREE.Color(0xffffff)).lerp(nightSkyColor, tNight);
    });
  }
  let tz = 12;
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, dt*0.5);
  if (cyclePos <= DUSK_START || cyclePos >= DAWN_START) {
    scene.fog = null;
  } else if (cyclePos <= DUSK_END) {
    const t = (cyclePos - DUSK_START) / TRANSITION_LENGTH;
    scene.fog = new THREE.FogExp2(0x000022, 0.001 * t);
  } else if (cyclePos <= DAWN_START) {
    scene.fog = new THREE.FogExp2(0x000022, 0.003);
  } else {
    const t = 1 - (cyclePos - DAWN_START) / TRANSITION_LENGTH;
    scene.fog = new THREE.FogExp2(0x000022, 0.001 * t);
  }
  const turnSpeed = (score>=500?15:10) * dt;
  if(left)  car.position.x -= turnSpeed;
  if(right) car.position.x += turnSpeed;
  car.position.x = THREE.MathUtils.clamp(car.position.x, -ROAD_W/2+1, ROAD_W/2-1);
  mainRoad.children.concat(leftRoad.children).forEach(o => {
    o.position.z += ((score<500?1:score<1000?1.5:score<1500?2:2.5)*200) * effectiveSpeed * dt;
    if(o.position.z > camera.position.z + SEG_L) o.position.z -= NUM_S*SEG_L;
  });
  spawnMain += dt;
  if(spawnMain > nextMain){
    spawnNPC((Math.random()*2-1)*(ROAD_W/2-1.5));
    spawnMain = 0; nextMain = Math.random()*2.5+0.5;
  }
  spawnOpp += dt;
  if(spawnOpp > nextOpp){
    spawnNPC(-18 + (Math.random()*(ROAD_W-3)-(ROAD_W-3)/2));
    spawnOpp = 0; nextOpp = Math.random()*2.5+0.5;
  }
  if (score >= 1500) {
    extraSpawnMain += dt;
    if (extraSpawnMain > nextExtraMain) {
      spawnNPC((Math.random()*2-1)*(ROAD_W/2-1.5));
      extraSpawnMain = 0; nextExtraMain = 0.5+Math.random()*1.2;
    }
    extraSpawnOpp += dt;
    if (extraSpawnOpp > nextExtraOpp) {
      spawnNPC(-18 + (Math.random()*(ROAD_W-3)-(ROAD_W-3)/2));
      extraSpawnOpp = 0; nextExtraOpp = 0.5+Math.random()*1.2;
    }
  } else {
    extraSpawnMain = 0; extraSpawnOpp = 0;
  }
  let collidedWithCar = false;
  for(let i=npCars.length-1; i>=0; i--){
    const npc = npCars[i];
    npc.position.z += ((score<500?1:score<1000?1.5:score<1500?2:2.5)*200) * effectiveSpeed * dt;
    if(npc.position.z > camera.position.z+10){
      scene.remove(npc);
      npCars.splice(i,1);
    } else {
      if (!collidedWithCar && carHealth > 0) {
        const hit = new THREE.Box3().setFromObject(car)
          .intersectsBox(new THREE.Box3().setFromObject(npc));
        if(hit && !nitroActive){
          if (score < 1000) {
            carHealth = Math.max(0, carHealth - CAR_MAX_HEALTH * 0.5);
            updateHealthBar();
            collidedWithCar = true;
          } else if (score < 2000) {
            carHealth = Math.max(0, carHealth - CAR_MAX_HEALTH * 0.9);
            updateHealthBar();
            collidedWithCar = true;
          } else {
            carHealth = 0;
            updateHealthBar();
            collidedWithCar = true;
          }
          if (carHealth <= 0) {
            endGame();
            return;
          }
          npc.position.z -= 6;
        }
      }
    }
  }
  guardrails.forEach(g => {
    const hit = new THREE.Box3().setFromObject(car)
      .intersectsBox(new THREE.Box3().setFromObject(g));
    if(hit && !nitroActive){
      const GUARDRAIL_DMG_RATE = 12;
      carHealth = Math.max(0, carHealth - GUARDRAIL_DMG_RATE * dt);
      updateHealthBar();
      if (carHealth <= 0) {
        endGame();
        return;
      }
      const side = g.position.x>0?1:-1;
      for(let k=0;k<10;k++){
        car.userData.wheels.forEach(w => {
          const pos = new THREE.Vector3(); w.getWorldPosition(pos);
          pos.x = g.position.x;
          const sp = new Voxel(pos, 0xffa500, 0.1);
          sp.vel.z = Math.random()*10+10;
          sp.vel.x = side*(Math.random()*2+1);
          voxels.push(sp);
        });
      }
    }
  });
  if(!nitroFlight){
    voxelTimer += dt;
    if(voxelTimer > 0.05){
      voxelTimer = 0;
      car.userData.wheels.forEach(w => {
        const pos = new THREE.Vector3(); w.getWorldPosition(pos);
        let col = 0x888888;
        if(score>=500){
          const arr=[0xffa500,0xff0000,0xffff00];
          col = arr[Math.floor(Math.random()*arr.length)];
        }
        const p = new Voxel(pos, col, 0.2);
        p.vel.z = Math.random()*10+10;
        voxels.push(p);
      });
    }
  }
  for(let i=0;i<voxels.length;i++){
    if(!voxels[i].update(dt)) { voxels.splice(i,1); i--; }
  }
  updateHealthBar();
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
function endGame(){
  isGameOver = true;
  gameOverEl.style.display = 'block';
  const ctr = new THREE.Vector3(); car.getWorldPosition(ctr);
  car.children.forEach(c => {
    const pos = new THREE.Vector3(); c.getWorldPosition(pos);
    const m = new THREE.Mesh(c.geometry.clone(), c.material.clone());
    m.position.copy(pos); scene.add(m);
    shards.push({ mesh:m, vel:new THREE.Vector3(
      (Math.random()-0.5)*10,
      Math.random()*10,
      -(Math.random()*10+5)
    )});
  });
  scene.remove(car);
  for(let i=0;i<80;i++){
    const size = 0.6+Math.random()*0.6;
    const colors=[0xffa500,0xff0000,0xffff00];
    const c = colors[Math.floor(Math.random()*colors.length)];
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(size,size,size),
      new THREE.MeshBasicMaterial({ color:c, transparent:true })
    );
    m.position.copy(ctr); scene.add(m);
    shards.push({ mesh:m, vel:new THREE.Vector3(
      (Math.random()-0.5)*15,
      Math.random()*15+5,
      -(Math.random()*15+5)
    )});
  }
  const exClock = new THREE.Clock();
  (function explodeAnim(){
    const dt = exClock.getDelta(), fade = exClock.elapsedTime/2;
    shards.forEach(s => {
      s.mesh.position.addScaledVector(s.vel, dt);
      s.vel.y -= 9.8*dt;
      s.mesh.rotation.x += dt*5;
      s.mesh.rotation.y += dt*5;
      if(s.mesh.material) s.mesh.material.opacity = Math.max(1-fade,0);
    });
    renderer.render(scene,camera);
    if(exClock.elapsedTime<2) requestAnimationFrame(explodeAnim);
  })();
  addToLB(playerNick, Math.floor(score));
  updatePauseRecord();
}
function restart(){
  isPaused = false;
  isGameOver = false;
  gameOverEl.style.display = 'none';
  shards.forEach(s => scene.remove(s.mesh)); shards=[];
  npCars.forEach(n => scene.remove(n)); npCars=[];
  voxels.forEach(v => scene.remove(v.mesh)); voxels=[];
  score = 0; speedFactor = 1;
  brakeHeat = 0; brakeOverheated = false; braking = false; releaseTimer = 0;
  nitroCharges = 0; nextChargeThreshold = 1000;
  nitroActive = false; nitroBar.style.visibility = 'hidden';
  nitroFlight = false; nitroFlightTimer = 0;
  scoreEl.textContent = '0'; nitroCount.textContent = '0';
  camera.position.set(0,5,12);
  carHealth = CAR_MAX_HEALTH;
  updateHealthBar();
  if (car) scene.remove(car);
  car = createCar(); scene.add(car);
  clock.start();
  animate();
}
scene.background = daySkyColor.clone();
carHealth = CAR_MAX_HEALTH;
updateHealthBar();
if (car) scene.remove(car);
clock.start();
car = createCar(); scene.add(car);

    // --- Первый запуск: показать меню кастома если нет сохраненного ---
// Показываем меню кастомизации при первом запуске, но пауза всегда активна
// Проверяем, есть ли сохранённый ник
let hasNick = !!localStorage.getItem(KEY_NICK);

restart();

if (!hasNick) {
  // Первый запуск: сразу показываем меню паузы и блокируем кнопку "Продолжить", пока не введён ник
  pauseGame();
  pauseNickInput.value = '';
  updateContinueBtnState();
  continueBtn.disabled = true;
  pauseNickInput.focus();

  // Следим за изменениями поля ника
  pauseNickInput.addEventListener('input', function checkNickInput() {
    let val = pauseNickInput.value.trim();
    continueBtn.disabled = !val;
    if (val.length > 0) {
      // Сохраняем ник и разрешаем продолжить
      localStorage.setItem(KEY_NICK, val);
      playerNick = val;
    }
  });
} else {
  // Ник уже есть, всё как обычно
  pauseNickInput.value = playerNick;
  updateContinueBtnState();
  pauseMenu.style.display = 'none';
}
  })();