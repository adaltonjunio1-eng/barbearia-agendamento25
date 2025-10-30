# 🇧🇷 WhatsApp no Brasil - Correção Erro 63058

## 🚨 O PROBLEMA

Você está recebendo este erro ao tentar enviar mensagens WhatsApp:

```
❌ Erro 63058: Os negócios estão restritos aos usuários de mensagens neste país
(Businesses are restricted from messaging users in this country)
```

### Por que isso acontece?

O número Sandbox padrão do Twilio (`+14155238886` - EUA) **NÃO pode enviar mensagens para números brasileiros (+55)** devido a restrições geográficas da API WhatsApp Business.

---

## ✅ SOLUÇÕES DISPONÍVEIS

### **Opção 1: Usar API do WhatsApp Business (GRÁTIS)** ⭐ RECOMENDADO

A Meta (Facebook) oferece a API oficial do WhatsApp Business gratuitamente. Você só paga pela infraestrutura.

#### Vantagens:
- ✅ Totalmente GRATUITO (1.000 conversas/mês incluídas)
- ✅ Funciona no Brasil e qualquer país
- ✅ Número próprio (seu WhatsApp Business)
- ✅ Sem limitações de Sandbox

#### Como configurar:

1. **Crie uma conta Meta Business:**
   - Acesse: https://business.facebook.com
   - Crie um Business Portfolio

2. **Configure WhatsApp Business API:**
   - Vá para: https://business.facebook.com/wa/manage/home
   - Clique em "Começar"
   - Siga as instruções para vincular seu número

3. **Integre com o Sistema:**

**Opção A - Via Twilio (mais fácil):**
```bash
# No console Twilio:
# 1) Vá em Messaging → Try it out → Send a WhatsApp message
# 2) Clique em "Use your production WhatsApp Sender"
# 3) Vincule sua conta WhatsApp Business
# 4) Use o número aprovado no .env
```

**Opção B - Direto via Meta (mais controle):**
- Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

---

### **Opção 2: Voltar para SMS Twilio** 📱 MAIS RÁPIDO

Como a conta Twilio já está configurada, você pode usar SMS tradicional:

#### Vantagens:
- ✅ Funciona imediatamente
- ✅ Trial Twilio tem $15 de crédito grátis
- ✅ SMS para Brasil funciona perfeitamente

#### Como mudar:

1. **Edite o arquivo `.env`:**
```env
# Mude de whatsapp para sms:
SMS_CHANNEL=sms

# Use seu número Twilio (não o Sandbox):
SMS_FROM_NUMBER=+15551234567  # seu número Twilio

# Comente as linhas do WhatsApp:
# WHATSAPP_SANDBOX_NUMBER=+14155238886
```

2. **Reinicie o servidor:**
```powershell
cd backend
npm start
```

3. **Verifique seu número no Twilio:**
   - https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   - Adicione seu número brasileiro: `+5519999510821`
   - Receba código de verificação
   - Confirme

4. **Teste o SMS:**
```powershell
cd backend
node teste-sms.js
```

---

### **Opção 3: Upgrade Twilio para Conta Paga** 💳

Contas pagas do Twilio têm acesso a Senders WhatsApp sem restrições regionais.

#### Custos:
- WhatsApp: ~$0.005 por mensagem (R$0,025)
- SMS: ~$0.01 por mensagem (R$0,05)

#### Como fazer:
1. Vá para: https://console.twilio.com/billing
2. Adicione um método de pagamento
3. Solicite um WhatsApp Sender:
   - https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders
   - Preencha o formulário (leva 1-2 dias úteis)

---

## 🎯 QUAL ESCOLHER?

### Use **SMS** se:
- ✅ Quer começar AGORA
- ✅ Público-alvo tem celular comum
- ✅ Mensagens simples (texto)

### Use **WhatsApp Business API (Meta)** se:
- ✅ Quer 100% GRÁTIS a longo prazo
- ✅ Público prefere WhatsApp
- ✅ Quer enviar imagens/botões

