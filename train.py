# train.py
# -*- coding: utf-8 -*-
"""
Etapa 2 - TREINAMENTO
----------------------
- Carrega dataset tratado (config.DATA_PROCESSED)
- Separa X e y
- Treina modelo definido (RandomForest por padrão)
- Salva modelo em config.MODEL_PATH
"""

import pandas as pd
import config
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from collections import Counter

def main():
    print("📥 Carregando dados tratados de:", config.DATA_PROCESSED)
    df = pd.read_csv(config.DATA_PROCESSED, low_memory=False)
    
    # =====================
    # LIMPEZA DE DADOS
    # =====================
    print("🔧 Limpando dados para treinamento...")
    
    # Converter valores booleanos em string para numéricos
    df = df.replace({'True': 1, 'False': 0, 'true': 1, 'false': 0})
    
    # Converter colunas object para numérico quando possível
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                # Tentar converter para numérico
                df[col] = pd.to_numeric(df[col], errors='coerce')
                print(f"   Coluna {col} convertida para numérico")
            except Exception as e:
                print(f"   Aviso: Não foi possível converter coluna {col}: {e}")
    
    # Preencher valores NaN que possam ter surgido da conversão
    df = df.fillna(0)
    
    # Verificar se ainda existem colunas não numéricas
    non_numeric_cols = df.select_dtypes(include=['object']).columns.tolist()
    if non_numeric_cols:
        print(f"⚠️  Colunas ainda não numéricas: {non_numeric_cols}")
        # Remover colunas que não puderam ser convertidas (exceto target)
        cols_to_drop = [col for col in non_numeric_cols if col != config.TARGET]
        if cols_to_drop:
            df = df.drop(columns=cols_to_drop)
            print(f"   Removidas colunas: {cols_to_drop}")
    
    print(f"✅ Dados limpos. Shape final: {df.shape}")
    print(f"   Tipos de dados: {df.dtypes.value_counts()}")
    
    # =====================
    # Separação em X e y
    # =====================
    if config.TARGET not in df.columns:
        raise ValueError(f"Coluna target '{config.TARGET}' não encontrada no dataset!")
    
    X = df.drop(columns=[config.TARGET])
    y = df[config.TARGET]
    
    print(f"📊 Features (X): {X.shape}")
    print(f"📊 Target (y): {y.shape}")
    
    # Mostrar distribuição original das classes
    print(f"📊 Distribuição original das classes:")
    class_counts = Counter(y)
    for class_name, count in class_counts.items():
        print(f"   Classe {class_name}: {count} ({count/len(y)*100:.2f}%)")
    
    # Verificar se X tem apenas valores numéricos
    if X.select_dtypes(include=['object']).shape[1] > 0:
        raise ValueError("Ainda existem colunas não numéricas em X após limpeza!")
    
    # Split treino/teste ANTES do SMOTE (importante!)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.TEST_SIZE, random_state=config.SEED, stratify=y
    )
    
    print(f"📊 Treino - X: {X_train.shape}, y: {y_train.shape}")
    print(f"📊 Teste - X: {X_test.shape}, y: {y_test.shape}")
    
    # =====================
    # APLICAR SMOTE
    # =====================
    print("\n⚖️ Aplicando SMOTE para balancear as classes...")
    
    # Mostrar distribuição antes do SMOTE
    print("📊 Distribuição no conjunto de TREINO antes do SMOTE:")
    train_counts_before = Counter(y_train)
    for class_name, count in train_counts_before.items():
        print(f"   Classe {class_name}: {count} ({count/len(y_train)*100:.2f}%)")
    
    # Aplicar SMOTE apenas no conjunto de treino
    smote = SMOTE(random_state=config.SEED)
    X_train_smote, y_train_smote = smote.fit_resample(X_train, y_train)
    
    # Mostrar distribuição após o SMOTE
    print("📊 Distribuição no conjunto de TREINO após SMOTE:")
    train_counts_after = Counter(y_train_smote)
    for class_name, count in train_counts_after.items():
        print(f"   Classe {class_name}: {count} ({count/len(y_train_smote)*100:.2f}%)")
    
    print(f"✅ SMOTE aplicado com sucesso!")
    print(f"   Treino original: {X_train.shape[0]} amostras")
    print(f"   Treino após SMOTE: {X_train_smote.shape[0]} amostras")
    print(f"   Aumento de: {X_train_smote.shape[0] - X_train.shape[0]} amostras")
    
    # =====================
    # TREINAMENTO DO MODELO
    # =====================
    model = RandomForestClassifier(**config.MODEL_PARAMS)
    print("\n🚀 Treinando modelo RandomForest com dados balanceados...")
    print(f"   Parâmetros: {config.MODEL_PARAMS}")
    
    # Treinar com dados balanceados
    model.fit(X_train_smote, y_train_smote)
    
    # Salvar modelo
    joblib.dump(model, config.MODEL_PATH)
    print("✅ Modelo salvo em:", config.MODEL_PATH)
    
    # =====================
    # INFORMAÇÕES ADICIONAIS
    # =====================
    print(f"\n📈 Score no treino (dados balanceados): {model.score(X_train_smote, y_train_smote):.4f}")
    print(f"📈 Score no teste (dados originais): {model.score(X_test, y_test):.4f}")
    
    # Comparar com dados originais não balanceados
    # Criar uma cópia dos parâmetros sem random_state se já existir
    params_without_smote = config.MODEL_PARAMS.copy()
    if 'random_state' not in params_without_smote:
        params_without_smote['random_state'] = config.SEED
    
    model_without_smote = RandomForestClassifier(**params_without_smote)
    model_without_smote.fit(X_train, y_train)
    print(f"📈 Score sem SMOTE (referência): {model_without_smote.score(X_test, y_test):.4f}")
    
    print("\n" + "="*60)
    print("✅ TREINAMENTO CONCLUÍDO COM SMOTE!")
    print("="*60)

if __name__ == "__main__":
    main()