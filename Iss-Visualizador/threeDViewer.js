import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// =======================================================
// ESTADO GLOBAL DO THREE.JS
// =======================================================
let scene, renderer, camera, controls;
let equipmentGroup;
let animationId;
let isExplodedState = false;
let isRotatingState = true;
let mountContainer;

// =======================================================
// FUNÇÕES AUXILIARES DE TEXTURAS E MATERIAIS
// =======================================================

/** Cria uma textura procedural de metal com ruído sutil para PBR. */
const createMetalTexture = (hexColor, roughness = 0.3) => {
    const color = new THREE.Color(hexColor);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = `#${color.getHexString()}`;
    ctx.fillRect(0, 0, 512, 512);
    
    // Adicionar ruído para textura e arranhões
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const brightness = Math.random() * 50 - 25;
      ctx.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 100})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
};

/** Cria uma textura procedural de fibra de carbono. */
const createCarbonTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 256, 256);
    
    // Padrão de fibra de carbono (weave pattern)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 256; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
};

/** Adiciona parafusos em um círculo */
const addBolts = (group, center, radius, count, component, offset) => {
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.9, roughness: 0.1 });
    const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8);
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(x, center.z, y);
        bolt.rotation.x = Math.PI / 2;
        bolt.userData = { component, offset };
        group.add(bolt);
    }
}


// =======================================================
// FUNÇÕES DE CRIAÇÃO DOS MODELOS (ALTA FIDELIDADE)
// =======================================================

// 0. SARJ (Mantido Perfeito)
const createSARJ = () => {
    const group = new THREE.Group();
    const C0 = 0x4A5568, C1 = 0x718096, C2 = 0x2D3748, C3 = 0xE53E3E, C4 = 0x3182CE; // Cores dos componentes
    
    // Anel externo com textura PBR
    const outerRingGeo = new THREE.TorusGeometry(3, 0.3, 24, 64);
    const outerRingMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.9, roughness: 0.2, map: createMetalTexture(C0)
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Race Ring' };
    group.add(outerRing);

    // Rolamentos (esferas e anéis de retenção)
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const offsetVector = new THREE.Vector3(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0);
      const pos = new THREE.Vector3(Math.cos(angle) * 3, Math.sin(angle) * 3, 0);
      
      const bearing = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 20, 20),
        new THREE.MeshStandardMaterial({ color: C1, metalness: 0.95, roughness: 0.05, envMapIntensity: 1.5 })
      );
      bearing.position.copy(pos);
      bearing.userData = { component: 1, offset: offsetVector, name: 'Bearing' };
      group.add(bearing);
      
      const bearingRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.02, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.9, roughness: 0.1 })
      );
      bearingRing.position.copy(pos);
      bearingRing.rotation.x = Math.PI / 2;
      bearingRing.userData = { component: 1, offset: offsetVector };
      group.add(bearingRing);
    }

    // Motor BAPTA (cilindro principal)
    const motorMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.7, roughness: 0.4, map: createMetalTexture(C2)
    });
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.2, 32), motorMat);
    motor.rotation.x = Math.PI / 2;
    motor.userData = { component: 2, offset: new THREE.Vector3(0, 0, 1.8), name: 'Motor BAPTA' };
    group.add(motor);

    // Sistema de lubrificação (tubos com emissivo sutil)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const offsetVector = new THREE.Vector3(Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0);
      const pos = new THREE.Vector3(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0);

      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.5, 16),
        new THREE.MeshStandardMaterial({ color: C3, metalness: 0.6, roughness: 0.4, emissive: 0x7f1d1d, emissiveIntensity: 0.1 })
      );
      tube.position.copy(pos);
      tube.rotation.z = angle + Math.PI / 2;
      tube.userData = { component: 3, offset: offsetVector, name: 'Lube Line' };
      group.add(tube);
    }

    // Sensores Resolver (com LED funcional)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const offsetVector = new THREE.Vector3(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0.9);
      const pos = new THREE.Vector3(Math.cos(angle) * 3.2, Math.sin(angle) * 3.2, 0.4);

      const sensor = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.25),
        new THREE.MeshStandardMaterial({ color: C4, metalness: 0.5, roughness: 0.6, emissive: 0x2563eb, emissiveIntensity: 0.3 })
      );
      sensor.position.copy(pos);
      sensor.userData = { component: 4, offset: offsetVector, name: 'Resolver' };
      group.add(sensor);
      
      // LED emissivo
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.5 })
      );
      led.position.set(pos.x, pos.y, 0.55);
      led.userData = { component: 4, offset: offsetVector };
      group.add(led);
    }
    return group;
};

