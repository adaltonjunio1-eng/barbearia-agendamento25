const cron = require('node-cron');
const db = require('../models/database');
const whatsappService = require('./whatsappService');

class ReminderService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ Serviço de lembretes já está rodando');
      return;
    }

    // Executar a cada minuto
    this.job = cron.schedule('* * * * *', async () => {
      await this.checkReminders();
    });

    this.isRunning = true;
    console.log('✅ Serviço de lembretes automáticos iniciado (verifica a cada minuto)');
  }

  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('⏹️ Serviço de lembretes pausado');
    }
  }

  async checkReminders() {
    try {
      const now = new Date();
      const reminderTime = parseInt(process.env.REMINDER_TIME_BEFORE) || 60; // padrão 60 minutos

      // Buscar agendamentos que precisam de lembrete
      const bookings = await db.all(`
        SELECT * FROM bookings 
        WHERE status != 'Cancelado' 
        AND reminderSent = 0
        AND datetime(dataISO || ' ' || hora) > datetime('now')
      `);

      for (const booking of bookings) {
        const appointmentDate = new Date(`${booking.dataISO}T${booking.hora}:00`);
        const reminderDate = new Date(appointmentDate.getTime() - reminderTime * 60 * 1000);

        // Verificar se está no horário de enviar (±2 minutos de margem)
        const diff = reminderDate.getTime() - now.getTime();
        const twoMinutes = 2 * 60 * 1000;

        if (diff >= -twoMinutes && diff <= twoMinutes) {
          console.log(`📨 Enviando lembrete para ${booking.cliente}...`);
          try {
            await whatsappService.sendReminder(booking);
          } catch (error) {
            console.error(`❌ Falha ao enviar lembrete para ${booking.cliente}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar lembretes:', error);
    }
  }

  async getStats() {
    try {
      const total = await db.get('SELECT COUNT(*) as count FROM bookings WHERE status != "Cancelado"');
      const sent = await db.get('SELECT COUNT(*) as count FROM bookings WHERE reminderSent = 1');
      const pending = await db.get(`
        SELECT COUNT(*) as count FROM bookings 
        WHERE status != 'Cancelado' 
        AND reminderSent = 0
        AND datetime(dataISO || ' ' || hora) > datetime('now')
      `);

      return {
        total: total.count,
        sent: sent.count,
        pending: pending.count,
        isRunning: this.isRunning
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { total: 0, sent: 0, pending: 0, isRunning: this.isRunning };
    }
  }
}

module.exports = new ReminderService();
