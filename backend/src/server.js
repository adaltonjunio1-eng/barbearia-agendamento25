require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const reminderService = require('./services/reminderService');
const whatsappService = require('./services/whatsappService');

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use('/api/', limiter);

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use('/api', apiRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    whatsapp: whatsappService.getStatus(),
    reminders: {
      isRunning: reminderService.isRunning
    }
  });
});

// Rota para status do WhatsApp
app.get('/api/whatsapp/status', (req, res) => {
  res.json(whatsappService.getStatus());
});

// Rota para estatísticas de lembretes
app.get('/api/reminders/stats', async (req, res) => {
  try {
    const stats = await reminderService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🪒  BARBEARIA BACKEND - Sistema de Agendamentos  ✂️    ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   🌐  Servidor rodando em: http://localhost:${PORT}       ║
║   📱  WhatsApp: Aguardando conexão...                     ║
║   ⏰  Lembretes automáticos: Iniciando...                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Iniciar serviço de lembretes automáticos
  setTimeout(() => {
    reminderService.start();
  }, 5000); // Aguardar 5s para WhatsApp conectar
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  Encerrando servidor...');
  reminderService.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⏹️  Encerrando servidor...');
  reminderService.stop();
  process.exit(0);
});
