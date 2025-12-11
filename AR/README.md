# Imersão em Realidade Aumentada — explorando experiências interativas que conectam o mundo físico ao digital.

Segue o projeto:  A.P.E.X.: Análise Preditiva para Excelência Operacional

https://imersao-apex.netlify.app/



# Treinamento WebAR - Manutenção Aeroespacial

## Descrição do Projeto
Aplicação de Realidade Aumentada desenvolvida para treinamento de técnicos e astronautas em procedimentos de manutenção de equipamentos espaciais, permitindo interação com componentes virtuais em um ambiente seguro de treinamento.

## Setor
Educação / Indústria Aeroespacial

## Objetivo
Simular procedimentos de inspeção e manutenção em equipamentos espaciais usando WebAR, proporcionando uma experiência imersiva e educativa para profissionais do setor aeroespacial.

## Funcionalidades Principais
###  Sistema de Interação

* **Visualização 3D em AR:** Modelo detalhado de equipamento espacial
* **Controle de Animação:** Sistema completo de play/pause/reinício
* **Interações Touch:**

  * Rotação livre 360° (arrastar)
  * Zoom in/out (pressionar longo)
  * Controle preciso de animações

## Sistema de Animação Avançado
* Animação Explosiva: Visualização detalhada dos componentes
* Controle Pausável: Congele a animação em qualquer frame para inspeção
* Loop Infinito: Reinício ilimitado para repetição do treinamento
* Feedback Visual: Status em tempo real do estado da animação

###  Interface do Usuário

* Tela de Boas-vindas: Instruções claras e requisitos
* Sistema de Status: Feedback visual do estado atual
* Design Responsivo: Compatível com mobile e desktop

##  Tecnologias Utilizadas

* **A-Frame 1.4.2** - Framework WebVR/WebAR
* **AR.js 3.4.5** - Biblioteca de Realidade Aumentada
* **Three.js** - Renderização 3D
* **JavaScript ES6** - Lógica de interação
* **HTML5 / CSS3** - Interface e estilização

##  Pré-requisitos

###  Hardware

* Dispositivo com câmera (smartphone, tablet ou webcam)
* Câmera traseira funcional para mobile
* Memória RAM mínima: 2GB

###  Software

* Navegador moderno com suporte a WebGL
* Conexão à internet (carregamento inicial)
* Permissões de câmera habilitadas

###  Materiais

* Marcador Hiro impresso ou exibido em outra tela
* Download do Marcador Hiro [aqui](https://github.com/LeonardoCorreia08/ImersaoRA/blob/main/assets/hiro.png)

##  Como Usar

### 1.  Inicialização

```bash
# Abra o arquivo em um servidor web
python -m http.server 8000
# Acesse: http://localhost:8000
```

### 2.  No Dispositivo Mobile

* Abra o link no navegador do celular
* Permita acesso à câmera quando solicitado
* Clique em "INICIAR TREINAMENTO"
* Aponte a câmera para o marcador Hiro

### 3.  Controles de Interação

| Gesto               | Ação              | Resultado                            |
| ------------------- | ----------------- | ------------------------------------ |
| 👆 Toque único      | Controle animação | Inicia → Pausa → Continua → Reinicia |
| 👆 Arrastar         | Rotaciona modelo  | 360° livre em todos os eixos         |
| 👆 Pressionar longo | Zoom in           | Aumenta escala gradualmente          |
| 👆 Soltar           | Zoom out          | Retorna ao tamanho original          |

##  Sistema de Animação

### Estados do Fluxo

```
🛑 PARADO → Toque → ▶️ EXECUTANDO → Toque → ⏸️ PAUSADO
⏸️ PAUSADO → Toque → ▶️ EXECUTANDO → Término → 🛑 PARADO
```

### Características da Animação

* Duração: ~6 segundos (configurável)
* Tipo: Animação de "explosão" para inspeção de componentes
* Controle: Pausa em qualquer frame para análise detalhada
* Repetição: Ilimitada para prática contínua

##  Estrutura Técnica

### Arquitetura de Componentes

```html
<a-marker>
  <a-entity id="model-container">
    <a-entity id="animation-wrapper"> <!-- Controla rotação/scale -->
      <a-entity id="model"              <!-- Controla animação -->
        gltf-model="#pneumatic-engine"
        gesture-handler>
      </a-entity>
    </a-entity>
  </a-entity>
</a-marker>
```

### Componentes Personalizados

* **gesture-detector:** Detecta toques e gestos
* **gesture-handler:** Gerencia interações e animações
* **Sistema de estabilidade:** Elimina tremores do modelo

##  Personalização

### Modificando o Modelo 3D

```html
<!-- Substitua no arquivo index.html -->
<a-asset-item id="test-model" src="novo-modelo.glb"></a-asset-item>
```

### Ajustes de Configuração

```javascript
// No componente gesture-handler
scale: "0.015 0.015 0.015"        // Tamanho do modelo
position: "0 0.3 0.2"             // Posição relativa
rotationSpeed: 0.4                 // Sensibilidade da rotação
```

##  Solução de Problemas

###  Problema: Modelo não aparece

**Soluções:**

* Verifique iluminação do marcador
* Use marcador Hiro de alta qualidade
* Mantenha câmera estável

###  Problema: Animação não funciona

**Soluções:**

* Recarregue a página
* Verifique console do navegador
* Teste em outro dispositivo

### ❌ Problema: Câmera não abre

**Soluções:**

* Verifique permissões do navegador
* Use conexão HTTPS em produção
* Teste em navegadores diferentes

##  Compatibilidade

| Dispositivo | Navegador      | Status      | Observações          |
| ----------- | -------------- | ----------- | -------------------- |
| Android     | Chrome         | ✅ Ótimo     | Melhor performance   |
| iOS         | Safari         | ✅ Bom       | Requer iOS 12+       |
| Desktop     | Chrome/Firefox | ✅ Excelente | Webcam necessária    |
| Tablets     | Todos          | ✅ Bom       | Tela maior vantajosa |

##  Créditos

### Modelo 3D

* **Modelo:** "3D Printable Radial Pneumatic Engine"
* **Autor:** Slava Z.
* **Fonte:** [Sketchfab](https://sketchfab.com/3d-models/3d-printable-radial-pneumatic-engine-3cbddbecd6c5462391e9936a3ccd7d32)
* **Licença:** CC Attribution

### Desenvolvimento

* **Desenvolvedor:** Leonardo Correia
* **Projeto:** Curso de ia aeroespacial 


##  Deploy

### Desenvolvimento

```bash
python -m http.server 8000
```

### Produção

* Hospede em servidor HTTPS
* Otimize assets para performance
* Teste cross-browser
* Configure CDN para bibliotecas

##  Limitações Conhecidas

* ⚠️ Performance pode variar em dispositivos antigos
* ⚠️ Requer boa iluminação para detecção do marcador
* ⚠️ Alguns dispositivos iOS podem ter restrições de câmera

##  Roadmap Futuro

* Múltiplos modelos e cenários
* Sistema de avaliação e pontuação
* Animações sequenciais complexas
* Modo colaborativo multi-usuário
* Export de relatórios de treinamento
* Integração com LMS (Sistema de Gestão de Aprendizagem)

##  Contato

* **Desenvolvedor:** Leonardo Correia
* **Data:** Novembro 2025


Contribuições são bem-vindas! Se você encontrar algum problema, tiver sugestões ou quiser adicionar novos recursos, fique à vontade para abrir uma issue ou enviar um pull request..

---

##  Desenvolvido para o futuro da educação e treinamento aeroespacial

**Treinamento seguro • Análise detalhada • Prática ilimitada**
