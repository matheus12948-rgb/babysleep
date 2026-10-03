# Motor de Estimativa de Sono — BabySleep (FASE 2)

Este documento detalha o funcionamento, as diretrizes de responsabilidade médica e a arquitetura matemática do motor **`SleepPredictionEngine`** evoluído na Fase 2.

---

## 1. Nomenclatura e Responsabilidade Médica

> **AVISO IMPORTANTE DE SAÚDE:**  
> O BabySleep fornece **estimativas probabilísticas de janelas de sono** e informações gerais sobre rotina infantil. Não constitui recomendação médica, prescrição pediátrica, certeza clínica ou diagnóstico. O sono infantil é dinâmico e varia conforme saúde, saltos de desenvolvimento, dentes e temperamento individual.

### Diretrizes de Linguagem Obrigatórias:
* ✅ **"Estimativa de janela de sono"** / **"Janela sugerida"**
* ✅ **"Previsão calculada"** / **"Confiança estimada"**
* ✅ **"Tendência observada"** / **"Padrão recente"**
* 🚫 *Nunca usar:* "Seu bebê precisa dormir", "O correto é", "Seu bebê deve dormir", "Diagnóstico de privação".

---

## 2. Entradas do Motor (`PredictionInput`)

O motor é estritamente determinístico, reproduzível e opera sem dependência de APIs externas de inteligência artificial generativa.

1. **Idade do bebê:** calculada com exatidão civil (em dias, semanas e meses) para seleção da faixa de referência etária.
2. **Horário do último despertar:** marco zero da janela de vigília atual.
3. **Duração e tipo do último sono:** identificação de sonecas curtas (< 35 min) vs. restauradoras (> 90 min) ou sono noturno.
4. **Histórico móvel das últimas 72 horas:** análise de sonos e vigílias nos últimos 3 dias.
5. **Consistência dos dados (`dataConsistencyScore`):** volume de registros, presença de sono noturno e dias com dados.
6. **Sono acumulado no dia:** contagem de sonecas já realizadas hoje em relação ao esperado.

---

## 3. Análise da Janela Móvel de 72 Horas

A função `SleepPredictionEngine.analyze72hHistory(records, now)` processa:
* **`windowRecordsCount`**: total de registros concluídos nas últimas 72h.
* **`distinctDaysCount`**: quantidade de dias civis com registros.
* **`avgNapDurationMinutes`**: média de duração das sonecas recentes.
* **`avgWakeWindowMinutes`**: média histórica real do intervalo entre sonos consecutivos do bebê.
* **`hasConsistentNightSleep`**: se há pelo menos um registro de sono noturno nas 72h.
* **`consistencyScore`** (0 a 100 pontos) e **`consistencyStatus`**:
  * **`INSUFFICIENT` (< 45 pts):** Bebê recém-cadastrado ou com menos de 4 registros. Ponderação orientada pelas referências etárias.
  * **`PARTIAL` (45 a 69 pts):** 4 a 7 registros com histórico preliminar. Ponderação equilibrada (40% individual, 60% referências).
  * **`CONSISTENT` (70+ pts):** 8+ registros em múltiplos dias com sono noturno. Ponderação individual dominante (65% histórico, 35% referências).

---

## 4. Ponderação Determinística da Janela de Vigília

$$\text{Janela Alvo} = \begin{cases} 
\text{Referência Populacional}, & \text{se } \text{status} = \text{INSUFFICIENT} \\
0.40 \times \text{Média 72h} + 0.60 \times \text{Referência}, & \text{se } \text{status} = \text{PARTIAL} \\
0.65 \times \text{Média 72h} + 0.35 \times \text{Referência}, & \text{se } \text{status} = \text{CONSISTENT}
\end{cases}$$

### Ajustes Dinâmicos:
* **Compensação por Soneca Curta (< 35 min):**  
  A janela subsequente é encurtada em:
  $$\Delta_{\text{curta}} = \text{Tolerância} \times \text{lastNapWeight}$$
* **Aproximação do Sono Noturno:**  
  Se o número de sonecas do dia atingir a meta esperada para a idade, a janela é ajustada para convergir suavemente ao horário habitual de dormir (`habitualBedtime`).

---

## 5. Saída e Transparência (`SleepPrediction`)

Toda estimativa gerada retorna:
* `predictedSleepTime`: horário estimado de adormecimento.
* `windowStartTime` e `windowEndTime`: intervalo de abertura e fechamento da janela recomendada.
* `estimatedDurationMinutes`: duração prevista com base no histórico recente e idade.
* `confidenceLevel`: `LOW` | `MEDIUM` | `HIGH`.
* `confidenceScore`: valor percentual transparente (ex: `78%`).
* `reasoning`: array explicativo exibido na interface ("Sobre esta estimativa"):
  * *Exemplo:*  
    1. *"Bebê acordou há 1h20."*  
    2. *"Histórico consistente de 72h com vigília média de 1h45."*  
    3. *"Última soneca foi curta (25 min) — janela seguinte ligeiramente reduzida."*

---

## 6. Aderência Previsão × Realidade

Quando o usuário registra o início real do sono, o sistema compara com a previsão ativa:
* **`ON_TIME`:** Diferença dentro da tolerância de ±15 minutos.
* **`EARLY`:** Bebê dormiu mais de 15 minutos antes do previsto (`diffMinutes < -15`).
* **`LATE`:** Bebê dormiu mais de 15 minutos após o previsto (`diffMinutes > 15`).

### Indicadores Agregados de Aderência:
* Percentual dentro da janela (`onTimePercentage`).
* Percentual antecipado (`earlyPercentage`) e atrasado (`latePercentage`).
* Erro Médio Absoluto (*Mean Absolute Error - MAE*):
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |\text{diffMinutes}_i|$$

---

## 7. Limitações Conhecidas

1. Saltos de desenvolvimento, cólicas, vacinas ou dentes podem alterar transitoriamente o ritmo sem aviso prévio.
2. O sistema requer de 3 a 5 dias de registros contínuos para elevar a confiança acima de 75%.
3. Não deve ser utilizado como ferramenta de diagnóstico de distúrbios neurológicos ou respiratórios do sono.
