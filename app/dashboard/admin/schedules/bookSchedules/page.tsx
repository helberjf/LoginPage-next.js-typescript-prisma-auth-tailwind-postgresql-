import { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import BookScheduleForm from "@/components/admin/BookScheduleForm";

export const metadata: Metadata = {
    title: "Criar agendamento | Admin",
    description: "Criar um novo agendamento para clientes.",
};

async function getClients() {
    try {
        const clients = await prisma.user.findMany({
            where: {
                role: "CUSTOMER",
                status: "ACTIVE",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        return clients;
    } catch (error) {
        console.error("Failed to fetch clients:", error);
        return [];
    }
}

async function getServices() {
    try {
        const services = await prisma.service.findMany({
            where: {
                active: true,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                durationMins: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        return services;
    } catch (error) {
        console.error("Failed to fetch services:", error);
        return [];
    }
}

async function getEmployees() {
    try {
        const employees = await prisma.user.findMany({
            where: {
                role: "STAFF",
                status: "ACTIVE",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        return employees;
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        return [];
    }
}

export default async function BookSchedulePage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        redirect("/login");
    }

    const [clients, services, employees] = await Promise.all([
        getClients(),
        getServices(),
        getEmployees(),
    ]);

    return (
        <div className="space-y-6 p-3 sm:p-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Criar agendamento</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Criar um novo agendamento para clientes existentes.
                </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
                <BookScheduleForm clients={clients} services={services} employees={employees} />
            </div>
        </div>
    );
}