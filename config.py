# config.py
# -*- coding: utf-8 -*-
"""
Configurações globais para o pipeline de Machine Learning
----------------------------------------------------------
Este arquivo centraliza parâmetros e caminhos usados em:
  - preprocess.py
  - train.py
  - evaluate.py
  - dash.py
"""
from pathlib import Path
import random
import numpy as np

# =====================
# Reprodutibilidade
# =====================
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# =====================
# Estrutura de diretórios
# =====================
ROOT = Path(__file__).parent

# Arquivos de dados
DATA_RAW = ROOT / "data" / "Amia_train.csv"      # dataset original
DATA_PROCESSED = ROOT / "data" / "dataset_tratado.csv"  # dataset tratado (gerado pelo preprocess)

# Arquivos de modelo
MODEL_PATH = ROOT / "models" / "modelo.pkl"          # modelo treinado salvo
SCALER_PATH = ROOT / "models" / "scaler.pkl"         # scaler salvo (normalização)

# Arquivos de métricas e relatórios
METRICS_PATH = ROOT / "reports" / "metrics.json"
EVALUATION_REPORT = ROOT / "reports" / "evaluation_report.json"
API_METRICS_PATH = ROOT / "reports" / "api_metrics.json"  # métricas da API
METRICS_DIR = ROOT / "reports"  # Diretório de relatórios e métricas 

# Diretório para predições da API
PREDICTIONS_DIR = ROOT / "predictions"

# Diretório de Logs
LOGS_DIR = ROOT / "logs"

# =====================
# Configurações de Pré-processamento
# =====================
TARGET = "falha_maquina"   # nome da coluna alvo

# Colunas categóricas e numéricas (ajuste conforme seu dataset)
CATEGORICAL_COLS = ["id_produto", "tipo"]
NUMERIC_COLS = [
    "temperatura_ar", "temperatura_processo", "umidade_relativa",
    "velocidade_rotacional", "torque", "desgaste_da_ferramenta"
]

# =====================
# Configurações de Treino
# =====================
TEST_SIZE = 0.2   # proporção do conjunto de teste
VALIDATION_SIZE = 0.2  # se for usar split train/val/test

MODEL_PARAMS = {
    "n_estimators": 200,
    "max_depth": 8,
    "random_state": SEED,
    "n_jobs": -1  # Usar todos os cores disponíveis
}

# =====================
# Configurações de Avaliação
# =====================
METRICS = ["accuracy", "precision", "recall", "f1"]

# =====================
# Configurações da API
# =====================
API_CONFIG = {
    "base_url": "http://34.193.187.218:5000",
    "register_endpoint": "/users/register",
    "evaluate_endpoint": "/evaluate/multilabel_metrics",
    "timeout": 60,
    "default_threshold": 0.5
}

# Colunas de falha esperadas pela API
FAILURE_COLUMNS = [
    'FDF (Falha Desgaste Ferramenta)',
    'FDC (Falha Dissipacao Calor)', 
    'FP (Falha Potencia)',
    'FA (Falha Aleatoria)'
]

# =====================
# Helpers
# =====================
def create_dirs():
    """Garante que pastas necessárias existam"""
    for p in [ROOT / "data", ROOT / "models", ROOT / "reports", ROOT / "predictions", ROOT / "logs"]:
        p.mkdir(parents=True, exist_ok=True)

# Cria diretórios ao importar
create_dirs()


