import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateMember, useCreateCircuit, useCreateJamaat, useListCircuits, useListJamaats } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useWingCalc } from "@/hooks/useWingCalc";
import { useLocationCascade } from "@/hooks/useLocationCascade";
import { WingBadge } from "@/components/members/WingBadge";
import { AlertTriangle, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { SmartCombobox } from "@/components/forms/SmartCombobox";
import { useQueryClient } from "@tanstack/react-query";
import { getListMembersQueryKey, getListCircuitsQueryKey, getListJamaatsQueryKey } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/useDebounce";

const personalSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const locationSchema = z.object({
  sector: z.string().min(1, "Sector is required"),
  region: z.string().min(1, "Region is required"),
  zone: z.string().min(1, "Zone is required"),
  circuit: z.string().min(1, "Circuit is required"),
  jamaat: z.string().min(1, "Jama'at is required"),
});

const guardianSchema = z.object({
  guardianName: z.string().optional(),
  guardianType: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  guardianAddress: z.string().optional(),
});

type WizardData = z.infer<typeof personalSchema> & z.infer<typeof locationSchema> & z.infer<typeof guardianSchema>;

export default function MemberWizard() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<WizardData>>({});

  const createMember = useCreateMember();
  const createCircuit = useCreateCircuit();
  const createJamaat = useCreateJamaat();
  const queryClient = useQueryClient();

  const handleNext = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const onSubmitFinal = () => {
    const dob = formData.dateOfBirth!;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    let wing = "atfal_sughir";
    if (age >= 15) wing = "khuddam";
    else if (age >= 12) wing = "atfal_kabir";

    createMember.mutate({
      data: { ...formData, age, wing: wing as any } as any,
    }, {
      onSuccess: (newMember) => {
        toast.success("Member registered successfully");
        queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        navigate(`/members/${newMember.id}`);
      },
      onError: () => {
        toast.error("Failed to create member. Please try again.");
      }
    });
  };

  const steps = ["Personal Info", "Location", "Guardian", "Review"];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Register Member"
        subtitle="Add a new member to the Majlis Atfal-ul-Ahmadiyya system."
        breadcrumb={[
          { label: "Members", href: "/members" },
          { label: "Register Member" }
        ]}
      />

      {/* Step indicator */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full z-0 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
        </div>
        <div className="relative z-10 flex justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 transition-colors duration-300
                ${step > s ? "bg-primary border-primary text-primary-foreground" :
                  step === s ? "bg-background border-primary text-primary" :
                  "bg-background border-muted text-muted-foreground"}`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground px-1">
          {steps.map((name, i) => (
            <span key={name} className={step >= i + 1 ? "text-foreground" : ""}>{name}</span>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-muted">
        <div className="p-5 md:p-8 relative min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {step === 1 && <Step1PersonalInfo defaultValues={formData} onNext={handleNext} />}
              {step === 2 && (
                <Step2Location
                  defaultValues={formData}
                  onNext={handleNext}
                  onBack={handleBack}
                  createCircuit={createCircuit.mutateAsync}
                  createJamaat={createJamaat.mutateAsync}
                  qc={queryClient}
                />
              )}
              {step === 3 && <Step3GuardianInfo defaultValues={formData} onNext={handleNext} onBack={handleBack} />}
              {step === 4 && <Step4Review data={formData} onBack={handleBack} onSubmit={onSubmitFinal} isSubmitting={createMember.isPending} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

function Step1PersonalInfo({ defaultValues, onNext }: any) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: defaultValues.firstName || "",
      middleName: defaultValues.middleName || "",
      lastName: defaultValues.lastName || "",
      dateOfBirth: defaultValues.dateOfBirth || "",
    }
  });

  const dob = watch("dateOfBirth");
  const { age, wing } = useWingCalc(dob);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Basic details about the member.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register("firstName")} placeholder="First Name" />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="middleName" {...register("middleName")} placeholder="Middle Name (Optional)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register("lastName")} placeholder="Last Name" />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message as string}</p>}
          </div>
        </div>

        <div className="bg-muted/30 p-6 rounded-xl border flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-primary">{age !== null ? age : "?"}</span>
          </div>
          <h4 className="font-semibold mb-2">Calculated Age</h4>
          {age === null ? (
            <p className="text-sm text-muted-foreground">Enter date of birth to calculate age and wing assignment.</p>
          ) : age < 7 ? (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Too young for Atfal (min age: 7)
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <p className="text-sm text-muted-foreground">This member belongs to:</p>
              <WingBadge wing={wing!} size="md" />
              {age >= 15 && (
                <div className="mt-2 flex items-start gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm text-left">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Will be registered as Khuddam.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={age !== null && age < 7}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function Step2Location({ defaultValues, onNext, onBack, createCircuit, createJamaat, qc }: any) {
  const { register: _r, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      sector: defaultValues.sector || "",
      region: defaultValues.region || "",
      zone: defaultValues.zone || "",
      circuit: defaultValues.circuit || "",
      jamaat: defaultValues.jamaat || "",
    }
  });

  const { sectors, regions, zones, sector, setSector, region, setRegion, zone, setZone } = useLocationCascade({
    sector: defaultValues.sector,
    region: defaultValues.region,
    zone: defaultValues.zone,
  });

  const [circuitSearch, setCircuitSearch] = useState("");
  const debouncedCircuitSearch = useDebounce(circuitSearch, 300);
  const { data: circuits } = useListCircuits(
    { q: debouncedCircuitSearch, zone: zone || undefined },
    { query: { enabled: !!zone } as any }
  );

  const currentCircuit = watch("circuit");
  const [jamaatSearch, setJamaatSearch] = useState("");
  const debouncedJamaatSearch = useDebounce(jamaatSearch, 300);
  const { data: jamaats } = useListJamaats(
    { q: debouncedJamaatSearch, circuit: currentCircuit || undefined },
    { query: { enabled: !!currentCircuit } as any }
  );

  const handleCreateCircuit = async (name: string) => {
    if (!zone) return;
    await createCircuit({ data: { name, zone } });
    toast.info(`New Circuit created: ${name}`);
    qc.invalidateQueries({ queryKey: getListCircuitsQueryKey() });
  };

  const handleCreateJamaat = async (name: string) => {
    if (!currentCircuit) return;
    await createJamaat({ data: { name, circuit: currentCircuit } });
    toast.info(`New Jama'at created: ${name}`);
    qc.invalidateQueries({ queryKey: getListJamaatsQueryKey() });
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Location Hierarchy</h3>
        <p className="text-sm text-muted-foreground">
          Select Sector → Region → Zone, then type or search Circuit and Jama'at.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Sector */}
        <div className="space-y-2">
          <Label>Sector *</Label>
          <Controller control={control} name="sector" render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                setSector(val);
                setValue("region", "");
                setValue("zone", "");
                setValue("circuit", "");
                setValue("jamaat", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.sector && <p className="text-sm text-destructive">{errors.sector.message as string}</p>}
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label>Region *</Label>
          <Controller control={control} name="region" render={({ field }) => (
            <Select
              value={field.value}
              disabled={!sector}
              onValueChange={(val) => {
                field.onChange(val);
                setRegion(val);
                setValue("zone", "");
                setValue("circuit", "");
                setValue("jamaat", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={sector ? "Select Region" : "Select Sector first"} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.region && <p className="text-sm text-destructive">{errors.region.message as string}</p>}
        </div>

        {/* Zone */}
        <div className="space-y-2">
          <Label>Zone *</Label>
          <Controller control={control} name="zone" render={({ field }) => (
            <Select
              value={field.value}
              disabled={!region}
              onValueChange={(val) => {
                field.onChange(val);
                setZone(val);
                setValue("circuit", "");
                setValue("jamaat", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={region ? "Select Zone" : "Select Region first"} />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          {errors.zone && <p className="text-sm text-destructive">{errors.zone.message as string}</p>}
        </div>

        {/* Circuit — autocomplete */}
        <div className="space-y-2">
          <Label>Circuit *</Label>
          <Controller control={control} name="circuit" render={({ field }) => (
            <SmartCombobox
              label="Circuit"
              items={circuits || []}
              value={field.value}
              onChange={(val) => { field.onChange(val); setValue("jamaat", ""); }}
              onSearch={setCircuitSearch}
              onCreateNew={handleCreateCircuit}
              disabled={!zone}
              placeholder={zone ? "Search or create circuit..." : "Select Zone first"}
            />
          )} />
          {errors.circuit && <p className="text-sm text-destructive">{errors.circuit.message as string}</p>}
        </div>

        {/* Jama'at — autocomplete */}
        <div className="space-y-2 md:col-span-2">
          <Label>Jama'at *</Label>
          <Controller control={control} name="jamaat" render={({ field }) => (
            <SmartCombobox
              label="Jama'at"
              items={jamaats || []}
              value={field.value}
              onChange={field.onChange}
              onSearch={setJamaatSearch}
              onCreateNew={handleCreateJamaat}
              disabled={!currentCircuit}
              placeholder={currentCircuit ? "Search or create jama'at..." : "Select Circuit first"}
            />
          )} />
          {errors.jamaat && <p className="text-sm text-destructive">{errors.jamaat.message as string}</p>}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 border border-dashed text-sm text-muted-foreground">
        <strong>Circuit &amp; Jama'at</strong> are searchable. If yours doesn't exist yet, type the name and press "Create new" — it will be saved for everyone to use.
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function Step3GuardianInfo({ defaultValues, onNext, onBack }: any) {
  const { register, handleSubmit, control } = useForm({
    resolver: zodResolver(guardianSchema),
    defaultValues: {
      guardianName: defaultValues.guardianName || "",
      guardianType: defaultValues.guardianType || "",
      guardianPhone: defaultValues.guardianPhone || "",
      guardianEmail: defaultValues.guardianEmail || "",
      guardianAddress: defaultValues.guardianAddress || "",
    }
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Guardian Information</h3>
        <p className="text-sm text-muted-foreground">Contact details for parents or guardians (optional but recommended).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input {...register("guardianName")} placeholder="Guardian's Full Name" />
        </div>
        <div className="space-y-2">
          <Label>Relationship</Label>
          <Controller control={control} name="guardianType" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Relationship" />
              </SelectTrigger>
              <SelectContent>
                {["Father", "Mother", "Uncle", "Aunt", "Grandparent", "Brother", "Sister", "Other"].map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} />
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input {...register("guardianPhone")} placeholder="+233..." />
        </div>
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" {...register("guardianEmail")} placeholder="email@example.com" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Residential Address</Label>
          <Textarea {...register("guardianAddress")} placeholder="House number, Street, Landmark..." className="h-20" />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit">
          Review <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function Step4Review({ data, onBack, onSubmit, isSubmitting }: any) {
  const { age, wing } = useWingCalc(data.dateOfBirth);
  const dob = data.dateOfBirth
    ? new Date(data.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review & Confirm</h3>
        <p className="text-sm text-muted-foreground">Verify the details before registering the member.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-none border-muted bg-muted/20">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{data.firstName} {data.middleName} {data.lastName}</span>
              <span className="text-muted-foreground">Date of Birth:</span>
              <span>{dob}</span>
              <span className="text-muted-foreground">Age & Wing:</span>
              <div className="flex items-center gap-2">
                <span>{age} yrs</span>
                <WingBadge wing={wing!} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-muted bg-muted/20">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm">Location</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Sector:</span>
              <span>{data.sector}</span>
              <span className="text-muted-foreground">Region:</span>
              <span>{data.region}</span>
              <span className="text-muted-foreground">Zone:</span>
              <span>{data.zone}</span>
              <span className="text-muted-foreground">Circuit:</span>
              <span>{data.circuit}</span>
              <span className="text-muted-foreground">Jama'at:</span>
              <span className="font-semibold">{data.jamaat}</span>
            </div>
          </CardContent>
        </Card>

        {(data.guardianName || data.guardianPhone) && (
          <Card className="shadow-none border-muted bg-muted/20 md:col-span-2">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm">Guardian</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-1 text-sm">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                {data.guardianName && <><span className="text-muted-foreground">Name:</span><span>{data.guardianName} {data.guardianType ? `(${data.guardianType})` : ""}</span></>}
                {data.guardianPhone && <><span className="text-muted-foreground">Phone:</span><span>{data.guardianPhone}</span></>}
                {data.guardianEmail && <><span className="text-muted-foreground">Email:</span><span className="break-all">{data.guardianEmail}</span></>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Member"}
          {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
