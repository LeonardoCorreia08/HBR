import pandas as pd
import config
import joblib
import json
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def main():
    print("📥 Carregando modelo de:", config.MODEL_PATH)
    model = joblib.load(config.MODEL_PATH)
    
    print("📥 Carregando dados tratados de:", config.DATA_PROCESSED)
    df = pd.read_csv(config.DATA_PROCESSED, low_memory=False)
    
    # =====================
    # Limpeza de dados (mesmo processo do train.py)
    # =====================
    print("🔧 Limpando dados para avaliação...")
    
    # Converter valores booleanos em string para numéricos
    df = df.replace({'True': 1, 'False': 0, 'true': 1, 'false': 0})
    
    # Converter colunas object para numérico quando possível
    for col in df.columns:
        if df[col].dtype == 'object' and col != config.TARGET:
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except:
                pass
    
    # Preencher valores NaN que possam ter surgido da conversão
    df = df.fillna(0)
    
    # =====================
    # Separação em X e y
    # =====================
    X = df.drop(columns=[config.TARGET])
    y_true = df[config.TARGET]
    
    # =====================
    # Predição
    # =====================
    print("🔮 Fazendo predições...")
    y_pred = model.predict(X)
    
    # =====================
    # Métricas
    # =====================
    print("📊 Calculando métricas...")
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average='weighted', zero_division=0),
        "recall": recall_score(y_true, y_pred, average='weighted', zero_division=0),
        "f1": f1_score(y_true, y_pred, average='weighted', zero_division=0),
    }
    
    # Salvar métricas
    with open(config.METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=4)
    
    print("✅ Métricas calculadas e salvas em:", config.METRICS_PATH)
    print(metrics)

if __name__ == "__main__":
    main()