// 1. WPA - Detalhe Aprimorado
const createWPA = () => {
    const group = new THREE.Group();
    const C0 = 0x2C5282, C1 = 0x4299E1, C2 = 0x90CDF4, C3 = 0x805AD5, C4 = 0x38B2AC; // Cores dos componentes

    const offsetTank = new THREE.Vector3(-1.5, 0, 0);
    const offsetPump = new THREE.Vector3(0, 1.5, 0);
    const offsetReactor = new THREE.Vector3(1.5, 0, 0);

    // 0. Estrutura Base (Rack)
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.9, roughness: 0.15 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.5, 1.5), rackMat);
    rack.scale.set(1, 1, 0.05);
    rack.position.y = -1.75;
    rack.userData = { component: 5, offset: new THREE.Vector3(0, 0, 0), name: 'Support Rack' };
    group.add(rack);


    // 1. Tanque Principal (0) - Com parafusos e flanges
    const tankMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.8, roughness: 0.2, map: createMetalTexture(C0)
    });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.8, 32), tankMat);
    tank.position.add(offsetTank);
    tank.userData = { component: 0, offset: offsetTank, name: 'Wastewater Tank' };
    group.add(tank);
    addBolts(group, tank.position, 0.7, 12, 0, offsetTank); // Parafusos na tampa

    // 2. Bomba Centrífuga (1) - Motor detalhado e entrada/saída
    const pumpMat = new THREE.MeshStandardMaterial({ 
      color: C1, metalness: 0.85, roughness: 0.15, map: createMetalTexture(C1)
    });
    const pumpHousing = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.2, 16, 32), pumpMat);
    pumpHousing.position.set(offsetPump.x, offsetPump.y, offsetPump.z + 0.2);
    pumpHousing.userData = { component: 1, offset: offsetPump, name: 'Pump Housing' };
    group.add(pumpHousing);
    // Motor da bomba (com bobina emissiva)
    const motorMat = new THREE.MeshStandardMaterial({ 
      color: 0x2563eb, metalness: 0.7, roughness: 0.3, emissive: 0x1e40af, emissiveIntensity: 0.4
    });
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32), motorMat);
    motor.rotation.x = Math.PI / 2;
    motor.position.set(offsetPump.x + 0.4, offsetPump.y, offsetPump.z + 0.2);
    motor.userData = { component: 1, offset: offsetPump };
    group.add(motor);


    // 3. Filtros MF (2) - Múltiplos estágios com conexões
    const filterGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const filterBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.7, 24),
        new THREE.MeshStandardMaterial({ color: C2, metalness: 0.5, roughness: 0.6, transparent: true, opacity: 0.8 })
      );
      filterBody.position.y = -1.2 + i * 0.8;
      filterBody.userData = { component: 2, offset: offsetReactor, name: `Filter Stage ${i+1}` };
      filterGroup.add(filterBody);
      addBolts(filterGroup, filterBody.position, 0.35, 8, 2, offsetReactor);
    }
    filterGroup.position.add(offsetReactor);
    group.add(filterGroup);


    // 4. Reator Catalítico (3) - Superfície texturizada e emissão de calor
    const reactorMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.6, roughness: 0.3, emissive: 0x6b21a8, emissiveIntensity: 0.4, map: createMetalTexture(C3)
    });
    const reactor = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), reactorMat);
    reactor.position.set(offsetReactor.x, offsetReactor.y + 1.5, offsetReactor.z);
    reactor.userData = { component: 3, offset: offsetReactor, name: 'Catalyst Reactor' };
    group.add(reactor);
    

    // 5. Tubulação (Nova adição para detalhes)
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 });
    const createPipe = (start, end) => {
        const path = new THREE.CatmullRomCurve3([start, end]);
        const geometry = new THREE.TubeGeometry(path, 20, 0.05, 8, false);
        const mesh = new THREE.Mesh(geometry, pipeMat);
        mesh.userData = { component: 5, offset: new THREE.Vector3(0, 0, 0) };
        group.add(mesh);
    };

    // Tank -> Pump (Linha 1)
    createPipe(new THREE.Vector3(offsetTank.x, 1.4, 0.4), new THREE.Vector3(offsetPump.x - 0.5, offsetPump.y + 0.4, 0.4));
    // Pump -> Filters (Linha 2)
    createPipe(new THREE.Vector3(offsetPump.x + 0.5, offsetPump.y + 0.4, 0.4), new THREE.Vector3(offsetReactor.x - 0.5, 0.5, 0.4));
    // Filters -> Reactor (Linha 3)
    createPipe(new THREE.Vector3(offsetReactor.x, filterGroup.children[2].position.y, 0.4), new THREE.Vector3(reactor.position.x, reactor.position.y - 0.7, 0.4));

    // 6. Sensor de Condutividade (4) - Detalhado
    const sensorMat = new THREE.MeshStandardMaterial({ 
      color: C4, metalness: 0.5, roughness: 0.6, emissive: 0x14b8a6, emissiveIntensity: 0.8
    });
    const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.15), sensorMat);
    sensor.position.set(offsetTank.x, offsetTank.y + 1.6, offsetTank.z + 0.4);
    sensor.userData = { component: 4, offset: offsetTank, name: 'Conductivity Sensor' };
    group.add(sensor);

    return group;
};


