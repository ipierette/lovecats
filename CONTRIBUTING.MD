# Contributing

Obrigado por querer contribuir com o projeto LoveCats! Este documento descreve um fluxo simples para que membros da equipe possam clonar o repositório, trabalhar em features e enviar alterações.

## 1) Clonar repositório

```bash
git clone https://github.com/ipierette/lovecats.git
cd lovecats
```

## 2) Preparar o ambiente local e verificar branches

```bash
git fetch --all --prune
git branch -r        # mostra branches remotas, ex: origin/dev
```

## 3) Trabalhar na branch `dev`

Se quiser trabalhar diretamente na branch de desenvolvimento remota (`origin/dev`):

```bash
git checkout dev                # cria dev local rastreando origin/dev (se disponível)
git pull --rebase origin dev    # atualiza a branch local
```

Recomenda-se criar uma branch de feature a partir de `dev` para cada tarefa:

```bash
git checkout -b feature/minha-funcionalidade dev
# fazer alterações
git add .
git commit -m "Descrição curta do que foi feito"
git push -u origin feature/minha-funcionalidade
```

Depois, abra um Pull Request (PR) da `feature/*` para `dev` no GitHub para revisão e merge.

## 4) Merge e histórico

- Preferimos PRs para revisão.
- Ao atualizar sua branch antes de abrir PR ou de receber revisão, use `git pull --rebase` para manter um histórico linear quando apropriado.

## 5) Permissões e proteção de branch

- Se você não conseguir dar `git push` para `dev`, pode ser por falta de permissão ou por regras de proteção de branch no GitHub.
- Nesse caso, abra um PR e peça revisão; se precisar de permissão de escrita, contate um administrador do repositório.

## 6) Boas práticas

- Mensagens de commit claras e em português (ou inglês, conforme combinado pelo time).
- Pequenos commits atômicos facilitam revisão.
- Inclua no PR uma descrição do que muda, capturas de tela (quando relevante) e como testar localmente.

## 7) Contato

Se tiver dúvidas sobre o fluxo, regras de merge ou permissões, fale com o responsável pelo repositório ou com o time.

Obrigado e bons commits! :heart: