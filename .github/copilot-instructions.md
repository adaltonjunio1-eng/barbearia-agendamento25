# Copilot Instructions - Barbearia Agendamento

## 🏗️ Arquitetura do Projeto

Este é um **sistema de agendamento de barbearia** com duas aplicações distintas no mesmo arquivo HTML:

### 1. **App Cliente** (`#mainApp`)
- Sistema de agendamento progressivo (login → serviços → agendar → confirmação)
- Fluxo em abas com estado gerenciado por `appState` (telefone, nome, serviço, data/hora)
- **Consulta de agendamentos**: tela separada em `#consultaContainer` que usa `localStorage` para buscar agendamentos por telefone

### 2. **App Admin** (`#admin`)
- Dashboard full-screen com grid layout responsivo (sidebar + topbar + main)
- Gerencia agendamentos, clientes, horários disponíveis, dias fechados
- Gráficos com Chart.js, tema dark/light, backup/restore de dados
- Acesso protegido por senha (padrão: `bf12025`, armazenada em `localStorage.adminPassword`)

---

## 📦 Armazenamento de Dados (localStorage)

**Todos os dados persistem no navegador usando `localStorage`:**

| Chave | Tipo | Descrição |
|-------|------|-----------|
| `bookings` | `Array<Booking>` | Lista de todos os agendamentos |
| `closedDates` | `Array<string>` | Datas fechadas no formato ISO (YYYY-MM-DD) |
| `availableSlots` | `Array<string>` | Horários padrão globais (ex: `["09:00", "09:30", ...]`) |
| `availableSlotsByDay` | `Object` | Horários por dia da semana (`{ "0": [...], "1": [...] }`) |
| `adminPassword` | `string` | Senha do admin (default: `bf12025`) |
| `adminTheme` | `"dark" \| "light"` | Tema do painel admin |

### Estrutura de um `Booking`:
```js
{
  id: number,           // timestamp
  cliente: string,
  telefone: string,     // formato: "(11) 99999-9999"
  servicoId: number,
  servicoNome: string,
  valor: number,
  duracao: number,
  hora: string,         // formato: "HH:mm"
  dataISO: string,      // formato: "YYYY-MM-DD"
  status: "Pendente" | "Pago" | "Cancelado",
  reminderSent: boolean
}
```

---

## 🔍 Problema Resolvido (Consulta de Agendamentos)

### **Erro Original:**
- Função `buscarAgendamentos()` tinha `catch` genérico sem logs
- Falhas silenciosas impediam debugging

### **Solução Aplicada:**
- Adicionado `console.error()` no catch para rastrear erros reais
- HTML de erro melhorado com mensagem detalhada e `e.message`
- Validação de funções auxiliares como `formatDateBR()` antes de usar

### **Debugging Guide:**
```js
// Testar localStorage no console do navegador:
JSON.parse(localStorage.getItem('bookings') || '[]')

// Limpar dados de teste:
localStorage.clear()
```

---

## 🎨 Convenções de Estilo

- **CSS Variables:** Todas as cores/estilos em `:root` (ex: `--primary`, `--secondary`, `--gold-light`)
- **Tema dark-first:** App cliente sempre dark; admin tem toggle light/dark
- **Responsividade:** Mobile-first com breakpoints em 640px, 768px, 1024px, 1280px
- **Animações:** `var(--transition)` usa cubic-bezier para animações suaves

---

## ⚙️ Horários e Disponibilidade

### **Sistema de Horários:**
1. **Global (`availableSlots`)**: Horários padrão para todos os dias
2. **Por Dia (`availableSlotsByDay`)**: Sobrescreve global para dia específico da semana (0=dom, 6=sáb)
3. **Datas Fechadas (`closedDates`)**: Bloqueia datas específicas (feriados, etc)

### **Lógica de Validação:**
```js
// Em renderTimeSlots():
1. Verifica se data está em closedDates → mostra "fechado"
2. Busca slots do dia da semana via getAvailableSlotsForDateISO()
3. Filtra horários já passados (se data = hoje)
4. Filtra horários já agendados (status ≠ "Cancelado")
```

### **Gerar Horários em Massa:**
- Admin pode gerar intervalos automáticos (ex: 09:00-18:00 a cada 30min)
- Preset "Ter-Sex 09-18 / Sáb 09-16" aplica padrão comum em um clique