// 2. PUMP - Detalhe Aprimorado
const createPump = () => {
    const group = new THREE.Group();
    const C0 = 0x2D3748, C1 = 0x4A5568, C2 = 0xE53E3E, C3 = 0x718096, C4 = 0x48BB78; // Cores dos componentes
    
    const offsetMotor = new THREE.Vector3(0, 0, -1.0);
    const offsetImpeller = new THREE.Vector3(0, 0, 1.0);

    // 0. Carcaça Principal (0) - Com Flanges e Parafusos
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.85, roughness: 0.25, map: createMetalTexture(C0)
    });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 2.0, 32), housingMat);
    housing.rotation.x = Math.PI / 2;
    housing.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Housing' };
    group.add(housing);
    addBolts(group, new THREE.Vector3(0, 0.9, 0), 1.05, 16, 0, new THREE.Vector3(0, 0.5, 0)); // Flange de entrada
    addBolts(group, new THREE.Vector3(0, -0.9, 0), 1.05, 16, 0, new THREE.Vector3(0, -0.5, 0)); // Flange de saída

    // 1. Impeller (1) - Pás mais complexas
    const impellerMat = new THREE.MeshStandardMaterial({ 
      color: C1, metalness: 0.98, roughness: 0.05 
    });
    
    // Hub
    const impellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 24), impellerMat);
    impellerHub.position.y = 0;
    impellerHub.userData = { component: 1, offset: offsetImpeller, name: 'Impeller' };
    group.add(impellerHub);

    // Pás helicoidais (6)
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        
        const bladeGeo = new THREE.BoxGeometry(0.1, 0.7, 0.3);
        const blade = new THREE.Mesh(bladeGeo, impellerMat);
        
        blade.position.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5);
        blade.rotation.y = angle;
        blade.rotation.x = Math.PI / 8; // Leve inclinação helicoidal
        
        blade.userData = { component: 1, offset: offsetImpeller };
        group.add(blade);
    }
    
    // 2. Motor BLDC (2) - Aletas de Refrigeração
    const motorMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.7, roughness: 0.35, emissive: 0x991b1b, emissiveIntensity: 0.2, map: createMetalTexture(C2)
    });
    const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 32), motorMat);
    motorBody.position.add(offsetMotor);
    motorBody.rotation.x = Math.PI / 2;
    motorBody.userData = { component: 2, offset: offsetMotor, name: 'BLDC Motor' };
    group.add(motorBody);
    
    // Aletas de refrigeração (12)
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const fin = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.8, 0.3),
            motorMat
        );
        fin.position.set(Math.cos(angle) * 0.7, offsetMotor.y, Math.sin(angle) * 0.7);
        fin.rotation.y = angle;
        fin.userData = { component: 2, offset: offsetMotor };
        group.add(fin);
    }

    // 3. Selo Mecânico (3)
    const sealMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.95, roughness: 0.05, envMapIntensity: 2.0 
    });
    const sealOuter = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 20, 32), sealMat);
    sealOuter.position.z = 0;
    sealOuter.userData = { component: 3, offset: new THREE.Vector3(0, 0, 0), name: 'Mech Seal' };
    group.add(sealOuter);

    // 4. Controlador VFD (4) - Caixa detalhada com conectores
    const controllerMat = new THREE.MeshStandardMaterial({ 
      color: C4, metalness: 0.5, roughness: 0.6, emissive: 0x16a34a, emissiveIntensity: 0.4
    });
    const controllerBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.35), controllerMat);
    controllerBox.position.set(1.4, 0.5, 0);
    controllerBox.userData = { component: 4, offset: new THREE.Vector3(1.0, 0.5, 0), name: 'VFD' };
    group.add(controllerBox);
    
    // Conectores de cabo (4)
    for (let i = 0; i < 4; i++) {
        const connector = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.8, roughness: 0.3 })
        );
        connector.position.set(1.4, 0.5 - 0.25 + i * 0.15, -0.3);
        connector.userData = { component: 4, offset: new THREE.Vector3(1.0, 0.5, 0) };
        group.add(connector);
    }

    return group;
};


