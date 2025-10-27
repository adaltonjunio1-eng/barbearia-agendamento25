// ============================================
// EXEMPLO DE INTEGRAÇÃO COM O BACKEND
// ============================================
// Este arquivo mostra como substituir localStorage por chamadas à API

const API_URL = 'http://localhost:3333/api';

// ============================================
// FUNÇÕES DE API
// ============================================

// Criar agendamento
async function createBookingAPI(bookingData) {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar agendamento');
    }

    return data.booking;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

// Buscar agendamentos por telefone
async function getBookingsByPhoneAPI(phone) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const response = await fetch(`${API_URL}/bookings/phone/${cleanPhone}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar agendamentos');
    }

    return data.bookings;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
}

// Atualizar status (cancelar, confirmar pagamento, etc)
async function updateBookingStatusAPI(bookingId, status) {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar status');
    }

    return data.booking;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
}

// Enviar lembrete manual
async function sendReminderAPI(bookingId) {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/reminder`, {
      method: 'POST'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar lembrete');
    }

    return data;
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    throw error;
  }
}

// ============================================
// SUBSTITUIR FUNÇÕES EXISTENTES
// ============================================

// Substituir a função confirmBooking() no index.html
function confirmBookingWithAPI() {
  if (!appState.selectedTime) {
    showNotification('Por favor, selecione um horário', 'error');
    return;
  }
  if (!appState.selectedDate) {
    showNotification('Por favor, selecione uma data', 'error');
    return;
  }

  // VALIDAÇÃO ADICIONAL: Verificar se horário já passou
  const now = new Date();
  const today = formatDateISO(now);
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [h, m] = appState.selectedTime.split(':').map(Number);
  const slotMinutes = h * 60 + m;
  
  if (appState.selectedDate === today && slotMinutes <= currentTime) {
    showNotification('Este horário já passou. Escolha outro horário.', 'error');
    appState.selectedTime = null;
    renderTimeSlots();
    return;
  }

  // Atualizar UI
  document.getElementById('confirm-service').textContent = appState.selectedService.name;
  document.getElementById('confirm-time').textContent = appState.selectedTime;
  document.getElementById('confirm-price').textContent = `R$ ${appState.selectedService.price}`;
  document.getElementById('confirm-client').textContent = appState.userName;
  document.getElementById('confirm-phone').textContent = appState.userPhone;
  document.getElementById('confirm-date').textContent = formatDateBR(appState.selectedDate);

  // Criar objeto de agendamento
  const bookingData = {
    cliente: appState.userName,
    telefone: appState.userPhone,
    servicoId: appState.selectedService.id,
    servicoNome: appState.selectedService.name,
    valor: appState.selectedService.price,
    duracao: appState.selectedService.duration,
    hora: appState.selectedTime,
    dataISO: appState.selectedDate
  };

  // Enviar para API
  createBookingAPI(bookingData)
    .then(booking => {
      console.log('Agendamento criado:', booking);
      
      // Persistir último telefone
      localStorage.setItem('lastPhone', appState.userPhone);
      
      showNotification('Agendamento confirmado!');
      switchTab('confirmacao');
    })
    .catch(error => {
      showNotification('Erro ao criar agendamento: ' + error.message, 'error');
    });
}

