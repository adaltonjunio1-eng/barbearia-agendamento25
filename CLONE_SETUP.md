# 🚀 Guia de Clonagem - BarberPro White Label

Este guia ensina como criar cópias personalizadas do sistema BarberPro para revenda.

## 📋 Pré-requisitos

- Git instalado
- Node.js instalado
- Conta no GitHub
- VS Code (recomendado)

## 🔄 Passo a Passo para Clonar

### 1️⃣ Criar novo repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `barbearia-cliente-nome` (exemplo: `barbearia-joao-silva`)
3. Deixe como **Público** (para usar GitHub Pages grátis)
4. **NÃO** inicialize com README
5. Clique em "Create repository"

### 2️⃣ Clonar este projeto base

```powershell
# Navegue até onde quer criar o novo projeto
cd "C:\Users\adalt\OneDrive\Área de Trabalho"

# Clone o projeto base
git clone https://github.com/adaltonjunio1-eng/barbearia-agendamento25.git barbearia-cliente-nome

# Entre na pasta
cd barbearia-cliente-nome
```

### 3️⃣ Remover conexão com repositório original

```powershell
# Remove o remote origin antigo
git remote remove origin

# Adiciona o novo repositório do cliente
git remote add origin https://github.com/SEU-USUARIO/barbearia-cliente-nome.git

# Envia para o novo repositório
git push -u origin main
```

### 4️⃣ Personalizar para o cliente

Execute o script de personalização (veja abaixo) ou edite manualmente:

**Arquivos que precisam ser personalizados:**

1. **Logo e Marca**
   - `assets/logo/icon.png` - Logo principal (512x512 recomendado)
   - `assets/logo/brand.svg` - Logo horizontal (opcional)
   - Execute: `npm run gen:icons` para gerar ícones PWA

2. **Informações da barbearia**
   - `index.html` - Nome, telefone, endereço
   - `dashboard-barberpro.html` - Nome no cabeçalho
   - `manifest.json` - Nome do app

3. **Configurações PWA**
   - `manifest.json`:
     - `name`: "NomeBarbearia - Sistema de Agendamento"
     - `short_name`: "NomeBarbearia"
     - `start_url`: "/barbearia-cliente-nome/"
   - `sw.js`:
     - Atualizar caminhos com `/barbearia-cliente-nome/`

4. **Senha Admin**
   - Default: `bf12025`
   - Cliente pode mudar no dashboard em Configurações > Segurança

5. **Cores/Tema** (opcional)
   - Editar variáveis CSS em `index.html` e `dashboard-barberpro.html`

### 5️⃣ Ativar GitHub Pages

1. No repositório do cliente no GitHub
2. Settings > Pages
3. Source: Deploy from a branch
4. Branch: `main` / `(root)`
5. Save
6. Aguarde 2-3 minutos
7. Site estará em: `https://SEU-USUARIO.github.io/barbearia-cliente-nome/`

### 6️⃣ Testar a instalação

1. Acesse o site publicado
2. Teste o agendamento
3. Faça login no admin (senha padrão)
4. Configure serviços e barbeiros
5. Instale o PWA no celular

---

## 🤖 Script Automático de Personalização

Crie um arquivo `personalize.js` (veja próximo arquivo) e execute:

```powershell
node personalize.js
```

O script vai perguntar:
- Nome da barbearia
- Nome do barbeiro
- Telefone
- Nome do repositório GitHub

E atualizar todos os arquivos automaticamente!

---

## 💰 Checklist de Entrega ao Cliente

- [ ] Repositório criado e configurado
- [ ] Logo personalizada
- [ ] Nome e informações atualizadas
- [ ] GitHub Pages ativado e funcionando
- [ ] PWA testado e instalável
- [ ] Senha admin informada ao cliente
- [ ] Tutorial de uso entregue
- [ ] Backend configurado (se contratado)

---

## 🔧 Manutenção e Atualizações

Para atualizar um cliente com novas features do projeto base:

```powershell
# No projeto do cliente
git remote add base https://github.com/adaltonjunio1-eng/barbearia-agendamento25.git
git fetch base
git merge base/main --allow-unrelated-histories
# Resolver conflitos se houver
git push origin main
```

---

## 📦 Pacotes de Venda Sugeridos

### 🥉 Básico - R$ 297
- Sistema completo
- GitHub Pages (grátis)
- Suporte por 7 dias
- 1 personalização de logo

### 🥈 Profissional - R$ 497
- Sistema completo
- Domínio próprio (.com.br)
- Backend com SMS
- Suporte por 30 dias
- 3 revisões de design

### 🥇 Premium - R$ 797
- Sistema completo
- Domínio próprio
- Backend com WhatsApp
- Integração n8n
- Google Analytics
- Suporte por 90 dias
- Design personalizado
- Treinamento presencial/online

---

## 🆘 Suporte

Para dúvidas sobre clonagem e personalização, consulte a documentação completa ou entre em contato.