// 3. CMG - Detalhe Aprimorado (Estrutura e Rotor)
const createCMG = () => {
    const group = new THREE.Group();
    // C0: Rotor (Carbono Azul), C1: Eixo (Metal Escuro), C2: Gimbal (Metal Azul Claro), C3: Motor Principal (Vermelho Emissivo), C4: Motores de Torque (Laranja), C5: Eletrônica (Verde)
    const C0 = 0x2C5282, C1 = 0x718096, C2 = 0x4299E1, C3 = 0xE53E3E, C4 = 0xF59E0B, C5 = 0x48BB78; 

    // 0. Base de Suporte (Nova adição para estabilidade)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.9, roughness: 0.1 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.2, 4.0), baseMat);
    base.position.y = -2.0;
    base.userData = { component: 6, offset: new THREE.Vector3(0, -2.0, 0), name: 'Mounting Base' };
    group.add(base);

    // 1. Flywheel (Rotor) (0) - Detalhe do cubo central e carbono extremo
    const carbonTexture = createCarbonTexture();
    const rotorMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.98, roughness: 0.01, map: carbonTexture, // PBR de Carbono de Alto Brilho
    });
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.6, 64), rotorMat);
    rotor.rotation.x = Math.PI / 2;
    rotor.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Flywheel' };
    group.add(rotor);
    
    // Cubo central do rotor (metal)
    const rotorHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.1 })
    );
    rotorHub.rotation.x = Math.PI / 2;
    rotorHub.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0) };
    group.add(rotorHub);
    addBolts(group, new THREE.Vector3(0, 0, 0), 0.2, 8, 0, new THREE.Vector3(0, 0, 0)); // Parafusos do cubo
    
    // 2. Eixo e Bearings (1)
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 3.0, 32),
      new THREE.MeshStandardMaterial({ color: C1, metalness: 0.9, roughness: 0.2 })
    );
    axle.rotation.x = Math.PI / 2;
    axle.userData = { component: 1, offset: new THREE.Vector3(0, 0, 0), name: 'Axle' };
    group.add(axle);
    
    // 3. Estrutura Gimbal (2) - Mais espessa e detalhada
    const gimbalMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.85, roughness: 0.2, transparent: true, opacity: 0.9 // Semitransparente para ver o rotor
    });
    
    // Anel interno (Pitch/Yaw) - Conectado ao eixo por rolamentos visíveis
    const innerGimbal = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.2, 16, 64), gimbalMat); // Mais espesso
    innerGimbal.rotation.x = Math.PI / 2;
    innerGimbal.userData = { component: 2, offset: new THREE.Vector3(0, 0, 0), name: 'Inner Gimbal' };
    group.add(innerGimbal);

    // Anel externo (Roll) - Conectado à base
    const outerGimbal = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.15, 16, 64), gimbalMat); // Mais espesso
    outerGimbal.rotation.y = Math.PI / 2;
    outerGimbal.userData = { component: 2, offset: new THREE.Vector3(0, 0, 0), name: 'Outer Gimbal' };
    group.add(outerGimbal);
    
    // 4. Spin Motor (3) - Embutido e emissivo
    const spinMotorMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.7, roughness: 0.35, emissive: 0x991b1b, emissiveIntensity: 0.5 // Emissão para parecer ativo
    });
    const spinMotorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 32), spinMotorMat);
    spinMotorBody.rotation.x = Math.PI / 2;
    spinMotorBody.userData = { component: 3, offset: new THREE.Vector3(0, 0, 0), name: 'Spin Motor' };
    group.add(spinMotorBody);

    // 5. Torque Motors (4) - Atuadores detalhados com pinos de articulação
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const offsetVector = new THREE.Vector3(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0);

      // Corpo do atuador (Servo motor)
      const torqueMotorMat = new THREE.MeshStandardMaterial({ 
        color: C4, metalness: 0.7, roughness: 0.3, emissive: 0x92400e, emissiveIntensity: 0.3 // Cor de cobre/elétrica
      });
      const torqueMotor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), torqueMotorMat);
      torqueMotor.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
      torqueMotor.rotation.z = angle + Math.PI / 2;
      torqueMotor.userData = { component: 4, offset: offsetVector, name: 'Torque Motor' };
      group.add(torqueMotor);
      
      // Pino de articulação (detalhe mecânico)
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
        baseMat
      );
      pin.rotation.z = Math.PI / 2;
      pin.position.set(torqueMotor.position.x - 0.25 * Math.cos(angle), torqueMotor.position.y - 0.25 * Math.sin(angle), 0);
      pin.userData = { component: 4, offset: offsetVector };
      group.add(pin);
    }

    // 6. IMU + Electronics (5) - Caixa com indicadores
    const electronicsMat = new THREE.MeshStandardMaterial({ 
      color: C5, metalness: 0.5, roughness: 0.6, emissive: 0x16a34a, emissiveIntensity: 0.5
    });
    const electronicsBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.5), electronicsMat);
    electronicsBox.position.set(0, 0, 1.5);
    electronicsBox.userData = { component: 5, offset: new THREE.Vector3(0, 0, 1.5), name: 'IMU & Cntl' };
    group.add(electronicsBox);

    return group;
};


