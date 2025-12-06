# Guia: CSS Clamp() - Responsividade Fluida

## O que é `clamp()`?

A função CSS `clamp()` permite criar valores responsivos que se ajustam automaticamente entre um valor mínimo e máximo, baseado em um valor preferencial. É uma das ferramentas mais poderosas para criar layouts verdadeiramente fluidos e responsivos.

## Sintaxe

```css
propriedade: clamp(MIN, VAL, MAX);
```

- **MIN**: Valor mínimo permitido
- **VAL**: Valor preferencial (geralmente usa unidades relativas como `vw`, `vh`, `%`)
- **MAX**: Valor máximo permitido

## Como Funciona

O navegador escolhe:
- O valor **MIN** se VAL for menor que MIN
- O valor **VAL** se estiver entre MIN e MAX
- O valor **MAX** se VAL for maior que MAX

## Exemplos Práticos

### 1. Tamanho de Fonte Responsivo

```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

- Em telas pequenas: mínimo 1.5rem (24px)
- Em telas médias: 5% da largura da viewport
- Em telas grandes: máximo 3rem (48px)

### 2. Largura de Container

```css
.container {
  width: clamp(320px, 90%, 1200px);
}
```

- Mínimo: 320px (mobile)
- Preferencial: 90% da viewport
- Máximo: 1200px (desktop)

### 3. Espaçamento Adaptativo

```css
.section {
  padding: clamp(1rem, 3vw, 4rem);
}
```

- Padding cresce proporcionalmente com a tela
- Nunca menor que 1rem
- Nunca maior que 4rem

### 4. Gap em Grid/Flexbox

```css
.grid {
  gap: clamp(0.5rem, 2vw, 2rem);
}
```

### 5. Line Height Responsivo

```css
p {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  line-height: clamp(1.4, 1.5 + 0.5vw, 1.8);
}
```

## Vantagens

✅ **Menos Media Queries**: Reduz drasticamente a necessidade de breakpoints  
✅ **Fluidez**: Transições suaves entre tamanhos de tela  
✅ **Manutenibilidade**: Menos código, mais fácil de manter  
✅ **Acessibilidade**: Respeita preferências de zoom do usuário  
✅ **Performance**: Navegador calcula automaticamente, sem JavaScript  

## Desvantagens

❌ **Suporte**: IE11 não suporta (mas navegadores modernos sim)  
❌ **Complexidade Inicial**: Pode ser difícil calcular valores ideais no início  
❌ **Debug**: Mais difícil visualizar o valor exato aplicado  

## Calculadora de Clamp

Para calcular valores ideais, use a fórmula:

```
VAL = MINrem + (MAX - MIN) * ((100vw - MINvw) / (MAXvw - MINvw))
```

Ou use ferramentas online:
- https://clamp.font-size.app/
- https://royalfig.github.io/fluid-typography-calculator/

## Exemplo Real: Typography System

```css
:root {
  /* Títulos */
  --fs-h1: clamp(2rem, 5vw + 1rem, 4rem);
  --fs-h2: clamp(1.5rem, 4vw + 0.5rem, 3rem);
  --fs-h3: clamp(1.25rem, 3vw + 0.5rem, 2rem);
  
  /* Corpo */
  --fs-body: clamp(1rem, 2vw, 1.125rem);
  --fs-small: clamp(0.875rem, 1.5vw, 1rem);
  
  /* Espaçamentos */
  --space-xs: clamp(0.5rem, 2vw, 1rem);
  --space-sm: clamp(1rem, 3vw, 2rem);
  --space-md: clamp(2rem, 5vw, 4rem);
  --space-lg: clamp(4rem, 10vw, 8rem);
}

h1 { font-size: var(--fs-h1); }
h2 { font-size: var(--fs-h2); }
h3 { font-size: var(--fs-h3); }
p { font-size: var(--fs-body); }

section {
  padding-block: var(--space-md);
  gap: var(--space-sm);
}
```

## Boas Práticas

1. **Use `rem` para MIN/MAX**: Respeita preferências de acessibilidade
2. **Combine com Custom Properties**: Facilita manutenção
3. **Teste em Múltiplos Tamanhos**: Verifique 320px até 1920px+
4. **Documente os Valores**: Explique a lógica por trás dos números
5. **Não Abuse**: Use onde faz sentido, não em tudo

## Compatibilidade

- ✅ Chrome/Edge 79+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ❌ Internet Explorer (não suportado)

## Alternativas (Fallback)

Para suportar navegadores antigos:

```css
.element {
  font-size: 1.5rem; /* Fallback */
  font-size: clamp(1rem, 3vw, 2rem); /* Sobrescreve se suportado */
}
```

Ou com `@supports`:

```css
.element {
  font-size: 1.5rem;
}

@supports (font-size: clamp(1rem, 2vw, 3rem)) {
  .element {
    font-size: clamp(1rem, 3vw, 2rem);
  }
}
```

## Recursos Adicionais

- [MDN Web Docs - clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [CSS Tricks - Linearly Scale Font Size](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/)
- [Modern CSS Solutions](https://moderncss.dev/)

---

**Conclusão**: `clamp()` é uma ferramenta essencial para criar designs modernos e responsivos. Comece usando em tipografia e espaçamentos, e expanda conforme ganhar experiência.
