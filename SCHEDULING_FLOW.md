# 📋 Fluxo Correto de Agendamento

## Visão Geral

O fluxo de agendamento foi redesenhado para ser seguro, eficiente e user-friendly. Cada etapa valida dados e revalida disponibilidade antes de confirmar.

## 🎯 Fluxo Passo a Passo

### **Passo 1: Usuário escolhe o serviço**

**Componente**: `SchedulingFlow.tsx` - Step "service"

- Frontend exibe lista de serviços com:
  - Nome do serviço
  - Duração em minutos
  - Preço em centavos (convertido para real)

**Dados**: Vindo do array `SERVICES` (TODO: chamar API `/api/services`)

**Ação**: Usuário clica no serviço desejado
- `handleServiceSelect()` armazena `serviceId` no estado
- Limpa data e hora anteriores
- Move para o próximo passo

---

### **Passo 2: Backend calcula horários disponíveis**

**Endpoint**: `GET /api/schedules/available-times`

**Parâmetros**:
```typescript
{
  serviceId: string;      // ID do serviço
  date: string;           // YYYY-MM-DD
  employeeId?: string;    // Opcional - funcionário específico
}
```

**Lógica**:

1. **Valida entrada**
   - Data não pode ser no passado
   - Serviço deve estar ativo

2. **Obtém disponibilidade do funcionário**
   - Query `EmployeeAvailability` pelo `dayOfWeek`
   - Extrai horário de início, fim e intervalo

3. **Gera slots de 30 em 30 minutos**
   - Respeita horário de pausa/lunch
   - Cada slot = duração do serviço

4. **Filtra agendamentos existentes**
   - Remove slots que já têm agendamentos `CONFIRMED` ou `PENDING`

5. **Retorna lista de horários válidos**
```typescript
{
  availableTimes: [
    { time: "09:00", timestamp: 1234567890 },
    { time: "09:30", timestamp: 1234567920 },
    // ...
  ],
  serviceName: "Consulta Médica",
  durationMins: 30
}
```

---

### **Passo 3: Frontend exibe apenas horários válidos**

**Componente**: `SchedulingFlow.tsx` - Step "datetime"

- Exibe calendário para seleção de data
- Ao selecionar data:
  - `handleDateSelect()` chama `fetchAvailableTimes()`
  - Faz request para `GET /api/schedules/available-times`
  - Estado `loadingTimes` mostra spinner
  - Exibe horários em grid 3 colunas

- Tratamento de erros:
  - Se nenhum horário disponível, exibe mensagem
  - Se erro na API, mostra toast

---

### **Passo 4: Usuário seleciona horário**

**Ação**: Clica em um horário disponível

- `handleTimeSelect()` armazena `time` no estado
- Move para próximo passo "personal"

---

### **Passo 5: Usuário preenche dados pessoais**

**Componente**: `SchedulingFlow.tsx` - Step "personal"

- Coleta:
  - Nome completo
  - Email
  - Telefone

- Validações:
  - Nome: mínimo 3 caracteres
  - Email: regex válido
  - Telefone: padrão `(XX) XXXXX-XXXX`

---

### **Passo 6: Backend revalida disponibilidade**

**Endpoint**: `POST /api/schedules/create-validated`

**Payload**:
```typescript
{
  serviceId: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:MM
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
  employeeId?: string;
}
```

**Lógica**:

1. **Valida entrada** (mesmas regras do passo 2)

2. **Revalida disponibilidade** (IMPORTANTE!)
   ```typescript
   // Verifica se outro agendamento foi criado entre
   // o passo 3 e agora (race condition)
   const conflicts = await prisma.schedule.findMany({
     where: {
       employeeId,
       startAt: { lt: endTime },
       endAt: { gt: selectedDate },
       status: { in: ["CONFIRMED", "PENDING"] }
     }
   });
   
   if (conflicts.length > 0) {
     return { error: "Horário não está mais disponível" };
   }
   ```

3. **Cria agendamento**
   ```typescript
   const schedule = await prisma.schedule.create({
     data: {
       serviceId,
       startAt: selectedDate,
       endAt: endTime,
       userId: userId || null,
       guestName, guestEmail, guestPhone,
       status: "PENDING",
       paymentStatus: "PENDING"
     }
   });
   ```

4. **Retorna dados do agendamento**
   ```typescript
   {
     success: true,
     schedule: {
       id: schedule.id,        // Para uso no checkout
       startAt,
       serviceName,
       priceCents
     }
   }
   ```

---

### **Passo 7: Inicia pagamento**

**Fluxo**:

1. Frontend recebe `schedule.id` e `schedule.priceCents`
2. Redireciona para `/checkout/payment?scheduleId={id}`
3. Checkout cria um `Order` com o serviço
4. Liga `Order` ao `Schedule`:
   ```typescript
   schedule.orderId = order.id;
   schedule.paymentStatus = "PENDING";
   ```
