import streamlit as st
import pandas as pd
import joblib

# ======================
# 📥 Carregar Modelo
# ======================
MODEL_PATH = "models/modelo.pkl"

@st.cache_resource
def load_model():
    return joblib.load(MODEL_PATH)

model = load_model()

# ======================
# 🎛️ Layout Streamlit
# ======================
st.set_page_config(page_title="Manutenção Preditiva", page_icon="⚙️", layout="wide")
st.title("⚙️ Manutenção Preditiva com Machine Learning")
st.markdown("Preveja falhas em máquinas industriais a partir de dados de sensores.")

# Sidebar para inputs
st.sidebar.header("📥 Entrada de Dados")

torque = st.sidebar.number_input("Torque [Nm]", min_value=0.0, max_value=500.0, value=200.0)
velocidade = st.sidebar.number_input("Velocidade Rotacional [RPM]", min_value=0.0, max_value=10000.0, value=3500.0)
potencia = st.sidebar.number_input("Potência Mecânica [kW]", min_value=0.0, max_value=500.0, value=120.0)
desgaste = st.sidebar.number_input("Desgaste da Ferramenta [%]", min_value=0.0, max_value=100.0, value=10.0)
temp_proc = st.sidebar.number_input("Temperatura do Processo [°C]", min_value=0.0, max_value=500.0, value=200.0)
temp_ar = st.sidebar.number_input("Temperatura do Ar [°C]", min_value=-10.0, max_value=50.0, value=25.0)
umidade = st.sidebar.number_input("Umidade Relativa [%]", min_value=0.0, max_value=100.0, value=40.0)

# Criar DataFrame de entrada
input_data = pd.DataFrame([{
    "torque": torque,
    "velocidade": velocidade,
    "potencia": potencia,
    "desgaste_da_ferramenta": desgaste,
    "temperatura_processo": temp_proc,
    "temperatura_ar": temp_ar,
    "umidade_relativa": umidade
}])

st.subheader("📊 Dados de Entrada")
st.dataframe(input_data)

# ======================
# 🎯 Predição
# ======================
if st.button("🚀 Rodar Predição"):
    try:
        pred = model.predict(input_data)[0]
        proba = model.predict_proba(input_data)[0]

        st.success(f"**Resultado:** {'⚠️ Falha Detectada' if pred == 1 else '✅ Operação Normal'}")
        st.metric("Probabilidade de Falha", f"{proba[1]*100:.2f}%")
        st.metric("Probabilidade de Operação Normal", f"{proba[0]*100:.2f}%")

        st.bar_chart(pd.DataFrame({
            "Probabilidade": proba
        }, index=["Normal", "Falha"]))

    except Exception as e:
        st.error("❌ Erro ao processar a predição")
        st.exception(e)

st.markdown("---")
st.markdown("**Produzido por Leonardo Correia** 🚀")