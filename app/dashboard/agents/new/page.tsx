'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Loader2,
  Building2, FileText, MessageSquare, Sparkles,
  UploadCloud, X, Phone, AtSign, MessagesSquare,
  RefreshCw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────

interface FormState {
  name: string;
  businessContext: string;
  files: File[];
  whatsappToken: string;
  whatsappPhoneId: string;
  instagramToken: string;
  instagramPageId: string;
  messengerToken: string;
  messengerPageId: string;
  systemPrompt: string;
}

// ─── Step config ─────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Context',     icon: Building2,     desc: 'Business info & agent role' },
  { id: 2, label: 'Knowledge',   icon: FileText,       desc: 'Upload files for the agent' },
  { id: 3, label: 'Channels',    icon: MessageSquare,  desc: 'Connect your platforms' },
  { id: 4, label: 'Prompt',      icon: Sparkles,       desc: 'Review & edit system prompt' },
];

// ─── System prompt generator ─────────────────────────────────────

function buildSystemPrompt(name: string, context: string): string {
  return `You are ${name || 'an AI assistant'}, a smart and friendly business assistant.

## Business context
${context || 'No context provided yet. Add a description to improve your responses.'}

## Your responsibilities
- Answer customer questions accurately and concisely
- Provide information about products, services, pricing, and availability
- Help customers book appointments or submit inquiries
- Maintain a professional yet warm tone at all times
- If a question is outside your knowledge, acknowledge it and offer to escalate to a human agent

## Rules
- Always respond in the same language the customer writes in
- Keep replies short and easy to read (prefer bullet points for lists)
- Never invent prices, availability, or policies — only use what's in the context above
- Do not reveal that you are an AI unless explicitly asked`.trim();
}

// ─── Page ────────────────────────────────────────────────────────

export default function NewAgentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    businessContext: '',
    files: [],
    whatsappToken: '',
    whatsappPhoneId: '',
    instagramToken: '',
    instagramPageId: '',
    messengerToken: '',
    messengerPageId: '',
    systemPrompt: '',
  });

  const update = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  // Generate prompt on entering step 4
  const goToStep = (next: number) => {
    if (next === 4 && !form.systemPrompt) {
      update({ systemPrompt: buildSystemPrompt(form.name, form.businessContext) });
    }
    setStep(next);
  };

  const regeneratePrompt = () => {
    update({ systemPrompt: buildSystemPrompt(form.name, form.businessContext) });
  };

  const handleCreate = async () => {
    setSubmitting(true);
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name || 'My Agent',
        business_context: form.businessContext,
        system_prompt: form.systemPrompt,
        llm_model: 'gemini-3.1-flash-lite',
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/agents/${data.id}`);
    } else {
      setSubmitting(false);
      alert('Failed to create agent — check connection');
    }
  };

  const canNext = () => {
    if (step === 1) return form.name.trim().length > 0 && form.businessContext.trim().length > 0;
    if (step === 4) return form.systemPrompt.trim().length > 0;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/dashboard/agents" className="text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-[13px] text-[#737373]">Back to agents</span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#0A0A0A]">Create your AI agent</h1>
        <p className="text-[13px] text-[#737373] mt-1">Follow the steps below to configure your agent</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-start gap-0 mb-8">
        {STEPS.map((s, i) => {
          const done    = step > s.id;
          const active  = step === s.id;
          const last    = i === STEPS.length - 1;
          return (
            <div key={s.id} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={() => done ? goToStep(s.id) : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold border-2 transition-colors ${
                    done   ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white cursor-pointer' :
                    active ? 'bg-white border-[#0A0A0A] text-[#0A0A0A]' :
                             'bg-white border-[#EAEAEA] text-[#A3A3A3] cursor-default'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : s.id}
                </button>
                <span className={`mt-1.5 text-[11px] font-medium ${
                  active ? 'text-[#0A0A0A]' : done ? 'text-[#525252]' : 'text-[#A3A3A3]'
                }`}>
                  {s.label}
                </span>
              </div>
              {!last && (
                <div className={`flex-1 h-px mt-4 mx-1 transition-colors ${
                  done ? 'bg-[#0A0A0A]' : 'bg-[#EAEAEA]'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-lg border border-[#EAEAEA] bg-white">
        {/* Step header */}
        <div className="px-6 py-5 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2.5">
            {(() => { const Icon = STEPS[step - 1].icon; return <Icon className="w-4 h-4 text-[#525252]" />; })()}
            <div>
              <p className="text-[13px] font-semibold text-[#0A0A0A]">Step {step} — {STEPS[step - 1].label}</p>
              <p className="text-[12px] text-[#737373]">{STEPS[step - 1].desc}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && <Step1 form={form} update={update} />}
          {step === 2 && <Step2 form={form} update={update} />}
          {step === 3 && <Step3 form={form} update={update} />}
          {step === 4 && <Step4 form={form} update={update} onRegenerate={regeneratePrompt} />}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => step > 1 ? goToStep(step - 1) : undefined}
          className={`flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-md border border-[#EAEAEA] transition-colors ${
            step === 1 ? 'text-[#D4D4D4] cursor-default' : 'text-[#525252] hover:bg-[#FAFAF9] hover:text-[#0A0A0A]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={() => goToStep(step + 1)}
            disabled={!canNext()}
            className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-md bg-[#0A0A0A] text-white hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={submitting || !canNext()}
            className="flex items-center gap-1.5 text-[13px] font-medium px-5 py-2 rounded-md bg-[#0A0A0A] text-white hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</>
              : <><Check className="w-3.5 h-3.5" /> Create agent</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Business context ────────────────────────────────────

function Step1({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Agent name" hint="The name your customers will see">
        <input
          autoFocus
          value={form.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Sophie — Glamour Nails"
          className={inputCls}
        />
      </Field>

      <Field label="Business context" hint="Describe your business and the agent's role in detail">
        <textarea
          rows={9}
          value={form.businessContext}
          onChange={e => update({ businessContext: e.target.value })}
          placeholder={`Example:\n\nWe are Glamour Nails Studio, a nail salon in East Austin, TX.\n\nServices & prices:\n• Manicure — $35\n• Gel nails — $55\n• Pedicure — $45\n\nWorking hours: Mon–Sat 10am–7pm, Sun 11am–5pm\nPhone: +1 512-000-0000\n\nThe agent's role is to:\n- Answer questions about services and pricing\n- Help clients book appointments\n- Send reminders about upcoming appointments`}
          className={`${inputCls} resize-none font-[inherit] leading-relaxed`}
        />
        <p className="text-[11px] text-[#A3A3A3] mt-1.5">
          The more detail you add, the smarter your agent will be. Include prices, hours, FAQ, and tone.
        </p>
      </Field>
    </div>
  );
}

