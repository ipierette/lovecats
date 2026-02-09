# HTML CHANGES
Linha 35, tag div para section, melhor semântica
linha 100, adicionado todos os elementos para dentro da div pages(linha 16)
linha 104, alteração da tag div para main, melhor semântica
linha 16, header puxado para fora da section page
linha 34, alteração de nomeclatura de classe page para page-api, pra evitar conflitos de estilização
linha 108, renomeada tag div para section, melhor semântica, renomeada a classe dessa section de header(não semântico) para endpoints(semântico), por ser um agrupamento de endpoints
linha 110, renomeado para subtitle-endpoint
linha 113, classe section-title renomeada para endpoint-title para melhor semântica
linha 114, section-subtitle para subtitle-endpoint, melhor semântica
linha 115, removida a classe 'endpoint-header', nao utilizada
linha 120, classe 'http-method get' inexistente no arquivo css, criada classe 'get' no css
linha (126, 135, 144, 153) tag code alterada para span
linha (124, 133, 142, 151) nomeclatura alterada de param-item para param-itens e criado o seletor no arquivo css(linha 170) para estilização, estava ausente
linha (128, 137, 146, 155) nomeclatura alterada de 'param-badge optional' para param-optional
linha (130, 139, 148, 157) nomeclatura alterada de 'param-description' para param-filter
linha (125, 134, 143, 152) removida a classe, div apenas para agrupamento
linha (160 a 167) criado o parâmetro neutered, ausente no arquivo html
linha 171, nomeclatura da classe de 'code-block' para 'response-json', melhor semântica



# CSS CHANGES
linha 7, margin no body pra desgrudar do canto da tela
linha 20 & 38, color alterada para mais próxima ao layout
linha 29, padding-top no h1
linha 30, max-width de 900 para 678px, mais condizente ao layout
linha 68, removido do seletor (margin, background, border-radius), desnecessários ao elemento
linha 74, adicionado ao seletor (background, padding, border-radius)
linha 14, 
linha, criação do soletor page-api
linha 119, container-endpoint removido
linha 122, padding de 40px para 1.5rem
linha 129, adicionado clamp ao font-size para adptação automática a diferentes tamanhos de tela
linha 130, color alterada para mais próximo ao layout
linha 134, adicionado ao seletor color mais próximo ao layout, line-height e renomeado para subtitle-endpoint
seletor endpoint-card: removido(margin-bottom,)
linha 160, adicionado o seletor endpoint-description, presente na linha 123 do html mas ausente no arquivo css
linha 226, deletado o seletor 'response-section', classe ausente no html
linha (229 parameter-name, 235 parameter-type, 241 optional-badge, 147 parameter-description) excluido seletores inexistentes no arquivo html, esses seletores provavelmente deveriam estar conectado as linhas 13, 14 e 15 documentadas nesse arquivo readme, mas como as nomeclaturas não eram iguais, ambos seletores css / classes html estavam inativas
SELETORES COMPLETOS DELETADOS: method-badge, description, 

# 8. adote-um-gatinho.html
git add adote-um-gatinho.html
git commit -m "Refactor: Atualizar adote-um-gatinho.html ao novo padrão

- Envolver header com section.group-header
- Remover link desnecessário ao header.css
- Mover menu-overlay e nav-mobile dentro do group-header
- Aplicar mesma estrutura do index.html"

# adote-um-gatinho.html, problemas detectados, tinha outras tags não fechadas mas quando decidi escrever aqui, eram essas
Encontrei mais problemas! Há um </div> extra (linha 291) e a indentação dos cards Mia e Thor está errada:

Problemas encontrados:

Linha 291 - Tem um </div> extra que fecha a div.container prematuramente:

Linhas 242-293 - Mia e Thor têm indentação errada (não estão dentro da .cards-gatinhos):

✅ Problemas Encontrados e Corrigidos:

Indentação e posicionamento dos cards Mia e Thor - Estavam com indentação incorreta (fora da .cards-gatinhos)
Fechamento de tags do card Caramelo - Adicionada a </div> que faltava para fechar o card-gatinho
Estrutura do div wrapper - Corrigida a indentação para que Mia e Thor estejam dentro de .cards-gatinhos
A estrutura agora está correta:

O arquivo agora está com todas as tags fechadas corretamente!

###### Evitar usar nomes de classes misturado portugues com inglês, exemplo que eu vi, filtro-group, ou filtro-grupo ou filter-group seria melhor, se começou escrevendo classes em inglês, vá até o fim do projeto em inglês e vice versa, seguir um padrão ajuda tanto você quanto outros desenvolvedores a entender melhor o código 

## Invés de usar input[type="checkbox"] dar uma classe ao elemento além de ser uma melhor prática,  atribui mais especificidade e evita futuros bugs caso nasçam novos inputs

![alt text](image.png) . - pra ver essa imagem clique na janela com lupa, para pré-visualização do readme; Jamais façam isso pessoal, a não ser que esteja trabalhando com tailwind, mas ai a sintaxe será diferente