5. Redireciona para MercadoPago

---

### **Passo 8: Webhook confirma ou cancela**

**Webhook do MercadoPago** → atualiza `Order.status`

Ao receber `PAID`:
```typescript
// Chamar: POST /api/webhooks/schedules
{
  scheduleId: schedule.id,
  orderId: order.id,
  paymentStatus: "PAID",
  action: "CONFIRM"
}
```

**Endpoint**: `POST /api/webhooks/schedules`

**Ação**: CONFIRM
- `Schedule.status` → "CONFIRMED"
- `Schedule.paymentStatus` → "PAID"
- TODO: Enviar email de confirmação
- TODO: Notificar funcionário

Se pagamento **falhar** ou for **cancelado**:
```typescript
{
  scheduleId: schedule.id,
  paymentStatus: "CANCELLED",
  action: "CANCEL"
}
```

- `Schedule.status` → "CANCELLED"
- `Schedule.paymentStatus` → "CANCELLED"
- Horário volta a ficar disponível
- TODO: Enviar email de cancelamento

---

## 🗄️ Modelo de Dados (Schema Prisma)

### **Service**
```prisma
model Service {
  id            String
  name          String
  durationMins  Int        @default(30)
  priceCents    Int?
  active        Boolean    @default(true)
  schedules     Schedule[]
}
```

### **EmployeeAvailability**
```prisma
model EmployeeAvailability {
  id              String
  employeeId      String
  dayOfWeek       Int         // 0-6 (Dom-Sab)
  startTime       String      // "09:00"
  endTime         String      // "18:00"
  breakStartTime  String?     // "12:00"
  breakEndTime    String?     // "13:00"
  active          Boolean     @default(true)
  
  @@unique([employeeId, dayOfWeek])
}
```

### **Schedule**
```prisma
model Schedule {
  id              String
  
  // Cliente
  userId          String?
  guestName       String?
  guestEmail      String?
  guestPhone      String?
  
  // Funcionário
  employeeId      String?
  
  // Serviço
  serviceId       String      @relation
  
  // Agendamento
  startAt         DateTime
  endAt           DateTime
  status          ScheduleStatus  // PENDING, CONFIRMED, CANCELLED, etc
  
  // Pagamento
  orderId         String?
  paymentStatus   PaymentStatus   // PENDING, PAID, FAILED, etc
  paymentId       String?
  
  notes           String?
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## 🔒 Segurança & Validações

### **Revalidação de disponibilidade**
- ✅ Feita no backend antes de criar Schedule
- ✅ Previne race conditions
- ✅ Lança erro 409 se horário foi reservado

### **Validação de entrada**
- ✅ Data não pode ser no passado
- ✅ Email tem formato válido
- ✅ Telefone segue padrão
- ✅ Serviço deve estar ativo

### **Rastreamento de pagamento**
- ✅ `Schedule.paymentStatus` sincronizado com `Order.status`
- ✅ PUT `/api/webhooks/schedules` ressinc estado

---

## 📱 Componentes

### **SchedulingFlow.tsx**
- Multiestágio (service → datetime → personal → review)
- Estados: loading, error, etc
- Chamadas API integradas

### **PurchaseBoxClient.tsx** (Atualizado)
- Para produtos que são serviços: botão simples que redireciona
- Sem formulário de agendamento inline
- Mobile-first

---

## 🔄 Sequência Completa

```
1. Usuário acessa /schedules
2. Seleciona serviço ("Consulta Médica")
3. Seleciona data (15/02/2026)
4. API retorna: ["09:00", "09:30", "10:00", ...]
5. Seleciona horário (09:30)
6. Preenche nome, email, telefone
7. Clica "Ir para Pagamento"
8. POST /api/schedules/create-validated
   └─ Revalida disponibilidade ✓
   └─ Cria Schedule (PENDING)
   └─ Retorna scheduleId + priceCents
9. Redireciona para /checkout/payment?scheduleId=xyz
10. Checkout cria Order
11. Liga Schedule.orderId = Order.id
12. MercadoPago payment flow
13. Webhook: PAID
14. POST /api/webhooks/schedules (CONFIRM)
15. Schedule.status = CONFIRMED ✓
16. Email: "Agendamento confirmado!"
```

---

## 🛠️ Next Steps

- [ ] Seed de `Service` com dados reais
- [ ] Seed de `EmployeeAvailability` para cada funcionário
- [ ] Integrar calendário com timezone do usuário
- [ ] Envio de emails (confirmação, cancelamento, lembretes)
- [ ] Dashboard de funcionário para gerir schedules
- [ ] SMS de confirmação
- [ ] Cancelamento de agendamento com reembolso
- [ ] Regra de cancelamento (até 24h antes, etc)
