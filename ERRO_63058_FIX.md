# ⚡ SOLUÇÃO RÁPIDA - Erro 63058 WhatsApp

## 🚨 Erro: "Businesses are restricted from messaging users in this country"

O WhatsApp Sandbox dos EUA não envia para o Brasil (+55).

---

## ✅ SOLUÇÃO MAIS RÁPIDA: Usar SMS

### 3 Passos (2 minutos):

#### 1️⃣ Edite o arquivo `.env`:
```env
# Mude de whatsapp para sms:
SMS_CHANNEL=sms

# Use seu número Twilio (não o Sandbox):
SMS_FROM_NUMBER=+15551234567  # TROQUE pelo seu número Twilio
```

#### 2️⃣ Verifique seu número brasileiro:
- Acesse: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Clique "Add a new Caller ID"
- Digite: `+5519999510821` (seu celular)
- Confirme o código recebido via SMS

#### 3️⃣ Teste:
```powershell
cd backend
node teste-sms.js
```

✅ **Deve mostrar**: "MENSAGEM ENVIADA COM SUCESSO!"

#### 4️⃣ Reinicie o servidor:
```powershell
npm start
```

---

## 🎯 PRONTO!

Agora use SMS em vez de WhatsApp. Funciona perfeitamente no Brasil.

**Custos:**
- Trial Twilio: $15 grátis (~300 SMS)
- Após trial: ~R$0,05 por SMS

---

## 💡 Quer usar WhatsApp de graça?

Use **WhatsApp Business API da Meta** (grátis):
- 1.000 conversas/mês incluídas
- Seu próprio número
- Guia: https://business.facebook.com/wa/manage/home

---

## 📚 Mais informações

Veja o guia completo: `WHATSAPP_BRASIL.md`
