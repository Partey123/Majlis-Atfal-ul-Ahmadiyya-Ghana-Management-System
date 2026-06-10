export function useWingCalc(dob: string | undefined | null): { age: number | null; wing: "atfal_sughir" | "atfal_kabir" | "khuddam" | null; label: string | null; color: string | null } {
  if (!dob) {
    return { age: null, wing: null, label: null, color: null };
  }

  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { age: null, wing: null, label: null, color: null };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  let wing: "atfal_sughir" | "atfal_kabir" | "khuddam" = "atfal_sughir";
  let label = "Atfal Sughir";
  let color = "bg-blue-500/10 text-blue-600 dark:text-blue-400";

  if (age >= 15) {
    wing = "khuddam";
    label = "Khuddam";
    color = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  } else if (age >= 13) {
    wing = "atfal_kabir";
    label = "Atfal Kabir";
    color = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  } else {
    wing = "atfal_sughir";
    label = "Atfal Sughir";
    color = "bg-sky-500/10 text-sky-600 dark:text-sky-400";
  }

  return { age, wing, label, color };
}
