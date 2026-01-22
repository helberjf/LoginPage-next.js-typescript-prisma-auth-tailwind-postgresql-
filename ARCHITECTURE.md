# 🏗️ Arquitetura - Fluxo de Agendamento

## 📊 Diagrama Geral

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                     SCHEDULING SYSTEM ARCHITECTURE                  │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CLIENT LAYER (Browser)                                             │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SchedulingFlow.tsx (4 Steps)                                 │ │
│  │  ├─ Service Selection → Carousel                              │ │
│  │  ├─ DateTime Selection → Calendar + Time Grid                │ │
│  │  ├─ Personal Info → Form Fields                              │ │
│  │  └─ Review → Summary + Confirm                               │ │
│  │                                                               │ │
│  │  State Management: useState (local)                           │ │
│  │  API Calls: fetch                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                             ↓ HTTP                                   │
│                                                                      │
│  API GATEWAY LAYER (Next.js)                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Route Handlers                                               │ │
│  │  ├─ GET  /api/schedules/available-times                      │ │
│  │  ├─ POST /api/schedules/create-validated                     │ │
│  │  └─ POST /api/webhooks/schedules                             │ │
│  │                                                               │ │
│  │  Middleware: NextAuth, CORS, Rate Limiting                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                             ↓ SQL                                    │
│                                                                      │
│  DATABASE LAYER (PostgreSQL)                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Tables:                                                      │ │
│  │  ├─ Service (tipos de serviço)                               │ │
│  │  ├─ User (usuários e funcionários)                           │ │
│  │  ├─ EmployeeAvailability (horários disponíveis)             │ │
│  │  ├─ Schedule (agendamentos)                                 │ │
│  │  ├─ Order (pedidos/pagamentos)                              │ │
│  │  └─ Payment (detalhes de pagamento)                         │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────────┐
│ User Interaction│
└────────┬────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ SchedulingFlow.tsx             │
    │ ┌──────────────────────────────┤
    │ │ state: formData              │
    │ │ - serviceId                  │
    │ │ - date                       │
    │ │ - time                       │
    │ │ - name, email, phone         │
    │ └──────────────────────────────┤
    └────┬───────────────────────────┘
         │
         │ 1️⃣  fetchAvailableTimes()
         │ GET /api/schedules/available-times
         │
         ▼
    ┌────────────────────────────────────────┐
    │ Backend: available-times/route.ts      │
    │ ┌──────────────────────────────────────┤
    │ │ 1. Parse: serviceId, date            │
    │ │ 2. Query Service (durationMins)     │
    │ │ 3. Query EmployeeAvailability       │
    │ │ 4. Generate slots (30min intervals) │
    │ │ 5. Query Schedule (conflicts)       │
    │ │ 6. Filter conflicts                 │
    │ │ 7. Return: availableTimes[]         │
    │ └──────────────────────────────────────┤
    └────┬───────────────────────────────────┘
         │
         │ Response: [{ time, timestamp }]
         │
         ▼
    ┌──────────────────────┐
    │ Frontend             │
    │ Display times grid   │
    │ User selects time    │
    └────┬─────────────────┘
         │
         │ 2️⃣  handleSubmit()
         │ POST /api/schedules/create-validated
         │
         ▼
    ┌────────────────────────────────────────┐
    │ Backend: create-validated/route.ts     │
    │ ┌──────────────────────────────────────┤
    │ │ 1. Parse & validate input            │
    │ │ 2. ⚠️  REVALIDATE conflicts         │
    │ │    ├─ Query Schedule                 │
    │ │    ├─ Check overlaps                 │
    │ │    └─ Return 409 if conflict        │
    │ │ 3. Create Schedule                   │
    │ │    ├─ status: PENDING                │
    │ │    ├─ paymentStatus: PENDING         │
    │ │ 4. Return: { schedule.id }           │
    │ └──────────────────────────────────────┤
    └────┬───────────────────────────────────┘
         │
         │ Response: { schedule: { id, ... } }
         │
         ▼
    ┌──────────────────────────────────────┐
    │ Frontend                             │
    │ router.push("/checkout/payment?...") │
    │ Redirect to MercadoPago              │
    └────┬───────────────────────────────────┘
         │
         │ 3️⃣  User completes payment
         │ (MercadoPago flow)
         │
         ▼
    ┌────────────────────────────────────────┐
    │ MercadoPago                            │
    │ Processes payment                      │
    │ Sends webhook: status APPROVED         │
    └────┬───────────────────────────────────┘
         │
         │ 4️⃣  POST /api/webhooks/schedules
         │ { scheduleId, paymentStatus: PAID, action: CONFIRM }
         │
         ▼
    ┌────────────────────────────────────────┐
    │ Backend: webhooks/schedules/route.ts   │
    │ ┌──────────────────────────────────────┤
    │ │ 1. Parse: scheduleId, action         │
    │ │ 2. Query Schedule                    │
    │ │ 3. Update Schedule:                  │
    │ │    ├─ status = CONFIRMED             │
    │ │    └─ paymentStatus = PAID           │
    │ │ 4. TODO: Send confirmation email     │
    │ │ 5. TODO: Notify employee             │
    │ │ 6. Return: { success: true }         │
    │ └──────────────────────────────────────┤
    └────┬───────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │ ✅ SCHEDULING CONFIRMED  │
    │ Agendamento confirmado! │
    └──────────────────────────┘
```

## 📋 Entity Relationship Diagram

```
┌─────────┐         ┌──────────┐
│  User   │◄────┐  │ Schedule │
├─────────┤     │  ├──────────┤
│ id      │     └──┤ userId?  │
│ email   │        │ startAt  │
│ role    │        │ endAt    │
│ name    │        │ status   │
└─────────┘        │ payment- │
    ▲              │ Status   │
    │              └────┬─────┘
    │                   │
    │  ┌────────────────┼────────────┐
    │  │                │            │
    ▼  │                │            ▼
