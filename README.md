# Meu Projeto Visual

Este é um projeto de aplicativo React que possui uma estrutura organizada e modular. Abaixo estão as principais características e arquivos do projeto:

## Estrutura do Projeto

```
meu-projeto-visual
├── public
│   ├── index.html          # Página principal do aplicativo
│   └── favicon.svg         # Ícone do site
├── src
│   ├── index.tsx           # Ponto de entrada da aplicação
│   ├── App.tsx             # Componente principal da aplicação
│   ├── components
│   │   ├── Header.tsx      # Componente de cabeçalho
│   │   ├── Footer.tsx      # Componente de rodapé
│   │   └── ui
│   │       └── Button.tsx  # Componente de botão reutilizável
│   ├── pages
│   │   └── Home.tsx        # Página inicial da aplicação
│   ├── styles
│   │   ├── globals.css      # Estilos globais
│   │   └── layout.css       # Estilos de layout
│   ├── assets
│   │   ├── fonts            # Diretório de fontes
│   │   └── svgs             # Diretório de arquivos SVG
│   ├── hooks
│   │   └── useWindowSize.ts # Hook personalizado para dimensões da janela
│   └── utils
│       └── index.ts        # Funções utilitárias
├── package.json             # Configuração do npm
├── tsconfig.json            # Configuração do TypeScript
└── README.md                # Documentação do projeto
```

## Instalação

Para instalar as dependências do projeto, execute o seguinte comando:

```
npm install
```

## Execução

Este repositório contém o frontend (página única `index.html`) e um backend Node.js (pasta `backend`) responsável por API e envio de lembretes via WhatsApp.

### 1) Iniciar o backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Opcional: edite .env
notepad .env
npm start
```

O backend roda por padrão em http://localhost:3333

### 2) Abrir o frontend

- Use o Live Server do VS Code para abrir o `index.html`, ou
- Abra o arquivo `index.html` no navegador (recomendado usar Live Server).

No rodapé, clique em "Entrar como Admin" (senha: bf12025) para acessar a área administrativa.

### 3) Conectar o WhatsApp

No Admin > Configurações, clique em "Abrir QR Code em nova aba" ou acesse diretamente:

```
http://localhost:3333/api/whatsapp/qr/html
```

No celular: WhatsApp > Dispositivos conectados > Conectar um dispositivo e escaneie o QR. Se já estiver conectado, o QR não será exibido (não é necessário).

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Abra um pull request ou crie uma issue para discutir mudanças.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.