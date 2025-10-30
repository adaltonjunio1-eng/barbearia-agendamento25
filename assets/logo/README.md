# Como usar sua logo personalizada

## Passo 1: Salvar a logo
1. Salve a imagem do robô BarberPro como:
   - `assets/logo/icon.png` (formato PNG, quadrado recomendado)

## Passo 2: Gerar ícones PWA
```powershell
npm run gen:icons
```

Isso criará automaticamente:
- `icon-192.png`
- `icon-512.png`

Na raiz do projeto (usados pelo manifest.json para instalação PWA).

## Passo 3: Aplicar no app (localStorage)
1. Abra o dashboard em Configurações > Marca e Logo
2. Faça upload da mesma imagem
3. Ou use o botão "Salvar como logo do app" no logo-generator.html

## Passo 4: Publicar
```powershell
git add -A
git commit -m "feat: atualiza logo para BarberPro com robô"
git push
```

## Observações
- O script `generate-icons.js` prioriza `icon.png` sobre `icon.svg`
- Após o push, reinstale o app no celular para ver a nova logo
- O service worker será atualizado automaticamente
