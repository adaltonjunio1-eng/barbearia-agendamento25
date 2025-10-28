# 📦 Workflows n8n - Barbearia

Esta pasta contém workflows prontos para importar no **n8n** e começar a usar imediatamente.

## 📋 Workflows Disponíveis

### 1. `exemplo-novo-agendamento.json`
**Função**: Envia confirmação via WhatsApp quando um novo agendamento é criado.

**Fluxo**:
```
Webhook → Extrair Dados → Formatar Mensagem → Enviar WhatsApp
```

**Como usar**:
1. Importe no n8n
2. Ative o workflow
3. Copie a URL do webhook
4. Cole no Painel Admin do sistema (seção "Integração n8n")

---

### 2. `exemplo-lembrete-cron.json`
**Função**: Verifica a cada 15 minutos e envia lembretes automáticos 1 hora antes dos agendamentos.

**Fluxo**:
```
Cron (15min) → Buscar Agendamentos → Filtrar Próximos 1h → 
Processar Um por Um → Formatar Lembrete → Enviar WhatsApp → 
Marcar Como Enviado
```

**Como usar**:
1. Importe no n8n
2. **Importante**: Altere a URL do backend nas URLs de requisição
3. Configure seu provedor de WhatsApp (Twilio, MessageBird, etc)
4. Ative o workflow

---

## 🚀 Como Importar

### Via Interface n8n:

1. Abra n8n (http://localhost:5678)
2. Clique em **"+ New Workflow"**
3. Clique no menu **(...) → "Import from File"**
4. Selecione o arquivo JSON
5. Ajuste as configurações (URLs, credenciais)
6. **Ative o workflow** (toggle no canto superior direito)

### Via linha de comando:

```bash
# Copie o arquivo para o diretório de workflows do n8n
cp exemplo-novo-agendamento.json ~/.n8n/workflows/
```

---

## ⚙️ Configurações Necessárias

### Para ambos workflows:

1. **URL do Backend**: Altere `https://baz.ngrok.dev` para a URL do seu backend
2. **API WhatsApp**: Configure credenciais do seu provedor
3. **Endereço da Barbearia**: Edite as mensagens para incluir seu endereço

### Apenas para `exemplo-lembrete-cron.json`:

- Ajuste o intervalo do Cron conforme necessário (padrão: 15 minutos)
- Ajuste a janela de tempo para lembretes (padrão: 55-65 minutos antes)

---

## 🔧 Personalizações Comuns

### Alterar mensagem de confirmação:

No node **"Formatar Mensagem"**, edite o texto da variável `mensagem`.

### Adicionar mais canais (Email, SMS):

1. Duplique o node **"Enviar WhatsApp"**
2. Altere o tipo para `Email` ou `SMS`
3. Conecte ao fluxo

### Enviar apenas para VIPs:

Adicione um node **IF** após "Extrair Dados":
```javascript
{{ $json.cliente.includes('VIP') }}
```

---

## 📊 Monitoramento

Veja os logs de execução em:
- n8n → **Executions** (menu lateral)
- Filtre por status: Success, Error, Running

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Webhook não recebe dados | Verifique se workflow está ativo e URL está correta no Admin |
| Mensagens não chegam | Verifique credenciais da API de WhatsApp |
| Cron não executa | Verifique se workflow está ativo e expressão cron está correta |
| Erro 404 ao buscar bookings | Altere URL do backend nos nodes HTTP Request |

---

## 📚 Próximos Passos

1. ✅ Importe os workflows
2. ✅ Configure credenciais
3. ✅ Teste com agendamento de teste
4. ✅ Monitore execuções
5. ✅ Customize mensagens
6. ✅ Adicione mais canais

---

**Dúvidas?** Leia o [N8N_INTEGRATION.md](../N8N_INTEGRATION.md) completo!
