const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const whatsappService = require('../services/whatsappService');

// Rotas de agendamentos
router.post('/bookings', bookingController.create);
router.get('/bookings', bookingController.getAll);
router.get('/bookings/phone/:phone', bookingController.getByPhone);
router.patch('/bookings/:id/status', bookingController.updateStatus);
router.delete('/bookings/:id', bookingController.delete);
router.post('/bookings/:id/reminder', bookingController.sendReminder);

// WhatsApp QR Code
router.get('/whatsapp/qr', async (req, res) => {
  try {
    const { dataUrl, generatedAt } = await whatsappService.getQRDataURL();
    if (!dataUrl) {
      return res.status(404).json({ error: 'QR Code não disponível no momento', generatedAt });
    }
    res.json({ success: true, dataUrl, generatedAt });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter QR Code' });
  }
});

// Página simples com o QR Code em HTML para abrir em nova aba
router.get('/whatsapp/qr/html', async (req, res) => {
  try {
    const { dataUrl, generatedAt } = await whatsappService.getQRDataURL();
    if (!dataUrl) {
      return res
        .status(404)
        .send(`<!doctype html><html><head><meta charset="utf-8"><title>QR Code WhatsApp</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body{background:#0f1115;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial}
            .wrap{max-width:640px;margin:24px;padding:24px;border-radius:16px;background:#151822;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center}
            .title{font-weight:700;font-size:20px;margin:0 0 6px}
            .muted{color:#9ca3af;font-size:14px;margin:0 0 14px}
            .box{background:#fff;padding:18px;border-radius:12px;display:inline-block}
            img{width:280px;height:280px;border-radius:8px;display:block}
          </style>
        </head><body>
          <div class="wrap">
            <h1 class="title">QR Code não disponível</h1>
            <p class="muted">Abra esta página novamente em alguns segundos ou reinicie o servidor.</p>
          </div>
        </body></html>`);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><head><meta charset="utf-8"><title>QR Code WhatsApp</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body{background:#0f1115;color:#e5e7eb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial}
        .wrap{max-width:640px;margin:24px;padding:24px;border-radius:16px;background:#151822;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center}
        .title{font-weight:700;font-size:20px;margin:0 0 6px}
        .muted{color:#9ca3af;font-size:14px;margin:0 0 14px}
        .box{background:#fff;padding:18px;border-radius:12px;display:inline-block}
        img{width:280px;height:280px;border-radius:8px;display:block}
        .row{display:flex;gap:10px;justify-content:center;margin-top:14px}
        a.btn{padding:10px 14px;border-radius:8px;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
        .primary{background:#c8a951;color:#0f1115;font-weight:700}
        .outline{border:1px solid #334155;color:#e5e7eb}
      </style>
    </head><body>
      <div class="wrap">
        <h1 class="title">Conectar WhatsApp</h1>
        <p class="muted">Abra o WhatsApp no celular » Dispositivos conectados » Conectar um dispositivo e escaneie o QR abaixo.</p>
        <div class="box">
          <img src="${dataUrl}" alt="QR Code do WhatsApp" />
        </div>
        <div class="row">
          <a class="btn outline" href="https://web.whatsapp.com" target="_blank" rel="noopener">Abrir WhatsApp Web</a>
          <a class="btn primary" href="/api/whatsapp/qr/html">Atualizar QR</a>
        </div>
        <p class="muted">Gerado em: ${generatedAt ? new Date(generatedAt).toLocaleString('pt-BR') : 'agora'}</p>
      </div>
    </body></html>`);
  } catch (e) {
    res.status(500).send('Erro ao montar página do QR Code');
  }
});

module.exports = router;