### Use **Twilio Pago** se:
- ✅ Precisa de suporte profissional
- ✅ Alto volume de mensagens
- ✅ Múltiplos canais (SMS + WhatsApp)

---

## 📋 GUIA RÁPIDO: MUDAR PARA SMS

### Passo 1: Editar `.env`

```env
# backend/.env

# Mude o canal:
SMS_CHANNEL=sms

# Configure SMS:
SMS_FROM_NUMBER=+15551234567  # Seu número Twilio
SMS_ACCOUNT_SID=ACxxxxxxxxxxxx  # Suas credenciais
SMS_AUTH_TOKEN=xxxxxxxxxxxx

# Desabilite WhatsApp (comente):
# WHATSAPP_SANDBOX_NUMBER=+14155238886
```

### Passo 2: Verificar Número Destino

No console Twilio (conta Trial):
1. Acesse: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Clique **"Add a new Caller ID"**
3. Digite: `+5519999510821` (seu número)
4. Receba código via SMS
5. Confirme

### Passo 3: Testar

```powershell
cd backend
node teste-sms.js
```

✅ Você deve ver:
```
✅ MENSAGEM ENVIADA COM SUCESSO!
SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Status: queued
Para: +5519999510821
```

### Passo 4: Reiniciar Backend

```powershell
npm start
```

Banner deve mostrar:
```
║   📱  Canal: SMS — Configurado ✅
```

---

## 🔍 VERIFICAR STATUS

### Health Check:
```powershell
curl http://localhost:3333/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "sms": {
    "connected": true,
    "provider": "twilio",
    "channel": "sms",
    "fromNumber": "+15551234567"
  }
}
```

### UI (Frontend):

Abra `index.html` → Admin → Configurações

Deve mostrar:
```
📱 Configuração SMS
✅ SMS Configurado
Provedor: twilio
Canal: sms
```

---

## ⚠️ IMPORTANTE: Sandbox WhatsApp

O Twilio WhatsApp Sandbox **não funciona para enviar mensagens do exterior para o Brasil**. 

### Limitações conhecidas:
- ❌ Número EUA (+1) → Brasil (+55): ERRO 63058
- ✅ Número EUA (+1) → EUA (+1): OK
- ✅ Número próprio (aprovado) → Brasil (+55): OK

### Solução definitiva:
Use **WhatsApp Business API** diretamente pela Meta (grátis) ou **SMS Twilio** (funciona já).

---

## 🆘 AINDA COM DÚVIDAS?

### Logs úteis:

**Backend:**
```powershell
cd backend
npm start
# Veja os logs em tempo real
```

**Twilio Logs:**
- Console: https://console.twilio.com
- Logs SMS: https://console.twilio.com/us1/monitor/logs/sms
- Logs WhatsApp: https://console.twilio.com/us1/monitor/logs/whatsapp

---

## ✅ CHECKLIST - MIGRAÇÃO PARA SMS

- [ ] Editei `.env` mudando `SMS_CHANNEL=sms`
- [ ] Configurei `SMS_FROM_NUMBER` com número Twilio
- [ ] Verifiquei meu número brasileiro no console Twilio
- [ ] Testei com `node teste-sms.js` ✅
- [ ] Reiniciei backend com `npm start`
- [ ] Health check mostra `"channel": "sms"`
- [ ] Frontend mostra "SMS Configurado ✅"
- [ ] Criei agendamento de teste
- [ ] Recebi SMS no celular ✅

---

## 🎉 PRONTO!

Agora seu sistema está enviando SMS para números brasileiros sem erros!

**Próximos passos:**
1. Teste com agendamentos reais
2. Configure n8n para automações
3. Quando quiser WhatsApp de verdade, migre para Meta API (grátis)

---

## 📚 LINKS ÚTEIS

- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [WhatsApp Business API (Meta)](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Verificar Números Twilio](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
- [Logs Twilio](https://console.twilio.com/us1/monitor/logs)
