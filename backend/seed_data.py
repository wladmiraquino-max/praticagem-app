"""
Popula o banco com questões reais do concurso de Praticagem e simulados.
Execute: python seed_data.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)

QUESTIONS = [
    # ── MANOBRA ───────────────────────────────────────────────────────────────
    {
        "text": "De acordo com Fragoso & Cajaty, qual é o ganho de força de tração a vante proporcionado pela instalação de um tubulão-Kort em um rebocador convencional?",
        "options": {"A": "Até 15%, sem efeito sobre o governo", "B": "Até 30%, com redução da capacidade de governo", "C": "Até 30%, sem qualquer efeito sobre o governo", "D": "Até 50%, com aumento da capacidade de governo"},
        "correct": "C",
        "explanation": "O tubulão-Kort (Kort nozzle) aumenta a força de tração a vante em até 30% sem afetar a capacidade de governo do rebocador, segundo Fragoso & Cajaty (CONAPRA, 2ª Ed., 2021).",
        "subject": "Arte Naval",
        "discipline": "2",
        "difficulty": "Fácil",
        "source": "SANTOS, F.M. & CAJATY, M. – Rebocadores Portuários, CONAPRA (2ª Ed., 2021)"
    },
    {
        "text": "Segundo Hensen (4ª Ed., 2021), qual é a principal vantagem operacional do rebocador ASD (Azimuth Stern Drive) em relação ao rebocador convencional de hélice fixo durante manobras de escolta?",
        "options": {"A": "Menor consumo de combustível em velocidade máxima", "B": "Capacidade de gerar força de guinada tanto a vante quanto a ré sem reposicionar o casco", "C": "Maior bollard pull estático em ambiente portuário calmo", "D": "Menor risco de capotamento por efeito girante"},
        "correct": "B",
        "explanation": "O ASD pode gerar forças em qualquer direção sem necessidade de reposicionar o casco, tornando-o ideal para escolta a alta velocidade. (Hensen, 4ª Ed., Cap. 3)",
        "subject": "Arte Naval",
        "discipline": "2",
        "difficulty": "Médio",
        "source": "HENSEN, Henk – Tug Use in Port, STC Publishing (4ª Ed., 2021)"
    },
    {
        "text": "Ao navegar em águas rasas, qual fenômeno causa redução da velocidade do navio mesmo mantendo a mesma potência de máquina?",
        "options": {"A": "Efeito banco (bank effect)", "B": "Squat", "C": "Aumento da resistência de onda (wave-making)", "D": "Cavitação do hélice"},
        "correct": "C",
        "explanation": "Em águas rasas, a resistência de onda aumenta significativamente pois as ondas geradas pelo navio interagem com o fundo. Além disso, o squat aumenta o calado efetivo. (Lewis, Principles of Naval Architecture, Vol. II)",
        "subject": "Manobra",
        "discipline": "1",
        "difficulty": "Médio",
        "source": "LEWIS, E.V. – Principles of Naval Architecture, SNAME, Vol. II (1988)"
    },
    {
        "text": "Segundo a Res. MSC.137(76) da IMO, qual é o critério máximo para o diâmetro tático (tactical diameter) no teste de evolução (turning circle)?",
        "options": {"A": "3,0 × Lpp", "B": "4,5 × Lpp", "C": "5,0 × Lpp", "D": "6,0 × Lpp"},
        "correct": "C",
        "explanation": "A Resolução MSC.137(76) estabelece que o diâmetro tático não deve exceder 5,0 × Lpp (comprimento entre perpendiculares). O avanço máximo permitido é 4,5 × Lpp.",
        "subject": "Manobra",
        "discipline": "1",
        "difficulty": "Difícil",
        "source": "IMO Res. MSC.137(76) – Standards for Ship Manoeuvrability"
    },
    # ── LEGISLAÇÃO ────────────────────────────────────────────────────────────
    {
        "text": "Conforme a Lei de Praticagem (Lei nº 9.432/1997), em qual situação o armador pode dispensar o prático a bordo?",
        "options": {"A": "Quando o comandante possuir habilitação equivalente emitida pela DPC", "B": "Quando o navio estiver em lastro e o porto for considerado de risco baixo pela Marinha", "C": "Quando o Ministério dos Transportes autorizar por prazo determinado", "D": "Quando o comandante possuir a Habilitação de Dispensa de Praticagem (HDP) emitida pela DPC"},
        "correct": "D",
        "explanation": "A Lei 9.432/97 e a Portaria nº 37/MB/2022 permitem ao comandante que possua a HDP (Habilitação de Dispensa de Praticagem), emitida pela Diretoria de Portos e Costas, dispensar o serviço de praticagem.",
        "subject": "Legislação Marítima",
        "discipline": "5",
        "difficulty": "Médio",
        "source": "Lei nº 9.432, de 8 de janeiro de 1997; Portaria nº 37/MB, 21/02/2022"
    },
    {
        "text": "Segundo a Portaria nº 37/MB/2022, qual é o número mínimo de práticos necessários para compor uma Zona de Praticagem (ZP)?",
        "options": {"A": "3 práticos", "B": "5 práticos", "C": "7 práticos", "D": "10 práticos"},
        "correct": "B",
        "explanation": "A Portaria nº 37/MB/2022 estabelece que cada Zona de Praticagem deve ser composta por no mínimo 5 (cinco) práticos habilitados para operar na respectiva zona.",
        "subject": "Legislação Marítima",
        "discipline": "5",
        "difficulty": "Médio",
        "source": "Portaria nº 37/MB, 21/02/2022 – Regulamento de Praticagem"
    },
    {
        "text": "De acordo com a Lei nº 2.180/1954 (Tribunal Marítimo), qual é a competência exclusiva desse órgão em relação aos acidentes da navegação?",
        "options": {"A": "Processar e julgar criminalmente os responsáveis por naufrágios", "B": "Julgar os acidentes e fatos da navegação e manter o registro geral de embarcações", "C": "Fiscalizar o cumprimento das normas SOLAS nos portos brasileiros", "D": "Estabelecer as zonas de praticagem e suas tarifas"},
        "correct": "B",
        "explanation": "O Tribunal Marítimo, criado pela Lei 2.180/1954, tem competência para julgar os acidentes e fatos da navegação ocorridos em águas sob jurisdição brasileira e manter o registro geral de embarcações, sendo um órgão auxiliar do Poder Judiciário.",
        "subject": "Legislação Marítima",
        "discipline": "5",
        "difficulty": "Fácil",
        "source": "Lei nº 2.180, de 5 de fevereiro de 1954 – Tribunal Marítimo"
    },
    # ── NAVEGAÇÃO ─────────────────────────────────────────────────────────────
    {
        "text": "Segundo a Resolução MSC.530(106) da IMO (ECDIS Performance Standards, 2022), qual é o requisito mínimo de atualização de cartas náuticas no ECDIS?",
        "options": {"A": "Semanal, via qualquer meio disponível", "B": "A cada 28 dias, obrigatoriamente por serviço autorizado", "C": "Contínua, com atualização automática sempre que disponível", "D": "Mensal, via AVISO AOS NAVEGANTES da DHN"},
        "correct": "C",
        "explanation": "A MSC.530(106) (2022) reforça que as ENCs no ECDIS devem ser mantidas atualizadas de forma contínua. O sistema deve suportar recepção automática de atualizações via serviços autorizados (ex: AVCS, PRIMAR).",
        "subject": "Navegação e Radar",
        "discipline": "6",
        "difficulty": "Difícil",
        "source": "IMO Res. MSC.530(106) – Revised Performance Standards for ECDIS (2022)"
    },
    {
        "text": "No sistema DGPS (Differential GPS), qual é a função principal da estação de referência terrestre?",
        "options": {"A": "Amplificar os sinais GPS para cobertura em maior área", "B": "Calcular e transmitir correções diferenciais para melhorar a precisão dos receptores móveis", "C": "Substituir o sinal GPS em caso de falha dos satélites", "D": "Monitorar o tráfego marítimo em tempo real para o VTS"},
        "correct": "B",
        "explanation": "A estação de referência do DGPS, em posição conhecida, calcula o erro do sinal GPS recebido e transmite correções diferenciais (RTCM) que os receptores móveis usam para melhorar sua precisão para sub-métrica.",
        "subject": "Navegação e Radar",
        "discipline": "6",
        "difficulty": "Fácil",
        "source": "NORMAM-511/DHN – Normas para Utilização de Sistemas de Rádionavegação"
    },
    # ── METEOROLOGIA ──────────────────────────────────────────────────────────
    {
        "text": "Segundo Ynoue et al. (2017), qual é a principal característica das nuvens do gênero Cumulonimbus (Cb) que as torna perigosas para a navegação?",
        "options": {"A": "Cobertura de baixa altitude que reduz visibilidade a menos de 1 milha", "B": "Correntes verticais intensas com turbulência severa, granizo, raios e possibilidade de tromba-d'água", "C": "Ventos alísios constantes que desviam rotas de navegação", "D": "Precipitação contínua e uniforme que dificulta operações portuárias"},
        "correct": "B",
        "explanation": "Os Cumulonimbus são nuvens de desenvolvimento vertical associadas a tempestades severas, com correntes ascendentes e descendentes intensas, turbulência, granizo, raios, chuva torrencial e eventual tromba-d'água — perigos diretos à navegação.",
        "subject": "Meteorologia e Oceanografia",
        "discipline": "4",
        "difficulty": "Médio",
        "source": "YNOUE, R.Y. et al. – Meteorologia: Noções Básicas (2017), Cap. Nuvens"
    },
    # ── SEGURANÇA ─────────────────────────────────────────────────────────────
    {
        "text": "De acordo com a Convenção SOLAS 2024 (Reg. V/23), quais são os requisitos para a transferência de práticos (pilot transfer arrangements)?",
        "options": {"A": "Escada de prático aprovada pela bandeira ou rampa de transferência, iluminação adequada e salva-vidas à mão", "B": "Apenas escada de prático aprovada pela IMO com distância máxima de 9 metros", "C": "Escada de prático ou helicóptero conforme preferência do armador", "D": "Combinação de escada de prático e escada de portaló apenas para navios acima de 500 GT"},
        "correct": "A",
        "explanation": "A SOLAS Reg. V/23, complementada pelas Resoluções A.1045(27), A.1108(29) e MSC.1/Circ.1495/Rev.1, exige escada de prático aprovada OU rampa de transferência, iluminação adequada do local e equipamentos de salva-vidas prontamente disponíveis.",
        "subject": "Segurança da Navegação",
        "discipline": "8",
        "difficulty": "Médio",
        "source": "SOLAS 2024, Reg. V/23; IMO Res. A.1045(27), A.1108(29)"
    },
    {
        "text": "Segundo o Código ISPS (International Ship and Port Facility Security Code), quais são os três níveis de proteção (security levels) definidos?",
        "options": {"A": "Nível Verde, Nível Amarelo, Nível Vermelho", "B": "Nível 1 (normal), Nível 2 (elevado), Nível 3 (excepcional)", "C": "Nível Básico, Nível Intermediário, Nível Máximo", "D": "Nível A, Nível B, Nível C"},
        "correct": "B",
        "explanation": "O Código ISPS define: Nível 1 (normal – medidas mínimas de proteção), Nível 2 (elevado – medidas adicionais por ameaça heightened), Nível 3 (excepcional – medidas máximas por ameaça específica ou iminente). (SOLAS, Cap. XI-2)",
        "subject": "Segurança da Navegação",
        "discipline": "8",
        "difficulty": "Fácil",
        "source": "SOLAS 2024, Cap. XI-2; Código ISPS, Parte A"
    },
    # ── ARTE NAVAL ────────────────────────────────────────────────────────────
    {
        "text": "Conforme Fonseca (Arte Naval, 8ª Ed., 2019), quando um navio de um hélice de passo direito está governando a ré com máquina a vante, qual é o efeito predominante do hélice sobre a popa?",
        "options": {"A": "A popa deriva para bombordo devido ao efeito de pá", "B": "A popa deriva para estibordo devido ao efeito de pá combinado com torque", "C": "O navio mantém curso retilíneo sem derivar lateralmente", "D": "A popa deriva para bombordo devido ao efeito de corrente oblíqua"},
        "correct": "A",
        "explanation": "Com máquina a vante e hélice de passo direito (gira no sentido horário visto da popa), o efeito de pá (paddle-wheel effect) e a corrente de sucção empurram a popa para BB. (Fonseca, 8ª Ed., Cap. 1)",
        "subject": "Arte Naval",
        "discipline": "2",
        "difficulty": "Médio",
        "source": "FONSECA, M.M. – Arte Naval, Marinha do Brasil (8ª Ed., 2019), Cap. 1"
    },
    # ── COMUNICAÇÕES ──────────────────────────────────────────────────────────
    {
        "text": "De acordo com o Sistema GMDSS, qual é o equipamento obrigatório para a transmissão de alertas de socorro na faixa de frequência MF/HF?",
        "options": {"A": "VHF DSC Canal 70", "B": "NAVTEX receptor", "C": "MF/HF DSC com frequências de guarda 2187,5 kHz e 8414,5 kHz", "D": "EPIRB COSPAS-SARSAT 406 MHz"},
        "correct": "C",
        "explanation": "Para cobertura de alto mar (áreas A3 e A4 do GMDSS), o rádio MF/HF com DSC (Digital Selective Calling) é obrigatório, guardando as frequências internacionais de socorro 2187,5 kHz (MF) e 8414,5 kHz (HF). (ICS, 6ª Ed., 2022; SOLAS 2024)",
        "subject": "Comunicações",
        "discipline": "7",
        "difficulty": "Difícil",
        "source": "ICS – International Code of Signals (6ª Ed., 2022); SOLAS 2024, Cap. IV"
    },
    # ── ARQUITETURA NAVAL ─────────────────────────────────────────────────────
    {
        "text": "Segundo Lewis (Principles of Naval Architecture, Vol. II), o coeficiente de bloco (Cb) de um navio é definido como:",
        "options": {"A": "Relação entre o volume do casco e o produto Lpp × B × T (volume do paralelepípedo envolvente)", "B": "Relação entre a área da seção mestra e o produto B × T", "C": "Relação entre o deslocamento em toneladas e o volume do paralelepípedo envolvente em metros cúbicos", "D": "Relação entre a área da superfície molhada e o comprimento do navio"},
        "correct": "A",
        "explanation": "Cb = ∇ / (Lpp × B × T), onde ∇ é o volume de carena. Representa o 'preenchimento' do casco em relação ao bloco envolvente. Navios lentos têm Cb alto (~0,85), navios rápidos têm Cb baixo (~0,55). (Lewis, Vol. II, Cap. V)",
        "subject": "Arquitetura Naval",
        "discipline": "3",
        "difficulty": "Fácil",
        "source": "LEWIS, E.V. – Principles of Naval Architecture, SNAME, Vol. II (1988), Cap. V"
    },
    # ── GESTÃO E PROCEDIMENTOS ────────────────────────────────────────────────
    {
        "text": "Conforme as diretrizes do PIANC (PIANC WG 49), qual é o parâmetro de Under-Keel Clearance (UKC) mínimo recomendado para navios em canais de acesso portuário?",
        "options": {"A": "5% do calado máximo do navio", "B": "10% a 15% do calado do navio, dependendo do tipo de fundo e condições ambientais", "C": "0,5 metro fixo independente do calado", "D": "2% do comprimento do navio"},
        "correct": "B",
        "explanation": "O PIANC recomenda UKC mínimo de 10% a 15% do calado máximo do navio, com ajuste conforme: tipo de fundo (lama vs. rocha), altura de onda, squat, assimetria de carregamento e margem de segurança. (Seção VII do edital; PIANC WG 49)",
        "subject": "Gestão e Procedimentos",
        "discipline": "10",
        "difficulty": "Difícil",
        "source": "PIANC – Harbour Approach Channels Design Guidelines, WG 49"
    },
    # ── NORMAS E PUBLICAÇÕES ──────────────────────────────────────────────────
    {
        "text": "Segundo a NORMAM-224/DPC, qual é o documento obrigatório que o prático deve preencher antes de iniciar toda manobra de praticagem em porto organizado?",
        "options": {"A": "Diário de Bordo (Official Log Book)", "B": "Pilot Card (Cartão do Prático) fornecido pelo comandante", "C": "Pilot Boarding Report emitido pela capitania", "D": "Exchange of Information Form conforme SOLAS"},
        "correct": "B",
        "explanation": "A NORMAM-224/DPC estabelece que o comandante deve fornecer ao prático, antes do início da manobra, o Pilot Card (Cartão do Prático) com informações sobre o navio: calado, GM, máquina, leme, propulsores auxiliares, etc.",
        "subject": "Normas e Publicações",
        "discipline": "9",
        "difficulty": "Médio",
        "source": "NORMAM-224/DPC – Normas da Autoridade Marítima para Praticagem"
    },
    {
        "text": "De acordo com o Roteiro da Costa brasileira (DHN – Costa Norte), qual é a maré predominante na foz do Rio Amazonas?",
        "options": {"A": "Maré diurna com amplitude de até 4 metros", "B": "Maré semidiurna com amplitude de até 6 metros e forte corrente de maré", "C": "Maré mista com pequena amplitude (micromaré)", "D": "Maré estacionária sem variação significativa de nível"},
        "correct": "B",
        "explanation": "A foz do Amazonas apresenta maré semidiurna com amplitudes que podem ultrapassar 6 metros em sizígia, gerando fortes correntes de maré que influenciam diretamente as manobras de praticagem na região. (Roteiro da Costa – Costa Norte, DHN)",
        "subject": "Normas e Publicações",
        "discipline": "9",
        "difficulty": "Médio",
        "source": "Marinha do Brasil – DHN – Roteiro da Costa Norte"
    },
    # ── SISTEMAS E EQUIPAMENTOS ───────────────────────────────────────────────
    {
        "text": "Segundo a Resolução MSC.191(79) da IMO, o sistema AIS (Automatic Identification System) Classe A deve transmitir automaticamente informações dinâmicas do navio a cada:",
        "options": {"A": "2 segundos quando atracado, 10 segundos em rota", "B": "2 a 10 segundos dependendo da velocidade (até 6 min quando fundeado)", "C": "30 segundos em qualquer situação de navegação", "D": "1 minuto em porto, 3 minutos em rota"},
        "correct": "B",
        "explanation": "O AIS Classe A transmite dados dinâmicos com intervalos variáveis: 2 s (>23 nós com mudança de rumo), 2-10 s (em manobra/alta velocidade), 10 s (12-23 nós), 6 min (fundeado/amarrado). (MSC.191(79); SOLAS Reg. V/19)",
        "subject": "Sistemas e Equipamentos",
        "discipline": "11",
        "difficulty": "Difícil",
        "source": "IMO Res. MSC.191(79); SOLAS 2024, Reg. V/19"
    },
]

SIMULADOS = [
    {
        "title": "Simulado Prático de Praticagem — Visão Geral da Profissão",
        "description": "Simulado equilibrado cobrindo legislação, manobra, segurança da navegação e normas. Ideal para avaliação inicial.",
        "duration_minutes": 60,
    },
    {
        "title": "Simulado Prático de Praticagem — Navegação, Manobra e Legislação",
        "description": "Simulado equilibrado cobrindo as principais áreas do concurso de Prático da Marinha do Brasil.",
        "duration_minutes": 60,
    },
    {
        "title": "Simulado Prático de Praticagem — Domínio Completo do Passadiço",
        "description": "Simulado abrangente e equilibrado cobrindo manobra, legislação, meteorologia, sistemas e segurança.",
        "duration_minutes": 60,
    },
]


def seed():
    db = SessionLocal()
    try:
        if db.query(models.Question).count() > 0:
            print("Banco já populado — pulando seed.")
            return

        # Insert questions
        q_objs = []
        for qd in QUESTIONS:
            q = models.Question(**qd)
            db.add(q)
            q_objs.append(q)
        db.flush()

        all_ids = [q.id for q in q_objs]

        # Create simulados distributing questions
        chunk = max(1, len(all_ids) // 3)
        for i, sim_data in enumerate(SIMULADOS):
            start = i * chunk
            ids = all_ids[start:start + chunk]
            sim = models.Simulado(
                title=sim_data["title"],
                description=sim_data["description"],
                question_ids=ids,
                duration_minutes=sim_data["duration_minutes"],
            )
            db.add(sim)

        db.commit()
        print(f"Seed concluído: {len(q_objs)} questões, {len(SIMULADOS)} simulados.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