// Substituir a função buscarAgendamentos() no index.html
function buscarAgendamentosWithAPI() {
  const phone = document.getElementById('consultaPhone').value.replace(/\D/g, '');
  
  console.log('[DEBUG] Buscando agendamentos para:', phone);
  
  if (!phone || phone.length < 11) {
    showNotification('Por favor, insira um número de celular válido', 'error');
    return;
  }

  // Buscar da API
  getBookingsByPhoneAPI(phone)
    .then(userBookings => {
      console.log('[DEBUG] Agendamentos encontrados:', userBookings.length);

      if (userBookings.length === 0) {
        document.getElementById('consultaResults').innerHTML = `
          <div class="no-bookings">
            <i class="fas fa-calendar-times"></i>
            <h3 style="margin-bottom:10px">Nenhum agendamento encontrado</h3>
            <p>Não encontramos agendamentos para este número.</p>
            <small style="display:block;margin-top:10px;color:var(--text-secondary)">
              Telefone buscado: ${phone}
            </small>
          </div>
        `;
        return;
      }

      // Ordenar por data (mais recente primeiro)
      userBookings.sort((a, b) => {
        const dateA = new Date(a.dataISO + 'T' + a.hora);
        const dateB = new Date(b.dataISO + 'T' + b.hora);
        return dateB - dateA;
      });

      let html = `
        <h3 style="color:var(--secondary);margin-bottom:20px;text-align:center">
          ${userBookings.length} agendamento${userBookings.length > 1 ? 's' : ''} encontrado${userBookings.length > 1 ? 's' : ''}
        </h3>
      `;

      userBookings.forEach(booking => {
        const bookingDate = new Date(booking.dataISO + 'T' + booking.hora);
        const isPast = bookingDate < new Date();
        const statusClass = booking.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const canCancel = !isPast && booking.status !== 'Cancelado';
        
        html += `
          <div class="booking-card ${statusClass}">
            <div class="booking-header">
              <div class="booking-service">
                <i class="fas fa-cut"></i> ${booking.servicoNome}
              </div>
              <span class="booking-status ${statusClass}">${booking.status}</span>
            </div>
            <div class="booking-info">
              <div class="booking-info-item">
                <span class="booking-info-label">Data</span>
                <span class="booking-info-value">
                  <i class="fas fa-calendar"></i> ${formatDateBR(booking.dataISO)}
                </span>
              </div>
              <div class="booking-info-item">
                <span class="booking-info-label">Horário</span>
                <span class="booking-info-value">
                  <i class="fas fa-clock"></i> ${booking.hora}
                </span>
              </div>
              <div class="booking-info-item">
                <span class="booking-info-label">Valor</span>
                <span class="booking-info-value">
                  <i class="fas fa-dollar-sign"></i> R$ ${booking.valor}
                </span>
              </div>
              <div class="booking-info-item">
                <span class="booking-info-label">Duração</span>
                <span class="booking-info-value">
                  <i class="fas fa-hourglass-half"></i> ${booking.duracao} min
                </span>
              </div>
            </div>
            ${canCancel ? `
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px">
              <button class="action-btn cancel" onclick="cancelBookingAPI(${booking.id})">
                <i class="fas fa-times"></i> Cancelar agendamento
              </button>
            </div>
            ` : ''}
            ${isPast ? '<div style="text-align:center;color:var(--text-secondary);font-size:12px;margin-top:8px"><i class="fas fa-info-circle"></i> Este agendamento já passou</div>' : ''}
          </div>
        `;
      });

      document.getElementById('consultaResults').innerHTML = html;
    })
    .catch(error => {
      document.getElementById('consultaResults').innerHTML = `
        <div class="no-bookings">
          <i class="fas fa-exclamation-triangle"></i>
          <h3 style="margin-bottom:10px;color:var(--danger)">Erro ao carregar agendamentos</h3>
          <p>Ocorreu um erro ao buscar seus agendamentos. Por favor, tente novamente.</p>
          <small style="color:var(--text-secondary);display:block;margin-top:10px">${error.message}</small>
        </div>
      `;
      showNotification('Erro ao buscar agendamentos: ' + error.message, 'error');
    });
}

// Cancelar agendamento via API
function cancelBookingAPI(id) {
  if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
  
  updateBookingStatusAPI(id, 'Cancelado')
    .then(() => {
      showNotification('Agendamento cancelado');
      buscarAgendamentosWithAPI();
    })
    .catch(error => {
      showNotification('Falha ao cancelar agendamento: ' + error.message, 'error');
    });
}

// ============================================
// INSTRUÇÕES DE USO
// ============================================

/*
PARA INTEGRAR COM O BACKEND:

1. Inicie o backend:
   cd backend
   npm install
   npm run dev

2. No index.html, substitua as funções:
   - confirmBooking() por confirmBookingWithAPI()
   - buscarAgendamentos() por buscarAgendamentosWithAPI()
   - cancelBooking() por cancelBookingAPI()

3. Copie as funções de API deste arquivo para o <script> do index.html

4. Configure a variável API_URL com o endereço do seu backend

5. Remova as chamadas ao localStorage (ou mantenha como fallback offline)

6. Teste!

BENEFÍCIOS:
- ✅ Lembretes enviados mesmo com navegador fechado
- ✅ Dados sincronizados entre dispositivos
- ✅ Backup automático no banco de dados
- ✅ Logs de todas as operações
- ✅ Escalabilidade para múltiplos usuários
*/