// 4. OGS - Detalhe Aprimorado (Trocador de Calor e Linhas)
const createOGS = () => {
    const group = new THREE.Group();
    const C0 = 0x2C5282, C1 = 0x4299E1, C2 = 0x90CDF4, C3 = 0x38B2AC, C4 = 0x48BB78, C5 = 0xF59E0B; // Cores dos componentes

    const offsetElectrolyzer = new THREE.Vector3(0, 0.5, 0);
    const offsetExchanger = new THREE.Vector3(0, -1.5, 0);

    // 0. Estrutura Rack (metal escuro)
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.9, roughness: 0.1 });
    const rack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.5, 1.8), rackMat);
    rack.scale.set(1.05, 1.05, 1.05);
    rack.geometry.translate(0, 0, 0);
    rack.material.transparent = true;
    rack.material.opacity = 0.1; // Transparência para ver o interior
    rack.userData = { component: 6, offset: new THREE.Vector3(0, 0, 0), name: 'Protective Frame' };
    group.add(rack);

    // 1. Módulo Principal (Electrolyzer) (0) - Com parafusos de acesso
    const moduleMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.8, roughness: 0.4, map: createMetalTexture(C0)
    });
    const module = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 1.5), moduleMat);
    module.position.add(offsetElectrolyzer);
    module.userData = { component: 0, offset: offsetElectrolyzer, name: 'Electrolyzer Module' };
    group.add(module);
    addBolts(group, new THREE.Vector3(-1.25 + offsetElectrolyzer.x, 0.75 + offsetElectrolyzer.y, 0), 0.1, 4, 0, offsetElectrolyzer);

    // 2. Stack de Células PEM (1) - Empilhamento mais visual
    const cellStackGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) { // Mais células
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.0, 0.05),
        new THREE.MeshStandardMaterial({ 
          color: C1, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.8, emissive: 0x4299e1, emissiveIntensity: 0.1
        })
      );
      cell.position.z = -0.6 + i * 0.1;
      cellStackGroup.add(cell);
    }
    cellStackGroup.position.set(1.25 + offsetElectrolyzer.x, offsetElectrolyzer.y, offsetElectrolyzer.z);
    cellStackGroup.rotation.y = Math.PI / 2;
    cellStackGroup.userData = { component: 1, offset: new THREE.Vector3(1.5, 0, 0).add(offsetElectrolyzer), name: 'PEM Stack' };
    group.add(cellStackGroup);

    // 3. Separador Ciclônico (2) - Conexões detalhadas
    const separatorMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.7, roughness: 0.5, map: createMetalTexture(C2)
    });
    const separator = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.7, 1.2, 32), separatorMat);
    separator.position.set(-1.0 + offsetElectrolyzer.x, 1.5 + offsetElectrolyzer.y, -0.5);
    separator.rotation.x = -Math.PI / 6;
    separator.userData = { component: 2, offset: new THREE.Vector3(-1.0, 1.0, -0.5).add(offsetElectrolyzer), name: 'Gas Separator' };
    group.add(separator);

    // 4. Trocador de Calor (3) - Aletas visíveis
    const exchangerMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.9, roughness: 0.1, map: createMetalTexture(C3)
    });
    const exchangerBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 1.5), exchangerMat);
    exchangerBody.position.add(offsetExchanger);
    exchangerBody.userData = { component: 3, offset: offsetExchanger, name: 'Heat Exchanger' };
    group.add(exchangerBody);
    
    // Aletas (20)
    for (let i = 0; i < 20; i++) {
        const fin = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 0.5, 1.3),
            exchangerMat
        );
        fin.position.set(-0.95 + i * 0.1, offsetExchanger.y, offsetExchanger.z);
        fin.userData = { component: 3, offset: offsetExchanger };
        group.add(fin);
    }
    
    // 5. Regulador de Pressão (4)
    const regulatorMat = new THREE.MeshStandardMaterial({ 
      color: C4, metalness: 0.7, roughness: 0.3, emissive: 0x16a34a, emissiveIntensity: 0.3
    });
    const regulator = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32), regulatorMat);
    regulator.position.set(-1.0 + offsetElectrolyzer.x, -0.5 + offsetElectrolyzer.y, 0.8);
    regulator.userData = { component: 4, offset: new THREE.Vector3(-1.0, -0.5, 0.8).add(offsetElectrolyzer), name: 'Regulator' };
    group.add(regulator);

    // 6. Sensores de Gás (5) - Indicadores LED
    for (let i = 0; i < 3; i++) {
      const sensorOffset = new THREE.Vector3(-0.5 + i * 0.5, 0.5, 0.8).add(offsetElectrolyzer);
      const sensorBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.15),
        new THREE.MeshStandardMaterial({ color: C5, metalness: 0.5, roughness: 0.6, emissive: 0xf59e0b, emissiveIntensity: 0.5 })
      );
      sensorBox.position.copy(sensorOffset);
      sensorBox.userData = { component: 5, offset: sensorOffset, name: `Gas Sensor ${i+1}` };
      group.add(sensorBox);
    }

    // 7. Tubulação de Processo (Nova adição)
    const O2pipeMat = new THREE.MeshStandardMaterial({ color: 0x3182ce, metalness: 0.9, roughness: 0.1 }); // Azul O2
    const H2pipeMat = new THREE.MeshStandardMaterial({ color: 0xe53e3e, metalness: 0.9, roughness: 0.1 }); // Vermelho H2

    // Linha de O2: Separador -> Exchanger -> Regulador
    const createPipe = (start, end, material) => {
        const path = new THREE.CatmullRomCurve3([start, end]);
        const geometry = new THREE.TubeGeometry(path, 20, 0.05, 8, false);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { component: 6, offset: new THREE.Vector3(0, 0, 0) };
        group.add(mesh);
    };

    const sepPos = separator.position.clone().add(new THREE.Vector3(0, 0.6, 0));
    const regPos = regulator.position.clone();
    const exchPos = exchangerBody.position.clone().add(new THREE.Vector3(0, 0.3, 0.6));

    createPipe(sepPos, new THREE.Vector3(sepPos.x, sepPos.y + 0.3, sepPos.z), O2pipeMat);
    createPipe(new THREE.Vector3(sepPos.x, sepPos.y + 0.3, sepPos.z), exchPos, O2pipeMat);
    createPipe(exchPos.add(new THREE.Vector3(0, 0, -0.2)), regPos.add(new THREE.Vector3(0, 0.3, 0)), O2pipeMat);

    // Linha de H2: Separador -> Exaustão
    const H2start = separator.position.clone().add(new THREE.Vector3(0, -0.6, 0));
    createPipe(H2start, H2start.add(new THREE.Vector3(-0.5, -0.5, -0.5)), H2pipeMat);


    return group;
};

