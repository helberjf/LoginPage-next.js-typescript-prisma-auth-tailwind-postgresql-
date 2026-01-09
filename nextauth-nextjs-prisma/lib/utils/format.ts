// src/lib/utils/format.ts

// formata datas para DD/MM/AAAA
export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

// formata horário HH:MM
export function formatTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// formata moeda BRL
export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