---

## 🛠️ Comandos e Workflows

### **Desenvolvimento Local:**
```bash
# Abrir index.html direto no navegador (sem servidor)
start index.html  # Windows
open index.html   # macOS

# OU usar servidor simples:
npx serve .
python -m http.server 8000
```

### **Deploy:**
- Arquivo `index.html` standalone (sem build)
- Hospedar em: GitHub Pages, Netlify, Vercel, ou qualquer host estático
- **Importante:** Dados ficam no `localStorage` do navegador do usuário

### **Backup/Restore:**
- Admin → Configurações → "Exportar Backup" gera JSON com tudo
- "Importar Backup" restaura dados em outro dispositivo/navegador

---

## 🔐 Segurança

⚠️ **ATENÇÃO:** Este sistema é **client-side only**:
- Senha do admin visível no código (`DEFAULT_ADMIN_PASSWORD`)
- Dados não sincronizam entre dispositivos
- Sem autenticação real de backend

**Para produção real:**
- Migrar para backend (Node.js + MongoDB/PostgreSQL)
- Implementar autenticação JWT
- Adicionar criptografia de senhas (bcrypt)
- API REST para sincronização de dados

---

## 📋 Padrões de Código

### **Manipulação de DOM:**
```js
// ✅ BOM: Verificar existência antes de usar
const el = document.getElementById('myElement');
if (el) el.textContent = 'texto';

// ❌ RUIM: Assumir que elemento existe
document.getElementById('myElement').textContent = 'texto';
```

### **Try-Catch em localStorage:**
```js
try {
  const data = JSON.parse(localStorage.getItem('key') || '[]');
  // ... processar data
} catch (e) {
  console.error('Erro ao carregar dados:', e);
  // ... fallback
}
```

### **Formatação de Datas:**
- **ISO para armazenamento:** `YYYY-MM-DD` (ex: `2025-10-27`)
- **BR para display:** `DD/MM/YYYY` (ex: `27/10/2025`)
- Usar `formatDateISO(date)` e `formatDateBR(iso)` existentes

---

## 🚀 Recursos Principais

### **Cliente:**
- Máscara telefônica automática `(XX) XXXXX-XXXX`
- Validação de horários em tempo real (passados/ocupados)
- Design responsivo mobile-first

### **Admin:**
- Dashboard com KPIs (faturamento, ticket médio, clientes)
- Gráfico de faturamento mensal (Chart.js)
- Gerenciamento de status de agendamentos (Pendente → Pago/Cancelado)
- Mensagens em massa por WhatsApp (grupos: todos, recentes, inativos)
- Lembretes automáticos 1h antes do agendamento

---

## 📝 Notas Importantes

1. **Estrutura React (`src/`)**: Existe mas NÃO está em uso. Sistema principal é `index.html` standalone.
2. **Fontes externas:** Font Awesome via CDN, Inter do Google Fonts
3. **Navegação entre apps:** 
   - Cliente ↔ Consulta: `showConsultaAgendamento()` / `closeConsulta()`
   - Cliente ↔ Admin: `openAdminLogin()` / `closeAdmin()`
4. **Estado global:** `appState` (cliente) e `adminState` (admin) são objetos globais

---

## 🐛 Debugging Common Issues

### "Horários não aparecem":
- Verificar se `dateInput` tem valor válido
- Console: `getAvailableSlotsForDateISO('2025-10-27')`
- Verificar se data não está em `closedDates`

### "Agendamentos não salvam":
- Abrir DevTools → Application → Local Storage
- Verificar se `bookings` tem array válido
- Testar com `localStorage.clear()` e tentar novamente

### "Admin não abre":
- Verificar senha: `getAdminPassword()` no console
- Resetar senha: `localStorage.removeItem('adminPassword')`

---

## 🎯 Princípios de Manutenção

- **Single File Architecture**: Todo código em `index.html` para simplicidade
- **Backward Compatibility**: Sempre adicionar fallbacks para dados antigos do localStorage
- **Progressive Enhancement**: Validar existência de elementos antes de manipular
- **Error Visibility**: Usar `console.error()` + mensagens visuais para erros

---

_Última atualização: 27/10/2025_
