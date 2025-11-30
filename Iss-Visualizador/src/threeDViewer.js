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

// =======================================================
// FUNÇÕES DE CRIAÇÃO DOS MODELOS (ALTA FIDELIDADE)
// =======================================================

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

const createWPA = () => {
    const group = new THREE.Group();
    const C0 = 0x2C5282, C1 = 0x4299E1, C2 = 0x90CDF4, C3 = 0x805AD5, C4 = 0x38B2AC; // Cores dos componentes

    // Tanque principal com textura
    const tankMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.8, roughness: 0.2, map: createMetalTexture(C0)
    });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32), tankMat);
    tank.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Wastewater Tank' };
    group.add(tank);

    // Bomba centrífuga detalhada
    const pumpMat = new THREE.MeshStandardMaterial({ 
      color: C1, metalness: 0.85, roughness: 0.15, map: createMetalTexture(C1)
    });
    const pumpHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.0, 32), pumpMat);
    pumpHousing.position.set(-1.8, 0.5, 0);
    pumpHousing.rotation.z = Math.PI / 2;
    pumpHousing.userData = { component: 1, offset: new THREE.Vector3(-1.2, 0, 0), name: 'Pump' };
    group.add(pumpHousing);

    // Motor da bomba com emissivo
    const motorMat = new THREE.MeshStandardMaterial({ 
      color: 0x2563eb, metalness: 0.7, roughness: 0.3, emissive: 0x1e40af, emissiveIntensity: 0.2
    });
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 32), motorMat);
    motor.position.set(-2.5, 0.5, 0);
    motor.rotation.z = Math.PI / 2;
    motor.userData = { component: 1, offset: new THREE.Vector3(-1.2, 0, 0) };
    group.add(motor);

    // Filtros MF Beds (camadas translúcidas)
    for (let i = 0; i < 3; i++) {
      const filterBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.6, 24),
        new THREE.MeshStandardMaterial({ color: C2, metalness: 0.5, roughness: 0.6, transparent: true, opacity: 0.9 })
      );
      filterBody.position.set(1.2, -0.8 + i * 0.7, 0);
      filterBody.userData = { component: 2, offset: new THREE.Vector3(0.9, 0, 0), name: 'MF Bed' };
      group.add(filterBody);

      // Meio filtrante interno escuro
      const filterMedia = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.5, 24),
        new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.9, metalness: 0.1 })
      );
      filterMedia.position.set(1.2, -0.8 + i * 0.7, 0);
      filterMedia.userData = { component: 2, offset: new THREE.Vector3(0.9, 0, 0) };
      group.add(filterMedia);
    }

    // Reator catalítico (esfera com emissivo de calor)
    const reactorMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.6, roughness: 0.3, emissive: 0x6b21a8, emissiveIntensity: 0.3
    });
    const reactor = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), reactorMat);
    reactor.position.set(0, -1.8, 0);
    reactor.userData = { component: 3, offset: new THREE.Vector3(0, -1.5, 0), name: 'Catalyst Reactor' };
    group.add(reactor);

    // Sensores de condutividade (com tela emissiva)
    const sensorMat = new THREE.MeshStandardMaterial({ 
      color: C4, metalness: 0.5, roughness: 0.6, emissive: 0x14b8a6, emissiveIntensity: 0.5
    });
    const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.15), sensorMat);
    sensor.position.set(0, 1.6, 1.3);
    sensor.userData = { component: 4, offset: new THREE.Vector3(0, 0.5, 0.8), name: 'Sensor' };
    group.add(sensor);

    const displayMat = new THREE.MeshStandardMaterial({ 
      color: 0x000000, emissive: 0x22d3ee, emissiveIntensity: 0.8 
    });
    const display = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), displayMat);
    display.position.set(0, 1.6, 1.38);
    display.userData = { component: 4, offset: new THREE.Vector3(0, 0.5, 0.8) };
    group.add(display);

    return group;
};

