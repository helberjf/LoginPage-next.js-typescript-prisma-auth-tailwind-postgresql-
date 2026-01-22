# Sistema de Venda Online

Este é um sistema completo de e-commerce desenvolvido com **Next.js 16**, **Prisma ORM**, **PostgreSQL** e **NextAuth.js**. O projeto implementa uma plataforma de vendas online com autenticação, gerenciamento de produtos, agendamentos, carrinho de compras e integração com MercadoPago.

## 🚀 Funcionalidades Principais

- ✅ **Autenticação completa** (NextAuth.js com Google OAuth)
- ✅ **Sistema de produtos** (CRUD, categorias, imagens)
- ✅ **Carrinho de compras** e checkout
- ✅ **Sistema de agendamentos** (para visitantes e usuários logados)
- ✅ **Dashboard administrativo** (gerenciar produtos, pedidos, usuários)
- ✅ **Dashboard do cliente** (pedidos, perfil, agendamentos)
- ✅ **Integração MercadoPago** (pagamentos online)
- ✅ **Interface responsiva** com Tailwind CSS
- ✅ **Tema escuro/claro** automático
- ✅ **Notificações modernas** (Sonner)
- ✅ **TypeScript** completo
- ✅ **Validações robustas** (Zod schemas)

## 📁 Estrutura do Projeto

