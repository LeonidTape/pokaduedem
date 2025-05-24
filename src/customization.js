    const bodyLengthInput = document.getElementById('body-length');
    const cabLengthInput = document.getElementById('cab-length');
    const bodyLengthValue = document.getElementById('body-length-value');
    const cabLengthValue = document.getElementById('cab-length-value');
    const restartBtn = document.getElementById('__xYzRestartBtn');

// --- Кастомизация: сохранение/загрузка ---
    const CUSTOM_KEY = "nvb_car_custom";
    function getDefaultCustom() {
  return {
    carFlagType: "none",
    carFlagColor: "#ff0000",
    tsurikawaType: "none",
    tsurikawaColor: "#ffffff",
    plateText: "",
    colorBody: "#e74c3c",
    colorCab: "#3498db",
    colorWheels: "#333333",
    spoiler: "classic",
    bodyLength: 5,
    cabLength: 2.5,
    taillightColor: "#ff4444",
    wheelCamber: 0, // default 0°
  };
}
    function loadCustom() {
      try {
        let data = localStorage.getItem(CUSTOM_KEY);
        if (!data) return getDefaultCustom();
        return { ...getDefaultCustom(), ...JSON.parse(data) };
      } catch (e) { return getDefaultCustom(); }
    }
    function saveCustom(custom) {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
    }
    let carCustom = loadCustom();

    // --- МЕНЮ КАСТОМИЗАЦИИ ---
    const openCustomBtn = document.getElementById('open-custom-menu');
    const customMenu = document.getElementById('custom-menu');
    const customCloseBtn = document.getElementById('custom-close-btn');
    const customSaveBtn = document.getElementById('custom-save-btn');
    const colorBodyInput = document.getElementById('color-body');
    const colorCabInput = document.getElementById('color-cab');
    const colorWheelsInput = document.getElementById('color-wheels');
    const spoilerTypeInput = document.getElementById('spoiler-type');
    const carPreviewDiv = document.getElementById('custom-car-preview');
    const wheelCamberInput = document.getElementById('wheel-camber');
    const wheelCamberValue = document.getElementById('wheel-camber-value');
    const carFlagColorInput = document.getElementById('car-flag-color');
    const carFlagTypeInput = document.getElementById('car-flag-type');
    const tsurikawaColorInput = document.getElementById('tsurikawa-color');
    const tsurikawaTypeInput = document.getElementById('tsurikawa-type');
    const plateTextInput = document.getElementById('plate-text');
    const pauseMenu = document.getElementById('pause-menu');
    let previewScene, previewCamera, previewRenderer, previewCar;

    wheelCamberInput.addEventListener('input', () => {
  wheelCamberValue.textContent = wheelCamberInput.value + "°";
  updatePreview(); // функция, которая пересобирает 3D-превью машины
});
    function initPreview() {
      previewScene = new THREE.Scene();
      previewCamera = new THREE.PerspectiveCamera(50, carPreviewDiv.offsetWidth/carPreviewDiv.offsetHeight, 0.1, 100);
      previewCamera.position.set(0,2,7);
      previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias:true });
      previewRenderer.setSize(carPreviewDiv.offsetWidth, carPreviewDiv.offsetHeight);
      carPreviewDiv.innerHTML = "";
      carPreviewDiv.appendChild(previewRenderer.domElement);
      const light = new THREE.AmbientLight(0xffffff, 1.2);
      previewScene.add(light);
      const pl = new THREE.PointLight(0xffffff, 1, 20); pl.position.set(0,12,7);
      previewScene.add(pl);
      previewCar = buildCustomCar(carCustom, true);
      previewScene.add(previewCar);
      previewAnimate();
    }
    function previewAnimate() {
  // if (previewCar) previewCar.rotation.y += 0.018;
  previewRenderer.render(previewScene, previewCamera);
  requestAnimationFrame(previewAnimate);
  if (previewCar) {
    let isDraggingPreview = false;
let lastPreviewX = 0;
carPreviewDiv.addEventListener('mousedown', function(e) {
  isDraggingPreview = true;
  lastPreviewX = e.clientX;
});

document.addEventListener('mousemove', function(e) {
  if (isDraggingPreview && previewCar) {
    const dx = e.clientX - lastPreviewX;
    previewCar.rotation.y += dx * 0.00004;
    lastPreviewX = e.clientX;
  }
});

document.addEventListener('mouseup', function(e) {
  isDraggingPreview = false;
});
    previewCar.children.forEach(obj => {
      // ФИЗИКА ФЛАГА
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

    }
    function updatePreview() {
      previewScene.remove(previewCar);
      previewCar = buildCustomCar(getCustomFromInputs(), true);
      previewScene.add(previewCar);
    }
    function showCustomMenu() {
      customMenu.style.display = 'flex';
      colorBodyInput.value = carCustom.colorBody;
      colorCabInput.value = carCustom.colorCab;
      colorWheelsInput.value = carCustom.colorWheels;
      spoilerTypeInput.value = carCustom.spoiler;
      bodyLengthInput.value = carCustom.bodyLength;
      cabLengthInput.value = carCustom.cabLength;
      bodyLengthValue.textContent = carCustom.bodyLength;
      cabLengthValue.textContent = carCustom.cabLength;
      wheelCamberInput.value = carCustom.wheelCamber;
      carFlagColorInput.value = carCustom.carFlagColor;
      carFlagTypeInput.value = carCustom.carFlagType;
      tsurikawaColorInput.value = carCustom.tsurikawaColor;
      tsurikawaTypeInput.value = carCustom.tsurikawaType;
      plateTextInput.value = carCustom.plateText || "";
      wheelCamberValue.textContent = carCustom.wheelCamber + "°";
      customMenu.style.display = "flex";
      if (!previewScene) initPreview(); else updatePreview();
    }
    function hideCustomMenu() {
      customMenu.style.display = 'none';
    }
    function getCustomFromInputs() {
  return {
    carFlagType: carFlagTypeInput.value,
    carFlagColor: carFlagColorInput.value,
    tsurikawaType: tsurikawaTypeInput.value,
    tsurikawaColor: tsurikawaColorInput.value,
    plateText: plateTextInput.value.trim(),
    wheelCamber: parseInt(wheelCamberInput.value, 10),
    colorBody: colorBodyInput.value,
    colorCab: colorCabInput.value,
    colorWheels: colorWheelsInput.value,
    spoiler: spoilerTypeInput.value,
    bodyLength: parseFloat(bodyLengthInput.value),
    cabLength: parseFloat(cabLengthInput.value),
  };
}
openCustomBtn.addEventListener('click', e => {
      e.stopPropagation();
      pauseGame(); // если нужно ставить игру на паузу
      setTimeout(showCustomMenu, 0);
    });
    customCloseBtn.addEventListener('click', hideCustomMenu);

bodyLengthInput.addEventListener('input', () => {
  bodyLengthValue.textContent = bodyLengthInput.value;
  updatePreview();
});

    document.addEventListener('click', e => {
      if (customMenu.style.display === 'flex' && !customMenu.contains(e.target) && e.target !== openCustomBtn) {
        hideCustomMenu();
      }
    });

cabLengthInput.addEventListener('input', () => {
  cabLengthValue.textContent = cabLengthInput.value;
  updatePreview();
});
    customCloseBtn.addEventListener('click', hideCustomMenu);
    [colorBodyInput, colorCabInput, colorWheelsInput, spoilerTypeInput, carFlagColorInput, carFlagTypeInput, tsurikawaColorInput, tsurikawaTypeInput, plateTextInput].forEach(input => input.addEventListener('input', updatePreview));
    customSaveBtn.addEventListener('click', () => {
      carCustom = getCustomFromInputs();
      saveCustom(carCustom);
      restart();
      hideCustomMenu();
      pauseGame();
    });

 // --- КАСТОМИЗАЦИЯ КАРА ---
 function buildCustomCar(custom, forPreview=false) {
      // Если это NPC -- не кастом, только дефолт
      if (forPreview === "npc") custom = getDefaultCustom();

      const car = new THREE.Group(); car.rotation.y = Math.PI;
      // Кузов
      const body = new THREE.Mesh(new THREE.BoxGeometry(3,0.8,custom.bodyLength), new THREE.MeshPhongMaterial({ color: custom.colorBody }));
      body.position.y = 0.9;
      car.add(body);

      // Кабина (центрируем по кузову)
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2,0.7,custom.cabLength), new THREE.MeshPhongMaterial({ color: custom.colorCab, transparent: true, opacity: 0.7 }));
      cab.position.y = 1.45;
      // Центр кабины = зад кузова + половина кабины + смещение
      cab.position.z = (custom.bodyLength - custom.cabLength)/2 - custom.bodyLength/2 + custom.cabLength/2;
      car.add(cab);

      // Колеса — позиции зависят от длины кузова
      const wheelGeo = new THREE.CylinderGeometry(0.5,0.5,0.4,16);
      const wheelMat = new THREE.MeshPhongMaterial({ color:custom.colorWheels });
      car.userData.wheels = [];
      const halfBody = custom.bodyLength / 2;
const wheelPositions = [
  [-1.4, 0.5,  halfBody - 1], // переднее левое
  [ 1.4, 0.5,  halfBody - 1], // переднее правое
  [-1.4, 0.5, -halfBody + 1], // заднее левое
  [ 1.4, 0.5, -halfBody + 1], // заднее правое
];

    // Координаты трёх вершин треугольника (у основания машины слева, у основания машины справа, вершина "на ветру")
const triW = 0.55; // ширина у палки
const triH = 0.36; // высота флага

const positions = new Float32Array([
  0, 0, 0,                 // у палки, низ
  0, triH, 0,              // у палки, верх
  triW, triH/2, 0.09       // вершина на ветру, чуть вперёд по Z (волна)
]);
const indices = [0, 1, 2];
const flagGeo = new THREE.BufferGeometry();
flagGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
flagGeo.setIndex(indices);
flagGeo.computeVertexNormals();
// Передняя часть кузова (там же где передние колёса, но чуть выше)
const frontZ = halfBody - 0.18;
const flagBaseX = -1.26;  // чуть левее центра
const flagBaseY = 1.35;   // чуть выше капота
if (custom.carFlagType !== "none") {
  // Палка флага
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12),
    new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
  );
  stick.position.set(flagBaseX, flagBaseY + 0.45, frontZ);
  stick.rotation.z = Math.PI / 20; // лёгкий наклон
  car.add(stick);

  // Треугольный флаг
  const triW = 0.55, triH = 0.36;
  const positions = new Float32Array([
    0, 0, 0,
    0, triH, 0,
    triW, triH/2, 0.09
  ]);
  const indices = [0, 1, 2];
  const flagGeo = new THREE.BufferGeometry();
  flagGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  flagGeo.setIndex(indices);
  flagGeo.computeVertexNormals();

  let flagMat;
  if (custom.carFlagType === "checkered") {
    // Клетчатая текстура
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 18;
    const ctx = canvas.getContext('2d');
    for(let x=0;x<4;x++) for(let y=0;y<2;y++) {
      ctx.fillStyle = (x+y)%2===0 ? "#fff":"#222";
      ctx.fillRect(x*8, y*9, 8, 9);
    }
    flagMat = new THREE.MeshPhongMaterial({
      map: new THREE.CanvasTexture(canvas),
      side: THREE.DoubleSide
    });
  } else {
    flagMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(custom.carFlagColor),
      side: THREE.DoubleSide
    });
  }

  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(flagBaseX, flagBaseY + 0.7, frontZ + 0.05);
  flag.rotation.y = Math.PI / 1.3;
  flag.userData.isFlag = true;
  car.add(flag);
}
if (custom.tsurikawaType !== "none") {
  let shape;
if (custom.tsurikawaType === "circle")
  shape = new THREE.RingGeometry(0.10, 0.17, 32);
else if (custom.tsurikawaType === "heart") {
  // Контур сердца
  const x = 0, y = 0;
  const heartShape = new THREE.Shape();
  heartShape.moveTo(x, y + 0.10);
  heartShape.bezierCurveTo(x, y + 0.18, x - 0.14, y + 0.18, x - 0.14, y + 0.10);
  heartShape.bezierCurveTo(x - 0.14, y - 0.08, x, y - 0.16, x, y - 0.02);
  heartShape.bezierCurveTo(x, y - 0.16, x + 0.14, y - 0.08, x + 0.14, y + 0.10);
  heartShape.bezierCurveTo(x + 0.14, y + 0.18, x, y + 0.18, x, y + 0.10);

  // Внутреннее отверстие ("дырка")
  const hole = new THREE.Path();
  hole.moveTo(x, y + 0.09);
  hole.bezierCurveTo(x, y + 0.13, x - 0.10, y + 0.13, x - 0.10, y + 0.09);
  hole.bezierCurveTo(x - 0.10, y - 0.03, x, y - 0.08, x, y - 0.01);
  hole.bezierCurveTo(x, y - 0.08, x + 0.10, y - 0.03, x + 0.10, y + 0.09);
  hole.bezierCurveTo(x + 0.10, y + 0.13, x, y + 0.13, x, y + 0.09);
  heartShape.holes.push(hole);

  shape = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.012,
    bevelSegments: 2
  });
}
else if (custom.tsurikawaType === "star") {
  function createStarShape(points = 5, rOuter = 0.17, rInner = 0.08) {
    const shape = new THREE.Shape();
    const step = Math.PI / points;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? rOuter : rInner;
      const angle = i * step - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    // Внутренняя звезда-дырка
    const hole = new THREE.Path();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? rOuter * 0.55 : rInner * 0.55;
      const angle = i * step - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) hole.moveTo(x, y);
      else hole.lineTo(x, y);
    }
    hole.closePath();
    shape.holes.push(hole);

    return shape;
  }
  const starShape = createStarShape(5, 0.17, 0.08);
  shape = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.012,
    bevelSegments: 2
  });
}

  const tsMat = new THREE.MeshPhongMaterial({ color: new THREE.Color(custom.tsurikawaColor) });
  const ts = new THREE.Mesh(shape, tsMat);
  ts.position.set(-1.13, 0.5, -halfBody - 0.27);
  ts.userData.isTsurikawa = true;
  car.add(ts);
}

