
# -*- coding: utf-8 -*-
"""
DASH.PY - VERSÃO CORRIGIDA BASEADA NA DOCUMENTAÇÃO OFICIAL
----------------------
- Integra com a API de avaliação do bootcamp
- Usa apenas registro (não há endpoint de login)
- Gera predições no formato necessário para a API
- Envia para avaliação e recebe métricas
"""
import pandas as pd
import numpy as np
import config
import joblib
import requests
import json
import os
from pathlib import Path

# Configurações da API baseadas na documentação oficial
API_BASE_URL = "http://34.193.187.218:5000"
API_REGISTER_URL = f"{API_BASE_URL}/users/register"
API_EVALUATE_URL = f"{API_BASE_URL}/evaluate/multilabel_metrics"

def register_user(email, password):
    """
    Registra usuário na API e retorna o token
    Baseado na documentação oficial da API
    """
    print(f"🔐 Registrando usuário: {email}")
    
    try:
        response = requests.post(
            API_REGISTER_URL,
            json={"email": email, "password": password},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token') or data.get('access_token')
            print(f"✅ Usuário registrado com sucesso!")
            print(f"🔑 Token: {token[:20]}...") # Mostrar apenas parte do token
            return token
        elif response.status_code == 400:
            response_data = response.json()
            if "already registered" in response_data.get("detail", "").lower():
                print(f"💡 Email já registrado!")
                print(f"📝 Use o dashboard em http://34.193.187.218:8501 para recuperar seu token")
                print(f"   Ou use um email diferente para novo registro")
                
                # Perguntar se quer inserir token manualmente
                use_existing = input("Deseja inserir seu token existente? (s/n): ").strip().lower()
                if use_existing in ['s', 'sim', 'y', 'yes']:
                    token = input("Digite seu token: ").strip()
                    if token:
                        print("✅ Token inserido manualmente!")
                        return token
                return None
            else:
                print(f"❌ Erro no registro: {response.status_code}")
                print(f"Resposta: {response.text}")
                return None
        else:
            print(f"❌ Erro no registro: {response.status_code}")
            print(f"Resposta: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
        return None

def generate_predictions_csv(model_path, data_path, output_path, threshold=0.5):
    """
    Gera arquivo CSV com predições no formato esperado pela API
    Baseado no bootcamp_submission_example.csv
    """
    print("🔮 Gerando predições para API...")
    
    # Carregar modelo e dados
    print(f"📥 Carregando modelo de: {model_path}")
    model = joblib.load(model_path)
    
    print(f"📥 Carregando dados de: {data_path}")
    df = pd.read_csv(data_path, low_memory=False)
    
    print(f"📊 Dados originais - Shape: {df.shape}")
    
    # Limpeza de dados (mesma do evaluate.py)
    print("🔧 Limpando dados...")
    df = df.replace({'True': 1, 'False': 0, 'true': 1, 'false': 0})
    
    for col in df.columns:
        if df[col].dtype == 'object' and col != config.TARGET:
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except:
                pass
    
    df = df.fillna(0)
    
    # Separar features (remover target se existir)
    if config.TARGET in df.columns:
        X = df.drop(columns=[config.TARGET])
    else:
        X = df.copy()
    
    print(f"📊 Features para predição - Shape: {X.shape}")
    
    # Fazer predições probabilísticas
    print("🎯 Fazendo predições probabilísticas...")
    
    # Se o modelo suporta predict_proba
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(X)
        print(f"📊 Probabilidades - Shape: {proba.shape}")
        # Se binário, pegar apenas a probabilidade da classe positiva
        if proba.shape[1] == 2:
            predictions_proba = proba[:, 1]
        else:
            predictions_proba = proba[:, 0]
    else:
        # Fallback para modelos que não têm predict_proba
        predictions_binary = model.predict(X)
        predictions_proba = predictions_binary.astype(float)
    
    print(f"📊 Predições probabilísticas - Shape: {predictions_proba.shape}")
    print(f"📊 Range das predições: [{predictions_proba.min():.4f}, {predictions_proba.max():.4f}]")
    
    # Criar DataFrame com formato esperado pela API
    # Baseado no exemplo bootcamp_submission_example.csv
    predictions_df = pd.DataFrame()
    
    # Colunas esperadas pela API (usando config.py)
    failure_columns = config.FAILURE_COLUMNS
    
    print(f"📊 Colunas de falha esperadas: {failure_columns}")
    
    # Distribuir as predições para todas as colunas de falha
    for col in failure_columns:
        predictions_df[col] = predictions_proba
    
    # Garantir que os valores estão no range correto [0, 1]
    predictions_df = predictions_df.clip(0, 1)
    
    # Verificar se há valores inválidos
    if predictions_df.isnull().sum().sum() > 0:
        print("⚠️  Encontrados valores nulos, preenchendo com 0...")
        predictions_df = predictions_df.fillna(0)
    
    if np.isinf(predictions_df.select_dtypes(include=[np.number])).sum().sum() > 0:
        print("⚠️  Encontrados valores infinitos, substituindo...")
        predictions_df = predictions_df.replace([np.inf, -np.inf], 0)
    
    # Limitar o tamanho do arquivo se necessário (API pode ter limite)
    MAX_ROWS = 10000  # Limite conservativo
    if len(predictions_df) > MAX_ROWS:
        print(f"⚠️  Arquivo muito grande ({len(predictions_df)} linhas)")
        print(f"🔄 Reduzindo para {MAX_ROWS} linhas para teste...")
        predictions_df = predictions_df.head(MAX_ROWS)
    
    # Salvar arquivo
    predictions_df.to_csv(output_path, index=False)
    
    print(f"✅ Predições salvas em: {output_path}")
    print(f"📊 Shape das predições finais: {predictions_df.shape}")
    print(f"📊 Colunas: {list(predictions_df.columns)}")
    print(f"📊 Estatísticas das predições:")
    print(predictions_df.describe())
    
    # Salvar uma amostra menor para debug se necessário
    sample_file = str(output_path).replace('.csv', '_sample.csv')
    predictions_df.head(100).to_csv(sample_file, index=False)
    print(f"📝 Amostra salva em: {sample_file}")
    
    return output_path

def validate_predictions_format(predictions_file):
    """
    Valida o formato do arquivo de predições
    """
    print(f"🔍 Validando formato do arquivo...")
    
    try:
        df = pd.read_csv(predictions_file)
        
        print(f"   📊 Shape: {df.shape}")
        print(f"   📋 Colunas: {list(df.columns)}")
        print(f"   🔢 Tipos de dados:")
        print(df.dtypes)
        print(f"   📈 Valores únicos por coluna:")
        for col in df.columns:
            unique_vals = df[col].nunique()
            min_val = df[col].min()
            max_val = df[col].max()
            print(f"     {col}: {unique_vals} únicos, range [{min_val:.4f}, {max_val:.4f}]")
        
        # Verificar se há valores inválidos
        print(f"   ❓ Valores nulos: {df.isnull().sum().sum()}")
        print(f"   ❓ Valores infinitos: {np.isinf(df.select_dtypes(include=[np.number])).sum().sum()}")
        
        # Mostrar algumas linhas
        print(f"   👀 Primeiras 3 linhas:")
        print(df.head(3))
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao validar arquivo: {e}")
        return False

def evaluate_with_api(token, predictions_file, threshold=0.5):
    """
    Envia predições para API e recebe métricas
    Baseado na documentação oficial da API
    """
    print(f"📤 Enviando predições para API...")
    print(f"   Arquivo: {predictions_file}")
    print(f"   Threshold: {threshold}")
    print(f"   API URL: {API_EVALUATE_URL}")
    
    if not os.path.exists(predictions_file):
        print(f"❌ Arquivo não encontrado: {predictions_file}")
        return None
    
    # Validar formato do arquivo primeiro
    if not validate_predictions_format(predictions_file):
        return None
    
    try:
        # Headers conforme documentação oficial
        headers = {"X-API-Key": token}
        
        # Ler arquivo para debug
        file_size = os.path.getsize(predictions_file) / (1024 * 1024)  # MB
        print(f"   📁 Tamanho do arquivo: {file_size:.2f} MB")
        
        files = {"file": open(predictions_file, "rb")}
        params = {"threshold": threshold}
        
        print(f"🔄 Enviando requisição...")
        print(f"   Headers: X-API-Key: {token[:20]}...")
        print(f"   Params: {params}")
        
        response = requests.post(
            API_EVALUATE_URL,
            headers=headers,
            files=files,
            params=params,
            timeout=120  # Aumentar timeout para arquivos grandes
        )
        
        files["file"].close()
        
        print(f"📨 Status Code: {response.status_code}")
        print(f"📨 Headers da resposta: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                metrics = response.json()
                print("✅ Avaliação concluída com sucesso!")
                return metrics
            except json.JSONDecodeError as e:
                print(f"❌ Erro ao decodificar JSON: {e}")
                print(f"Resposta bruta: {response.text[:500]}...")
                return None
        else:
            print(f"❌ Erro na avaliação: {response.status_code}")
            print(f"Resposta: {response.text}")
            
            # Dicas específicas baseadas no erro
            if response.status_code == 401:
                print("💡 Dica: Verifique se o token está correto")
            elif response.status_code == 422:
                print("💡 Dica: Verifique o formato do arquivo CSV")
                print("💡 Certifique-se de que:")
                print("   - O arquivo tem as colunas corretas")
                print("   - Os valores estão entre 0 e 1")
                print("   - Não há valores nulos ou infinitos")
            elif response.status_code == 413:
                print("💡 Dica: Arquivo muito grande")
            elif response.status_code == 500:
                print("💡 Dica: Erro interno do servidor")
                print("   - Tente reduzir o tamanho do arquivo")
                print("   - Verifique se os valores estão no formato correto")
                print("   - A API pode estar sobrecarregada, tente mais tarde")
            
            return None
            
    except requests.exceptions.Timeout:
        print(f"❌ Timeout na requisição")
        print(f"💡 Dica: Arquivo muito grande ou API lenta, tente:")
        print(f"   - Reduzir o tamanho do arquivo")
        print(f"   - Tentar novamente mais tarde")
        return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
        print(f"💡 Dica: Verifique se a API está disponível em {API_BASE_URL}")
        return None

def save_api_results(metrics, output_file):
    """
    Salva resultados da API em arquivo JSON
    """
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=4, ensure_ascii=False)
    
    print(f"💾 Métricas da API salvas em: {output_file}")
    
    # Exibir resumo das métricas
    print("\n" + "="*60)
    print("📊 RESULTADOS DA API DE AVALIAÇÃO")
    print("="*60)
    
    if isinstance(metrics, dict):
        for failure_type, metrics_dict in metrics.items():
            if isinstance(metrics_dict, dict):
                print(f"\n🔧 {failure_type.upper()}:")
                for metric, value in metrics_dict.items():
                    if isinstance(value, (int, float)):
                        print(f"   {metric}: {value:.4f}")
                    else:
                        print(f"   {metric}: {value}")
            else:
                print(f"{failure_type}: {metrics_dict}")
    else:
        print(f"Métricas: {metrics}")
    
    print("="*60)

def test_api_connection():
    """
    Testa se a API está disponível
    """
    print("🔍 Testando conexão com a API...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API está disponível!")
            return True
        else:
            print(f"⚠️  API respondeu com status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar com a API: {e}")
        print(f"💡 Verifique se a API está online: {API_BASE_URL}")
        return False

def main():
    """
    Função principal do dashboard de integração com API
    """
    print("🚀 Iniciando integração com API de avaliação...")
    print(f"🌐 API Base URL: {API_BASE_URL}")
    print(f"📖 Documentação: {API_BASE_URL}/docs")
    print(f"🎛️  Dashboard: http://34.193.187.218:8501")
    
    # Testar conexão primeiro
    if not test_api_connection():
        print("❌ Não foi possível conectar com a API. Abortando...")
        print("💡 Verifique se a API está online ou tente mais tarde")
        return
    
    print("\n" + "-"*50)
    
    # Configurações
    email = input("Digite seu email para a API: ").strip()
    password = input("Digite sua senha para a API: ").strip()
    
    threshold_input = input(f"Digite o threshold (0.0-1.0, padrão 0.5): ").strip()
    threshold = float(threshold_input) if threshold_input else 0.5
    
    # Caminhos dos arquivos (usando config.py)
    predictions_file = config.PREDICTIONS_DIR / "api_predictions.csv"
    api_results_file = config.API_METRICS_PATH
    
    # Criar diretórios se não existirem
    config.create_dirs()
    
    try:
        # 1. Registrar usuário e obter token
        token = register_user(email, password)
        if not token:
            print("❌ Falha na obtenção do token. Abortando...")
            return
        
        # 2. Gerar predições
        print("\n" + "-"*50)
        predictions_file = generate_predictions_csv(
            config.MODEL_PATH, 
            config.DATA_PROCESSED, 
            predictions_file, 
            threshold
        )
        
        # 3. Enviar para API e receber métricas
        print("\n" + "-"*50)
        api_metrics = evaluate_with_api(token, predictions_file, threshold)
        if not api_metrics:
            print("❌ Falha na avaliação pela API. Abortando...")
            return
        
        # 4. Salvar resultados
        print("\n" + "-"*50)
        save_api_results(api_metrics, api_results_file)
        
        print(f"\n✅ Integração com API concluída com sucesso!")
        print(f"📁 Predições: {predictions_file}")
        print(f"📁 Métricas: {api_results_file}")
        print(f"🎯 Threshold usado: {threshold}")
        
    except KeyboardInterrupt:
        print("\n⏹️  Processo interrompido pelo usuário.")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        print(f"\n💡 Se o problema persistir, use o dashboard: http://34.193.187.218:8501")

if __name__ == "__main__":
    main()