// ─── Step 2: Knowledge base ───────────────────────────────────────

function Step2({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    update({ files: [...form.files, ...arr] });
  };

  const removeFile = (idx: number) => {
    update({ files: form.files.filter((_, i) => i !== idx) });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    const colors: Record<string, string> = {
      pdf: 'text-red-500', xlsx: 'text-green-600', xls: 'text-green-600',
      docx: 'text-blue-500', doc: 'text-blue-500', txt: 'text-[#737373]',
      csv: 'text-emerald-500',
    };
    return colors[ext] ?? 'text-[#737373]';
  };

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[#525252] leading-relaxed">
        Upload price lists, FAQ documents, product catalogues, or any file the agent should know about.
        Supported: <span className="font-medium text-[#0A0A0A]">PDF, Word, Excel, TXT, CSV</span>
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-[#EAEAEA] rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#A3A3A3] hover:bg-[#FAFAF9] transition-colors"
      >
        <UploadCloud className="w-7 h-7 text-[#A3A3A3]" />
        <div className="text-center">
          <p className="text-[13px] font-medium text-[#0A0A0A]">Drop files here or click to browse</p>
          <p className="text-[12px] text-[#737373] mt-0.5">Max 20 MB per file</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          className="hidden"
          onChange={e => onFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {form.files.length > 0 && (
        <div className="space-y-1.5">
          {form.files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[#EAEAEA] bg-[#FAFAF9]">
              <FileText className={`w-4 h-4 flex-shrink-0 ${fileIcon(f.name)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0A0A0A] truncate">{f.name}</p>
                <p className="text-[11px] text-[#A3A3A3]">{fmt(f.size)}</p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md bg-[#FAFAF9] border border-[#EAEAEA] px-3.5 py-3 text-[12px] text-[#737373]">
        💡 Files will be processed after the agent is created. You can also add more files later from the agent settings.
      </div>

      <p className="text-[12px] text-[#A3A3A3]">
        This step is optional — you can skip it and add files later.
      </p>
    </div>
  );
}

// ─── Step 3: Channels ─────────────────────────────────────────────

function Step3({ form, update }: { form: FormState; update: (p: Partial<FormState>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-[#525252] leading-relaxed">
        Connect the platforms where your agent will respond. All fields are optional — you can configure channels after creating the agent.
      </p>

      {/* WhatsApp */}
      <ChannelCard
        icon={<Phone className="w-4 h-4 text-[#16A34A]" />}
        label="WhatsApp Business"
        color="green"
      >
        <Field label="Access Token">
          <input
            value={form.whatsappToken}
            onChange={e => update({ whatsappToken: e.target.value })}
            placeholder="EAABsbCS..."
            className={inputCls}
          />
        </Field>
        <Field label="Phone Number ID">
          <input
            value={form.whatsappPhoneId}
            onChange={e => update({ whatsappPhoneId: e.target.value })}
            placeholder="123456789012345"
            className={inputCls}
          />
        </Field>
      </ChannelCard>

      {/* Instagram */}
      <ChannelCard
        icon={<AtSign className="w-4 h-4 text-[#E1306C]" />}
        label="Instagram DMs"
        color="pink"
      >
        <Field label="Page Access Token">
          <input
            value={form.instagramToken}
            onChange={e => update({ instagramToken: e.target.value })}
            placeholder="EAABsbCS..."
            className={inputCls}
          />
        </Field>
        <Field label="Page / Account ID">
          <input
            value={form.instagramPageId}
            onChange={e => update({ instagramPageId: e.target.value })}
            placeholder="123456789012345"
            className={inputCls}
          />
        </Field>
      </ChannelCard>

      {/* Messenger */}
      <ChannelCard
        icon={<MessagesSquare className="w-4 h-4 text-[#0084FF]" />}
        label="Facebook Messenger"
        color="blue"
      >
        <Field label="Page Access Token">
          <input
            value={form.messengerToken}
            onChange={e => update({ messengerToken: e.target.value })}
            placeholder="EAABsbCS..."
            className={inputCls}
          />
        </Field>
        <Field label="Page ID">
          <input
            value={form.messengerPageId}
            onChange={e => update({ messengerPageId: e.target.value })}
            placeholder="123456789012345"
            className={inputCls}
          />
        </Field>
      </ChannelCard>
    </div>
  );
}

function ChannelCard({
  icon, label, children,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[#EAEAEA] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAFAF9] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-[13px] font-medium text-[#0A0A0A]">{label}</span>
        </div>
        <span className="text-[12px] text-[#737373]">{open ? 'Hide' : 'Configure'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#EAEAEA] space-y-3 bg-[#FAFAF9]">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Step 4: System prompt ────────────────────────────────────────

function Step4({
  form, update, onRegenerate,
}: {
  form: FormState;
  update: (p: Partial<FormState>) => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[13px] text-[#525252] leading-relaxed">
          This system prompt was generated from your business context. Review it and edit if needed — it defines how your agent thinks and responds.
        </p>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#525252] border border-[#EAEAEA] px-3 py-1.5 rounded-md hover:bg-[#FAFAF9] hover:text-[#0A0A0A] transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          Regenerate
        </button>
      </div>

      <textarea
        rows={16}
        value={form.systemPrompt}
        onChange={e => update({ systemPrompt: e.target.value })}
        className={`${inputCls} resize-none font-mono text-[12px] leading-relaxed`}
        spellCheck={false}
      />

      <div className="rounded-md bg-[#FAFAF9] border border-[#EAEAEA] px-3.5 py-3 text-[12px] text-[#737373]">
        💡 You can always edit the system prompt later from agent settings. The prompt is injected at the start of every conversation.
      </div>
    </div>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#525252] mb-1.5">
        {label}
        {hint && <span className="text-[#A3A3A3] font-normal ml-1.5">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full border border-[#EAEAEA] rounded-md px-3 py-2 text-[13px] text-[#0A0A0A] ' +
  'placeholder:text-[#A3A3A3] outline-none bg-white ' +
  'focus:border-[#737373] focus:ring-1 focus:ring-[#EAEAEA] transition-colors';
