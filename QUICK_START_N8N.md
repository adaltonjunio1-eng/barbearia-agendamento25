# 🎯 Guia Rápido - Integração n8n

> Configure automações profissionais em 5 minutos!

---

## ⚡ Setup Rápido (3 Passos)

### 1️⃣ Instalar n8n

Escolha uma opção:

**Opção A - Docker (Recomendado)**
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

**Opção B - NPM**
```bash
npm install -g n8n
n8n
```

Acesse: http://localhost:5678

---

### 2️⃣ Importar Workflow

1. **Baixe** o workflow: [`exemplo-novo-agendamento.json`](./backend/n8n-workflows/exemplo-novo-agendamento.json)

2. **No n8n**:
   - Clique em **"+ New Workflow"**
   - Clique no menu **(...)**
   - Selecione **"Import from File"**
   - Escolha o arquivo JSON

3. **Configure**:
   - No node **"Enviar WhatsApp"**, adicione suas credenciais
   - Salve o workflow

4. **Ative** (toggle no canto superior direito) ✅

5. **Copie a URL do webhook**:
   ```
   https://seu-n8n.com/webhook/booking-created
   ```

---

### 3️⃣ Configurar no Sistema

1. **Acesse o Admin** do sistema de barbearia
2. **Vá em "Configurações"** (menu lateral)
3. **Role até "Integração n8n"**
4. **Cole a URL do webhook**
5. **Clique em "Salvar Configuração"**
6. **Teste** com o botão "Testar Webhook"

✅ **Pronto!** Agora todos os agendamentos serão enviados para o n8n automaticamente!

---

## 🔥 Fluxo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO COMPLETO                               │
└─────────────────────────────────────────────────────────────────┘

1. CLIENTE FAZ AGENDAMENTO
   ↓
   [Frontend] → confirmBooking()
   ↓
   [Backend API] → POST /api/bookings
   ↓
   [Frontend] → sendToN8n() ✨
   ↓
   [n8n Webhook] → Recebe dados
   ↓
   [n8n] → Formata mensagem
   ↓
   [WhatsApp/SMS/Email] → Envia para cliente
   ↓
   ✅ CLIENTE RECEBE CONFIRMAÇÃO

```

---

## 📱 Exemplo de Fluxo n8n

### Workflow: Novo Agendamento

```
┌────────────────────┐
│   WEBHOOK TRIGGER  │
│  (booking-created) │
└──────────┬─────────┘
           │
           ↓
┌────────────────────┐
│   EXTRAIR DADOS    │
│  - Cliente         │
│  - Telefone        │
│  - Serviço         │
│  - Data/Hora       │
└──────────┬─────────┘
           │
           ↓
┌────────────────────┐
│  FORMATAR MENSAGEM │
│  "Olá João! Seu    │
│  agendamento foi   │
│  confirmado..."    │
└──────────┬─────────┘
           │
           ↓
┌────────────────────┐
│   ENVIAR WHATSAPP  │
│  API: Twilio/etc   │
└────────────────────┘
```

---

## 🎨 Customizações

### Adicionar Email

Após "Formatar Mensagem", adicione:

```
[Formatar Mensagem]
   │
   ├─→ [Enviar WhatsApp]
   │
   └─→ [Enviar Email] ← NOVO
       └─→ [Node Email]
```

### Adicionar SMS

```
[Formatar Mensagem]
   │
   ├─→ [WhatsApp]
   ├─→ [Email]
   └─→ [SMS] ← NOVO
       └─→ [Twilio SMS]
```

### Lógica Condicional (VIP)

```
[Extrair Dados]
   ↓
[IF: Cliente VIP?]
   ├─→ SIM: [WhatsApp Premium]
   └─→ NÃO: [SMS Básico]
```

---

## 🧪 Testar

### 1. Teste Manual no n8n

1. No workflow, clique em **"Listen for Test Event"** no webhook
2. No **Painel Admin**, clique em **"Testar Webhook"**
3. Verifique se o n8n recebeu os dados ✅

### 2. Teste Real

1. Faça um agendamento de teste no sistema
2. Verifique em **n8n → Executions**
3. Confirme se a mensagem foi enviada

---

## 📊 Monitoramento

### Dashboard de Execuções

No n8n, vá em **Executions** (menu lateral):

| Status | Cor | Significado |
|--------|-----|-------------|
| ✅ Success | Verde | Enviado com sucesso |
| ❌ Error | Vermelho | Falha no envio |
| ⏸️ Running | Azul | Executando agora |

### Logs Detalhados

Clique em uma execução para ver:
- Dados recebidos do webhook
- Transformações aplicadas
- Resposta da API de WhatsApp
- Tempo de execução

---

## 🚨 Troubleshooting

### Webhook não recebe dados

```bash
# Teste direto com curl
curl -X POST https://seu-n8n.com/webhook/booking-created \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "booking": {
      "cliente": "Teste",
      "telefone": "5511999999999"
    }
  }'
```

✅ **Deve retornar**: `{"status": "received"}`

### Mensagens não chegam

1. **Verifique credenciais** da API de WhatsApp
2. **Teste a API** isoladamente no n8n
3. **Confira formato do telefone**: `5511999999999`

### n8n não inicia

```bash
# Limpe cache
rm -rf ~/.n8n/cache

# Reinicie
n8n
```

---

## 🎓 Recursos

- [Documentação n8n](https://docs.n8n.io/)
- [Exemplos de Workflows](https://n8n.io/workflows/)
- [Community Forum](https://community.n8n.io/)
- [YouTube Tutorials](https://www.youtube.com/c/n8n-io)

---

## 💡 Dicas Pro

### 1. Use Environment Variables

No n8n, configure:
```
BACKEND_URL=https://seu-backend.com
WHATSAPP_API_KEY=sua-chave-aqui
```

### 2. Ative Error Workflow

Crie um workflow para receber notificações de erros:
```
[Error Trigger] → [Enviar Email Admin]
```

### 3. Rate Limiting

Adicione **Wait** entre envios para evitar ban:
```
[Loop Clientes]
   ├→ [Enviar WhatsApp]
   └→ [Wait 2s] → volta para loop
```

### 4. Backup

Exporte workflows regularmente:
```bash
# Menu (...) → Export Workflow
```

---

## 🎯 Próximos Passos

- [ ] Importar workflow básico
- [ ] Testar com agendamento real
- [ ] Adicionar mais canais (Email, SMS)
- [ ] Criar workflow de lembretes (Cron)
- [ ] Configurar workflow de follow-up pós-atendimento
- [ ] Adicionar pesquisa de satisfação automática

---

**🚀 Pronto para começar?** [Importe o primeiro workflow agora!](./backend/n8n-workflows/)