```
c:\Users\default.LAPTOP-K8F2QHAF\projects\loginPage-nextauth-nextjs-prisma\
├── __tests__\                          # Testes automatizados
│   ├── auth-validation.test.ts
│   ├── Button.test.tsx
│   └── utils.test.ts
├── app\                                # Páginas Next.js App Router
│   ├── (auth)\                        # Layout de autenticação
│   │   ├── forgot-password\
│   │   ├── login\
│   │   ├── register\
│   │   ├── reset\[token]\
│   │   └── verify-email\
│   ├── api\                           # API Routes
│   │   ├── admin\                     # Rotas administrativas
│   │   │   ├── products\
│   │   │   └── schedules\
│   │   ├── auth\[...nextauth]\        # NextAuth.js
│   │   ├── categories\                # Gestão de categorias
│   │   ├── checkout\                  # Processo de compra
│   │   ├── contact\                   # Formulário de contato
│   │   ├── feedback\                  # Sistema de feedback
│   │   ├── forgot-password\           # Recuperação de senha
│   │   ├── mercadopago\               # Webhooks MercadoPago
│   │   │   └── webhook\
│   │   ├── products\public\           # API pública de produtos
│   │   ├── register\                  # Registro de usuários
│   │   ├── schedules\                 # Sistema de agendamentos
│   │   │   ├── assign\                # Atribuir funcionários
│   │   │   └── create\                # Criar agendamentos
│   │   ├── send-verification-email\   # Verificação de email
│   │   ├── users\                     # Gestão de usuários
│   │   └── verify-email\              # Verificar email
│   ├── categories\[id]\               # Página de categoria
│   ├── checkout\                      # Sistema de checkout
│   │   ├── guest\                     # Checkout para visitantes
│   │   ├── payment\                   # Página de pagamento
│   │   └── success\                   # Confirmação de compra
│   ├── contact\                       # Página de contato
│   ├── dashboard\                     # Área logada
│   │   ├── admin\                     # Dashboard administrador
│   │   │   ├── dashboard\
│   │   │   ├── orders\[id]\           # Detalhes do pedido
│   │   │   ├── products\              # Gerenciar produtos
│   │   │   │   ├── [id]\              # Editar produto
│   │   │   │   ├── new\               # Novo produto
│   │   │   │   └── page.tsx           # Listar produtos
│   │   │   ├── schedules\             # Agendamentos admin
│   │   │   └── users\[id]\            # Detalhes do usuário
│   │   ├── orders\[id]\               # Detalhes do pedido
│   │   ├── page.tsx                   # Dashboard principal
│   │   ├── payments\                  # Histórico de pagamentos
│   │   ├── profile\                   # Perfil do usuário
│   │   └── schedules\                 # Agendamentos do usuário
│   ├── globals.css                   # Estilos globais
│   ├── layout.tsx                    # Layout raiz
│   ├── page.tsx                      # Página inicial
│   ├── products\[id]\                # Detalhes do produto
│   │   ├── ImageGallery.tsx
│   │   ├── page.tsx
│   │   └── PurchaseBoxClient.tsx
│   ├── products\                      # Listagem de produtos
│   │   └── page.tsx
│   ├── schedules\                     # Sistema de agendamentos
│   │   ├── page.tsx                   # Formulário de agendamento
│   │   └── success\                   # Confirmação de agendamento
│   └── test-env\                      # Ambiente de testes
├── auth.ts                           # Configuração NextAuth.js
├── components\                        # Componentes React
│   ├── admin\                        # Componentes administrativos
│   │   ├── Breadcrumbs.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductModal.tsx
│   ├── form\                         # Componentes de formulário
│   │   ├── Form.tsx
│   │   └── Input.tsx
│   ├── products\                      # Componentes de produto
│   │   └── ProductCard.tsx
│   ├── ui\                           # Componentes UI (shadcn/ui)
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── popover.tsx
│   ├── Navbar.tsx                    # Barra de navegação
│   ├── Providers.tsx                 # Provedores globais
│   ├── SearchBar.tsx                 # Barra de pesquisa
│   ├── Sidebar.tsx                   # Menu lateral
│   ├── SidebarMobile.tsx             # Menu mobile
│   ├── SidebarNav.tsx                # Configuração navegação
│   ├── SignOutButton.tsx             # Botão logout
│   ├── StatusBadge.tsx               # Badge de status
│   └── ThemeSwitcher.tsx             # Seletor de tema
├── contexts\                         # Contextos React
│   ├── CartContext.tsx               # Contexto do carrinho
│   └── SidebarContext.tsx            # Contexto sidebar
├── lib\                              # Utilitários e configurações
│   ├── auth\                         # Configurações de auth
│   │   ├── helpers.ts
│   │   └── validation.ts
│   ├── email-templates\              # Templates de email
│   │   └── verification.ts
│   ├── mailgun.ts                    # Serviço de email
│   ├── prisma.ts                     # Cliente Prisma
│   ├── rate-limit.ts                 # Controle de taxa
│   ├── token.ts                      # Utilitários de token
│   ├── utils\                        # Utilitários diversos
│   │   ├── cn.ts                     # Classe CSS condicional
│   │   ├── format.ts                 # Formatação
│   │   ├── ptBrDataset.ts            # Dataset PT-BR
│   │   └── utils.ts                  # Funções utilitárias
│   └── validators\                   # Validadores
│       ├── product.ts
│       └── validateCpf.ts
├── prisma\                           # Configuração Prisma
│   ├── migrations\                   # Migrações banco
│   ├── schema.prisma                 # Schema do banco
│   ├── seed.ts                       # Seeds do banco
│   └── seed_example.ts               # Exemplos de seed
├── public\                           # Arquivos estáticos
├── types\                            # Definições TypeScript
│   ├── auth.d.ts
│   └── next-auth.d.ts
├── AGENTS.md                        # Documentação agentes
├── docker-compose.yml               # Docker Compose
├── env.md                           # Documentação variáveis ambiente
├── eslint.config.mjs                # Config ESLint
├── LICENSE                          # Licença
├── next.config.ts                   # Config Next.js
├── next-env.d.ts                    # Tipos Next.js
├── package.json                     # Dependências
├── postcss.config.mjs               # Config PostCSS
├── proxy.ts                         # Config proxy
├── README.md                        # Este arquivo
├── sidebar.config.ts                # Config sidebar
├── tsconfig.json                    # Config TypeScript
├── tsconfig.tsbuildinfo             # Cache TypeScript
└── vitest.config.ts                 # Config testes
```

## 🛠️ Tecnologias Utilizadas

- **Frontend/Backend**: Next.js 16 (App Router)
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: NextAuth.js (Google OAuth)
- **Pagamentos**: MercadoPago
- **Estilos**: Tailwind CSS + shadcn/ui
- **Linguagem**: TypeScript
- **Notificações**: Sonner
- **Validação**: Zod
- **Testes**: Vitest
- **Deploy**: Docker + Railway

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL (local ou Railway)
- Git

### 1. Clone o repositório
```bash
git clone <repository-url>
cd loginPage-nextauth-nextjs-prisma
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.local` e configure:
```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# NextAuth
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MercadoPago (opcional)
MP_ACCESS_TOKEN="your-mercadopago-token"
```

### 4. Configure o banco de dados
```bash
# Execute as migrações
npx prisma db push

# Opcional: Popule com dados de exemplo
npx prisma db seed
```