const createPump = () => {
    const group = new THREE.Group();
    const C0 = 0x2D3748, C1 = 0x4A5568, C2 = 0xE53E3E, C3 = 0x718096, C4 = 0x48BB78; // Cores dos componentes

    // Carcaça principal com textura de alumínio
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.85, roughness: 0.25, map: createMetalTexture(C0)
    });
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 2.0, 32), housingMat);
    housing.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Housing' };
    group.add(housing);

    // Impeller com 6 pás de alto brilho (metal)
    const impellerMat = new THREE.MeshStandardMaterial({ 
      color: C1, metalness: 0.95, roughness: 0.05 
    });
    const impellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 24), impellerMat);
    impellerHub.userData = { component: 1, offset: new THREE.Vector3(0, 0, 2.0), name: 'Impeller' };
    group.add(impellerHub);

    // Pás detalhadas (parafusadas ao hub)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.7, 0.25),
        impellerMat
      );
      // Posiciona a pá no hub e a rotaciona levemente
      blade.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0);
      blade.rotation.z = angle + Math.PI / 12;
      blade.userData = { component: 1, offset: new THREE.Vector3(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 2.0) };
      group.add(blade);
    }

    // Motor BLDC (com refrigeração aletada e emissivo)
    const motorMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.7, roughness: 0.35, emissive: 0x991b1b, emissiveIntensity: 0.2, map: createMetalTexture(C2)
    });
    const motorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 32), motorMat);
    motorBody.position.z = -1.5;
    motorBody.userData = { component: 2, offset: new THREE.Vector3(0, 0, -1.5), name: 'BLDC Motor' };
    group.add(motorBody);

    // Selo mecânico duplo (metal)
    const sealMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.85, roughness: 0.15 
    });
    const sealOuter = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.15, 20, 32), sealMat);
    sealOuter.rotation.x = Math.PI / 2;
    sealOuter.position.z = 0.9;
    sealOuter.userData = { component: 3, offset: new THREE.Vector3(0, 0, 1.2), name: 'Mech Seal' };
    group.add(sealOuter);

    // Controlador VFD (caixa eletrônica verde com tela)
    const controllerMat = new THREE.MeshStandardMaterial({ 
      color: C4, metalness: 0.5, roughness: 0.6, emissive: 0x16a34a, emissiveIntensity: 0.4
    });
    const controllerBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.35), controllerMat);
    controllerBox.position.set(1.4, 0, -0.9);
    controllerBox.userData = { component: 4, offset: new THREE.Vector3(1.0, 0, -0.3), name: 'VFD' };
    group.add(controllerBox);

    return group;
};

const createCMG = () => {
    const group = new THREE.Group();
    const C0 = 0x2C5282, C1 = 0x718096, C2 = 0x4299E1, C3 = 0xE53E3E, C4 = 0xF59E0B, C5 = 0x48BB78; // Cores dos componentes

    // Flywheel (Rotor) com textura de fibra de carbono (alta PBR)
    const carbonTexture = createCarbonTexture();
    const rotorMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.95, roughness: 0.05, map: carbonTexture
    });
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.6, 64), rotorMat);
    rotor.rotation.x = Math.PI / 2;
    rotor.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Flywheel' };
    group.add(rotor);
    
    // Eixo com rolamentos (Bearings)
    const axle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 3.0, 32),
      new THREE.MeshStandardMaterial({ color: C1, metalness: 0.9, roughness: 0.2 })
    );
    axle.rotation.x = Math.PI / 2;
    axle.userData = { component: 1, offset: new THREE.Vector3(0, 0, 0), name: 'Axle' };
    group.add(axle);
    
    // Estrutura Gimbal (Anéis de titânio translúcido/opaco)
    const gimbalMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.85, roughness: 0.2, transparent: true, opacity: 0.9
    });

    // Anel interno (Pitch/Yaw)
    const innerGimbal = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.15, 16, 64), gimbalMat);
    innerGimbal.rotation.x = Math.PI / 2;
    innerGimbal.userData = { component: 2, offset: new THREE.Vector3(0, 0, 0), name: 'Inner Gimbal' };
    group.add(innerGimbal);

    // Anel externo (Roll)
    const outerGimbal = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.1, 16, 64), gimbalMat);
    outerGimbal.rotation.y = Math.PI / 2;
    outerGimbal.userData = { component: 2, offset: new THREE.Vector3(0, 0, 0), name: 'Outer Gimbal' };
    group.add(outerGimbal);
    
    // Spin Motor (Embutido no eixo, com emissivo)
    const spinMotorMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.7, roughness: 0.35, emissive: 0x991b1b, emissiveIntensity: 0.3
    });
    const spinMotorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 32), spinMotorMat);
    spinMotorBody.rotation.x = Math.PI / 2;
    spinMotorBody.userData = { component: 3, offset: new THREE.Vector3(0, 0, 0), name: 'Spin Motor' };
    group.add(spinMotorBody);

    // Torque Motors (atuadores do gimbal)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const offsetVector = new THREE.Vector3(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0);

      // Corpo do atuador (Servo motor)
      const torqueMotorMat = new THREE.MeshStandardMaterial({ 
        color: C4, metalness: 0.7, roughness: 0.3, emissive: 0x92400e, emissiveIntensity: 0.2
      });
      const torqueMotor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), torqueMotorMat);
      torqueMotor.position.set(Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, 0);
      torqueMotor.rotation.z = angle + Math.PI / 2;
      torqueMotor.userData = { component: 4, offset: offsetVector, name: 'Torque Motor' };
      group.add(torqueMotor);
    }

    // IMU + Electronics (com emissivo)
    const electronicsMat = new THREE.MeshStandardMaterial({ 
      color: C5, metalness: 0.5, roughness: 0.6, emissive: 0x16a34a, emissiveIntensity: 0.4
    });
    const electronicsBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.5), electronicsMat);
    electronicsBox.position.set(0, 0, 1.5);
    electronicsBox.userData = { component: 5, offset: new THREE.Vector3(0, 0, 1.5), name: 'IMU & Cntl' };
    group.add(electronicsBox);

    return group;
};