if (custom.plateText && custom.plateText.length > 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = "#000";
  ctx.font = "bold 65px Montserrat";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(custom.plateText, 128, 32);

  // Для отладки:
document.body.appendChild(canvas);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.01 });
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.16),
    textMat
  );
  textPlane.material.side = THREE.FrontSide;
  textPlane.position.set(0, 0.8, -halfBody - 0.1);
  textPlane.rotation.y = Math.PI;

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.18, 0.03),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
  );
  plate.position.set(0, 0.8, -halfBody - 0.04);

  //car.add(plate);
  car.add(textPlane);
}


for (let i = 0; i < wheelPositions.length; i++) {
  const p = wheelPositions[i];
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  // 1. Сначала развал по Z (наклон колеса)
  let camber = (custom.wheelCamber || 0) * (i % 2 === 0 ? 1 : -1);
  w.rotation.z = Math.PI/2 + THREE.MathUtils.degToRad(camber);
  // 2. Если нужно, можешь чуть сместить по X/Y, но это не обязательно
  w.position.set(...p);
  car.add(w); car.userData.wheels.push(w);
}

      // Спойлеры
      if (custom.spoiler === "classic") {
        const spoiler = new THREE.Mesh(new THREE.BoxGeometry(3,0.1,0.5), new THREE.MeshPhongMaterial({ color:0x222222 }));
        spoiler.position.set(0,1.6,-halfBody-0.2); car.add(spoiler);
      } else if (custom.spoiler === "big") {
        const spoiler = new THREE.Mesh(new THREE.BoxGeometry(3.6,0.18,0.7), new THREE.MeshPhongMaterial({ color:0x111111 }));
        spoiler.position.set(0,1.75,-halfBody-0.33); car.add(spoiler);
      } else if (custom.spoiler === "double") {
        for (let offset of [-0.25,0.25]) {
          const spoiler = new THREE.Mesh(new THREE.BoxGeometry(3,0.09,0.5), new THREE.MeshPhongMaterial({ color:0x333333 }));
          spoiler.position.set(0,1.6+offset,-halfBody-0.2-offset*2.5);
          car.add(spoiler);
        }
      } else if (custom.spoiler === "ducktail") {
        // Дактейл — изогнутый спойлер
        const ducktail = new THREE.Mesh(
          new THREE.BoxGeometry(3, 0.12, 0.5),
          new THREE.MeshPhongMaterial({ color: 0x444444 })
        );
        ducktail.position.set(0, 1.6, -halfBody-0.3);
        ducktail.rotation.x = Math.PI / 8;
        car.add(ducktail);
      } 
      // Задние фонари: строго на хвосте кузова
      const brMat = new THREE.MeshBasicMaterial({ color:0x550000 });
      const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.1,0.05), brMat.clone());
      f1.position.set(-1,1,-halfBody-0.03);
      const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.1,0.05), brMat.clone());
      f2.position.set(1,1,-halfBody-0.03);
      car.add(f1, f2);
      car.userData.brakeLights = [f1, f2];
      car.userData.currentRoll = 0;
      car.userData.nitroY = 0;
      return car;
    }
    function createCar(){ return buildCustomCar(carCustom, false); }
    function createNPCCar(){ return buildCustomCar(getDefaultCustom(), "npc"); }

    function buildTruckCar() {
  const car = new THREE.Group(); car.rotation.y = Math.PI;
  // Кузов (длиннее и выше)
  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 8), new THREE.MeshPhongMaterial({ color: 0x888888 }));
  body.position.y = 1.1; car.add(body);

  // Кабина (выделенная)
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.2, 2.3), new THREE.MeshPhongMaterial({ color: 0x333399, transparent: true, opacity: 0.7 }));
  cab.position.y = 1.7;
  cab.position.z = 2.8; // ближе к переду
  car.add(cab);

  // Колёса — больше и чуть дальше друг от друга
  const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.55, 16);
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
  let positions = [
    [-1.5, 0.4, 3.1], [1.5, 0.4, 3.1],
    [-1.5, 0.4, -2.8], [1.5, 0.4, -2.8]
  ];
  car.userData.wheels = [];
  for (const p of positions) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2; w.position.set(...p);
    car.add(w); car.userData.wheels.push(w);
  }

  // Задние фонари
  const brMat = new THREE.MeshBasicMaterial({ color: 0x550000 });
  const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), brMat.clone());
  f1.position.set(-1, 1.3, -4.1);
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), brMat.clone());
  f2.position.set( 1, 1.3, -4.1);
  car.add(f1, f2);
  car.userData.brakeLights = [f1, f2];

  return car;
}