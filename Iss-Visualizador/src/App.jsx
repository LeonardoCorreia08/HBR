// App.jsx (NÃO HOUVE ALTERAÇÕES NESTA ETAPA, permanece como estava)

import React, { useState, useEffect, useCallback, useRef } from 'react';

import { initThreeJS, loadModel, setRotationState, setExplosionState, exportModelGLB } from './threeDViewer'; 

// ===== DADOS DOS EQUIPAMENTOS (COMPLETO) =====
const equipmentData = [
    {
        id: 'sarj',
        name: 'SARJ - Solar Alpha Rotary Joint',
        description: 'Junta rotativa de 10 pés (3m de diâmetro) que permite rotação dos painéis solares para rastreamento solar contínuo. Gira a 4° por minuto.',
        weight: '1,134 kg',
        power: '3,000W',
        components: [
            { name: 'Race Ring', detail: 'Estrutura principal em alumínio 7075-T6', color: '#4A5568' },
            { name: 'Rolamentos de Aço', detail: '1,264 rolamentos de precisão', color: '#718096' },
            { name: 'Motor BAPTA', detail: 'Motor de acionamento principal 0.1 HP', color: '#2D3748' },
            { name: 'Sistema de Lubrificação', detail: 'Graxa PFPE espacial anti-vácuo', color: '#E53E3E' },
            { name: 'Sensores Resolver', detail: '12 sensores de posição angular', color: '#3182CE' }
        ],
        issues: [
            'Desgaste de rolamentos por microimpactos',
            'Contaminação por detritos metálicos',
            'Degradação de lubrificante por radiação UV'
        ]
    },
    {
        id: 'wpa',
        name: 'WPA - Water Processing Assembly',
        description: 'Sistema que recicla urina e condensado em água potável, recuperando 93% da água. Produz 6 galões/dia.',
        weight: '907 kg',
        power: '1,500W',
        components: [
            { name: 'Tanque', detail: '23L em liga de Titânio', color: '#2C5282' },
            { name: 'Bomba', detail: '3 estágios 50GPH', color: '#4299E1' },
            { name: 'Filtros MF', detail: 'Carvão ativado', color: '#90CDF4' },
            { name: 'Reator', detail: 'Catalisador de Platina', color: '#805AD5' },
            { name: 'Sensor', detail: 'Condutividade e pH', color: '#38B2AC' }
        ],
        issues: [
            'Saturação de filtros MF (6 meses)',
            'Falha em bombas por cavitação',
            'Contaminação bacteriana em linhas'
        ]
    },
    {
        id: 'pump',
        name: 'ITCS Pump Module',
        description: 'Bomba que circula 1360kg de água gelada por minuto a 4°C. Pressão: 17 PSI.',
        weight: '118 kg',
        power: '800W',
        components: [
            { name: 'Carcaça', detail: 'Alumínio anodizado', color: '#2D3748' },
            { name: 'Impeller', detail: 'Aço 316L 6 pás', color: '#4A5568' },
            { name: 'Motor BLDC', detail: '800W alto torque', color: '#E53E3E' },
            { name: 'Selo', detail: 'Duplo carbeto de Silício', color: '#718096' },
            { name: 'VFD', detail: 'Controle de Freq. variável', color: '#48BB78' }
        ],
        issues: [
            'Desgaste de selos mecânicos (2 anos)',
            'Falha eletrônica do VFD',
            'Cavitação por ar dissolvido'
        ]
    },
    {
        id: 'cmg',
        name: 'CMG - Control Moment Gyroscope',
        description: 'Giroscópio de 272kg com rotor a 6600 RPM para controle de orientação sem propelente. Torque: 4660 N·m.',
        weight: '272 kg',
        power: '1,200W para spin-up',
        components: [
            { name: 'Flywheel', detail: 'Disco 100cm aço especial', color: '#2C5282' },
            { name: 'Bearings', detail: 'Cerâmica híbrida', color: '#718096' },
            { name: 'Gimbal', detail: 'Estrutura em liga Ti-6Al-4V', color: '#4299E1' },
            { name: 'Spin Motor', detail: 'Motor de Indução 3 fases', color: '#E53E3E' },
            { name: 'Torque Motor', detail: 'Servo motor', color: '#F59E0B' },
            { name: 'IMU', detail: 'Unidade de Navegação Inercial', color: '#48BB78' }
        ],
        issues: [
            'Falha de rolamentos por fadiga (6 anos)',
            'Degradação lubrificação em vácuo',
            'Desequilíbrio do rotor por impactos'
        ]
    },
    {
        id: 'ogs',
        name: 'OGS - Oxygen Generation System',
        description: 'Eletrolisador PEM que produz 5.5kg de oxigênio respirável por dia. Eficiência: 85%.',
        weight: '468 kg',
        power: '3,600W',
        components: [
            { name: 'Eletrolisador', detail: 'Módulo principal', color: '#2C5282' },
            { name: 'Células PEM', detail: '8 membranas de troca protônica', color: '#4299E1' },
            { name: 'Separador', detail: 'Ciclônico H2/O2', color: '#90CDF4' },
            { name: 'Trocador', detail: 'Dissipa 3.6kW de calor', color: '#38B2AC' },
            { name: 'Pressurização', detail: 'Regulador 25PSI', color: '#48BB78' },
            { name: 'Sensores', detail: '6 sensores de gás e pressão', color: '#F59E0B' }
        ],
        issues: [
            'Degradação eletrodos Pt/Ir (5000h)',
            'Vazamento hidrogênio em juntas',
            'Falha sensores pressão diferencial'
        ]
    }
];
// =======================================================


