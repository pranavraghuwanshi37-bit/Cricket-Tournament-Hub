import React, { useState } from 'react';
import phonepeQr from '@assets/e228529f-b322-4684-a894-639b96ba4986_1784655226760.jpg';
import { Layout } from '@/components/layout/Layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationForm } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { submitRegistration } from '@/hooks/useRegistrations';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, IndianRupee, CheckCircle2, Upload, Copy } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Team Info', icon: Trophy },
  { id: 2, title: 'Payment', icon: IndianRupee },
  { id: 3, title: 'Done', icon: CheckCircle2 }
];

export function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      teamName: '',
      captainName: '',
      captainPhone: '',
      captainEmail: '',
      city: '',
      category: 'Open',
    },
    mode: 'onTouched'
  });

  const validateStep1 = async () => {
    const fieldsToValidate: (keyof RegistrationForm)[] = ['teamName', 'captainName', 'captainPhone', 'captainEmail', 'city', 'category'];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!paymentFile) {
      toast.error("Please upload payment proof screenshot");
      return;
    }
    if (!transactionId || transactionId.length < 5) {
      toast.error("Please enter a valid Transaction ID/UTR");
      return;
    }

    setIsSubmitting(true);
    setSubmitStep('Starting…');
    try {
      const formData = form.getValues();
      const id = await submitRegistration(formData, paymentFile, transactionId, setSubmitStep);
      setRegistrationId(id);
      setCurrentStep(3);
      toast.success("Registration submitted successfully!");
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Failed to submit registration. Please try again.";
      toast.error(msg, { duration: 8000 });
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  const copyId = () => {
    if (registrationId) {
      navigator.clipboard.writeText(registrationId);
      toast.success("Registration ID copied to clipboard!");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0 rounded-full" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500 ease-in-out rounded-full"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                    isActive ? 'bg-primary border-primary/20 text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.5)]' :
                    isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                    'bg-card border-border text-muted-foreground'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-xs font-bold uppercase tracking-wider hidden sm:block ${
                    isActive || isCompleted ? 'text-white' : 'text-muted-foreground'
                  }`}>{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <Card className="border-primary/20 shadow-2xl shadow-black overflow-hidden relative min-h-[400px]">
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 sm:p-10 space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Team Information</h2>
                    <p className="text-muted-foreground">Enter your core team details to get started.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Team Name</Label>
                      <Input {...form.register('teamName')} className="h-12 text-lg" placeholder="e.g. Bhopal Blasters" />
                      {form.formState.errors.teamName && <p className="text-sm text-destructive">{form.formState.errors.teamName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Captain Name</Label>
                      <Input {...form.register('captainName')} className="h-12" placeholder="Full Name" />
                      {form.formState.errors.captainName && <p className="text-sm text-destructive">{form.formState.errors.captainName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Captain Phone</Label>
                      <Input {...form.register('captainPhone')} className="h-12" placeholder="+91 XXXXXXXXXX" />
                      {form.formState.errors.captainPhone && <p className="text-sm text-destructive">{form.formState.errors.captainPhone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Captain Email</Label>
                      <Input {...form.register('captainEmail')} type="email" className="h-12" placeholder="email@example.com" />
                      {form.formState.errors.captainEmail && <p className="text-sm text-destructive">{form.formState.errors.captainEmail.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Team Category</Label>
                      <select
                        {...form.register('category')}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        <option value="Under-19">Under-19</option>
                        <option value="Under-23">Under-23</option>
                        <option value="Open">Open (No age limit)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input {...form.register('city')} className="h-12" placeholder="e.g. Indore" />
                      {form.formState.errors.city && <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>State</Label>
                      <div className="flex h-12 w-full rounded-md border border-border bg-muted/50 px-3 py-2 items-center text-muted-foreground select-none">
                        Madhya Pradesh
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border">
                    <Button onClick={validateStep1} size="lg" className="h-12 px-8 uppercase tracking-widest">Next Step &rarr;</Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 sm:p-10 space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Payment</h2>
                    <p className="text-muted-foreground">Complete your registration by paying the tournament fee.</p>
                  </div>

                  <div className="bg-card border border-primary/30 p-8 rounded-2xl text-center shadow-lg">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Registration Fee</p>
                    <p className="text-5xl font-black text-primary mb-8">₹3,500</p>

                    <div className="bg-background rounded-xl p-6 border border-border text-left w-full">
                      <div className="flex flex-col sm:flex-row gap-6 items-center">
                        <div className="shrink-0 flex flex-col items-center gap-2">
                          <img src={phonepeQr} alt="PhonePe QR Code" className="w-44 h-44 rounded-xl border-2 border-primary/40 object-cover" />
                          <span className="text-xs text-muted-foreground">Scan & Pay via PhonePe</span>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Pay via UPI to:</p>
                            <div className="flex items-center gap-3 bg-muted px-4 py-3 rounded-md border border-border">
                              <span className="font-mono text-lg font-bold">8269818508@axl</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Account Holder</p>
                            <p className="text-sm font-bold text-white">ADITYA PRATAP SINGH RAGHUWANSHI</p>
                          </div>
                          <div className="py-2 px-4 rounded-lg bg-primary/10 border border-primary/30">
                            <p className="text-sm font-bold text-primary">📅 Last Date to Register: 1st August 2026</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Transaction ID / UTR Number</Label>
                      <Input
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter the 12-digit UPI reference number"
                        className="h-12 font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Screenshot</Label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary rounded-xl cursor-pointer bg-card/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {paymentFile ? <span className="text-primary font-bold">{paymentFile.name}</span> : "Click to upload payment proof"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t border-border">
                    <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      size="lg"
                      className="h-12 px-8 uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    >
                      {isSubmitting ? (submitStep || "Submitting…") : "Submit Registration"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 text-center py-20"
                >
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 text-primary shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-4xl font-bold uppercase tracking-tight mb-4">Registration Received!</h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                    Your team details and payment have been submitted. Our team will verify the payment and approve your registration within 24-48 hours.
                  </p>

                  <div className="bg-card border border-border p-6 rounded-xl max-w-sm mx-auto mb-10">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Your Registration ID</p>
                    <div className="flex items-center justify-between bg-background px-4 py-3 rounded-lg border border-primary/30">
                      <span className="font-mono text-xl font-bold text-primary">{registrationId}</span>
                      <button onClick={copyId} className="text-muted-foreground hover:text-primary transition-colors">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Save this ID to track your status.</p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Link href="/">
                      <Button variant="outline" size="lg">Return Home</Button>
                    </Link>
                    <Link href={`/track?id=${registrationId}`}>
                      <Button size="lg">Track Status</Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
