<p align="center">
  <img src="./assets/logo02.png" width="500" alt="HBR">
</p>

# AMIA: Manutenção Inteligente e Assistida para a ISS

Integração de Inteligência Artificial e Realidade Aumentada para Análise Preditiva e Treinamento em Manutenção de Componentes da Estação Espacial Internacional.

## Sobre o Projeto

Este projeto propõe uma arquitetura inovadora para manutenção preditiva e assistida na Estação Espacial Internacional (ISS), combinando **Inteligência Artificial (IA)** para previsão de falhas com **Realidade Aumentada (RA)** para execução de procedimentos de manutenção.

### Objetivos Principais

- **Desenvolver modelos de IA** para análise preditiva de falhas em componentes críticos
- **Implementar interface de RA** para treinamento e execução de manutenção
- **Reduzir tempo de inatividade** e **minimizar erro humano** em ambientes de alto estresse

## Arquitetura do Sistema

### Componentes Principais

#### 1. Módulo de IA Preditiva
- **Dataset**: AI4I 2020 Predictive Maintenance Dataset
- **Algoritmos**: Decision Tree, Bagging Classifier, Random Forest
- **Métricas**: Previsão de RUL (Remaining Useful Life), Pontuação de Risco
- **Desempenho**: AUC 1.00, F1-Score 0.98 (Random Forest)

#### 2. Módulo de Realidade Aumentada
- **Dispositivos**: Microsoft HoloLens
- **Funcionalidades**:
  - Rastreamento por visão computacional
  - Sobrepõe instruções passo a passo
  - Visualização de dados preditivos em tempo real
  - Guias de procedimento assistido

#### 3. Integração Orbital
- **Processamento**: Edge computing com hardware rad-hard
- **Protocolos**: Compatibilidade com MIL-STD-1553, CCSDS
- **Latência**: Inferência determinística para manutenção crítica

## Resultados e Performance

### Desempenho dos Modelos de IA

| Modelo | Acurácia | AUC | F1-Score | Robustez |
|--------|----------|-----|----------|----------|
| Decision Tree | 96.5% | 0.96 | 0.92 | Baixa |
| Bagging Classifier | 97.8% | 0.99 | 0.96 | Média |
| **Random Forest** | **98.1%** | **1.00** | **0.98** | **Alta** |

### Impacto Esperado da RA

| Métrica | Melhoria Esperada | Fonte |
|---------|-------------------|-------|
| Tempo de Execução | 25-40% | [Maintwiz 2024] |
| Taxa de Erro Humano | 50-80% | [IEEE 2024] |
| Retenção de Treinamento | 15-30% | [IJIRCCE 2023] |

## Casos de Uso

### Manutenção em Control Moment Gyros (CMGs)

**Problema**: Degradação de mancais em vácuo
**Solução AMIA**:
1. **IA detecta**: Aumento de torque residual, assimetrias de vibração
2. **RA orienta**: Destaca parafusos específicos, exibe torque necessário
3. **Resultado**: Reparo preciso com redução de 40% no tempo

### Fluxo Operacional Típico
Fase 1: Detecção (T-72h) → IA identifica anomalia
Fase 2: Intervenção (T-24h) → Sistema gera ordem de serviço
Fase 3: Execução → RA guia reparo passo a passo
Fase 4: Validação → IA confirma normalização dos parâmetros


##  Implementação Técnica

### Pré-processamento de Dados
```python
# Pipeline de processamento
1. Imputação pela mediana
2. Normalização Z-score
3. Amostragem estratificada (80/20)
4. Engenharia de atributos
```

## Hiperparâmetros do Modelo

- Random Forest: 100 estimadores, profundidade máxima 20.
- Critério: Entropia para maximizar ganho de informação.
- Features: √n features por split.

## Configuração de RA

- Rastreamento: IMU + visão computacional.
- Renderização: Otimizada para microgravidade.
- Latência: < 50ms para interação crítica.

## Estrutura do Projeto
```
amia-iss/
├── data/
│   ├── raw/                 # Dados brutos de telemetria
│   ├── processed/           # Dados pré-processados
│   └── models/              # Modelos treinados
├── src/
│   ├── prediction/          # Módulos de IA preditiva
│   ├── ar_interface/        # Sistema de realidade aumentada
│   ├── integration/         # Integração com sistemas ISS
│   └── utils/               # Utilitários comuns
├── docs/                    # Documentação técnica
├── tests/                   # Testes unitários e integração
└── Iss-Visualizador/        # Ambientes de simulação
```
## Visualizacao do ambiente 

[Projeto](https://iss-visualizador.vercel.app/)
---
<p align="center"><img src="./assets/visao 1.PNG" width="500"></p>
---
<p align="center"><img src="./assets/visao2.PNG" width="500"></p>
---

## Instalação e Uso
Pré-requisitos
Python 3.8+

TensorFlow 2.8+

OpenCV 4.5+

Unity 2022.3+ (para módulo RA)

## Instalação
```
git clone https://github.com/seu-usuario/amia-iss.git
cd amia-iss
pip install -r requirements.txt
```
## Execução
# Treinamento do modelo de IA
```
python src/prediction/train_model.py
```
# Simulação do sistema de RA
```
python src/ar_interface/simulate_ar.py
```

## Validação e Testes
### Ambientes de Teste
- Simulação Terra: Validação funcional completa
- Ambiente Análogo Espacial: Testes em microgravidade simulada
- ISS (Futuro): Implementação operacional

## Métricas de Validação
- Acurácia de Previsão: > 97%
- Latência de Inferência: < 100ms
- Precisão de Rastreamento RA: < 2mm
- Tempo de Resposta do Sistema: < 5 segundos

## Contribuição
Interessado em contribuir? Veja nosso: entre em contato

## Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