const equipmentCreators = {
    sarj: createSARJ,
    wpa: createWPA,
    pump: createPump,
    cmg: createCMG,
    ogs: createOGS,
};


// =======================================================
// FUNÇÕES PÚBLICAS (IMPORTADAS PELO APP.JSX)
// =======================================================

/** Inicializa o ambiente Three.js */
export const initThreeJS = (container) => {
    if (mountContainer) return; // Evita inicialização dupla
    mountContainer = container;

    // Scene (Fundo escuro para destacar o PBR)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); 

    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(6, 4, 9);

    // Renderer (Com correção de exposição)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.8; // CORREÇÃO MANTIDA: Aumentado para 2.8 para evitar modelos escuros
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // Lighting (Iluminação forte para metais PBR)
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    scene.add(new THREE.HemisphereLight(0xeeeeee, 0xaaaaaa, 1.5));

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight2.position.set(-10, 5, -10);
    scene.add(dirLight2);
    
    // Grid Helper (Grade Quadriculada como no AppV7)
    const size = 10;
    const divisions = 20; // 20 linhas por lado para um visual mais denso
    const colorCenterLine = 0x2d3748; // Cor da linha central (cinza escuro/azulado)
    const colorGrid = 0x1a202c; // Cor das linhas da grade (quase preto)
    
    const gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
    gridHelper.position.y = -0.01; // Move ligeiramente para baixo para evitar Z-fighting
    scene.add(gridHelper);
    // FIM Grid Helper

    const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();

        if (equipmentGroup) {
            if (isRotatingState) {
                equipmentGroup.rotation.y += 0.005;
            }

            // Transição suave para visão explodida
            const factor = isExplodedState ? 0.7 : 0; 
            equipmentGroup.children.forEach(child => {
                // Previne erro se offset não estiver definido
                if (child.userData.offset) { 
                    const targetPos = new THREE.Vector3(0, 0, 0);
                    const originalOffset = child.userData.offset || new THREE.Vector3(0, 0, 0);
                    targetPos.copy(originalOffset).multiplyScalar(factor);
                    child.position.lerp(targetPos, 0.1);
                }
            });
        }

        renderer.render(scene, camera);
    };

    animate();
    
    // Adiciona listener de redimensionamento
    const handleResize = () => {
        if (mountContainer) {
            camera.aspect = mountContainer.clientWidth / mountContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountContainer.clientWidth, mountContainer.clientHeight);
        }
    };
    window.addEventListener('resize', handleResize);
};


