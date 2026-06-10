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
  position: z.string().optional(),
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

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const onSubmitFinal = () => {
    // Determine wing from age
    const dob = formData.dateOfBirth;
    const today = new Date();
    const birthDate = new Date(dob!);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    let wing = "atfal_sughir";
    if (age >= 15) wing = "khuddam";
    else if (age >= 13) wing = "atfal_kabir";

    createMember.mutate({
      data: {
        ...formData,
        age,
        wing: wing as any,
      } as any
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
                ${step > s ? 'bg-primary border-primary text-primary-foreground' : 
                  step === s ? 'bg-background border-primary text-primary' : 
                  'bg-background border-muted text-muted-foreground'}`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground px-1">
          <span className={step >= 1 ? "text-foreground" : ""}>Personal Info</span>
          <span className={step >= 2 ? "text-foreground" : ""}>Location</span>
          <span className={step >= 3 ? "text-foreground" : ""}>Guardian</span>
          <span className={step >= 4 ? "text-foreground" : ""}>Review</span>
        </div>
      </div>

      <Card className="overflow-hidden border-muted">
        <div className="p-6 md:p-8 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {step === 1 && <Step1PersonalInfo defaultValues={formData} onNext={handleNext} />}
              {step === 2 && <Step2Location defaultValues={formData} onNext={handleNext} onBack={handleBack} createCircuit={createCircuit.mutateAsync} createJamaat={createJamaat.mutateAsync} qc={queryClient} />}
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
  const { age, wing, label, color } = useWingCalc(dob);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p className="text-sm text-muted-foreground">Basic details about the member.</p>
          </div>

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
                max={new Date().toISOString().split('T')[0]} 
                {...register("dateOfBirth")} 
              />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message as string}</p>}
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-6 rounded-xl border flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-primary">
              {age !== null ? age : "?"}
            </span>
          </div>
          <h4 className="font-semibold text-lg mb-2">Calculated Age</h4>
          
          {age === null ? (
            <p className="text-sm text-muted-foreground">Enter date of birth to calculate age and wing assignment.</p>
          ) : age < 7 ? (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Too young for Atfal membership (min age: 7)
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <p className="text-sm text-muted-foreground">Based on the age, this member belongs to:</p>
              <WingBadge wing={wing!} size="md" />
              {age >= 15 && (
                <div className="mt-4 flex items-start gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm text-left">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Will be registered as Khuddam. You may want to archive them after registration.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={age !== null && age < 7}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function Step2Location({ defaultValues, onNext, onBack, createCircuit, createJamaat, qc }: any) {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      sector: defaultValues.sector || "",
      region: defaultValues.region || "",
      zone: defaultValues.zone || "",
      circuit: defaultValues.circuit || "",
      jamaat: defaultValues.jamaat || "",
      position: defaultValues.position || "",
    }
  });

  const {
    sectors, regions, zones,
    sector, setSector,
    region, setRegion,
    zone, setZone
  } = useLocationCascade();

  const [circuitSearch, setCircuitSearch] = useState("");
  const debouncedCircuitSearch = useDebounce(circuitSearch, 300);
  const { data: circuits } = useListCircuits({ q: debouncedCircuitSearch, zone: zone || undefined }, { query: { enabled: !!zone } as any });

  const currentCircuit = watch("circuit");
  const [jamaatSearch, setJamaatSearch] = useState("");
  const debouncedJamaatSearch = useDebounce(jamaatSearch, 300);
  const { data: jamaats } = useListJamaats({ q: debouncedJamaatSearch, circuit: currentCircuit || undefined }, { query: { enabled: !!currentCircuit } as any });

  // Init cascade state if editing
  useState(() => {
    if (defaultValues.sector) setSector(defaultValues.sector);
    if (defaultValues.region) setRegion(defaultValues.region);
    if (defaultValues.zone) setZone(defaultValues.zone);
  });

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
        <p className="text-sm text-muted-foreground">Assign the member to their specific region and jama'at.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-2">
          <Label>Sector *</Label>
          <Controller
            control={control}
            name="sector"
            render={({ field }) => (
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
                  {sectors.map((s: any) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.sector && <p className="text-sm text-destructive">{errors.sector.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Region *</Label>
          <Controller
            control={control}
            name="region"
            render={({ field }) => (
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
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r: any) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.region && <p className="text-sm text-destructive">{errors.region.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Zone *</Label>
          <Controller
            control={control}
            name="zone"
            render={({ field }) => (
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
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z: any) => <SelectItem key={z.id} value={z.name}>{z.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.zone && <p className="text-sm text-destructive">{errors.zone.message as string}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label>Circuit *</Label>
          <Controller
            control={control}
            name="circuit"
            render={({ field }) => (
              <SmartCombobox
                label="Circuit"
                items={circuits || []}
                value={field.value}
                onChange={(val) => { field.onChange(val); setValue("jamaat", ""); }}
                onSearch={setCircuitSearch}
                onCreateNew={handleCreateCircuit}
                disabled={!zone}
                placeholder="Search or select circuit..."
              />
            )}
          />
          {errors.circuit && <p className="text-sm text-destructive">{errors.circuit.message as string}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label>Jama'at *</Label>
          <Controller
            control={control}
            name="jamaat"
            render={({ field }) => (
              <SmartCombobox
                label="Jama'at"
                items={jamaats || []}
                value={field.value}
                onChange={field.onChange}
                onSearch={setJamaatSearch}
                onCreateNew={handleCreateJamaat}
                disabled={!currentCircuit}
                placeholder="Search or select jama'at..."
              />
            )}
          />
          {errors.jamaat && <p className="text-sm text-destructive">{errors.jamaat.message as string}</p>}
        </div>

        <div className="space-y-2">
          <Label>Office / Position</Label>
          <Input {...register("position")} placeholder="e.g. Nazim Atfal (Optional)" />
        </div>
      </div>

      <div className="flex justify-between pt-4">
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
        <p className="text-sm text-muted-foreground">Contact details for parents or guardians (Optional but recommended).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input {...register("guardianName")} placeholder="Guardian's Name" />
        </div>

        <div className="space-y-2">
          <Label>Relationship</Label>
          <Controller
            control={control}
            name="guardianType"
            render={({ field }) => (
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
            )}
          />
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

      <div className="flex justify-between pt-4">
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review & Confirm</h3>
        <p className="text-sm text-muted-foreground">Please verify the details before registering the member.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-none border-muted bg-muted/20">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-muted-foreground">Name:</span>
              <span className="col-span-2 font-medium">{data.firstName} {data.middleName} {data.lastName}</span>
              
              <span className="text-muted-foreground mt-1">DOB:</span>
              <span className="col-span-2 mt-1">{new Date(data.dateOfBirth).toLocaleDateString()}</span>
              
              <span className="text-muted-foreground mt-1">Age & Wing:</span>
              <div className="col-span-2 mt-1 flex items-center gap-2">
                <span>{age} years</span>
                <WingBadge wing={wing!} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-muted bg-muted/20">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm">Location</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-muted-foreground">Hierarchy:</span>
              <span className="col-span-2 text-xs leading-relaxed">
                {data.sector} Sector › {data.region} › {data.zone}
              </span>
              
              <span className="text-muted-foreground mt-1">Local:</span>
              <span className="col-span-2 font-medium mt-1">
                {data.circuit} Circuit, {data.jamaat} Jama'at
              </span>
              
              {data.position && (
                <>
                  <span className="text-muted-foreground mt-1">Position:</span>
                  <span className="col-span-2 mt-1">{data.position}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {(data.guardianName || data.guardianPhone) && (
          <Card className="shadow-none border-muted bg-muted/20 md:col-span-2">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm">Guardian Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium">{data.guardianName || "-"}</span>
                  
                  <span className="text-muted-foreground mt-1">Relation:</span>
                  <span className="col-span-2 mt-1">{data.guardianType || "-"}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="col-span-2">{data.guardianPhone || "-"}</span>
                  
                  <span className="text-muted-foreground mt-1">Email:</span>
                  <span className="col-span-2 mt-1">{data.guardianEmail || "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Confirm & Register Member"} <Check className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
