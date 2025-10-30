const db = require('../models/database');

// Para usar Twilio SMS, instale: npm install twilio
// Ou use qualquer outro provedor de SMS (Zenvia, TotalVoice, etc)

class SMSService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.provider = process.env.SMS_PROVIDER || 'twilio'; // twilio, zenvia, totalvoice
    this.channel = (process.env.SMS_CHANNEL || 'sms').toLowerCase(); // sms | whatsapp | none
    this.initialize();
  }

  initialize() {
    console.log('🔄 Inicializando serviço de SMS...');

    // Canal desativado
    if (this.channel === 'none') {
      this.client = null;
      this.fromNumber = null;
      this.isReady = false;
      this.provider = this.provider || 'disabled';
      console.log('🔕 Mensageria desativada (canal: NONE). Nenhuma mensagem será enviada.');
      return;
    }

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
        // Definir remetente conforme canal
        if (this.channel === 'whatsapp') {
          // Número do WhatsApp Sandbox do Twilio
          // Pode ser configurado como: whatsapp:+14155238886 ou apenas +14155238886
          const rawFrom = process.env.WHATSAPP_FROM || process.env.WHATSAPP_SANDBOX_NUMBER || '+14155238886';
          this.fromNumber = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;
        } else {
          this.fromNumber = process.env.SMS_FROM_NUMBER || '';
        }
        this.isReady = true;
        console.log(`✅ Serviço de mensagens (Twilio) inicializado no canal: ${this.channel.toUpperCase()}`);
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
    if (this.channel === 'none') {
      throw new Error('Mensageria desativada (canal NONE)');
    }
    if (!this.isReady) {
      throw new Error('Serviço de SMS não está configurado. Configure as credenciais no .env');
    }

    const phone = booking.telefone.replace(/\D/g, '');
    // Formato internacional: +5511999999999
    let toNumber = phone.startsWith('55') ? `+${phone}` : `+55${phone}`;
    if (this.channel === 'whatsapp') {
      toNumber = toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`;
    }

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

      const channelLabel = this.channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
      console.log(`✅ ${channelLabel} enviado para ${booking.cliente} (${phone}) - SID: ${result.sid}`);
      return { success: true, message: `${channelLabel} enviado`, sid: result.sid };
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem (${this.channel}) para ${booking.cliente}:`, error);

      // Registrar falha no banco
      await db.run(
        'INSERT INTO reminder_logs (bookingId, status, message) VALUES (?, ?, ?)',
        [booking.id, 'failed', error.message]
      );

      throw error;
    }
  }

  async sendMessage(telefone, message) {
    if (this.channel === 'none') {
      throw new Error('Mensageria desativada (canal NONE)');
    }
    if (!this.isReady) {
      throw new Error('Serviço de SMS não está configurado');
    }

    const phone = telefone.replace(/\D/g, '');
    let toNumber = phone.startsWith('55') ? `+${phone}` : `+55${phone}`;
    if (this.channel === 'whatsapp') {
      toNumber = toNumber.startsWith('whatsapp:') ? toNumber : `whatsapp:${toNumber}`;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber
      });

      const channelLabel = this.channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
      console.log(`✅ ${channelLabel} enviado para ${telefone} - SID: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem (${this.channel}):`, error);
      throw error;
    }
  }

  formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatus() {
    return {
      connected: this.channel !== 'none' && this.isReady,
      provider: this.provider,
      channel: this.channel,
      fromNumber: this.isReady && this.channel !== 'none' ? this.fromNumber : null,
      configured: !!process.env.SMS_ACCOUNT_SID
    };
  }

  // Método para compatibilidade com código existente
  async getQRDataURL() {
    // SMS não usa QR Code, mas mantemos método para compatibilidade
    return { 
      dataUrl: null, 
      generatedAt: null,
      message: this.channel === 'whatsapp'
        ? 'WhatsApp Sandbox do Twilio não requer QR Code. Conecte enviando "join <código>" para o número do sandbox.'
        : (this.channel === 'none' ? 'Mensageria desativada - nenhum QR é necessário.' : 'SMS não requer QR Code - configure credenciais no .env')
    };
  }

  async logoutAndReset() {
    // SMS não precisa de logout, mas mantemos para compatibilidade
    return { 
      success: true, 
      message: this.channel === 'whatsapp'
        ? 'WhatsApp Sandbox não requer logout - pronto após parear com join <código>'
        : (this.channel === 'none' ? 'Mensageria desativada.' : 'SMS não requer logout - sempre pronto quando configurado')
    };
  }
}

module.exports = new SMSService();
