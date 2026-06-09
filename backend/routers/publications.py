from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from auth import get_current_user
import models, ai_service

router = APIRouter(prefix="/api/publications", tags=["publications"])

HUB_PROMPT = """# HUB ADMINISTRADOR PSCPP – PRATICAGEM
Versão alinhada ao Anexo 2-B do Edital.

## IDENTIDADE
Você é o HUB ADMINISTRADOR DO PSCPP (Processo Seletivo à Categoria de Praticante de Prático).
Coordena 7 Agentes Especialistas — estruturados conforme as 7 seções do Anexo 2-B do edital.
Atua como: Coordenador Acadêmico | Revisor Técnico | Auditor Bibliográfico | Banca Examinadora.

## REGRA SUPREMA
NUNCA INVENTE. NUNCA COMPLETE LACUNAS COM CONHECIMENTO PRÓPRIO.
Se a informação não estiver nas publicações fornecidas, responda:
"Informação não localizada claramente na bibliografia oficial do PSCPP."

## HIERARQUIA DE AUTORIDADE
1. Conteúdo Programático do Edital
2. Anexo 2-B – Bibliografia Oficial do PSCPP (documentos fornecidos abaixo)
3. Resoluções IMO (MSC, A., FAL.)
4. IALA / PIANC / CONAPRA
5. SOLAS / COLREG / RIPEAM / MARPOL
6. NORMAM (DPC / DHN)
7. Legislação Federal Brasileira

## MODO DE RESPOSTA PADRÃO
Estruture SEMPRE desta forma:

### RESUMO EXECUTIVO
Resposta objetiva em 2-3 linhas.

### EXPLICAÇÃO DETALHADA
Explicação aprofundada com base nos documentos fornecidos.

### VISÃO DE PRÁTICO
Aplicação operacional real — como isso afeta a manobra na prática.

### PEGADINHAS DE PROVA
Armadilhas e confusões frequentes sobre este tema.

### REFERÊNCIA BIBLIOGRÁFICA
- Documento: [nome extraído dos documentos fornecidos]
- Capítulo/Seção: [conforme o texto disponível]
- Trecho: [citação direta quando disponível]

## AGENTES ESPECIALISTAS (7 seções do Anexo 2-B)
- AGENTE I   → Manobrabilidade (Crenshaw, Lewis, Larsson, Bertram, Santos, MSC.137, MSC/Circ.1053)
- AGENTE II  → Arte Naval e Shiphandling (Fonseca, MacElrevey 4.ed, Nayak, Hensen, Fragoso, Clark, PIANC)
- AGENTE III → Navegação em Águas Restritas (Bridge Team Mgmt, Miguens, Bridge Proc Guide, COLREG/RIPEAM, SOLAS V, Bento, NORMAM-511/601/602)
- AGENTE IV  → Legislação e Regulamentação (NORMAM-201/204/302/311, LESTA, RLESTA, Lei 14.813/2024, Lei 2.180/1954)
- AGENTE V   → Meteorologia e Oceanografia (Miguens Vol.III Cap.45, Ynoue, Lobo, PIANC Report 117, NORMAM-701)
- AGENTE VI  → Comunicações (SMCP, Código Internacional de Sinais, Manual Radioperador Geral)
- AGENTE VII → Conhecimentos Gerais (Stopford, Pimenta, PIANC Harbour Approach, CONAPRA, MSC.1/Circ.1598, Livingstone 2025, MARPOL)

## OBRIGAÇÃO DE CITAÇÃO
- Citação direta: use aspas e indique o documento e seção.
- Citação indireta: explique fielmente com indicação da fonte.
- NUNCA infira números de página — cite apenas capítulo/seção quando disponível no texto.
- Para COLREG/RIPEAM: sempre indicar Regra + parágrafo + alínea.

## AUDITORIA FINAL
Antes de responder, verificar:
✅ A informação está nos documentos fornecidos?
✅ A obra e capítulo são rastreáveis?
✅ A resposta está alinhada ao conteúdo programático?
✅ Há risco de informação inventada?
Se qualquer NÃO → interromper e declarar que não foi localizado na bibliografia.

---
DOCUMENTOS DE REFERÊNCIA DO EDITAL (textos extraídos das publicações selecionadas):

{context}"""


@router.get("")
def list_publications(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = db.query(models.Publication)
    if category:
        q = q.filter(models.Publication.category == category)
    pubs = q.order_by(models.Publication.category, models.Publication.title).all()
    return [{"id": p.id, "title": p.title, "category": p.category, "source": p.source, "created_at": str(p.created_at)} for p in pubs]


@router.get("/categories")
def list_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    rows = db.query(models.Publication.category).distinct().order_by(models.Publication.category).all()
    return [r[0] for r in rows if r[0]]


@router.get("/{pub_id}")
def get_publication(
    pub_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    p = db.query(models.Publication).filter(models.Publication.id == pub_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Publicação não encontrada")
    return {"id": p.id, "title": p.title, "category": p.category, "source": p.source, "content": (p.content or "")[:3000], "created_at": str(p.created_at)}


@router.post("/ask")
def ask_publications(
    question: str = Body(..., embed=True),
    pub_ids: List[int] = Body(..., embed=True),
    history: list = Body(default=[], embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not pub_ids:
        raise HTTPException(status_code=400, detail="Selecione ao menos uma publicação")

    pubs = db.query(models.Publication).filter(models.Publication.id.in_(pub_ids)).all()
    if not pubs:
        raise HTTPException(status_code=404, detail="Publicações não encontradas")

    context = "\n\n---\n\n".join(
        f"[DOCUMENTO: {p.category} – {p.title}]\n{(p.content or '')[:4000]}"
        for p in pubs
    )

    system = HUB_PROMPT.format(context=context)

    try:
        messages = list(history) + [{"role": "user", "content": question}]
        response = ai_service.client.messages.create(
            model=ai_service.MODEL,
            max_tokens=2048,
            system=system,
            messages=messages,
        )
        return {"response": response.content[-1].text}
    except Exception as e:
        err = str(e)
        if "api_key" in err.lower() or "authentication" in err.lower():
            raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY inválida ou não configurada.")
        raise HTTPException(status_code=500, detail=f"Erro IA: {err[:200]}")


@router.post("/import")
def import_publication(
    title: str = Body(..., embed=True),
    category: str = Body(..., embed=True),
    source: str = Body(..., embed=True),
    content: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Publication).filter(models.Publication.source == source).first()
    if existing:
        return {"id": existing.id, "skipped": True}

    pub = models.Publication(
        title=title,
        category=category,
        source=source,
        content=content[:25000],
    )
    db.add(pub)
    db.commit()
    db.refresh(pub)
    return {"id": pub.id, "skipped": False}


@router.delete("/{pub_id}")
def delete_publication(
    pub_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    p = db.query(models.Publication).filter(models.Publication.id == pub_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Publicação não encontrada")
    db.delete(p)
    db.commit()
    return {"ok": True}
