import { Course, Article } from './types';

export const COURSES: Course[] = [
  {
    id: 'course-newborn',
    title: 'O Sono do Recém-Nascido',
    subtitle: 'Os primeiros 100 dias: acolhimento, ritmo circadiano e segurança',
    ageRange: '0 a 3 meses',
    icon: '🐣',
    badgeColor: 'from-amber-400 to-orange-500',
    description: 'Compreenda a transição do útero para o mundo e construa os alicerces de um sono tranquilo sem estresse.',
    lessons: [
      {
        id: 'lesson-newborn-1',
        courseId: 'course-newborn',
        title: 'O Quarto Trimestre e o Ritmo Circadiano',
        durationMinutes: 4,
        summary: 'Entenda por que recém-nascidos confundem dia com noite e como a luz solar ajuda a calibrar o relógio biológico.',
        content: `Nos primeiros meses de vida, o bebê ainda não produz melatonina de forma sincronizada com o ciclo dia/noite. No útero, era a mãe quem fornecia esses sinais hormonais.

### O que esperar:
- **Ciclos curtos:** O bebê acorda a cada 2 a 3 horas para se alimentar e obter calor.
- **Confusão dia/noite:** É muito comum ficarem mais alertas à noite nas primeiras semanas.

### Como apoiar o desenvolvimento do ritmo:
1. **Exposição à luz natural:** Durante o dia, abra cortinas e faça passeios ao ar livre (evitando sol direto).
2. **Ambiente diurno com sons normais:** A casa não precisa ficar em silêncio absoluto durante o dia.
3. **À noite, luz âmbar/vermelha suave:** Ao amamentar ou trocar fraldas de madrugada, utilize apenas luz indireta e evite estímulos como conversar animadamente.`,
        keyTakeaways: [
          'A melatonina só começa a ser produzida com ritmo próprio por volta das 8 a 12 semanas.',
          'Luz natural de dia e escuridão/luz suave à noite são os maiores aliados dos pais.',
          'Sonecas de dia não precisam de escuridão total nos primeiros 2 meses para não acentuar a confusão.'
        ],
        order: 1
      },
      {
        id: 'lesson-newborn-2',
        courseId: 'course-newborn',
        title: 'Sinais de Sono: Como Agir Antes do Choro',
        durationMinutes: 5,
        summary: 'Aprenda a reconhecer sinais sutis de sonolência para adormecer o bebê antes que o cortisol suba.',
        content: `O choro é um sinal tardio de cansaço. Quando o bebê chega ao choro de sono, seu corpinho já está inundado por cortisol e adrenalina, tornando o adormecimento muito mais difícil e agitado.

### A escala de sinais de sono:
1. **Sinais Iniciais (Momento de Ouro):**
   - Olhar fixo ou distante (olhar de "peixe fora d'água")
   - Movimentos corporais mais lentos e calmos
   - Perda de interesse pelo brinquedo ou pelo rosto do cuidador

2. **Sinais Intermediários (Hora de Iniciar o Ninho):**
   - Bocejos discretos
   - Esfregar os olhos ou o nariz
   - Sobrancelhas avermelhadas

3. **Sinais Tardios (Bebê Exausto/Overtired):**
   - Choro estridente ou irritação inconsolável
   - Arqueamento das costas
   - Agitação motora dos braços e pernas`,
        keyTakeaways: [
          'Observe a janela de vigília aproximada: recém-nascidos toleram entre 45 e 90 minutos acordados.',
          'Não espere o bebê chorar para preparar o ambiente.',
          'Sobrancelha avermelhada é um dos indicativos biológicos mais rápidos de cansaço.'
        ],
        order: 2
      },
      {
        id: 'lesson-newborn-3',
        courseId: 'course-newborn',
        title: 'Ambiente de Sono Seguro Pediátrico',
        durationMinutes: 4,
        summary: 'Diretrizes mundiais para prevenir riscos, temperatura ideal do berço e posição correta de dormir.',
        content: `A segurança no berço é a prioridade absoluta nos cuidados com bebês.

### Regras de ouro do sono seguro:
- **Barriguinha para cima (Dorso):** Sempre coloque o bebê para dormir de barriga para cima até que ele aprenda a rolar em ambas as direções com autonomia.
- **Superfície firme e plana:** Colchão firme com lençol bem preso com elástico.
- **Berço livre de objetos:** Nada de travesseiros, protetores acolchoados de berço, cobertores soltos, bichos de pelúcia ou ninhos moles.
- **Quarto compartilhado, cama separada:** Pelo menos nos primeiros 6 meses, o bebê deve dormir no mesmo quarto dos pais, porém em seu próprio berço ou moisés.
- **Temperatura térmica confortável:** Entre 20°C e 23°C. Evite excesso de camadas de roupa. Toque na nuca do bebê para verificar se não está suado.`,
        keyTakeaways: [
          'Barriga para cima em superfície firme salva vidas.',
          'Berço vazio é berço seguro: sem almofadas soltas ou protetores volumosos.',
          'Sacos de dormir seguros (sleep sacks) substituem cobertores soltos com total segurança.'
        ],
        order: 3
      },
      {
        id: 'lesson-newborn-4',
        courseId: 'course-newborn',
        title: 'Ruído Branco e Transição Suave',
        durationMinutes: 3,
        summary: 'Por que o som constante ajuda a acalmar o sistema neurológico imaturo.',
        content: `No útero, o fluxo sanguíneo da placenta e os batimentos cardíacos da mãe geravam um som contínuo de cerca de 70 a 80 decibéis — mais alto que um aspirador de pó!

Portanto, o silêncio absoluto de um quarto pode ser estranho e assustador para um bebê recém-nascido.

### Como usar o Ruído Branco com eficácia:
- **Volume seguro:** Não encoste o aparelho na orelha do bebê; mantenha a pelo menos 1 a 2 metros de distância e em volume moderado (cerca de 50 a 60 dB, equivalente a um chuveiro suave no banheiro).
- **Som contínuo:** Sons com variações melódicas chamam a atenção do cérebro. Sons monótonos como ruído marrom, chuva e ventilador ajudam a conectar ciclos de sono.
- **Fade-out:** Se não quiser deixar tocando a noite toda, use um timer com redução gradual de volume para não causar despertares súbitos pelo silêncio repentino.`,
        keyTakeaways: [
          'O útero é um ambiente ruidoso; o ruído contínuo simula essa sensação de proteção.',
          'Mantenha o aparelho distante do berço e com volume confortável.',
          'O som contínuo ajuda a mascarar barulhos da casa (portas fechando, campainha).'
        ],
        order: 4
      }
    ]
  },
  {
    id: 'course-4months',
    title: 'O Salto dos 4 Meses e Regressões',
    subtitle: 'Navegando pela maturidade neurológica do sono e despertares de ciclo',
    ageRange: '3 a 6 meses',
    icon: '🌙',
    badgeColor: 'from-indigo-500 to-purple-600',
    description: 'Entenda a maior transformação do sono infantil: o bebê desenvolve os mesmos 4 estágios do adulto.',
    lessons: [
      {
        id: 'lesson-4months-1',
        courseId: 'course-4months',
        title: 'O que Realmente Acontece aos 4 Meses?',
        durationMinutes: 5,
        summary: 'Não é um retrocesso, mas um avanço neurológico irreversível na estrutura do sono.',
        content: `Muitas famílias relatam que o bebê "dormia a noite toda" e, de repente, por volta das 16 semanas, começa a acordar a cada 45 a 90 minutos.

### A mudança na arquitetura do sono:
- **Antes dos 4 meses:** O bebê tinha apenas 2 fases no ciclo de sono (sono ativo REM e sono quieto não-REM). Ele caía diretamente em sono profundo.
- **Após os 4 meses:** O cérebro amadurece e passa a ter 4 estágios distintos de sono, exatamente como os adultos.
- **A cada fim de ciclo (45 a 50 min):** Há um micro-despertar natural. Se o bebê foi adormecido no colo mamando e, ao acordar de leve, se vê sozinho no berço sem o bico ou o balanço, ele ativa o alerta de sobrevivência e chora.`,
        keyTakeaways: [
          'A regressão dos 4 meses é na verdade uma progressão neurológica.',
          'Micro-despertares entre ciclos são universais em humanos.',
          'O segredo é aproximar o ambiente em que o bebê adormece daquele em que ele acorda.'
        ],
        order: 1
      },
      {
        id: 'lesson-4months-2',
        courseId: 'course-4months',
        title: 'Ritual Noturno de 20 Minutos',
        durationMinutes: 4,
        summary: 'A sequência previsível que reduz a ansiedade e prepara o organismo para o sono longo.',
        content: `Bebês adoram previsibilidade. Um ritual consistente ensina ao cérebro: "esta sequência significa que vamos descansar".

### Exemplo de ritual relaxante de 4 passos:
1. **Banho morninho ou massagem suave (5 a 7 min):** Água morna ajuda a baixar ligeiramente a temperatura corporal central depois, estimulando a sonolência.
2. **Troca de fralda e pijama aconchegante (3 min):** Movimentos calmos, sem cócegas ou brincadeiras agitadas.
3. **Alimentação tranquila (10 min):** Com pouca luz e ruído branco ligado.
4. **Canção de ninar ou leitura de um livrinho com carinho:** Momento de afeto e conexão segura antes de deitar no berço.`,
        keyTakeaways: [
          'Mantenha a mesma ordem todos os dias: previsibilidade gera relaxamento.',
          'Duração ideal entre 20 e 30 minutos.',
          'Desligue telas e reduza a iluminação da casa 1 hora antes do ritual.'
        ],
        order: 2
      },
      {
        id: 'lesson-4months-3',
        courseId: 'course-4months',
        title: 'Ajustando as Sonecas de Dia (4 para 3)',
        durationMinutes: 4,
        summary: 'Como organizar os horários diurnos para proteger a qualidade do sono noturno.',
        content: `Nesta fase, as janelas de vigília se expandem para cerca de 1h30 a 2h15. As sonecas curtas de 30 a 45 minutos tornam-se frequentes e geram apreensão, mas são naturais enquanto o bebê aprende a conectar ciclos.

### Diretrizes de sonecas aos 4-5 meses:
- **Quantidade:** Geralmente 3 a 4 sonecas por dia.
- **A última soneca (catnap):** Deve ser mais curta (30 a 40 minutos) e terminar com folga de pelo menos 2 horas antes da hora de deitar para a noite, garantindo pressão de sono suficiente.
- **Não force sonecas longas se o bebê acordar bem-humorado:** Observe o estado de espírito da criança antes de insistir exaustivamente.`,
        keyTakeaways: [
          'Janelas de vigília aumentam para 1h30 a 2h15.',
          'Proteja a última janela do dia para não deixar o bebê excessivamente acordado nem com pouca pressão de sono.',
          'Sonecas de 30 minutos são frustrantes, mas muito comuns nesta idade.'
        ],
        order: 3
      }
    ]
  },
  {
    id: 'course-routine',
    title: 'Rotina e Associação de Sono',
    subtitle: 'Autonomia suave, transição de sonecas e noites mais descansadas',
    ageRange: '6 a 12 meses',
    icon: '⭐',
    badgeColor: 'from-emerald-500 to-teal-600',
    description: 'Como encorajar a conexão entre ciclos de sono de maneira gentil e respeitando o vínculo de apego seguro.',
    lessons: [
      {
        id: 'lesson-routine-1',
        courseId: 'course-routine',
        title: 'Associações de Sono: Amigas ou Vilãs?',
        durationMinutes: 5,
        summary: 'Entendendo como desmistificar o colo, peito e embalo sem culpa ou radicalismos.',
        content: `Associação de sono é qualquer elemento, som ou movimento que o cérebro do bebê aprende a relacionar ao adormecer.

Nenhuma associação é inerentemente ruim se estiver funcionando para a sua família! O problema só existe quando o cuidador está exausto e não consegue mais sustentar o método a cada hora da noite.

### Criando associações sustentáveis:
- **Associações externas positivas:** Ruído branco, escuridão, saco de dormir, objeto de transição seguro (naninha aprovada após 1 ano).
- **Associações que exigem intervenção humana ativa:** Balanço vigoroso no colo, bico que cai toda hora e o bebê não sabe recolocar, mamadeira a cada 40 minutos.
- **Passo a passo gentil:** Não retire nada abruptamente. Adicione primeiro o som e o carinho na cabeça; aos poucos diminua a intensidade do balanço.`,
        keyTakeaways: [
          'Associações só precisam mudar se a família estiver sofrendo com exaustão.',
          'Acrescente novas associações relaxantes antes de retirar as antigas.',
          'Consistência e paciência geram resultados muito mais duradouros do que técnicas bruscas.'
        ],
        order: 1
      },
      {
        id: 'lesson-routine-2',
        courseId: 'course-routine',
        title: 'A Transição de 3 para 2 Sonecas',
        durationMinutes: 4,
        summary: 'Quando e como saber que seu bebê está pronto para eliminar a terceira soneca.',
        content: `A transição de 3 para 2 sonecas costuma ocorrer entre os 6 e 9 meses de idade.

### Sinais claros de que é hora de transitar:
1. O bebê recusa terminantemente a terceira soneca da tarde durante vários dias seguidos.
2. A terceira soneca empurra a hora de dormir da noite para muito tarde (ex: depois das 21h30).
3. As sonecas da manhã ou do início da tarde começam a encurtar drasticamente.
4. O bebê passa a acordar alegre no meio da madrugada querendo brincar (sinal de pouco sono acumulado à noite).

### Como estruturar o dia com 2 sonecas:
- Soneca 1: Meio da manhã (cerca de 2h30 a 3h após despertar).
- Soneca 2: Início da tarde (cerca de 3h após o fim da primeira soneca).
- Janela antes da noite: 3h30 a 4h de vigília.`,
        keyTakeaways: [
          'Ocorre geralmente entre 6 e 9 meses.',
          'Janelas de vigília estendem-se para cerca de 3 a 3,5 horas.',
          'Durante a semana de transição, antecipe o sono noturno em 30 minutos para evitar cansaço excessivo.'
        ],
        order: 2
      },
      {
        id: 'lesson-routine-3',
        courseId: 'course-routine',
        title: 'Despertares de Madrugada e Ansiedade de Separação',
        durationMinutes: 4,
        summary: 'O marco dos 8-10 meses em que o bebê entende que os pais existem mesmo quando não estão visíveis.',
        content: `Por volta dos 8 aos 10 meses, o bebê desenvolve a noção de **permanência do objeto**. Ele agora compreende que você continua existindo mesmo quando sai do quarto!

Isso costuma gerar uma fase intensa de ansiedade de separação.

### Como lidar com carinho e firmeza:
- **Brinque de esconde-achou durante o dia:** Ajuda o bebê a entender que você vai e sempre volta.
- **Não fuja escondido:** Ao sair, dê um abraço afetuoso e diga "já volto", transmitindo segurança emocional.
- **Seja o porto seguro à noite:** Responda ao chamado com presença calma, fale baixinho "está tudo bem, mamãe/papai está aqui", acariciando o corpinho sem precisar tirá-lo imediatamente do berço se não houver desconforto agudo.`,
        keyTakeaways: [
          'A ansiedade de separação é um marco saudável do desenvolvimento cognitivo.',
          'Brincadeiras de esconde-achou ajudam a internalizar o retorno do cuidador.',
          'Responda com calma e voz tranquila para desarmar o estado de alerta do bebê.'
        ],
        order: 3
      }
    ]
  },
  {
    id: 'course-feeding-sleep',
    title: 'Alimentação e Sono: A Conexão',
    subtitle: 'Digestão, rotina de mamadas e desmame noturno gradual',
    ageRange: '4 a 18 meses',
    icon: '🥑',
    badgeColor: 'from-rose-500 to-pink-600',
    description: 'Entenda como os nutrientes, o refluxo e a introdução alimentar dialogam diretamente com a qualidade do sono.',
    lessons: [
      {
        id: 'lesson-feed-1',
        courseId: 'course-feeding-sleep',
        title: 'Introdução Alimentar e Digestão Noturna',
        durationMinutes: 4,
        summary: 'Alimentos que promovem a saciedade sem pesar no sistema gastrointestinal imaturo.',
        content: `Quando a introdução alimentar começa (aos 6 meses), o sistema digestivo do bebê passa por uma revolução bacteriana e enzimática.

### Dicas para não atrapalhar o sono da noite:
- **Horário do jantar:** Ofereça a refeição salgada pelo menos 1h30 a 2 horas antes de deitar, permitindo digestão adequada.
- **Atenção aos gases:** Evite introduzir novos alimentos potencialmente flatulentos (brócolis, couve, leguminosas pesadas) diretamente na refeição noturna nos primeiros testes. Teste-os sempre no almoço.
- **Hidratação:** Com sólidos, a oferta regular de água é vital para prevenir constipação, que é uma grande vilã silenciosa do sono noturno.`,
        keyTakeaways: [
          'Jantar com antecedência de pelo menos 1h30 do sono.',
          'Novos alimentos devem ser testados preferencialmente de manhã ou no almoço.',
          'A constipação intestinal é causa frequente de cólicas e despertares noturnos.'
        ],
        order: 1
      },
      {
        id: 'lesson-feed-2',
        courseId: 'course-feeding-sleep',
        title: 'Fome Real vs Despertar por Conforto',
        durationMinutes: 5,
        summary: 'Como distinguir a necessidade calórica da busca por reconexão emocional e sucção não-nutritiva.',
        content: `À medida que o bebê se aproxima dos 9 a 12 meses com desenvolvimento ponderal adequado (confirmado pelo pediatra), grande parte das calorias diárias passa a ser obtida durante o dia.

### Como identificar o motivo do despertar:
- **Fome Real:**
  - O bebê mama com ritmo vigoroso por mais de 5 a 10 minutos.
  - Deglutição audível e compassada.
  - Acontece em horários relativamente espaçados (ex: a cada 4 horas).

- **Hábito / Conforto / Associação:**
  - O bebê dá 3 sugadas fracas, para e adormece imediatamente com o peito ou mamadeira na boca.
  - Desperta a cada 45 minutos a 1 hora logo após ser colocado de volta no berço.
  - Utiliza o seio exclusivamente como chupeta humana para conectar os ciclos de sono.`,
        keyTakeaways: [
          'Avalie com seu pediatra se o ganho de peso permite espaçar mamadas noturnas.',
          'Sugadas curtas e sonolentas indicam necessidade de conforto, não de calorias.',
          'Acolhimento alternativo pelo outro cuidador (parceiro/a) ajuda a quebrar o hábito sem choro solitário.'
        ],
        order: 2
      }
    ]
  }
];

