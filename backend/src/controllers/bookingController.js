const db = require('../models/database');
const whatsappService = require('../services/whatsappService');

class BookingController {
  // Criar novo agendamento
  async create(req, res) {
    try {
      const { cliente, telefone, servicoId, servicoNome, valor, duracao, hora, dataISO } = req.body;

      // Validações
      if (!cliente || !telefone || !servicoNome || !valor || !hora || !dataISO) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const result = await db.run(
        `INSERT INTO bookings (cliente, telefone, servicoId, servicoNome, valor, duracao, hora, dataISO, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cliente, telefone, servicoId || 0, servicoNome, valor, duracao || 0, hora, dataISO, 'Pendente']
      );

      const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);

      res.status(201).json({
        success: true,
        message: 'Agendamento criado com sucesso',
        booking
      });
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }

  // Buscar agendamentos por telefone
  async getByPhone(req, res) {
    try {
      const { phone } = req.params;
      const cleanPhone = phone.replace(/\D/g, '');

      const bookings = await db.all(
        'SELECT * FROM bookings WHERE telefone LIKE ? ORDER BY dataISO DESC, hora DESC',
        [`%${cleanPhone}%`]
      );

      res.json({
        success: true,
        count: bookings.length,
        bookings
      });
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  }

  // Listar todos os agendamentos
  async getAll(req, res) {
    try {
      const { status, date } = req.query;
      let sql = 'SELECT * FROM bookings WHERE 1=1';
      const params = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (date) {
        sql += ' AND dataISO = ?';
        params.push(date);
      }

      sql += ' ORDER BY dataISO DESC, hora DESC';

      const bookings = await db.all(sql, params);

      res.json({
        success: true,
        count: bookings.length,
        bookings
      });
    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error);
      res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
  }

  // Atualizar status do agendamento
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Pendente', 'Pago', 'Cancelado'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      await db.run(
        'UPDATE bookings SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );

      const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        booking
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  // Deletar agendamento
  async delete(req, res) {
    try {
      const { id } = req.params;

      await db.run('DELETE FROM bookings WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Agendamento deletado com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao deletar agendamento:', error);
      res.status(500).json({ error: 'Erro ao deletar agendamento' });
    }
  }

  // Enviar lembrete manual
  async sendReminder(req, res) {
    try {
      const { id } = req.params;

      const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [id]);

      if (!booking) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      if (booking.status === 'Cancelado') {
        return res.status(400).json({ error: 'Não é possível enviar lembrete para agendamento cancelado' });
      }

      await whatsappService.sendReminder(booking);

      res.json({
        success: true,
        message: 'Lembrete enviado com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete:', error);
      res.status(500).json({ error: error.message || 'Erro ao enviar lembrete' });
    }
  }
}

module.exports = new BookingController();
