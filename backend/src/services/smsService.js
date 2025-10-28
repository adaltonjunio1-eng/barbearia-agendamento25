const db = require('../models/database');

// Para usar Twilio SMS, instale: npm install twilio
// Ou use qualquer outro provedor de SMS (Zenvia, TotalVoice, etc)

class SMSService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.provider = process.env.SMS_PROVIDER || 'twilio'; // twilio, zenvia, totalvoice
    this.initialize();
  }

  initialize() {
    console.log('🔄 Inicializando serviço de SMS...');

    // Verificar se credenciais estão configuradas
    if (!process.env.SMS_ACCOUNT_SID || !process.env.SMS_AUTH_TOKEN) {
      console.warn('⚠️ Credenciais de SMS não configuradas no .env');
      console.warn('⚠️ Configure SMS_ACCOUNT_SID e SMS_AUTH_TOKEN para ativar SMS');
      this.isReady = false;
      return;
    }

    try {
      if (this.provider === 'twilio') {
        // Twilio SMS (https://www.twilio.com)
        const twilio = require('twilio');
        this.client = twilio(
          process.env.SMS_ACCOUNT_SID,
          process.env.SMS_AUTH_TOKEN
        );
        this.fromNumber = process.env.SMS_FROM_NUMBER || '';
        this.isReady = true;
        console.log('✅ Serviço de SMS (Twilio) inicializado!');
      } else {
        console.warn(`⚠️ Provedor '${this.provider}' não implementado. Use 'twilio'.`);
        this.isReady = false;
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar SMS:', error.message);
      console.warn('💡 Execute: npm install twilio');
      this.isReady = false;
    }
  }

  async sendReminder(booking) {
    if (!this.isReady) {
      throw new Error('Serviço de SMS não está configurado. Configure as credenciais no .env');
    }

    const phone = booking.telefone.replace(/\D/g, '');
    // Formato internacional: +5511999999999
    const toNumber = phone.startsWith('55') ? `+${phone}` : `+55${phone}`;

    const message = `Olá ${booking.cliente}! 😊

🔔 Lembrete de Agendamento - ${process.env.BARBERSHOP_NAME || 'BARBEARIA'}

Você tem um horário agendado em 1 hora:
📅 Data: ${this.formatDate(booking.dataISO)}
⏰ Horário: ${booking.hora}
✂️ Serviço: ${booking.servicoNome}
💰 Valor: R$ ${booking.valor.toFixed(2)}

📍 ${process.env.BARBERSHOP_ADDRESS || 'Aguardamos você!'}

Responda SIM para confirmar presença.`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      // Registrar envio no banco
      await db.run(
        'INSERT INTO reminder_logs (bookingId, status, message) VALUES (?, ?, ?)',
        [booking.id, 'sent', `SMS enviado (SID: ${result.sid})`]
      );

      // Atualizar booking
      await db.run(
        'UPDATE bookings SET reminderSent = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [booking.id]
      );

      console.log(`✅ SMS enviado para ${booking.cliente} (${phone}) - SID: ${result.sid}`);
      return { success: true, message: 'SMS enviado', sid: result.sid };
    } catch (error) {
      console.error(`❌ Erro ao enviar SMS para ${booking.cliente}:`, error);

      // Registrar falha no banco
      await db.run(
        'INSERT INTO reminder_logs (bookingId, status, message) VALUES (?, ?, ?)',
        [booking.id, 'failed', error.message]
      );

      throw error;
    }
  }

  async sendMessage(telefone, message) {
    if (!this.isReady) {
      throw new Error('Serviço de SMS não está configurado');
    }

    const phone = telefone.replace(/\D/g, '');
    const toNumber = phone.startsWith('55') ? `+${phone}` : `+55${phone}`;

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      console.log(`✅ SMS enviado para ${telefone} - SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error(`❌ Erro ao enviar SMS:`, error);
      throw error;
    }
  }

  formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatus() {
    return {
      connected: this.isReady,
      provider: this.provider,
      fromNumber: this.isReady ? this.fromNumber : null,
      configured: !!process.env.SMS_ACCOUNT_SID
    };
  }

  // Método para compatibilidade com código existente
  async getQRDataURL() {
    // SMS não usa QR Code, mas mantemos método para compatibilidade
    return { 
      dataUrl: null, 
      generatedAt: null,
      message: 'SMS não requer QR Code - configure credenciais no .env'
    };
  }

  async logoutAndReset() {
    // SMS não precisa de logout, mas mantemos para compatibilidade
    return { 
      success: true, 
      message: 'SMS não requer logout - sempre pronto quando configurado'
    };
  }
}

module.exports = new SMSService();