const createOGS = () => {
    const group = new THREE.Group();
    const C0 = 0x2C5282, C1 = 0x4299E1, C2 = 0x90CDF4, C3 = 0x38B2AC, C4 = 0x48BB78, C5 = 0xF59E0B; // Cores dos componentes

    // Módulo Principal (Electrolyzer)
    const moduleMat = new THREE.MeshStandardMaterial({ 
      color: C0, metalness: 0.8, roughness: 0.4, map: createMetalTexture(C0)
    });
    const module = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 1.5), moduleMat);
    module.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0), name: 'Electrolyzer Module' };
    group.add(module);

    // Painel de controle frontal
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.4, roughness: 0.7 })
    );
    panel.position.set(-1.25, 0, 0);
    panel.rotation.y = -Math.PI / 2;
    panel.userData = { component: 0, offset: new THREE.Vector3(0, 0, 0) };
    group.add(panel);

    // Stack de Células PEM (empilhamento translúcido)
    const cellStackGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.0, 0.1),
        new THREE.MeshStandardMaterial({ 
          color: C1, metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.8
        })
      );
      cell.position.z = -0.45 + i * 0.11;
      cellStackGroup.add(cell);
    }
    cellStackGroup.position.x = 1.5;
    cellStackGroup.userData = { component: 1, offset: new THREE.Vector3(1.5, 0, 0), name: 'PEM Stack' };
    group.add(cellStackGroup);

    // Separador Ciclônico (Formato cônico)
    const separatorMat = new THREE.MeshStandardMaterial({ 
      color: C2, metalness: 0.7, roughness: 0.5, map: createMetalTexture(C2)
    });
    const separator = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.7, 1.2, 32), separatorMat);
    separator.position.set(-1.8, 0, 0.6);
    separator.rotation.x = -Math.PI / 6;
    separator.userData = { component: 2, offset: new THREE.Vector3(-0.8, 0.8, 0.8), name: 'Gas Separator' };
    group.add(separator);

    // Trocador de Calor (Aletas)
    const exchangerMat = new THREE.MeshStandardMaterial({ 
      color: C3, metalness: 0.85, roughness: 0.15, map: createMetalTexture(C3)
    });
    const exchangerBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 1.0), exchangerMat);
    exchangerBox.position.y = -1.0;
    exchangerBox.userData = { component: 3, offset: new THREE.Vector3(0, -1.0, 0), name: 'Heat Exchanger' };
    group.add(exchangerBox);

    // Regulador de Pressão
    const regulatorMat = new THREE.MeshStandardMaterial({ 
      color: C4, metalness: 0.7, roughness: 0.3, emissive: 0x16a34a, emissiveIntensity: 0.2
    });
    const regulator = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32), regulatorMat);
    regulator.position.set(-1.0, 0.9, -0.6);
    regulator.userData = { component: 4, offset: new THREE.Vector3(-1.0, 0.5, -0.5), name: 'Regulator' };
    group.add(regulator);

    // Sensores de Gás (com emissivo para sinalização)
    for (let i = 0; i < 3; i++) {
      const sensorMat = new THREE.MeshStandardMaterial({ 
        color: C5, metalness: 0.5, roughness: 0.6, emissive: 0xf59e0b, emissiveIntensity: 0.5
      });
      const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), sensorMat);
      sensor.position.set(-1.25, -0.3 + i * 0.3, 0.8);
      sensor.userData = { component: 5, offset: new THREE.Vector3(-0.5, 0, 0.8), name: 'O2 Sensor' };
      group.add(sensor);
    }

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
    renderer.toneMappingExposure = 2.8; // Aumentado para 2.8 para resolver o problema de escuridão (CMG)
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
                const targetPos = new THREE.Vector3(0, 0, 0);
                const originalOffset = child.userData.offset || new THREE.Vector3(0, 0, 0);
                targetPos.copy(originalOffset).multiplyScalar(factor);
                child.position.lerp(targetPos, 0.1);
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