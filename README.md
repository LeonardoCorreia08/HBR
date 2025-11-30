# AMIA: Manutenção Inteligente e Assistida para a ISS

Integração de Inteligência Artificial e Realidade Aumentada para Análise Preditiva e Treinamento em Manutenção de Componentes da Estação Espacial Internacional.

## 📋 Sobre o Projeto

Este projeto propõe uma arquitetura inovadora para manutenção preditiva e assistida na Estação Espacial Internacional (ISS), combinando **Inteligência Artificial (IA)** para previsão de falhas com **Realidade Aumentada (RA)** para execução de procedimentos de manutenção.

### 🎯 Objetivos Principais

- **Desenvolver modelos de IA** para análise preditiva de falhas em componentes críticos
- **Implementar interface de RA** para treinamento e execução de manutenção
- **Reduzir tempo de inatividade** e **minimizar erro humano** em ambientes de alto estresse

## 🏗️ Arquitetura do Sistema

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

## 📊 Resultados e Performance

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

## 🚀 Casos de Uso

### Manutenção em Control Moment Gyros (CMGs)

**Problema**: Degradação de mancais em vácuo
**Solução AMIA**:
1. **IA detecta**: Aumento de torque residual, assimetrias de vibração
2. **RA orienta**: Destaca parafusos específicos, exibe torque necessário
3. **Resultado**: Reparo preciso com redução de 40% no tempo

### Fluxo Operacional Típico