export const ARTICLES: Article[] = [
  {
    id: 'art-wake-windows',
    title: 'O que são Janelas de Vigília e por que não deixá-los exaustos?',
    subtitle: 'O conceito mais importante da rotina infantil moderna explicado de forma simples',
    category: 'sleep',
    readTimeMinutes: 5,
    tags: ['janelas', 'sono', 'sinais-de-sono', 'cortisol'],
    icon: '⏳',
    summary: 'Descubra como o tempo em que o bebê permanece acordado determina a facilidade ou a luta para adormecer.',
    content: `A **janela de vigília** é o intervalo exato de tempo entre o momento em que o bebê abre os olhos de um sono e o momento em que fecha novamente para a próxima soneca ou sono noturno.

### O mito de "deixar acordado para cansar bastante":
Muitas pessoas da geração anterior diziam: *"Se você mantiver o bebê acordado o dia todo, ele vai desmaiar de sono à noite"*.

Na biologia infantil, acontece **exatamente o oposto**!

Quando um bebê ultrapassa o limite da sua janela de vigília suportável:
1. O cérebro percebe a exaustão física como uma ameaça à sobrevivência.
2. A glândula suprarrenal dispara **cortisol** (hormônio do estresse) e **adrenalina**.
3. O bebê ganha uma "segunda onda de energia", fica eufórico, ri alto, mexe pernas e braços sem parar.
4. Ao tentar deitá-lo, ele chora copiosamente, briga com o sono e acorda frequentemente a noite inteira.

### Parâmetros de referência de janelas por idade:
- **0 a 6 semanas:** 45 a 60 minutos
- **2 a 3 meses:** 60 a 90 minutos
- **4 a 6 meses:** 1h30 a 2h15
- **7 a 9 meses:** 2h30 a 3h15
- **10 a 14 meses:** 3h00 a 4h00
- **15 a 24 meses:** 4h30 a 5h30

*Dica BabySleep:* Use os parâmetros do BabySleep como estimativa de apoio flexível. Ajuste sempre acompanhando a observação dos sinais do seu bebê.`
  },
  {
    id: 'art-wonder-weeks',
    title: 'Saltos de Desenvolvimento: As Semanas de Mudança Mágica',
    subtitle: 'Por que o humor e o sono oscilam exatamente antes de uma nova habilidade motora ou cognitiva',
    category: 'leaps',
    readTimeMinutes: 6,
    tags: ['saltos', 'marcos', 'neurodesenvolvimento', 'paciência'],
    icon: '🧠',
    summary: 'Compreenda a mente do bebê em expansão e por que o colo e o aconchego são o melhor remédio para essas fases.',
    content: `Você já sentiu que seu bebê aprendeu a rolar, sentar ou balbuciar e, de repente, o sono "desandou" por 1 ou 2 semanas?

Isso é fruto dos chamados **Saltos de Desenvolvimento**.

### O que acontece no cérebro do bebê?
Durante um salto cognitivo, o mundo perceptual do bebê é completamente reconfigurado. Ele passa a perceber padrões, distâncias, relações de causa e efeito que antes não enxergava.

Imagine acordar amanhã e descobrir que consegue ver cores invisíveis ou ouvir frequências novas de rádio. Você também ficaria deslumbrado, ansioso e buscaria refúgio seguro em quem mais ama!

### Os três sintomas universais do salto (Os 3 "C"s):
1. **Choro (Crying):** Mais irritabilidade com frustrações cotidianas.
2. **Carência / Apego (Clinginess):** Quer colo o tempo todo; chora se o cuidador se afasta meio metro.
3. **Crise de Humor (Crankiness):** Dificuldade para relaxar e comer.

### Como apoiar o seu bebê durante um salto:
- Dê mais colo sem medo de "mimar". Segurança afetiva acelera a passagem pelo salto.
- Não inicie mudanças radicais de rotina durante o pico de um salto.
- Deixe o bebê praticar a nova habilidade durante o dia (tapetinho de chão, espelho, estímulos motores). Quando o cérebro domina a habilidade, o sono volta ao normal.`
  },
  {
    id: 'art-sound-colors',
    title: 'Ruído Branco, Rosa ou Marrom: Qual usar no sono do bebê?',
    subtitle: 'A física acústica dos tons relaxantes e como escolher o som perfeito',
    category: 'sleep',
    readTimeMinutes: 4,
    tags: ['ruido-branco', 'sons', 'acustica', 'sono'],
    icon: '🔊',
    summary: 'Entenda a diferença das densidades de frequências sonoras e descubra por que o ruído marrom e rosa são mais suaves.',
    content: `O termo "ruído branco" virou sinônimo de qualquer som constante para dormir. No entanto, a acústica classifica os ruídos por cores, de acordo com o espectro de frequências.

### 1. Ruído Branco (White Noise):
- Possui todas as frequências audíveis na mesma intensidade de energia.
- Soa como uma TV fora do ar ou estática pura.
- **Uso ideal:** Excelente para mascarar sons agudos pontuais da rua, latidos e portas.

### 2. Ruído Rosa (Pink Noise):
- As frequências mais graves têm maior potência, decaindo 3 dB por oitava à medida que sobem.
- Soa como uma chuva constante e suave na folhagem ou vento moderado.
- Estudos neurológicos indicam que o ruído rosa favorece a estabilidade das ondas cerebrais lentas do sono profundo.

### 3. Ruído Marrom (Brown Noise):
- Decaimento de 6 dB por oitava. Foco predominante nas frequências graves e aveludadas.
- Soa como uma cachoeira distante, trovões abafados ou um grande ventilador industrial suave.
- **O favorito dos bebês:** Por ser mais aconchegante e menos sibilante que o ruído branco puro.

*No BabySleep:* No player nativo de sons, você conta com os três sintetizados em tempo real, além de sons orgânicos de útero, mar e chuva com fade-out gradual.`
  },
  {
    id: 'art-early-waking',
    title: 'A Arte do Despertar Feliz: O que fazer quando acordam antes das 6h',
    subtitle: 'Estratégias comprovadas para lidar com os madrugadores indesejados',
    category: 'sleep',
    readTimeMinutes: 5,
    tags: ['madrugadores', 'despertar-precoce', 'rotina', 'noite'],
    icon: '🌅',
    summary: 'Descubra os 4 maiores vilões que fazem bebês pularem do berço às 5h da manhã com energia total.',
    content: `O despertar precoce (entre 4h30 e 5h30) é uma das queixas mais desgastantes para pais e cuidadores.

Por que isso acontece? Às 4h da manhã, a pressão biológica de sono do bebê já diminuiu quase 80%, o pico de melatonina passou e o cortisol matinal já começa a subir lentamente. Qualquer desconforto mínimo vira um gatilho de despertar definitivo.

### Os 4 principais vilões do despertar precoce:
1. **Luz solar entrando no quarto:**
   Mesmo uma fresta minúscula de luz às 5h sinaliza ao nervo óptico que o dia começou.
   *Solução:* Cortina blackout 100% vedada nas laterais.
2. **Queda de temperatura na madrugada:**
   Entre 4h e 6h é a hora mais fria do dia. O bebê que estava quentinho esfria e acorda com o corpinho tenso.
   *Solução:* Use saco de dormir seguro com TOG adequado à estação.
3. **Cansaço excessivo acumulado na véspera:**
   Ir para a cama muito tarde gera cortisol, que detona o sono nas horas mais leves da manhã.
   *Solução:* Experimente antecipar a hora de dormir em 20 a 30 minutos.
4. **Alimentação muito cedo:**
   Se todo dia às 5h o bebê ganha uma mamadeira cheia e vai brincar na sala, o estômago aprende a acordar exatamente nessa hora para comer. Trate qualquer despertar antes das 6h como sono noturno: luz apagada, sussurro e ambiente sonolento.`
  },
  {
    id: 'art-safe-room-temp',
    title: 'Temperatura do Quarto e Roupas Adequadas para o Sono Seguro',
    subtitle: 'Como vestir o bebê sem risco de superaquecimento ou desconforto térmico',
    category: 'wellbeing',
    readTimeMinutes: 4,
    tags: ['segurança', 'temperatura', 'quarto', 'saude'],
    icon: '🌡️',
    summary: 'Aprenda a checar a temperatura correta no corpo do bebê e escolha as camadas certas para a noite.',
    content: `O superaquecimento é um dos fatores de risco mais documentados na medicina pediátrica em relação ao sono infantil. Bebês têm mais dificuldade em regular o calor corporal do que adultos.

### A regra de ouro da temperatura:
A faixa recomendada para o quarto do bebê fica entre **20°C e 23°C**.

### Mãos e pés frios não significam frio!
A circulação periférica de recém-nascidos e bebês pequenos ainda está em formação. Mãos e pés quase sempre parecem frios ao toque.

**Onde checar a temperatura real:**
Coloque dois dedos na **nuca ou no peitinho** do bebê:
- Se estiver quentinho e seco: a temperatura está excelente.
- Se estiver suado, quente ou pegajoso: o bebê está com calor. Remova uma camada de roupa imediatamente.
- Se a nuca estiver nitidamente fria: adicione um body por baixo ou escolha um pijama mais aconchegante.

### Camadas de vestir:
Como diretriz geral: vista o bebê com apenas **uma camada a mais** do que você estaria vestindo confortavelmente no mesmo ambiente.`
  },
  {
    id: 'art-overtired-paradox',
    title: 'Cansaço Excessivo: O paradoxo do bebê que não dorme porque está exausto',
    subtitle: 'Por que quanto mais cansado o bebê está, mais difícil é acalmá-lo para dormir',
    category: 'sleep',
    readTimeMinutes: 5,
    tags: ['cansaço', 'overtired', 'cortisol', 'dicas'],
    icon: '⚡',
    summary: 'Aprenda a quebrar o ciclo vicioso do over-tired com técnicas calmantes de desaceleração.',
    content: `Para quem não conhece a fisiologia infantil, a lógica parece simples: "se o bebê estiver exausto, ele vai deitar e dormir rapidamente". Na prática com bebês, o resultado é o oposto: um colapso de choro e resistência.

### O mecanismo biológico do Over-tired:
Quando o limite de vigília é ultrapassado, o cérebro da criança interpreta o cansaço como uma situação de alerta/fuga.
- A glândula adrenal libera adrenalina e cortisol.
- A frequência cardíaca aumenta e os sentidos ficam hipersensíveis.
- O bebê luta contra o sono porque seu corpo físico está em estado de luta ou fuga.

### Passo a passo para resgatar um bebê exausto:
1. **Mude o ambiente imediatamente:** Saia da sala iluminada, vá para um quarto escuro e silencioso.
2. **Ligue o ruído marrom ou de útero:** O som constante ajuda a quebrar o circuito de hiperexcitação cerebral.
3. **Mantenha sua própria respiração lenta e compassada:** Bebês sintonizam seu sistema nervoso autônomo com o do cuidador pelo ritmo dos batimentos e da respiração. Se você se desesperar, ele fica ainda mais agitado.
4. **Ofereça aconchego sem insistir no berço de imediato:** Faça o ninho no colo, acalme o choro primeiro, e só deite após o corpo relaxar.`
  }
];
