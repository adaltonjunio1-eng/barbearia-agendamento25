# 🪒 Backend - Sistema de Agendamento de Barbearia

Backend Node.js com Express, WhatsApp Web.js e SQLite para sistema de agendamento com lembretes automáticos.

## 🚀 Recursos

- ✅ API REST completa para gerenciar agendamentos
- 📱 Integração com WhatsApp (whatsapp-web.js)
- ⏰ Lembretes automáticos 1 hora antes do agendamento
- 💾 Banco de dados SQLite
- 🔒 Segurança com Helmet e Rate Limiting
- 📊 Logs de envio de mensagens
- 🔄 Verificação de lembretes a cada minuto

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar as variáveis de ambiente
notepad .env
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
PORT=3333
FRONTEND_URL=http://localhost:5500
DB_PATH=./database.sqlite
BARBERSHOP_NAME=Bruno Ferreira Barbearia
BARBERSHOP_ADDRESS=Rua José Bonifácio, 491, centro - cordeiropolis, SP
BARBERSHOP_PHONE=+5519996354338
REMINDER_TIME_BEFORE=60
```

## 🏃 Executar

### Desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Produção:
```bash
npm start
```

## 📱 Conectar WhatsApp

Forma recomendada (via link em nova aba):

1. Inicie o servidor
2. Acesse: http://localhost:3333/api/whatsapp/qr/html
3. No celular: WhatsApp > Dispositivos conectados > Conectar um dispositivo
4. Escaneie o QR da página e aguarde conectar

Também pelo Admin:

- Admin > Configurações > "Abrir QR Code em nova aba" (abre a mesma rota acima)

Observações:

- Se já estiver conectado, o QR não será exibido (não é necessário)
- Se o QR não aparecer, aguarde 10–15s e atualize a página do QR

## 🔌 API Endpoints

### Agendamentos

**Criar agendamento:**
```http
POST /api/bookings
Content-Type: application/json

{
  "cliente": "João Silva",
  "telefone": "(11) 99999-9999",
  "servicoId": 1,
  "servicoNome": "Corte Geral",
  "valor": 40,
  "duracao": 45,
  "hora": "14:00",
  "dataISO": "2025-10-28"
}
```

**Buscar por telefone:**
```http
GET /api/bookings/phone/11999999999
```

**Listar todos:**
```http
GET /api/bookings
GET /api/bookings?status=Pendente
GET /api/bookings?date=2025-10-28
```

**Atualizar status:**
```http
PATCH /api/bookings/:id/status
Content-Type: application/json

{
  "status": "Pago"
}
```

**Enviar lembrete manual:**
```http
POST /api/bookings/:id/reminder
```

**Deletar:**
```http
DELETE /api/bookings/:id
```

### Status

**Health check:**
```http
GET /health
```

**Status do WhatsApp:**
```http
GET /api/whatsapp/status
```

**Página HTML com QR (abrir em nova aba):**
```http
GET /api/whatsapp/qr/html
```

**Estatísticas de lembretes:**
```http
GET /api/reminders/stats
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `bookings`
- `id` INTEGER PRIMARY KEY
- `cliente` TEXT
- `telefone` TEXT
- `servicoId` INTEGER
- `servicoNome` TEXT
- `valor` REAL
- `duracao` INTEGER
- `hora` TEXT
- `dataISO` TEXT
- `status` TEXT (Pendente | Pago | Cancelado)
- `reminderSent` INTEGER (0 | 1)
- `createdAt` DATETIME
- `updatedAt` DATETIME

### Tabela `reminder_logs`
- `id` INTEGER PRIMARY KEY
- `bookingId` INTEGER
- `sentAt` DATETIME
- `status` TEXT
- `message` TEXT

## 📂 Estrutura de Pastas

```
backend/
├── src/
│   ├── controllers/
│   │   └── bookingController.js    # Lógica de negócio
│   ├── models/
│   │   └── database.js              # Conexão SQLite
│   ├── routes/
│   │   └── api.js                   # Rotas da API
│   ├── services/
│   │   ├── whatsappService.js       # Integração WhatsApp
│   │   └── reminderService.js       # Cron de lembretes
│   └── server.js                    # Servidor Express
├── .env.example                     # Exemplo de configuração
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Troubleshooting

### WhatsApp não conecta
- Certifique-se de que o celular está conectado à internet
- Tente deletar a pasta `.wwebjs_auth` e reconectar
- Verifique se o firewall não está bloqueando

### Lembretes não são enviados
- Verifique se o WhatsApp está conectado: `GET /api/whatsapp/status`
- Confira os logs no terminal
- Certifique-se de que os agendamentos têm `dataISO` e `hora` corretos

### Erro ao instalar dependências
```bash
# Windows: instalar ferramentas de build
npm install --global windows-build-tools

# Instalar novamente
npm install
```

## 📝 Logs

O sistema exibe logs coloridos no terminal:

- ✅ Verde: Sucesso
- ⚠️ Amarelo: Aviso
- ❌ Vermelho: Erro
- 🔄 Azul: Processando
- 📨 Envelope: Enviando mensagem

## 🚀 Deploy (Produção)

### Usando PM2:
```bash
npm install -g pm2
pm2 start src/server.js --name barbearia-backend
pm2 save
pm2 startup
```

### Usando Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3333
CMD ["node", "src/server.js"]
```

## 📄 Licença

MIT

## 👨‍💻 Autor

Bruno Ferreira Barbearia - Sistema de Agendamentos
