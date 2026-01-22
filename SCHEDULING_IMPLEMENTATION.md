# 🎯 Fluxo de Agendamento - Implementação Completa

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      SCHEDULING FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend (SchedulingFlow.tsx)                                   │
│  ├─ Step 1: Service Selection                                   │
│  ├─ Step 2: Date & Time Selection                               │
│  │   └─ Chama GET /api/schedules/available-times                │
│  ├─ Step 3: Personal Information                                │
│  ├─ Step 4: Review & Confirmation                               │
│  │   └─ Chama POST /api/schedules/create-validated              │
│  └─ Redireciona para Checkout                                   │
│                                                                   │
│  Backend APIs                                                    │
│  ├─ GET /api/schedules/available-times                          │
│  │   └─ Calcula horários disponíveis                            │
│  ├─ POST /api/schedules/create-validated                        │
│  │   └─ Revalida e cria agendamento                             │
│  └─ POST /api/webhooks/schedules                                │
│      └─ Confirma/cancela após pagamento                         │
│                                                                   │
│  Database                                                        │
│  ├─ Service                                                      │
│  ├─ EmployeeAvailability                                        │
│  └─ Schedule                                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Sequência Completa

```
PASSO 1: SELEÇÃO DE SERVIÇO
═════════════════════════════════════════════════════════════════

┌─────────────────────────┐
│  Frontend               │
│  (SchedulingFlow)       │
│                         │
│  [ Consulta Médica ]    │
│  [ Corte de Cabelo ]    │
│  [ Massagem ]           │
│                         │
│  Usuário clica →        │
└────────────┬────────────┘
             │
             │ handleServiceSelect(serviceId)
             │ setFormData.serviceId
             │ setStep("datetime")
             │
             ▼
        Estado atualizado
        serviceId = "service-1"


PASSO 2: SELEÇÃO DE DATA & HORÁRIO
═════════════════════════════════════════════════════════════════

┌─────────────────────────┐
│  Frontend               │
│  (SchedulingFlow)       │
│                         │
│  📅 Calendário          │
│  Usuário seleciona      │
│  15/02/2026             │
└────────────┬────────────┘
             │
             │ handleDateSelect(date)
             │ fetchAvailableTimes(date)
             │ 
             ▼
    ┌──────────────────────────────────────┐
    │  GET /api/schedules/available-times  │
    │                                      │
    │  Query Params:                       │
    │  - serviceId: "service-1"            │
    │  - date: "2026-02-15"                │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │  Backend Processing                  │
    │                                      │
    │  1. Valida data (não passada)        │
    │  2. Obtém Service (durationMins=30)  │
    │  3. Obtém EmployeeAvailability       │
    │     dayOfWeek=1 (segunda)            │
    │     09:00-18:00 (break 12:00-13:00)  │
    │  4. Gera slots: 09:00, 09:30, ...    │
    │  5. Filtra conflicts:                │
    │     SELECT * FROM Schedule           │
    │     WHERE startAt < endTime          │
    │     AND endAt > startAt              │
    │     AND status IN (PENDING,          │
    │                     CONFIRMED)       │
    │  6. Remove slots de conflitos        │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │  Response 200 OK                     │
    │  {                                   │
    │    "availableTimes": [               │
    │      { time: "09:00", ts: 1... },    │
    │      { time: "09:30", ts: 2... },    │
    │      { time: "10:00", ts: 3... },    │
    │      ...                             │
    │    ],                                │
    │    "serviceName": "Consulta Médica"  │
    │  }                                   │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │  Frontend               │
    │  (SchedulingFlow)       │
    │                         │
    │  [09:00] [09:30]        │
    │  [10:00] [10:30]        │
    │  [11:00] [11:30]        │
    │  ...                    │
    │                         │
    │  Usuário clica "09:30" →│
    └────────────┬────────────┘
                 │
                 │ handleTimeSelect("09:30")
                 │ setFormData.time
                 │ setStep("personal")
                 │
                 ▼
            Estado atualizado
            time = "09:30"


PASSO 3: DADOS PESSOAIS
═════════════════════════════════════════════════════════════════

┌─────────────────────────┐
│  Frontend               │
│  (SchedulingFlow)       │
│                         │
│  Nome: [___________]    │
│  Email: [__________]    │
│  Phone: [__________]    │
│                         │
│  Usuário preenche →     │
└────────────┬────────────┘
             │
             │ handleInputChange()
             │ setFormData.{name, email, phone}
             │
             │ Validações:
             │ - name.length >= 3
             │ - email regex válido
             │ - phone formato (XX)XXXXX-XXXX
             │
             ▼
        isPersonalInfoValid = true
        Usuário clica "Continuar"
        setStep("review")


PASSO 4: REVISÃO & CHECKOUT
═════════════════════════════════════════════════════════════════

┌─────────────────────────┐
│  Frontend               │
│  (SchedulingFlow)       │
│                         │
│  📋 Resumo              │
│  Serviço: Consulta      │
│  Data: 15/02 09:30      │
│  Nome: João Silva       │
│  Email: joao@email.com  │
│  Valor: R$ 150,00       │
│                         │
│  [Voltar] [Pagar] →     │
└────────────┬────────────┘
             │
             │ handleSubmit()
             │
             ▼
    ┌──────────────────────────────────────┐
    │  POST /api/schedules/create-validated │
    │                                      │
    │  Body:                               │
    │  {                                   │
    │    serviceId: "service-1",           │
    │    date: "2026-02-15",               │
    │    time: "09:30",                    │
    │    guestName: "João Silva",          │
    │    guestEmail: "joao@email.com",     │
    │    guestPhone: "(11)99999-9999"      │
    │  }                                   │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │  Backend Processing                  │
    │                                      │
    │  1. Valida entrada                   │
    │  2. REVALIDA disponibilidade:        │
    │     SELECT * FROM Schedule           │
    │     WHERE employeeId = ?             │
    │     AND startAt < "2026-02-15 10:00" │
    │     AND endAt > "2026-02-15 09:30"   │
    │     AND status IN (PENDING,          │
    │                     CONFIRMED)       │
    │     → Se conflito: erro 409          │
    │  3. CRI Schedule                     │
    │     {                                │
    │       serviceId,                     │
    │       startAt: DateTime,             │
    │       endAt: DateTime,               │
    │       status: "PENDING",             │
    │       paymentStatus: "PENDING"       │
    │     }                                │
    │  4. Retorna scheduleId + priceCents  │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │  Response 201 Created                │
    │  {                                   │
    │    success: true,                    │
    │    schedule: {                       │
    │      id: "clu123...",                │
    │      startAt: "2026-02-15T09:30:00", │
    │      serviceName: "Consulta Médica", │
    │      priceCents: 15000               │
    │    }                                 │
    │  }                                   │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │  Frontend               │
    │                         │
    │  router.push(           │
    │    '/checkout/payment   │
    │    ?scheduleId=clu123'  │
    │  )                      │
    └────────────┬────────────┘
                 │
                 ▼
    Checkout Page
    ├─ Cria Order
    ├─ Schedule.orderId = Order.id
    ├─ MercadoPago payment flow
    └─ Webhook aguardando...


PASSO 5: PAGAMENTO (MercadoPago)
═════════════════════════════════════════════════════════════════

    User             MP                  API
      │               │                   │
      ├─ Payment ────→│                   │
      │               ├─ Process ────────→│
      │               │                   │
      │               │    Webhook        │
      │               ├─ POST /webhooks ─→│
      │               │                   │ Order.status = PAID
      │               │                   │
      │  Redirect ←──────────────────────┤
      │               │                   │


PASSO 6: WEBHOOK - CONFIRMA AGENDAMENTO
═════════════════════════════════════════════════════════════════

┌──────────────────────────────────────┐
│  MercadoPago Webhook                 │
│  (chamado pelo MP)                   │
└────────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │  Checkout Handler                    │
    │  Recebe: payment APPROVED            │
    │  Extrai: orderId                     │
    │  Chama: POST /api/webhooks/schedules │
    │  {                                   │
    │    orderId: "order-123",             │
    │    paymentStatus: "PAID",            │
    │    action: "CONFIRM"                 │
    │  }                                   │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │  Backend Processing                  │
    │                                      │
    │  1. Encontra Schedule pelo orderId   │
    │  2. Atualiza:                        │
    │     Schedule.status = "CONFIRMED"    │
    │     Schedule.paymentStatus = "PAID"  │
    │  3. TODO: Enviar email confirmação   │
    │  4. TODO: Notificar funcionário      │
    │  5. Retorna sucesso                  │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │  Response 200 OK                     │
    │  {                                   │
    │    success: true,                    │
    │    message: "Agendamento confirmado" │
    │  }                                   │
    └────────────┬─────────────────────────┘
                 │
                 ▼
    ✅ Agendamento CONFIRMADO!
    Usuário recebe email com detalhes
```