┌──────────────┐ ┌─────────────┐ ┌───────┐
│ Employee     │ │ EmployeeAvl │ │Order  │
│Availability  │ │ ─────────── │ ├───────┤
├──────────────┤ │ id          │ │ id    │
│ employeeId   │ │ employeeId  │ │ status│
│ dayOfWeek    │ │ dayOfWeek   │ │ total │
│ startTime    │ │ startTime   │ └───────┘
│ endTime      │ │ endTime     │     ▲
│ break*       │ │ active      │     │
└──────────────┘ └─────────────┘     │
                        ▲            │
                        │            │
                        └────────────┘
                        
┌─────────┐
│ Service │
├─────────┤
│ id      │
│ name    │
│ duration│
│ price   │
│ active  │
└────┬────┘
     │
     └─────────→ Schedule.serviceId
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────┐
│ CLIENT                                      │
│ - HTML5 validation                          │
│ - Regex checks (email, phone)               │
│ - Loading states (prevent double submit)    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│ TRANSPORT                                   │
│ - HTTPS only (env: NODE_ENV=production)     │
│ - Content-Type: application/json            │
│ - CORS headers                              │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│ API LAYER                                   │
│ - Input validation (type, format, length)   │
│ - Parse & sanitize params                   │
│ - Error handling (400, 404, 409, 500)       │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│ BUSINESS LOGIC                              │
│ - Date validation (no past, not > 60 days)  │
│ - Service active check                      │
│ - ⚠️  REVALIDATION before create           │
│ - Race condition prevention                 │
│ - Availability conflicts                    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│ DATABASE                                    │
│ - SQL injection prevention (Prisma ORM)     │
│ - Prepared statements                       │
│ - Transaction support                       │
│ - Indexes on frequently queried fields      │
└─────────────────────────────────────────────┘
```

## 🎯 Component Tree

```
app/schedules/page.tsx
└─ SchedulingFlow.tsx (Main Component)
   ├─ Step: SERVICE
   │  └─ Card[] (Service selections)
   │     └─ onClick → serviceId selected
   │
   ├─ Step: DATETIME
   │  ├─ Calendar (date picker)
   │  │  └─ onSelect → fetch available times
   │  │
   │  └─ Grid (time slots)
   │     └─ onClick → time selected
   │
   ├─ Step: PERSONAL
   │  ├─ Input (name)
   │  ├─ Input (email)
   │  └─ Input (phone)
   │     └─ onChange → validate
   │
   ├─ Step: REVIEW
   │  ├─ Card (Service summary)
   │  ├─ Card (DateTime summary)
   │  ├─ Card (Personal summary)
   │  └─ Button (Confirm)
   │     └─ onClick → POST create-validated
   │
   └─ Navigation
      ├─ Button (Back)
      └─ Button (Next)
```

## 📈 Performance Considerations

```
Frontend Optimization
├─ useMemo() → Prevent re-renders
├─ useCallback() → Stable function refs
├─ Lazy load Calendar component
└─ Debounce input validation

Backend Optimization
├─ DB Indexes
│  ├─ Schedule.startAt (datetime range queries)
│  ├─ Schedule.employeeId (filter by employee)
│  ├─ EmployeeAvailability.employeeId
│  └─ Service.active (active filter)
│
├─ Query Optimization
│  ├─ Limit date range queries (30-60 days)
│  ├─ Use indexes for WHERE clauses
│  └─ Avoid N+1 queries (use includes)
│
└─ Caching (TODO)
   ├─ Cache available times per day
   ├─ Invalidate on new Schedule
   └─ TTL: 5 minutes
```

## 🚀 Deployment Strategy

```
Development
├─ Local PostgreSQL
├─ Hot reload: npm run dev
├─ Test with test-scheduling.sh
└─ Check logs in console

Staging
├─ Cloud PostgreSQL (AWS RDS)
├─ Environment: NODE_ENV=production
├─ Enable HTTPS
├─ Configure MercadoPago sandbox
└─ Test webhook flow

Production
├─ Cloud PostgreSQL (backup 3x daily)
├─ Environment: NODE_ENV=production
├─ Enable HTTPS + security headers
├─ MercadoPago production credentials
├─ Monitoring & alerting
├─ Log aggregation (CloudWatch, etc)
└─ Database backups + failover

Deployment Steps
1. npx prisma migrate deploy
2. npm run build
3. npm start (or deploy to Vercel)
4. Verify /api/schedules/available-times
5. Verify /api/schedules/create-validated
6. Verify webhooks receiving data
```

## 🔍 Debugging Guide

```
Problem: Horários não aparecem
├─ Check: Service existe e active=true
├─ Check: EmployeeAvailability criada
├─ Check: Nenhum Schedule conflitante
└─ Debug: console.log() em available-times

Problem: Agendamento falha com 409
├─ Significa: Outro agendamento foi criado
├─ Solução: User tenta novamente
└─ Check: Database Schedule conflicts

Problem: Webhook não recebido
├─ Check: MercadoPago webhook config
├─ Check: API endpoint accessible
├─ Check: Logs do servidor (console)
└─ Debug: Use webhook testing tool

Problem: Email não enviado
├─ Check: TODO não implementado ainda
├─ Check: Email provider config
├─ Check: SMTP credentials
└─ Debug: Adicione console.log em webhook
```

---

**Documentação Visual da Arquitetura**
**Versão 1.0 | 21/01/2026**
