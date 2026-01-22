import { redirect } from "next/navigation";

export default function StaffAgendaRedirect() {
  redirect("/dashboard/staff/schedules");
}