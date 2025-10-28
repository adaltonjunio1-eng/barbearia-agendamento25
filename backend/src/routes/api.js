const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const smsService = require('../services/smsService');

// Rotas de agendamentos
router.post('/bookings', bookingController.create);
router.get('/bookings', bookingController.getAll);
router.get('/bookings/phone/:phone', bookingController.getByPhone);
router.patch('/bookings/:id/status', bookingController.updateStatus);
router.delete('/bookings/:id', bookingController.delete);
router.post('/bookings/:id/reminder', bookingController.sendReminder);

// SMS Status e Configuração
router.get('/sms/status', async (req, res) => {
  try {
    const status = smsService.getStatus();
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter status do SMS' });
  }
});

// Página de configuração SMS (substitui QR Code)
router.get('/sms/config/html', async (req, res) => {
  try {
    const status = smsService.getStatus();
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Configuração SMS</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body{background:#0f1115;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial}
        .wrap{max-width:640px;margin:24px;padding:24px;border-radius:16px;background:#151822;box-shadow:0 10px 30px rgba(0,0,0,.3)}
        .title{font-weight:700;font-size:20px;margin:0 0 6px}
        .muted{color:#9ca3af;font-size:14px;margin:0 0 14px}
        .status{padding:16px;border-radius:12px;margin:16px 0}
        .success{background:rgba(74,222,128,0.1);border-left:3px solid #4ade80}
        .warning{background:rgba(251,146,60,0.1);border-left:3px solid #fb923c}
        code{background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;font-size:13px}
        ol{margin:12px 0 0 20px;line-height:1.8}
        a{color:#c8a951;text-decoration:none}
      </style>
    </head><body>
      <div class="wrap">
        <h1 class="title">📱 Configuração de SMS</h1>
        <p class="muted">Configure o serviço de SMS para enviar lembretes automáticos</p>
        
        <div class="status ${status.connected ? 'success' : 'warning'}">
          <strong>${status.connected ? '✅ SMS Ativo' : '⚠️ SMS Não Configurado'}</strong>
          <p style="margin:8px 0 0;font-size:13px">
            ${status.connected 
              ? `Provedor: ${status.provider}<br>Número: ${status.fromNumber}` 
              : 'Configure as credenciais no arquivo .env do backend'}
          </p>
        </div>

        <h3 style="margin-top:24px">Como configurar:</h3>
        <ol style="font-size:14px">
          <li>Crie conta no <a href="https://www.twilio.com/try-twilio" target="_blank">Twilio</a> (grátis)</li>
          <li>Obtenha suas credenciais (Account SID e Auth Token)</li>
          <li>Adicione no arquivo <code>.env</code> do backend:
            <pre style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;margin:8px 0;overflow-x:auto">SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=seu_account_sid_aqui
SMS_AUTH_TOKEN=seu_auth_token_aqui  
SMS_FROM_NUMBER=+5511999999999</pre>
          </li>
          <li>Instale a dependência: <code>npm install twilio</code></li>
          <li>Reinicie o backend</li>
        </ol>

        <div style="margin-top:24px;padding:12px;background:rgba(59,130,246,0.1);border-radius:8px;border:1px solid rgba(59,130,246,0.3)">
          <strong style="color:#3b82f6">💡 Dica:</strong>
          <p style="margin:8px 0 0;font-size:13px">
            O Twilio oferece crédito grátis para testes. Outros provedores: 
            <a href="https://www.zenvia.com" target="_blank">Zenvia</a>, 
            <a href="https://www.totalvoice.com.br" target="_blank">TotalVoice</a>
          </p>
        </div>
      </div>
    </body></html>`);
  } catch (e) {
    res.status(500).send('Erro ao carregar página de configuração');
  }
});

// Forçar reconfiguração do SMS
router.get('/sms/reconnect', async (req, res) => {
  try {
    smsService.initialize();
    const status = smsService.getStatus();
    res.json({ success: true, status });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao reconectar SMS' });
  }
});

// ===== WEBHOOKS PARA N8N =====
// Endpoint para receber dados de agendamentos do frontend e repassar para n8n
router.post('/webhook/booking-created', async (req, res) => {
  try {
    const booking = req.body;
    console.log('[N8N Webhook] Novo agendamento recebido:', booking);
    
    // Retorna sucesso imediatamente
    // O n8n deve chamar este endpoint ou você pode configurar para o backend chamar o n8n
    res.json({ 
      success: true, 
      message: 'Agendamento recebido para processamento',
      booking 
    });
  } catch (error) {
    console.error('[N8N Webhook] Erro:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Endpoint para n8n solicitar envio de lembretes
router.post('/webhook/send-reminder', async (req, res) => {
  try {
    const { bookingId, telefone, cliente, servicoNome, hora, dataISO } = req.body;
    console.log('[N8N Webhook] Solicitação de lembrete:', { bookingId, telefone });
    
    // Tenta enviar via SMS se estiver configurado
    const status = smsService.getStatus();
    if (status.connected) {
      await smsService.sendReminder({
        telefone,
        cliente,
        servicoNome,
        hora,
        dataISO
      });
    }
    
    res.json({ 
      success: true, 
      smsUsed: status.connected,
      message: status.connected 
        ? 'Lembrete enviado via SMS' 
        : 'SMS não configurado, use n8n para envio'
    });
  } catch (error) {
    console.error('[N8N Webhook] Erro ao enviar lembrete:', error);
    res.status(500).json({ error: 'Erro ao enviar lembrete' });
  }
});

// Status da integração
router.get('/webhook/status', (req, res) => {
  res.json({
    success: true,
    webhooks: {
      bookingCreated: '/api/webhook/booking-created',
      sendReminder: '/api/webhook/send-reminder'
    },
    instructions: 'Configure seu workflow no n8n para chamar estes endpoints'
  });
});

module.exports = router;
