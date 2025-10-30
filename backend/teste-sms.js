// Teste rápido de envio de SMS via Twilio
// Execute: node teste-sms.js

require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.SMS_ACCOUNT_SID,
  process.env.SMS_AUTH_TOKEN
);

const channel = (process.env.SMS_CHANNEL || 'sms').toLowerCase();

async function testarEnvio() {
  console.log(`🔄 Testando envio de mensagem via Twilio (${channel.toUpperCase()})...\n`);

  // Definir remetente conforme canal
  let from;
  if (channel === 'whatsapp') {
    const rawFrom = process.env.WHATSAPP_FROM || process.env.WHATSAPP_SANDBOX_NUMBER || '+14155238886';
    from = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`;
  } else {
    from = process.env.SMS_FROM_NUMBER;
  }

  console.log('Credenciais:');
  console.log('Account SID:', process.env.SMS_ACCOUNT_SID);
  console.log('From:', from);
  console.log('');

  // ⚠️ IMPORTANTE:
  // - Para SMS (trial): o número de destino PRECISA estar verificado na sua conta Twilio
  // - Para WhatsApp Sandbox: o destinatário PRECISA ter enviado "join <código>" para o número do sandbox
  const numeroDestinoBase = '+5519999510821'; // <-- TROQUE AQUI se for diferente
  const to = channel === 'whatsapp' ? `whatsapp:${numeroDestinoBase}` : numeroDestinoBase;

  try {
    const mensagem = await client.messages.create({
      body: channel === 'whatsapp'
        ? '🎉 TESTE: WhatsApp do sistema de barbearia funcionando via Twilio Sandbox!'
        : '🎉 TESTE: SMS do sistema de barbearia funcionando! Este é um teste manual.',
      from,
      to
    });

    console.log('✅ MENSAGEM ENVIADA COM SUCESSO!');
    console.log('SID:', mensagem.sid);
    console.log('Status:', mensagem.status);
    console.log('Para:', mensagem.to);
    console.log('\n📱 Verifique seu telefone!');

  } catch (erro) {
    console.error('❌ ERRO ao enviar mensagem:');
    console.error('Código:', erro.code);
    console.error('Mensagem:', erro.message);
    console.error('');

    if (channel === 'whatsapp' && erro.code === 63058) {
      console.error('🚨 ERRO 63058 - RESTRIÇÃO GEOGRÁFICA!');
      console.error('');
      console.error('O Twilio WhatsApp Sandbox NÃO pode enviar para números brasileiros (+55).');
      console.error('');
      console.error('✅ SOLUÇÕES:');
      console.error('');
      console.error('1) USAR SMS (MAIS RÁPIDO):');
      console.error('   - Edite .env: SMS_CHANNEL=sms');
      console.error('   - Use: SMS_FROM_NUMBER=+15551234567 (seu número Twilio)');
      console.error('   - Verifique seu número BR em: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.error('');
      console.error('2) WHATSAPP BUSINESS API (GRÁTIS):');
      console.error('   - Configure direto pela Meta: https://business.facebook.com/wa/manage/home');
      console.error('   - Use seu próprio número WhatsApp Business');
      console.error('   - 1.000 conversas/mês GRÁTIS');
      console.error('');
      console.error('3) TWILIO PAGO:');
      console.error('   - Solicite um WhatsApp Sender aprovado');
      console.error('   - Console: https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders');
      console.error('');
      console.error('📚 Veja o guia completo: WHATSAPP_BRASIL.md');
    } else if (channel === 'whatsapp') {
      console.error('💡 Dica (WhatsApp Sandbox):');
      console.error('- Abra o WhatsApp do seu celular');
      console.error('- Envie a mensagem "join <seu-código>" para o número do sandbox mostrado no Twilio');
      console.error('- Depois, rode este teste novamente.');
    } else if (erro.code === 21211 || erro.code === 21608) {
      console.error('⚠️ Número inválido ou não verificado (Trial)!');
      console.error('Verifique o número em: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    } else if (erro.code === 20003) {
      console.error('⚠️ Credenciais inválidas! Verifique Account SID e Auth Token no arquivo .env');
    }
  }
}

testarEnvio();
