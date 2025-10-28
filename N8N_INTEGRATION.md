# 🔗 Integração n8n - Sistema de Barbearia

Este documento explica como integrar o sistema de agendamentos da barbearia com o **n8n** para automações externas de lembretes via WhatsApp, SMS, Email e outros canais.

## 📋 Índice

- [Por que usar n8n?](#por-que-usar-n8n)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Backend](#configuração-do-backend)
- [Criando Workflows no n8n](#criando-workflows-no-n8n)
- [Configurando no Painel Admin](#configurando-no-painel-admin)
- [Exemplos de Workflows](#exemplos-de-workflows)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Por que usar n8n?

O **n8n** oferece várias vantagens sobre o WhatsApp Web.js integrado:

✅ **Mais confiável** - Não depende de Puppeteer/Chromium  
✅ **Mais canais** - WhatsApp Business API, SMS, Email, Telegram, etc  
✅ **Workflows avançados** - Lógica condicional, múltiplos passos  
✅ **Escalável** - Funciona em servidores serverless  
✅ **Visual** - Interface drag-and-drop sem código  

---

## 📦 Pré-requisitos

- **n8n instalado** - [Instruções de instalação](https://docs.n8n.io/hosting/)
- **Backend rodando** - Backend Node.js na porta 3333
- **Ngrok** (opcional) - Para expor backend local

### Instalação rápida do n8n:

```bash
# Via npm
npm install -g n8n

# Via Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# Abra http://localhost:5678
```

---

## ⚙️ Configuração do Backend

### 1. Endpoints Disponíveis

O backend expõe 3 endpoints para integração com n8n:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/webhook/booking-created` | Recebe dados de novos agendamentos |
| `POST` | `/api/webhook/send-reminder` | Solicita envio de lembrete |
| `GET` | `/api/webhook/status` | Verifica status da integração |

### 2. Estrutura dos Dados

#### POST `/api/webhook/booking-created`

Corpo da requisição:
```json
{
  "event": "booking-created",
  "booking": {
    "id": 1234,
    "cliente": "João Silva",
    "telefone": "5511999999999",
    "servicoNome": "Corte + Barba",
    "valor": 50,
    "duracao": 60,
    "hora": "14:00",
    "dataISO": "2025-10-28",
    "status": "Pendente"
  },
  "timestamp": "2025-10-28T10:30:00.000Z",
  "source": "barbearia-agendamento"
}
```

#### POST `/api/webhook/send-reminder`

Corpo da requisição:
```json
{
  "bookingId": 1234,
  "telefone": "5511999999999",
  "cliente": "João Silva",
  "servicoNome": "Corte + Barba",
  "hora": "14:00",
  "dataISO": "2025-10-28"
}
```

---

## 🔧 Criando Workflows no n8n

### Workflow 1: Novo Agendamento → Notificação

1. **Abra n8n** (http://localhost:5678)
2. **Crie novo workflow** → "Novo Agendamento - WhatsApp"
3. **Adicione nodes:**

#### Node 1: Webhook (Trigger)
- **Webhook URL**: `/booking-created`
- **Method**: `POST`
- **Response Mode**: `On Received`

#### Node 2: Extrair Dados
- **Node Type**: `Set`
- **Campos**:
  - `cliente`: `{{ $json.booking.cliente }}`
  - `telefone`: `{{ $json.booking.telefone }}`
  - `servico`: `{{ $json.booking.servicoNome }}`
  - `data`: `{{ $json.booking.dataISO }}`
  - `hora`: `{{ $json.booking.hora }}`
  - `valor`: `{{ $json.booking.valor }}`

#### Node 3: WhatsApp Business API
- **Node Type**: `HTTP Request` ou `WhatsApp Business`
- **URL**: API do seu provedor WhatsApp
- **Body**:
```json
{
  "to": "{{ $json.telefone }}",
  "message": "Olá {{ $json.cliente }}! Seu agendamento foi confirmado:\n📅 {{ $json.data }}\n⏰ {{ $json.hora }}\n✂️ {{ $json.servico }}\n💰 R$ {{ $json.valor }}"
}
```

4. **Salve e Ative** o workflow
5. **Copie a URL do webhook**: `https://seu-n8n.com/webhook/booking-created`

---

### Workflow 2: Lembrete Automático (Cron)

1. **Novo workflow** → "Lembrete 1h Antes"
2. **Adicione nodes:**

#### Node 1: Schedule Trigger (Cron)
- **Trigger Type**: `Schedule`
- **Cron Expression**: `*/15 * * * *` (a cada 15 minutos)

#### Node 2: Buscar Agendamentos
- **Node Type**: `HTTP Request`
- **Method**: `GET`
- **URL**: `https://seu-backend.com/api/bookings`

#### Node 3: Filtrar Próximos Agendamentos
- **Node Type**: `Code`
- **JavaScript**:
```javascript
const now = new Date();
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

const upcomingBookings = items[0].json.filter(booking => {
  const bookingTime = new Date(`${booking.dataISO}T${booking.hora}`);
  const diff = bookingTime - now;
  return diff > 0 && diff <= 60 * 60 * 1000 && !booking.reminderSent;
});

return upcomingBookings.map(b => ({ json: b }));
```

#### Node 4: Loop e Enviar
- **Node Type**: `Split In Batches`
- **Batch Size**: `1`
- Conecte a um node de WhatsApp/SMS/Email

---

## 🖥️ Configurando no Painel Admin

1. **Acesse o Admin** do sistema
2. **Vá em Configurações** (menu lateral)
3. **Role até "Integração n8n"**
4. **Cole a URL do webhook** do n8n
5. **Clique em "Salvar Configuração"**
6. **Teste a conexão** com o botão "Testar Webhook"

### Exemplo de URL:
```
https://seu-n8n.com/webhook/booking-created
```

Se estiver usando n8n local + Ngrok:
```
https://abc123.ngrok.io/webhook/booking-created
```

---

## 📝 Exemplos de Workflows

### Exemplo 1: WhatsApp + Email + SMS

```
Webhook (Novo Agendamento)
  ↓
[Extrair Dados]
  ↓
[Dividir em 3 branches]
  ↓         ↓         ↓
[WhatsApp] [Email]  [SMS]
```

### Exemplo 2: Confirmação + Lembrete + Follow-up

```
Webhook (Novo Agendamento)
  ↓
[Enviar Confirmação Imediata]
  ↓
[Wait] (esperar até 1h antes)
  ↓
[Enviar Lembrete]
  ↓
[Wait] (esperar até 1h após)
  ↓
[Enviar Pesquisa de Satisfação]
```

### Exemplo 3: Multi-Canal com Fallback

```
Webhook
  ↓
[Tentar WhatsApp]
  ↓
[IF: Falhou?]
  ↓ (SIM)      ↓ (NÃO)
[Enviar SMS] [Sucesso]
```

---

## 🔍 Troubleshooting

### Webhook não está recebendo dados

✅ **Verifique se o workflow está ativo** no n8n  
✅ **Teste a URL do webhook** com curl:

```bash
curl -X POST https://seu-n8n.com/webhook/booking-created \
  -H "Content-Type: application/json" \
  -d '{"test": true, "cliente": "Teste"}'
```

✅ **Verifique logs do n8n** para erros  
✅ **Confirme que o backend está enviando** (veja console do browser: `[N8N] Enviando dados...`)

---

### CORS Errors

Se o n8n estiver em domínio diferente, adicione CORS no n8n:

```javascript
// n8n settings
{
  "cors": {
    "enabled": true,
    "origin": "*"
  }
}
```

---

### Mensagens não chegam

✅ **Verifique credenciais** da API de WhatsApp/SMS  
✅ **Teste o node isoladamente** no n8n  
✅ **Verifique formato do telefone**: `5511999999999` (código do país + DDD + número)  
✅ **Logs do n8n** mostram o erro exato

---

## 🚀 Próximos Passos

1. ✅ Configurar webhook no Admin
2. ✅ Criar workflow básico no n8n
3. ✅ Testar com agendamento real
4. ✅ Expandir para múltiplos canais
5. ✅ Adicionar lógica condicional (ex: VIP = WhatsApp, Normal = SMS)
6. ✅ Criar dashboards de métricas no n8n

---

## 📚 Recursos Adicionais

- [Documentação n8n](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Twilio SMS API](https://www.twilio.com/docs/sms)

---

## 🆘 Suporte

Se encontrar problemas, verifique:
1. Logs do backend (`npm start` no terminal)
2. Logs do n8n (aba Executions)
3. Console do navegador (F12)

**Dica**: Use o botão "Testar Webhook" no Admin para diagnóstico rápido!