## 📁 Arquivos Criados/Modificados

### Backend APIs
- ✅ `app/api/schedules/available-times/route.ts` - Calcula horários
- ✅ `app/api/schedules/create-validated/route.ts` - Cria agendamento
- ✅ `app/api/webhooks/schedules/route.ts` - Webhook de confirmação

### Frontend
- ✅ `components/SchedulingFlow.tsx` - Componente multiestágio

### Database
- ✅ `prisma/schema.prisma` - Modelos Service, EmployeeAvailability, Schedule melhorado
- ✅ `prisma/seed-scheduling.ts` - Seed de dados

### Documentação
- ✅ `SCHEDULING_FLOW.md` - Documentação técnica completa

## 🚀 Como Usar

### 1. Aplicar Migrations
```bash
npx prisma migrate dev --name add_scheduling
```

### 2. Seed de Dados
```bash
npx ts-node prisma/seed-scheduling.ts
```

### 3. Integrar Componente
```tsx
import SchedulingFlow from "@/components/SchedulingFlow";

export default function SchedulesPage() {
  return <SchedulingFlow />;
}
```

### 4. Testar Fluxo
- Acesse `/schedules`
- Selecione um serviço
- Escolha uma data
- Selecione um horário
- Preencha dados
- Revise e confirme
- Complete pagamento

## 🔒 Segurança

✅ **Race Condition Prevention**: Revalidação no backend
✅ **Input Validation**: Zod schemas em todo lugar
✅ **Payment Verification**: Via webhook
✅ **Time Zone Handling**: Usando date-fns
✅ **Error Handling**: Mensagens claras ao usuário

## 📊 Status

- [x] Schema Prisma atualizado
- [x] API de horários disponíveis
- [x] API de criação com revalidação
- [x] Webhook de confirmação
- [x] Componente frontend multiestágio
- [ ] Seed com dados reais
- [ ] Emails de confirmação
- [ ] Notificações para funcionário
- [ ] Dashboard de funcionário
- [ ] Cancelamento com reembolso
