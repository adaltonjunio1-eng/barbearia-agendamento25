#!/usr/bin/env node
/**
 * Script de Personalização Automática - BarberPro White Label
 * 
 * Uso: node personalize.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🎨 Personalizador BarberPro - White Label\n');
  console.log('Este script vai personalizar o sistema para seu cliente.\n');

  // Coletar informações
  const barberShopName = await question('Nome da Barbearia: ');
  const barberName = await question('Nome do Barbeiro Principal: ');
  const phone = await question('Telefone (formato: +55 11 99999-9999): ');
  const repoName = await question('Nome do repositório GitHub (ex: barbearia-joao): ');
  const shortName = await question('Nome curto (max 12 chars, ex: JoãoBarbeiro): ');

  console.log('\n📝 Resumo:');
  console.log(`   Barbearia: ${barberShopName}`);
  console.log(`   Barbeiro: ${barberName}`);
  console.log(`   Telefone: ${phone}`);
  console.log(`   Repositório: ${repoName}`);
  console.log(`   Nome curto: ${shortName}\n`);

  const confirm = await question('Confirma? (s/n): ');
  if (confirm.toLowerCase() !== 's') {
    console.log('❌ Cancelado.');
    rl.close();
    return;
  }

  console.log('\n⚙️  Personalizando arquivos...\n');

  // 1. Atualizar manifest.json
  updateManifest(barberShopName, shortName, repoName);

  // 2. Atualizar index.html
  updateIndexHtml(barberShopName, barberName, phone);

  // 3. Atualizar dashboard-barberpro.html
  updateDashboard(barberShopName);

  // 4. Atualizar service worker
  updateServiceWorker(repoName);

  // 5. Atualizar README
  updateReadme(barberShopName, repoName);

  console.log('✅ Personalização concluída!\n');
  console.log('📋 Próximos passos:');
  console.log('   1. Substitua assets/logo/icon.png pela logo do cliente');
  console.log('   2. Execute: npm run gen:icons');
  console.log('   3. Execute: git add -A');
  console.log(`   4. Execute: git commit -m "feat: personaliza para ${barberShopName}"`);
  console.log('   5. Configure o remote e faça push\n');

  rl.close();
}

function updateManifest(barberShopName, shortName, repoName) {
  const manifestPath = path.resolve(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  manifest.name = `${barberShopName} - Sistema de Agendamento`;
  manifest.short_name = shortName;
  manifest.start_url = `/${repoName}/`;
  manifest.description = `Sistema profissional de agendamento para ${barberShopName}`;
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✓ manifest.json atualizado');
}

function updateIndexHtml(barberShopName, barberName, phone) {
  const indexPath = path.resolve(__dirname, 'index.html');
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Atualizar título
  content = content.replace(/<title>.*?<\/title>/, `<title>${barberShopName} - Agendamento Online</title>`);
  
  // Atualizar nome da barbearia
  content = content.replace(/BRUNO FERREIRA/g, barberName.toUpperCase());
  content = content.replace(/Bruno Ferreira/g, barberName);
  
  // Atualizar telefone (se houver campo específico)
  // content = content.replace(/\+55.*?\d{4}-\d{4}/, phone);
  
  fs.writeFileSync(indexPath, content);
  console.log('✓ index.html atualizado');
}

function updateDashboard(barberShopName) {
  const dashPath = path.resolve(__dirname, 'dashboard-barberpro.html');
  let content = fs.readFileSync(dashPath, 'utf8');
  
  // Atualizar título
  content = content.replace(/<title>.*?<\/title>/, `<title>${barberShopName} - Admin</title>`);
  
  // Atualizar nome no header (se houver)
  content = content.replace(/BarberPro/g, barberShopName);
  
  fs.writeFileSync(dashPath, content);
  console.log('✓ dashboard-barberpro.html atualizado');
}

function updateServiceWorker(repoName) {
  const swPath = path.resolve(__dirname, 'sw.js');
  let content = fs.readFileSync(swPath, 'utf8');
  
  // Atualizar caminhos
  content = content.replace(/\/barbearia-agendamento25\//g, `/${repoName}/`);
  
  // Incrementar versão do cache
  const match = content.match(/barberpro-v(\d+)/);
  if (match) {
    const newVersion = parseInt(match[1]) + 1;
    content = content.replace(/barberpro-v\d+/, `barberpro-v${newVersion}`);
  }
  
  fs.writeFileSync(swPath, content);
  console.log('✓ sw.js atualizado');
}

function updateReadme(barberShopName, repoName) {
  const readmePath = path.resolve(__dirname, 'README.md');
  let content = fs.readFileSync(readmePath, 'utf8');
  
  // Adicionar nota de personalização
  const note = `\n---\n\n## 🎯 Projeto Personalizado\n\n- **Cliente:** ${barberShopName}\n- **Repositório:** ${repoName}\n- **Data:** ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  
  content = note + content;
  
  fs.writeFileSync(readmePath, content);
  console.log('✓ README.md atualizado');
}

main().catch(console.error);
