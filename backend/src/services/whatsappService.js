const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const db = require('../models/database');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.lastQR = null;
    this.lastQRTimestamp = null;
    this.initialize();
  }

  initialize() {
    console.log('🔄 Inicializando WhatsApp Web...');

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './.wwebjs_auth'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.client.on('qr', (qr) => {
        // Armazenar QR para consumo pelo frontend
        this.lastQR = qr;
        this.lastQRTimestamp = new Date().toISOString();

        console.log('\n📱 Escaneie o QR Code abaixo com o WhatsApp:\n');
        qrcodeTerminal.generate(qr, { small: true });
        console.log('\n👆 Abra o WhatsApp > Dispositivos Vinculados > Vincular Dispositivo\n');
      });

      this.client.on('ready', () => {
        console.log('✅ WhatsApp conectado e pronto!');
        this.isReady = true;
        // Limpar QR após conexão
        this.lastQR = null;
        this.lastQRTimestamp = null;
      });

      this.client.on('authenticated', () => {
        console.log('✅ WhatsApp autenticado');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('❌ Falha na autenticação:', msg);
      });

      this.client.on('disconnected', (reason) => {
        console.log('⚠️ WhatsApp desconectado:', reason);
        this.isReady = false;
      });

      this.client.initialize().catch(err => {
        console.error('❌ Erro ao inicializar WhatsApp (não-crítico):', err.message);
        console.log('ℹ️ Sistema continuará funcionando. Use n8n para automações.');
      });
    } catch (error) {
      console.error('❌ Erro ao configurar WhatsApp (não-crítico):', error.message);
      console.log('ℹ️ Sistema continuará funcionando. Use n8n para automações.');
    }
  }

  async sendReminder(booking) {
    if (!this.isReady) {
      throw new Error('WhatsApp não está conectado');
    }

    const phone = booking.telefone.replace(/\D/g, '');
    const chatId = `55${phone}@c.us`;

    const message = `Olá ${booking.cliente}! 😊

🔔 *Lembrete de Agendamento - ${process.env.BARBERSHOP_NAME || 'BRUNO FERREIRA BARBEARIA'}*

Você tem um horário agendado em 1 hora:
📅 Data: ${this.formatDate(booking.dataISO)}
⏰ Horário: ${booking.hora}
✂️ Serviço: ${booking.servicoNome}
⏱️ Duração: ${booking.duracao} min
💰 Valor: R$ ${booking.valor.toFixed(2)}

📍 Endereço: ${process.env.BARBERSHOP_ADDRESS || '[Endereço não configurado]'}

Aguardamos você! 🙌

Para confirmar presença, responda esta mensagem.`;

    try {
      await this.client.sendMessage(chatId, message);
      
      // Registrar envio no banco
      await db.run(
        'INSERT INTO reminder_logs (bookingId, status, message) VALUES (?, ?, ?)',
        [booking.id, 'sent', 'Lembrete enviado com sucesso']
      );

      // Atualizar booking
      await db.run(
        'UPDATE bookings SET reminderSent = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [booking.id]
      );

      console.log(`✅ Lembrete enviado para ${booking.cliente} (${phone})`);
      return { success: true, message: 'Lembrete enviado' };
    } catch (error) {
      console.error(`❌ Erro ao enviar lembrete para ${booking.cliente}:`, error);
      
      // Registrar falha no banco
      await db.run(
        'INSERT INTO reminder_logs (bookingId, status, message) VALUES (?, ?, ?)',
        [booking.id, 'failed', error.message]
      );

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
      clientInfo: this.isReady ? this.client.info : null,
      hasQR: !!this.lastQR,
      qrGeneratedAt: this.lastQRTimestamp
    };
  }

  async getQRDataURL() {
    if (!this.lastQR) {
      return { dataUrl: null, generatedAt: this.lastQRTimestamp };
    }
    try {
      const dataUrl = await QRCode.toDataURL(this.lastQR, { margin: 2, scale: 6 });
      return { dataUrl, generatedAt: this.lastQRTimestamp };
    } catch (e) {
      console.error('❌ Erro ao gerar data URL do QR:', e);
      return { dataUrl: null, generatedAt: this.lastQRTimestamp };
    }
  }

  async logoutAndReset() {
    try {
      console.log('🔌 Solicitado logout do WhatsApp...');
      if (this.client) {
        try { await this.client.logout(); } catch (_) {}
        try { await this.client.destroy(); } catch (_) {}
      }
    } finally {
      this.isReady = false;
      this.lastQR = null;
      this.lastQRTimestamp = null;
      // Re-inicializa para gerar novo QR
      this.initialize();
    }
    return { success: true };
  }
}

module.exports = new WhatsAppService();
