const db = require('../models/database');

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const toISO = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
  return { start: toISO(start), end: toISO(end) };
}

async function getSetting(key, defaultValue = null) {
  try {
    const row = await db.get('SELECT value FROM settings WHERE key = ?', [key]);
    if (!row) return defaultValue;
    return row.value;
  } catch {
    return defaultValue;
  }
}

module.exports = {
  // KPIs do topo
  async stats(req, res) {
    try {
      const { start, end } = getMonthRange();
      const kpis = await db.get(
        `SELECT 
           IFNULL(SUM(CASE WHEN status <> 'Cancelado' THEN valor ELSE 0 END), 0) AS totalRevenueMonth,
           COUNT(*) AS newAppointmentsMonth
         FROM bookings
         WHERE dataISO BETWEEN ? AND ?`,
        [start, end]
      );

      let activeBarbers = parseInt(await getSetting('active_barbers', '0'), 10);
      if (Number.isNaN(activeBarbers)) activeBarbers = 0;

      res.json({
        success: true,
        totalRevenueMonth: kpis.totalRevenueMonth || 0,
        newAppointmentsMonth: kpis.newAppointmentsMonth || 0,
        activeBarbers
      });
    } catch (error) {
      console.error('❌ Erro em /dashboard/stats:', error);
      res.status(500).json({ error: 'Erro ao obter estatísticas do dashboard' });
    }
  },

  // Últimos agendamentos
  async recentAppointments(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
      const bookings = await db.all(
        `SELECT id, cliente, telefone, servicoNome, valor, hora, dataISO, status
         FROM bookings
         ORDER BY dataISO DESC, hora DESC
         LIMIT ?`,
        [limit]
      );

      res.json({ success: true, bookings });
    } catch (error) {
      console.error('❌ Erro em /dashboard/recent-appointments:', error);
      res.status(500).json({ error: 'Erro ao obter agendamentos recentes' });
    }
  },

  // Série de ganhos por dia do mês atual
  async earningsSeries(req, res) {
    try {
      const { start, end } = getMonthRange();
      const rows = await db.all(
        `SELECT dataISO, IFNULL(SUM(CASE WHEN status <> 'Cancelado' THEN valor ELSE 0 END), 0) AS total
         FROM bookings
         WHERE dataISO BETWEEN ? AND ?
         GROUP BY dataISO
         ORDER BY dataISO ASC`,
        [start, end]
      );

      const labels = rows.map(r => r.dataISO.slice(8, 10) + '/' + r.dataISO.slice(5, 7));
      const values = rows.map(r => r.total);

      res.json({ success: true, labels, values });
    } catch (error) {
      console.error('❌ Erro em /dashboard/earnings:', error);
      res.status(500).json({ error: 'Erro ao obter série de ganhos' });
    }
  }
};