### 5. Execute o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📜 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Executar ESLint
npm run test         # Executar testes (Vitest)
npm run db:push      # Aplicar mudanças no schema
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados
```

## 🎯 Funcionalidades por Módulo

### 👤 Autenticação
- Login/cadastro com email e senha
- OAuth com Google
- Recuperação de senha
- Verificação de email
- Middleware de proteção de rotas

### 🛍️ Loja Online
- Catálogo de produtos com filtros
- Carrinho de compras persistente
- Sistema de checkout completo
- Integração MercadoPago
- Histórico de pedidos

### 📅 Agendamentos
- Sistema de reservas online
- Calendário interativo moderno
- Validação de horários
- Gestão de funcionários
- Notificações de confirmação

### 👨‍💼 Dashboard Administrativo
- Gerenciamento completo de produtos
- Controle de pedidos e usuários
- Relatórios e estatísticas
- Sistema de permissões

### 👤 Área do Cliente
- Perfil pessoal
- Histórico de compras
- Meus agendamentos
- Preferências e configurações

## 🏗️ Arquitetura

O projeto segue a arquitetura **Full-Stack Type-Safe** com:

- **App Router**: Roteamento moderno do Next.js 13+
- **Server Components**: Componentes do servidor por padrão
- **API Routes**: Endpoints RESTful
- **Database Schema**: Prisma com PostgreSQL
- **Type Safety**: TypeScript end-to-end
- **Component Library**: shadcn/ui consistente

## 🔐 Configuração OAuth (NextAuth)

### Desenvolvimento Local
Para desenvolvimento local em rede LAN ou hosts não-`localhost`:

1. Configure `NEXTAUTH_URL` no `.env.local`:
```bash
NEXTAUTH_URL=http://192.168.1.100:3000
```

2. Configure o callback URL no Google Cloud Console:
```
http://192.168.1.100:3000/api/auth/callback/google
```

### Configuração do Google OAuth

#### 1. Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ API
4. Vá para "Credenciais" > "Criar Credenciais" > "ID do cliente OAuth"
5. Configure:
   - **Tipo de aplicativo**: "Aplicação web"
   - **Nome**: Seu nome do aplicativo
   - **URIs de redirecionamento autorizados**:
     - Desenvolvimento: `http://localhost:3000/api/auth/callback/google`
     - Produção: `https://seudominio.com/api/auth/callback/google`

#### 2. Variáveis de Ambiente
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```


### Pagamento

📋 Arquivos Essenciais para o Pagamento:
APIs (Backend):
app/api/checkout/route.ts ✅ - Inicia o checkout e cria a preference no Mercado Pago
app/api/mercadopago/webhook/route.ts ✅ - Recebe notificações do Mercado Pago sobre pagamentos
APIs Adicionais Necessárias:
app/api/cep/route.ts - Consulta CEP para preenchimento automático de endereço
lib/validators/validateCpf.ts - Validação de CPF
Páginas (Frontend):
app/checkout/page.tsx - Carrinho de compras
app/checkout/payment/page.tsx - Formulário de checkout/pagamento
app/checkout/success/page.tsx - Página de confirmação/sucesso
Contexto/Estado:
contexts/CartContext.tsx - Gerenciamento do carrinho de compras
🔄 Fluxo Completo do Pagamento:
Usuário adiciona produtos ao carrinho (CartContext)
Página do carrinho mostra itens e redireciona para checkout
Página de pagamento coleta dados do usuário e faz chamada para /api/checkout
API de checkout valida dados, cria pedido no banco e gera preference no Mercado Pago
Usuário é redirecionado para checkout do Mercado Pago
Mercado Pago processa o pagamento e envia webhook
Webhook recebe notificação e atualiza status do pedido
Página de sucesso mostra confirmação com dados do pedido
⚙️ Configurações Necessárias:
As seguintes variáveis de ambiente são necessárias:
MP_ACCESS_TOKEN - Token de acesso do Mercado Pago
MP_WEBHOOK_SECRET - Segredo para validação de webhooks
MP_WEBHOOK_URL - URL do webhook (opcional, usa origem da requisição)
🎯 O webhook é crucial para atualizar o status dos pagamentos automaticamente quando o Mercado Pago notifica sobre mudanças no status do pagamento.



### Produção
Para produção, certifique-se de:
- Definir `NEXTAUTH_URL` com o domínio real
- Configurar os callbacks no Google Cloud Console
- Usar HTTPS para segurança
- Adicionar domínios autorizados no Google Console

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email
- Consulte a documentação em `/docs`

---

**Desenvolvido com ❤️ usando Next.js, Prisma e PostgreSQL**