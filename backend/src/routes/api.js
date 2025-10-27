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

module.exports = router;