function App() {
    // Estados React
    const [currentEquipmentId, setCurrentEquipmentId] = useState(equipmentData[0].id);
    const [isExploded, setIsExploded] = useState(false);
    const [isRotating, setIsRotating] = useState(true);
    const [showInfo, setShowInfo] = useState(true);
    const canvasRef = useRef(null);
    const activeEquipment = equipmentData.find(e => e.id === currentEquipmentId);

    // Efeito 1: Inicializa o Three.js no DOM. Roda apenas na montagem.
    useEffect(() => {
        if (canvasRef.current) {
            initThreeJS(canvasRef.current);
            loadModel(currentEquipmentId, isExploded, isRotating);
        }
    }, []); 

    // Efeito 2: Carrega NOVO modelo quando o ID muda.
    useEffect(() => {
        loadModel(currentEquipmentId, isExploded, isRotating);
    }, [currentEquipmentId]);

    // Funções de UI e Downloads (NOVAS FUNÇÕES AQUI!)

    const handleExportGLB = () => {
        exportModelGLB(activeEquipment.id);
    };

    const handleDownloadHTML = () => {
        alert("O Download do HTML Self-Contained não está implementado, pois requer a serialização complexa de todo o ambiente de build (React, Three.js, CSS, etc.) em um único arquivo HTML estático.");
    };


    const handleResetCamera = () => {
        loadModel(currentEquipmentId, isExploded, isRotating, true);
    };

    const toggleExplode = () => {
        const newState = !isExploded;
        setIsExploded(newState);
        setExplosionState(newState); 
    };

    const toggleRotate = () => {
        const newState = !isRotating;
        setIsRotating(newState);
        setRotationState(newState);
    };

    // --- Renderização da UI (JSX) ---
    return (
        <div className="container">
            <h1>🚀 ISS Equipment - Real 3D Models</h1>
            <p className="subtitle">Modelos 3D Ultra Realistas com Texturas PBR • Three.js • AR/VR Ready</p>

            <div className="main-grid">
                
                {/* Coluna Lateral (Sidebar) */}
                <div className="sidebar">
                    
                    {/* Painel 1: Lista de Equipamentos */}
                    <div className="panel">
                        <div className="panel-title">🛠️ Equipamentos ISS</div>
                        <div className="equipment-list">
                            {equipmentData.map((equip) => (
                                <button
                                    key={equip.id}
                                    className={`equipment-btn ${currentEquipmentId === equip.id ? 'active' : ''}`}
                                    onClick={() => setCurrentEquipmentId(equip.id)}
                                >
                                    <div className="equipment-name">{equip.name}</div>
                                    <div className="equipment-info">{equip.weight} • {equip.components.length} peças</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Painel 2: Especificações */}
                    <div className="panel">
                        <div className="panel-title">📝 Especificações</div>
                        <div className="specs-grid">
                            <div className="spec-label">Peso:</div>
                            <div className="spec-value">{activeEquipment.weight}</div>
                            <div className="spec-label">Potência:</div>
                            <div className="spec-value">{activeEquipment.power}</div>
                            <div className="spec-label">Componentes:</div>
                            <div className="spec-value">{activeEquipment.components.length}</div>
                        </div>
                    </div>

                    {/* Painel 3: Componentes 3D */}
                    <div className="panel">
                        <div className="panel-title">🧩 Componentes 3D</div>
                        <div className="component-list">
                            {activeEquipment.components.map((comp, index) => (
                                <div key={index} className="component-item" style={{ borderLeftColor: comp.color }}>
                                    <div className="component-name">{comp.name}</div>
                                    <div className="component-detail">{comp.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Coluna Principal (Viewer 3D) */}
                <div className="viewer-container">
                    <div className="viewer-header">
                        <div className="viewer-title">{activeEquipment.name}</div>
                        <div className="viewer-controls">
                            <button 
                                className={`btn-icon-only ${showInfo ? 'active' : ''}`} 
                                onClick={() => setShowInfo(!showInfo)} 
                                title="Mostrar Informações">
                                <span className="btn-icon">ℹ️</span>
                            </button>
                            <button className="btn-icon-only" title="Mostrar Anotações">
                                <span className="btn-icon">📌</span>
                            </button>
                        </div>
                    </div>

                    {/* Container 3D - Usa a ref para o Three.js desenhar */}
                    <div id="canvas-container" ref={canvasRef}>
                        <div className="canvas-overlay overlay-info" style={{ display: showInfo ? 'block' : 'none' }}>
                            <div id="equipmentDescription">{activeEquipment.description}</div>
                        </div>
                        <div className="canvas-overlay overlay-status">{isExploded ? '💥 EXPLODED VIEW' : '✅ ASSEMBLED'}</div>
                        <div className="canvas-overlay overlay-badge" style={{ display: 'none' }}>LIVE FEED</div>
                    </div>

                    {/* Controles do Modelo */}
                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={toggleExplode}>
                            <span className="btn-icon">💥</span> {isExploded ? 'Visão Montada' : 'Vista Explodida'}
                        </button>
                        <button className="btn btn-purple" onClick={toggleRotate}>
                            <span className="btn-icon">{isRotating ? '⏸️' : '▶️'}</span> Rotação Automática
                        </button>
                        <button className="btn btn-primary" onClick={handleResetCamera}>
                            <span className="btn-icon">🔄</span> Resetar Câmera
                        </button>
                    </div>
                </div>
            </div>

            {/* Painel de Análise/Problemas (Rodapé) */}
            <div className="analysis-panel">
                <div className="analysis-title">🚨 Análise de Risco & Problemas Conhecidos</div>
                <div className="issues-grid">
                    {activeEquipment.issues.map((issue, index) => (
                        <div key={index} className="issue-card">
                            <div className="issue-icon">⚠️</div>
                            <div className="issue-title">Falha {index + 1}</div>
                            <div className="issue-description">{issue}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Opções de Exportação */}
            <div className="analysis-panel footer">
                <div className="analysis-title footer-title">💾 Opções de Exportação</div>
                <div className="action-buttons">
                    <button className="btn btn-success" onClick={handleExportGLB}>
                        <span className="btn-icon">📦</span> Exportar Modelo (GLB)
                    </button>
                    <button className="btn btn-success" onClick={handleDownloadHTML}>
                        <span className="btn-icon">📄</span> Download (HTML Self-Contained)
                    </button>
                </div>
            </div>

        </div>
    );
}

export default App;