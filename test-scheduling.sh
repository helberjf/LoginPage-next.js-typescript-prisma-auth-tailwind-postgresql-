#!/usr/bin/env bash

# 🧪 Script para testar o fluxo de agendamento

API_BASE="http://localhost:3000"

echo "🎯 Testando Fluxo de Agendamento"
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. OBTER HORÁRIOS DISPONÍVEIS
echo -e "${BLUE}\n📅 PASSO 1: Obter Horários Disponíveis${NC}"
echo "GET /api/schedules/available-times?serviceId=service-1&date=2026-02-20"

AVAILABLE_TIMES=$(curl -s \
  "${API_BASE}/api/schedules/available-times?serviceId=service-1&date=2026-02-20" \
  -H "Accept: application/json")

echo "Response:"
echo "$AVAILABLE_TIMES" | jq .

# Extrair primeiro horário disponível
FIRST_TIME=$(echo "$AVAILABLE_TIMES" | jq -r '.availableTimes[0].time')
if [ "$FIRST_TIME" == "null" ] || [ -z "$FIRST_TIME" ]; then
  echo -e "${RED}❌ Erro: Nenhum horário disponível${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Horário disponível: $FIRST_TIME${NC}"

# 2. CRIAR AGENDAMENTO COM VALIDAÇÃO
echo -e "${BLUE}\n📝 PASSO 2: Criar Agendamento (com Revalidação)${NC}"
echo "POST /api/schedules/create-validated"

SCHEDULE_RESPONSE=$(curl -s -X POST \
  "${API_BASE}/api/schedules/create-validated" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "service-1",
    "date": "2026-02-20",
    "time": "'"${FIRST_TIME}"'",
    "guestName": "João Silva",
    "guestEmail": "joao@example.com",
    "guestPhone": "(11) 99999-9999",
    "notes": "Primeira consulta"
  }')

echo "Response:"
echo "$SCHEDULE_RESPONSE" | jq .

# Extrair scheduleId
SCHEDULE_ID=$(echo "$SCHEDULE_RESPONSE" | jq -r '.schedule.id')
if [ "$SCHEDULE_ID" == "null" ] || [ -z "$SCHEDULE_ID" ]; then
  echo -e "${RED}❌ Erro: Agendamento não foi criado${NC}"
  echo "Full response: $SCHEDULE_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Agendamento criado: $SCHEDULE_ID${NC}"

# 3. SIMULAR WEBHOOK DE PAGAMENTO (CONFIRMADO)
echo -e "${BLUE}\n💳 PASSO 3: Webhook - Pagamento Confirmado${NC}"
echo "POST /api/webhooks/schedules (CONFIRM)"

WEBHOOK_RESPONSE=$(curl -s -X POST \
  "${API_BASE}/api/webhooks/schedules" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "'"${SCHEDULE_ID}"'",
    "paymentStatus": "PAID",
    "action": "CONFIRM"
  }')

echo "Response:"
echo "$WEBHOOK_RESPONSE" | jq .

WEBHOOK_SUCCESS=$(echo "$WEBHOOK_RESPONSE" | jq -r '.success')
if [ "$WEBHOOK_SUCCESS" == "true" ]; then
  echo -e "${GREEN}✅ Agendamento confirmado com sucesso!${NC}"
else
  echo -e "${RED}❌ Erro ao confirmar agendamento${NC}"
fi

# 4. TESTAR CENÁRIO DE FALHA
echo -e "${BLUE}\n❌ PASSO 4: Teste de Erro - Horário Já Reservado${NC}"
echo "Tentando criar agendamento no mesmo horário..."

CONFLICT_RESPONSE=$(curl -s -X POST \
  "${API_BASE}/api/schedules/create-validated" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "service-1",
    "date": "2026-02-20",
    "time": "'"${FIRST_TIME}"'",
    "guestName": "Maria Silva",
    "guestEmail": "maria@example.com",
    "guestPhone": "(11) 88888-8888"
  }')

echo "Response:"
echo "$CONFLICT_RESPONSE" | jq .

ERROR_MSG=$(echo "$CONFLICT_RESPONSE" | jq -r '.error')
if [[ "$ERROR_MSG" == *"não está mais disponível"* ]]; then
  echo -e "${GREEN}✅ Sistema detectou conflito corretamente!${NC}"
else
  echo -e "${YELLOW}⚠️  Resposta inesperada (pode estar ok se nenhum conflito real)${NC}"
fi

# 5. TESTE DE VALIDAÇÃO DE ENTRADA
echo -e "${BLUE}\n🔍 PASSO 5: Validação de Entrada - Email Inválido${NC}"

INVALID_EMAIL=$(curl -s -X POST \
  "${API_BASE}/api/schedules/create-validated" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "service-1",
    "date": "2026-02-20",
    "time": "10:00",
    "guestName": "João Silva",
    "guestEmail": "email-invalido",
    "guestPhone": "(11) 99999-9999"
  }')

echo "Response:"
echo "$INVALID_EMAIL" | jq .

echo -e "\n${GREEN}✅ Testes completos!${NC}"