/** Carrega o modelo 3D baseado no ID */
export const loadModel = (id, isExploded, isRotating, resetCamera = false) => {
    if (!scene) return; 

    if (equipmentGroup) {
        scene.remove(equipmentGroup);
    }
    
    isExplodedState = isExploded;
    isRotatingState = isRotating;

    const creator = equipmentCreators[id];
    if (creator) {
        equipmentGroup = creator();
        scene.add(equipmentGroup);

        if (resetCamera || !controls) {
            controls.reset();
            camera.position.set(6, 4, 9);
            controls.target.set(0, 0, 0);
        }
    }
};

/** Define o estado de explosão (separação das peças) */
export const setExplosionState = (state) => {
    isExplodedState = state;
};

/** Define o estado de rotação automática */
export const setRotationState = (state) => {
    isRotatingState = state;
};

/** Exporta o modelo atual para GLB */
export const exportModelGLB = (fileName) => {
    if (!equipmentGroup) {
      console.error("Nenhum equipamento carregado para exportar.");
      return;
    }

    const exporter = new GLTFExporter();
    const options = { binary: true };

    // Clona o grupo e o coloca na posição não-explodida para exportação
    const exportGroup = equipmentGroup.clone();
    exportGroup.traverse((child) => {
      if (child.userData.offset) {
        child.position.copy(new THREE.Vector3(0, 0, 0)); 
      }
    });

    exporter.parse(
      exportGroup,
      (glb) => {
        const blob = new Blob([glb], { type: 'model/gltf-binary' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}_3d_model.glb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Erro ao exportar GLB:', error);
      },
      options
    );
};