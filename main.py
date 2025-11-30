#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MAIN.PY - Pipeline Principal
============================
Executa o pipeline completo de ML do projeto Bootcamp CDIA
"""

import os
import sys
import logging
import argparse
from datetime import datetime
from pathlib import Path

# Importar módulos do projeto
import config
import preprocess
import train
import evaluate

def setup_logging():
    """
    Configura logging do pipeline
    """
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Configurar logging para console
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(config.LOGS_DIR / 'pipeline.log')
        ]
    )
    
    return logging.getLogger(__name__)

def run_preprocessing():
    """
    Executa etapa de preprocessamento
    """
    logger.info("🔧 Iniciando preprocessamento...")
    
    try:
        # Importar e executar preprocessamento
        if hasattr(preprocess, 'main'):
            preprocess.main()
        else:
            logger.warning("Função main() não encontrada em preprocess.py")
        
        logger.info("✅ Preprocessamento concluído")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro no preprocessamento: {e}")
        return False

def run_training():
    """
    Executa etapa de treinamento
    """
    logger.info("🧠 Iniciando treinamento...")
    
    try:
        # Importar e executar treinamento
        if hasattr(train, 'main'):
            train.main()
        else:
            logger.warning("Função main() não encontrada em train.py")
        
        logger.info("✅ Treinamento concluído")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro no treinamento: {e}")
        return False

def run_evaluation():
    """
    Executa etapa de avaliação
    """
    logger.info("📊 Iniciando avaliação...")
    
    try:
        # Importar e executar avaliação
        if hasattr(evaluate, 'main'):
            evaluate.main()
        else:
            logger.warning("Função main() não encontrada em evaluate.py")
        
        logger.info("✅ Avaliação concluída")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro na avaliação: {e}")
        return False

def run_full_pipeline():
    """
    Executa pipeline completo
    """
    logger.info("🚀 Iniciando pipeline completo de ML")
    logger.info(f"📁 Diretório de trabalho: {os.getcwd()}")
    logger.info(f"🐍 Python: {sys.version}")
    logger.info(f"🌍 Ambiente: {os.getenv('ML_PROJECT_ENV', 'local')}")
    
    start_time = datetime.now()
    
    # Criar diretórios necessários
    config.create_dirs()
    
    # Verificar se arquivo de dados existe
    if not config.DATA_RAW.exists():
        logger.error(f"❌ Arquivo de dados não encontrado: {config.DATA_RAW}")
        logger.info("💡 Certifique-se de que bootcamp_train.csv está em data/")
        return False
    
    steps = [
        ("Preprocessamento", run_preprocessing),
        ("Treinamento", run_training),
        ("Avaliação", run_evaluation)
    ]
    
    results = []
    
    for step_name, step_func in steps:
        logger.info(f"\n{'='*60}")
        logger.info(f"📋 ETAPA: {step_name}")
        logger.info(f"{'='*60}")
        
        success = step_func()
        results.append((step_name, success))
        
        if not success:
            logger.error(f"❌ Pipeline interrompido na etapa: {step_name}")
            break
    
    # Resumo final
    end_time = datetime.now()
    duration = end_time - start_time
    
    logger.info(f"\n{'='*60}")
    logger.info(f"🏁 RESUMO DO PIPELINE")
    logger.info(f"{'='*60}")
    logger.info(f"⏱️  Duração total: {duration}")
    logger.info(f"📅 Início: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"📅 Fim: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    for step_name, success in results:
        status = "✅ SUCESSO" if success else "❌ FALHOU"
        logger.info(f"   {step_name}: {status}")
    
    all_success = all(success for _, success in results)
    
    if all_success:
        logger.info("\n🎉 PIPELINE CONCLUÍDO COM SUCESSO!")
        logger.info(f"📁 Modelo salvo em: {config.MODEL_PATH}")
        logger.info(f"📁 Métricas em: {config.METRICS_DIR}")
        logger.info(f"📁 Predições em: {config.PREDICTIONS_DIR}")
    else:
        logger.error("\n💥 PIPELINE FALHOU!")
    
    return all_success

def main():
    """
    Função principal com argumentos de linha de comando
    """
    parser = argparse.ArgumentParser(
        description="Pipeline ML - Bootcamp CDIA",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python main.py                    # Pipeline completo
  python main.py --step preprocess  # Apenas preprocessamento
  python main.py --step train       # Apenas treinamento
  python main.py --step evaluate    # Apenas avaliação
        """
    )
    
    parser.add_argument(
        '--step',
        choices=['preprocess', 'train', 'evaluate', 'all'],
        default='all',
        help='Etapa específica a executar (padrão: all)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Modo verboso (debug)'
    )
    
    args = parser.parse_args()
    
    # Configurar logging
    global logger
    logger = setup_logging()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("🔍 Modo debug ativado")
    
    # Executar etapa solicitada
    if args.step == 'preprocess':
        success = run_preprocessing()
    elif args.step == 'train':
        success = run_training()
    elif args.step == 'evaluate':
        success = run_evaluation()
    else:  # 'all'
        success = run_full_pipeline()
    
    # Exit code baseado no sucesso
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()