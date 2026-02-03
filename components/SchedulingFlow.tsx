"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatCpf, formatPhoneBR, onlyDigits } from "@/lib/utils/formatters";
import { validateCpf } from "@/lib/validators/validateCpf";

interface Service {
  id: string;
  name: string;
  durationMins: number;
  priceCents: number;
}

interface AvailableTime {
  time: string;
  timestamp: number;
}

interface TimeSlot extends AvailableTime {
  available: boolean;
}

interface Employee {
  id: string;
  name: string | null;
}

interface ScheduleFormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  serviceId: string;
  employeeId: string;
  date: Date | undefined;
  time: string;
}

type Step = "service" | "datetime" | "personal" | "review" | "loading";

type SchedulingFlowProps = {
  prefill?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    cpf?: string | null;
  };
  isGoogleAccount?: boolean;
};

export default function SchedulingFlow({ prefill, isGoogleAccount }: SchedulingFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("service");
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState(false);
  const [unavailableDialogMessage, setUnavailableDialogMessage] = useState(
    "O horário selecionado não está mais disponível. Escolha outro horário."
  );

  const [formData, setFormData] = useState<ScheduleFormData>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    serviceId: "",
    employeeId: "",
    date: undefined,
    time: "",
  });

  useEffect(() => {
    if (!session?.user || isGoogleAccount) return;

    setFormData((prev) => ({
      ...prev,
      name: prev.name || prefill?.name || session.user?.name || "",
      email: prev.email || prefill?.email || session.user?.email || "",
      phone: prev.phone || (prefill?.phone ? formatPhoneBR(prefill.phone) : ""),
      cpf: prev.cpf || (prefill?.cpf ? formatCpf(prefill.cpf) : ""),
    }));
  }, [session, prefill, isGoogleAccount]);

  const preselectedServiceId = searchParams?.get("serviceId") ?? "";

  // Load services from database on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error("Erro ao carregar serviços");
        }
        const data = await response.json();
        // A API retorna um array direto, não um objeto com propriedade services
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
        setError("Erro ao carregar serviços");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await fetch("/api/schedules/employees");
        if (!response.ok) {
          throw new Error("Erro ao carregar profissionais");
        }
        const data = await response.json();
        setEmployees(Array.isArray(data.employees) ? data.employees : []);
      } catch (err) {
        console.error("Erro ao carregar profissionais:", err);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!preselectedServiceId || services.length === 0) return;
    const found = services.find((s) => s.id === preselectedServiceId);
    if (!found) return;

    setFormData((prev) => ({
      ...prev,
      serviceId: preselectedServiceId,
      date: undefined,
      time: "",
    }));
    setStep("datetime");
  }, [preselectedServiceId, services]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === formData.serviceId);
  }, [formData.serviceId, services]);

  const selectedEmployee = useMemo(() => {
    if (!formData.employeeId) return null;
    return employees.find((employee) => employee.id === formData.employeeId) ?? null;
  }, [employees, formData.employeeId]);

  // STEP 1: Service Selection
  const handleServiceSelect = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceId,
      date: undefined,
      time: "",
    }));
    setTimeSlots([]);
    setError(null);
    setStep("datetime");
  };

  // STEP 2: Date & Time Selection
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;

    setFormData((prev) => ({
      ...prev,
      date,
      time: "",
    }));

    await fetchAvailableTimes(date);
  };

  const fetchAvailableTimes = async (date: Date, employeeIdOverride?: string) => {
    try {
      setLoadingTimes(true);
      setError(null);
      setTimeSlots([]);

      const dateStr = format(date, "yyyy-MM-dd");
      const employeeId = employeeIdOverride ?? formData.employeeId;
      const params = new URLSearchParams({
        serviceId: formData.serviceId,
        date: dateStr,
      });
      if (employeeId) {
        params.append("employeeId", employeeId);
      }

      const response = await fetch(
        `/api/schedules/available-times?${params.toString()}`
      );

      if (!response.ok) {
        let errorMessage = "Erro ao buscar horários disponíveis";
        try {
          const errorData = await response.json();
          if (typeof errorData?.error === "string" && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error("Erro ao interpretar resposta:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const available = Array.isArray(data.availableTimes) ? data.availableTimes : [];
      const slots = Array.isArray(data.timeSlots) ? data.timeSlots : [];

      const normalizedSlots = slots.length
        ? slots
        : available.map((slot: AvailableTime) => ({ ...slot, available: true }));

      setTimeSlots(normalizedSlots);

      const hasAvailable = normalizedSlots.some((slot) => slot.available);
      if (!hasAvailable || normalizedSlots.length === 0) {
        setError("Nenhum horário disponível para este dia");
      }
    } catch (err) {
      console.error("Erro ao buscar horários:", err);
      setError("Erro ao buscar horários disponíveis");
      toast.error("Erro ao buscar horários");
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      time,
    }));
    setStep("personal");
  };

  const handleEmployeeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: value,
      time: "",
    }));
    setTimeSlots([]);
    setError(null);

    if (formData.date) {
      fetchAvailableTimes(formData.date, value);
    }
  };

  // STEP 3: Personal Information
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: formatPhoneBR(value),
      }));
      return;
    }

    if (name === "cpf") {
      setFormData((prev) => ({
        ...prev,
        cpf: formatCpf(value),
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isPersonalInfoValid = useMemo(() => {
    const nameValid = formData.name.trim().length >= 3;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const phoneValid = /^\d{10,11}$/.test(onlyDigits(formData.phone));
    const cpfValid = validateCpf(formData.cpf);

    return nameValid && emailValid && phoneValid && cpfValid;
  }, [formData.name, formData.email, formData.phone, formData.cpf]);

  const handleNextToReview = () => {
    if (isPersonalInfoValid) {
      setStep("review");
      setError(null);
    } else {
      setError("Preencha todos os campos corretamente");
    }
  };

  // STEP 4: Review & Checkout
  const handleSubmit = async () => {
    if (!formData.date || !selectedService) {
      setError("Dados incompletos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // CRIAR AGENDAMENTO COM VALIDAÇÃO
      const response = await fetch("/api/schedules/create-validated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          date: format(formData.date, "yyyy-MM-dd"),
          time: formData.time,
          employeeId: formData.employeeId || undefined,
          guestName: formData.name,
          guestEmail: formData.email,
          guestPhone: onlyDigits(formData.phone),
          notes: formData.cpf ? `CPF: ${onlyDigits(formData.cpf)}` : "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || "Erro ao criar agendamento";
        if (
          response.status === 409 ||
          errorMessage.toLowerCase().includes("horário não está mais disponível")
        ) {
          setUnavailableDialogMessage(
            "O horário selecionado não está mais disponível. Escolha outro horário."
          );
          setIsUnavailableDialogOpen(true);
          setStep("datetime");
          return;
        }
        throw new Error(errorMessage);
      }

      const { schedule } = data;

      toast.success("Agendamento criado com sucesso!");

      // REDIRECIONAR PARA SUCESSO (SEM PAGAMENTO)
      router.push(`/schedules/success?scheduleId=${schedule.id}`);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao agendar";
      console.error("Erro:", err);
      setError(errorMsg);
      if (!errorMsg.toLowerCase().includes("horário não está mais disponível")) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const unavailableDialog = (
    <Dialog
      open={isUnavailableDialogOpen}
      onOpenChange={setIsUnavailableDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Horário indisponível</DialogTitle>
          <DialogDescription>{unavailableDialogMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsUnavailableDialogOpen(false)}>
            Ok, escolher outro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Renderização por step
  if (step === "service") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12 px-4">
        {unavailableDialog}
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Agendar Atendimento
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-lg">
              Escolha o serviço que deseja agendar
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            {loadingServices ? (
              <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                Carregando serviços...
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600 dark:text-gray-400">
                Nenhum serviço disponível
              </div>
            ) : (
              services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="text-left p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-900 transition-all hover:shadow-lg"
                >
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {service.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.durationMins} min
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      R$ {(service.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "datetime") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12 px-4">
        {unavailableDialog}
        <div className="mx-auto max-w-5xl">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => setStep("service")}
              className="hover:text-blue-600"
            >
              Serviço
            </button>
            <ArrowRight className="w-4 h-4" />
            <span className="text-blue-600 font-semibold">Data e Hora</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Agendamento
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Selecione data e horário
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedService?.name}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                <Clock className="w-3.5 h-3.5" />
                {selectedService?.durationMins} min
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-100/80 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-4">
              <Label className="text-xs font-semibold uppercase tracking-[0.16em] mb-2 block text-blue-700 dark:text-blue-300">
                Profissional
              </Label>
              <select
                value={formData.employeeId}
                onChange={(event) => handleEmployeeChange(event.target.value)}
                className="w-full rounded-xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 shadow-sm"
              >
                <option value="">Qualquer profissional</option>
                {loadingEmployees && (
                  <option value="" disabled>
                    Carregando profissionais...
                  </option>
                )}
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name ?? "Profissional"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Calendar */}
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/40 p-4">
                <Label className="text-xs font-semibold uppercase tracking-[0.16em] mb-3 block text-gray-700 dark:text-gray-300">
                  Data
                </Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const maxDate = addDays(today, 60);
                      return date < today || date > maxDate;
                    }}
                    locale={ptBR}
                  />
                </div>
              </div>

              {/* Times */}
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/40 p-4">
                <Label className="text-xs font-semibold uppercase tracking-[0.16em] mb-3 block text-gray-700 dark:text-gray-300">
                  Horário
                </Label>

                {loadingTimes && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Carregando horários...
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 flex gap-2 text-sm text-red-700 dark:text-red-200 mb-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {!loadingTimes && timeSlots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.timestamp}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={cn(
                          "p-3 rounded-xl border-2 text-sm font-semibold transition-all",
                          formData.time === slot.time
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                            : slot.available
                              ? "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-white dark:hover:bg-gray-900"
                              : "border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/60 cursor-not-allowed opacity-75 line-through"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}

                {!loadingTimes && timeSlots.length > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    Horários indisponíveis aparecem esmaecidos.
                  </p>
                )}

                {!loadingTimes && timeSlots.length === 0 && !error && formData.date && (
                  <div className="text-center py-8 text-sm text-gray-500">
                    Selecione uma data para ver horários disponíveis
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setStep("service")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={() => formData.time && setStep("personal")}
                disabled={!formData.time}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "personal") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12 px-4">
        {unavailableDialog}
        <div className="mx-auto max-w-5xl">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button onClick={() => setStep("service")} className="hover:text-blue-600">
              Serviço
            </button>
            <ArrowRight className="w-4 h-4" />
            <button onClick={() => setStep("datetime")} className="hover:text-blue-600">
              Data e Hora
            </button>
            <ArrowRight className="w-4 h-4" />
            <span className="text-blue-600 font-semibold">Dados Pessoais</span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-white">
              Seus dados
            </h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="João da Silva"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="cpf" className="mb-2 block">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="h-11"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 flex gap-2 text-sm text-red-700 dark:text-red-200">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setStep("datetime")}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleNextToReview}
                disabled={!isPersonalInfoValid}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Revisar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 sm:py-12 px-4">
        {unavailableDialog}
        <div className="mx-auto max-w-5xl">
          {/* Progress */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="text-blue-600 font-semibold">Resumo</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Resumo do Agendamento
              </h2>

              <div className="space-y-4">
                {/* Service */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Serviço
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    {selectedService?.name}
                  </p>
                </div>

                {/* DateTime */}
                {formData.date && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Data e Hora
                    </h4>
                    <p className="text-green-700 dark:text-green-300">
                      {format(formData.date, "EEEE, dd 'de' MMMM", {
                        locale: ptBR,
                      })}{" "}
                      às {formData.time}
                    </p>
                  </div>
                )}

                {/* Personal Info */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Dados Pessoais
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Nome:</span> {formData.name}
                    </p>
                    {selectedEmployee && (
                      <p>
                        <span className="font-medium">Profissional:</span> {selectedEmployee.name ?? "Profissional"}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Email:</span> {formData.email}
                    </p>
                    <p>
                      <span className="font-medium">Telefone:</span> {formData.phone}
                    </p>
                    <p>
                      <span className="font-medium">CPF:</span> {formData.cpf}
                    </p>
                  </div>
                </div>

                {/* Price */}
                {selectedService && (
                  <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Valor:
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        R$ {(selectedService.priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep("personal")}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      Confirmar agendamento
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 sm:p-8 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                ℹ️ Próximos Passos
              </h3>
              <ol className="space-y-4 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    1
                  </span>
                  <span>Revise os dados do seu agendamento</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    2
                  </span>
                  <span>Clique em &quot;Confirmar agendamento&quot;</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    3
                  </span>
                  <span>Você receberá a confirmação do agendamento</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                    4
                  </span>
                  <span>O pagamento de 50% será no dia do atendimento</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
