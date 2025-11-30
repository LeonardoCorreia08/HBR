# -*- coding: utf-8 -*-
"""
Editor Spyder

Este é um arquivo de script temporário.
"""

# preprocess.py
# -*- coding: utf-8 -*-
"""
Etapa 1 - PRÉ-PROCESSAMENTO
----------------------------
- Carrega dataset bruto (definido em config.DATA_RAW)
- Realiza limpeza e transformação
- Salva dataset tratado (config.DATA_PROCESSED)
"""

import pandas as pd
import config

def main():
    print("📥 Carregando dados de:", config.DATA_RAW)
    df = pd.read_csv(config.DATA_RAW)

    # =====================
    # Limpeza de dados
    # =====================
    # Remover duplicados
    df = df.drop_duplicates()

    # Tratar valores ausentes
    df = df.ffill().bfill()

    # Normalização de labels (exemplo: target binário)
    def normalize_label(x):
        s = str(x).strip().lower()
        if s in {"1", "sim", "s", "true", "verdadeiro", "y"}:
            return 1
        if s in {"0", "não", "nao", "n", "false", "falso", "-"}:
            return 0
        return None

    df[config.TARGET] = df[config.TARGET].apply(normalize_label)

    # =====================
    # Engenharia de Atributos (ajuste conforme seu dataset)
    # =====================
    # Exemplo: encoding simples para variáveis categóricas
    df = pd.get_dummies(df, columns=config.CATEGORICAL_COLS, drop_first=True)

    # =====================
    # Salvar dataset tratado
    # =====================
    df.to_csv(config.DATA_PROCESSED, index=False)
    print("✅ Dados tratados salvos em:", config.DATA_PROCESSED)


if __name__ == "__main__":
    main()
