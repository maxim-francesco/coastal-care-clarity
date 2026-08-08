import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  listAllServicesAdmin,
  createService,
  updateService,
  deleteService,
} from "@/server/adminServices";
import {
  listAllFaqsAdmin,
  createFaq,
  updateFaq,
  deleteFaq,
  listAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSettingsAdmin,
  updateSettings,
} from "@/server/adminContentServices";
import { listLeads, updateLeadStatus, deleteLead, type DBLead } from "@/server/leads";
import type { DBService, DBFaq, DBTestimonial, DBSiteSettings } from "@/lib/supabase.client";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  Menu,
  Check,
  Archive,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Layers,
  HelpCircle,
  Quote,
  Settings as SettingsIcon,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [services, leads, faqs, testimonials, settings] = await Promise.all([
      listAllServicesAdmin(),
      listLeads({ data: "all" }),
      listAllFaqsAdmin(),
      listAllTestimonialsAdmin(),
      getSettingsAdmin(),
    ]);
    return { services, leads, faqs, testimonials, settings };
  },
  component: AdminDashboardPage,
});

interface ServiceFormState {
  id: string;
  name: string;
  short: string;
  from_label: string;
  price_from: string;
  price_unit: string;
  price_note: string;
  good_for: string;
  sort_order: number;
  featured: boolean;
  is_active: boolean;
  image_url: string;
  paragraphs: string[];
  includes: string[];
}

const defaultFormState: ServiceFormState = {
  id: "",
  name: "",
  short: "",
  from_label: "From",
  price_from: "",
  price_unit: "visit",
  price_note: "",
  good_for: "",
  sort_order: 10,
  featured: false,
  is_active: true,
  image_url: "",
  paragraphs: [],
  includes: [],
};

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  const handleAddItem = () => {
    onChange([...items, ""]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-muted-foreground">{label}</label>
        <button
          type="button"
          onClick={handleAddItem}
          className="text-[13px] font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Add line
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground italic bg-surface/50 rounded-lg p-3 text-center">
          No lines added yet. Click "Add line" to begin.
        </p>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border border-dashed rounded-lg p-2 bg-surface/30">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                placeholder={placeholder || `Line ${index + 1}`}
                className="flex-1 min-h-[38px] rounded-[8px] bg-white border border-border px-3 text-[14px] text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                  title="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                  title="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded cursor-pointer"
                  title="Delete line"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const { services, leads, faqs, testimonials, settings } = Route.useLoaderData();
  const { session, user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();



  // Tab State
  const [tab, setTab] = useState<"services" | "leads" | "faqs" | "testimonials" | "settings">("services");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Lead filter & expanded states
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [expandedLeadIds, setExpandedLeadIds] = useState<Record<string, boolean>>({});

  // Lead delete alert states
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [deletingLead, setDeletingLead] = useState(false);

  // Services Dialog / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<DBService | null>(null);
  const [form, setForm] = useState<ServiceFormState>(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Services Delete Alert States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!serviceToEdit;

  // FAQs Dialog / Form States
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);
  const [faqToEdit, setFaqToEdit] = useState<DBFaq | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    sort_order: 10,
    is_active: true,
  });
  const [submittingFaq, setSubmittingFaq] = useState(false);
  const [faqValidationError, setFaqValidationError] = useState<string | null>(null);

  // FAQs Delete Alert States
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);
  const [deleteFaqQuestion, setDeleteFaqQuestion] = useState<string | null>(null);
  const [deletingFaq, setDeletingFaq] = useState(false);

  // Testimonials Dialog / Form States
  const [isTestimonialFormOpen, setIsTestimonialFormOpen] = useState(false);
  const [testimonialToEdit, setTestimonialToEdit] = useState<DBTestimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    text: "",
    who: "",
    sort_order: 10,
    is_active: true,
  });
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialValidationError, setTestimonialValidationError] = useState<string | null>(null);

  // Testimonials Delete Alert States
  const [deleteTestimonialId, setDeleteTestimonialId] = useState<string | null>(null);
  const [deleteTestimonialWho, setDeleteTestimonialWho] = useState<string | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState(false);

  // Settings Form States (initialise from route loader settings)
  const [settingsForm, setSettingsForm] = useState({
    brand: settings.brand,
    owner: settings.owner,
    phone: settings.phone,
    phone_href: settings.phone_href,
    email: settings.email,
    hours: settings.hours,
    since: settings.since,
    cities: settings.cities || [],
    area_note: settings.area_note,
    about_bio: settings.about_bio || [],
  });
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [settingsValidationError, setSettingsValidationError] = useState<string | null>(null);

  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  const handleUpdateLeadStatus = async (id: string, nextStatus: "new" | "read" | "archived") => {
    try {
      const res = await updateLeadStatus({
        data: { id, status: nextStatus, accessToken: session?.access_token || undefined },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        toast.success(`Lead status updated to ${nextStatus}`);
        await router.invalidate();
      } else {
        toast.error(res.error || "Failed to update lead status");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteLeadId) return;
    setDeletingLead(true);
    try {
      const res = await deleteLead({
        data: { id: deleteLeadId, accessToken: session?.access_token || undefined },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        toast.success("Lead deleted successfully");
        await router.invalidate();
        setDeleteLeadId(null);
      } else {
        toast.error(res.error || "Failed to delete lead");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setDeletingLead(false);
    }
  };

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/admin/login" });
    }
  }, [session, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  const handleOpenForm = (service: DBService | null) => {
    setValidationError(null);
    if (service) {
      setServiceToEdit(service);
      setForm({
        id: service.id,
        name: service.name,
        short: service.short,
        from_label: service.from_label,
        price_from: service.price_from,
        price_unit: service.price_unit,
        price_note: service.price_note,
        good_for: service.good_for,
        sort_order: service.sort_order,
        featured: service.featured,
        is_active: service.is_active,
        image_url: service.image_url || "",
        paragraphs: service.paragraphs || [],
        includes: service.includes || [],
      });
    } else {
      setServiceToEdit(null);
      setForm(defaultFormState);
    }
    setIsFormOpen(true);
  };

  const handleConfirmDelete = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteService({
        data: { id: deleteId, accessToken: session?.access_token || undefined },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        toast.success("Service deleted successfully");
        await router.invalidate();
        setDeleteId(null);
        setDeleteName(null);
      } else {
        toast.error(res.error || "Failed to delete service");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitting(true);

    // Client side regex check for creation
    if (!isEdit && !/^[a-z0-9-]+$/.test(form.id)) {
      setValidationError("ID (slug) must contain only lowercase letters, numbers, and hyphens.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...form,
        image_url: form.image_url.trim() || null,
      };

      let res;
      if (isEdit) {
        res = await updateService({
          data: {
            id: serviceToEdit.id,
            input: {
              sort_order: payload.sort_order,
              name: payload.name,
              short: payload.short,
              from_label: payload.from_label,
              image_url: payload.image_url,
              paragraphs: payload.paragraphs,
              includes: payload.includes,
              good_for: payload.good_for,
              price_from: payload.price_from,
              price_unit: payload.price_unit,
              price_note: payload.price_note,
              featured: payload.featured,
              is_active: payload.is_active,
            },
            accessToken: session?.access_token || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      } else {
        res = await createService({
          data: {
            ...payload,
            accessToken: session?.access_token || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      }

      if (res.ok) {
        toast.success(isEdit ? "Service updated successfully" : "Service created successfully");
        await router.invalidate();
        setIsFormOpen(false);
      } else {
        setValidationError(res.error || "An error occurred.");
      }
    } catch (err: any) {
      setValidationError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // FAQ Form and Submit Handlers
  const handleOpenFaqForm = (faq: DBFaq | null) => {
    setFaqValidationError(null);
    if (faq) {
      setFaqToEdit(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sort_order,
        is_active: faq.is_active,
      });
    } else {
      setFaqToEdit(null);
      setFaqForm({
        question: "",
        answer: "",
        sort_order: faqs.length ? Math.max(...faqs.map(f => f.sort_order)) + 1 : 1,
        is_active: true,
      });
    }
    setIsFaqFormOpen(true);
  };

  const handleConfirmDeleteFaq = (id: string, question: string) => {
    setDeleteFaqId(id);
    setDeleteFaqQuestion(question);
  };

  const handleDeleteFaq = async () => {
    if (!deleteFaqId) return;
    setDeletingFaq(true);
    try {
      const res = await deleteFaq({
        data: { id: deleteFaqId, accessToken: session?.access_token || undefined },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        toast.success("FAQ deleted successfully");
        await router.invalidate();
        setDeleteFaqId(null);
        setDeleteFaqQuestion(null);
      } else {
        toast.error(res.error || "Failed to delete FAQ");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setDeletingFaq(false);
    }
  };

  const handleSubmitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqValidationError(null);
    setSubmittingFaq(true);

    try {
      let res;
      if (faqToEdit) {
        res = await updateFaq({
          data: {
            id: faqToEdit.id,
            input: faqForm,
            accessToken: session?.access_token || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      } else {
        res = await createFaq({
          data: {
            ...faqForm,
            accessToken: session?.access_token || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      }

      if (res.ok) {
        toast.success(faqToEdit ? "FAQ updated successfully" : "FAQ created successfully");
        await router.invalidate();
        setIsFaqFormOpen(false);
      } else {
        setFaqValidationError(res.error || "An error occurred.");
      }
    } catch (err: any) {
      setFaqValidationError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmittingFaq(false);
    }
  };

  // Testimonial Form and Submit Handlers
  const handleOpenTestimonialForm = (testimonial: DBTestimonial | null) => {
    setTestimonialValidationError(null);
    if (testimonial) {
      setTestimonialToEdit(testimonial);
      setTestimonialForm({
        text: testimonial.text,
        who: testimonial.who,
        sort_order: testimonial.sort_order,
        is_active: testimonial.is_active,
      });
    } else {
      setTestimonialToEdit(null);
      setTestimonialForm({
        text: "",
        who: "",
        sort_order: testimonials.length ? Math.max(...testimonials.map(t => t.sort_order)) + 1 : 1,
        is_active: true,
      });
    }
    setIsTestimonialFormOpen(true);
  };

  const handleConfirmDeleteTestimonial = (id: string, who: string) => {
    setDeleteTestimonialId(id);
    setDeleteTestimonialWho(who);
  };

  const handleDeleteTestimonial = async () => {
    if (!deleteTestimonialId) return;
    setDeletingTestimonial(true);
    try {
      const res = await deleteTestimonial({
        data: { id: deleteTestimonialId, accessToken: session?.access_token || undefined },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        toast.success("Testimonial deleted successfully");
        await router.invalidate();
        setDeleteTestimonialId(null);
        setDeleteTestimonialWho(null);
      } else {
        toast.error(res.error || "Failed to delete testimonial");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setDeletingTestimonial(false);
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialValidationError(null);
    setSubmittingTestimonial(true);

    try {
      let res;
      if (testimonialToEdit) {
        res = await updateTestimonial({
          data: {
            id: testimonialToEdit.id,
            input: testimonialForm,
            accessToken: session?.access_token || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      } else {
        res = await createTestimonial({
          data: {
            ...testimonialForm,
            accessToken: session?.access_token || undefined,
          },
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
      }

      if (res.ok) {
        toast.success(testimonialToEdit ? "Testimonial updated successfully" : "Testimonial created successfully");
        await router.invalidate();
        setIsTestimonialFormOpen(false);
      } else {
        setTestimonialValidationError(res.error || "An error occurred.");
      }
    } catch (err: any) {
      setTestimonialValidationError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  // Settings Save Handler
  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsValidationError(null);
    setSubmittingSettings(true);

    try {
      const res = await updateSettings({
        data: {
          ...settingsForm,
          accessToken: session?.access_token || undefined,
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        toast.success("Site settings updated successfully");
        await router.invalidate();
      } else {
        setSettingsValidationError(res.error || "Failed to save settings.");
      }
    } catch (err: any) {
      setSettingsValidationError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmittingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const inputBase =
    "block w-full min-h-[44px] rounded-[10px] bg-surface border border-transparent px-3.5 text-sm md:text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all";
  const labelBase = "block text-[12px] md:text-[13px] font-medium text-muted-foreground";
  const isSeededService = deleteId ? ["cleaning", "turnover", "management", "home-watch"].includes(deleteId) : false;

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      {/* Apple-style glass Top Bar */}
      <header className="glass fixed top-0 left-0 right-0 z-50 h-12 md:h-14 flex items-center px-5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold tracking-tight text-foreground">
                Coastal Care
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface text-foreground uppercase tracking-wider">
                Admin
              </span>
            </div>
            
            {/* Desktop-only Tabs */}
            <nav className="hidden md:flex items-center gap-2 sm:gap-4 border-l border-border pl-2 sm:pl-4 overflow-x-auto max-w-[50vw] sm:max-w-none no-scrollbar">
              <button
                onClick={() => setTab("services")}
                className={`text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  tab === "services"
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setTab("leads")}
                className={`text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  tab === "leads"
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Leads
                {newLeadsCount > 0 && (
                  <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                    {newLeadsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setTab("faqs")}
                className={`text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  tab === "faqs"
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setTab("testimonials")}
                className={`text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  tab === "testimonials"
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Testimonials
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`text-[13px] md:text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  tab === "settings"
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
          
          {/* Desktop-only Profile & Logout */}
          <div className="hidden md:flex items-center gap-4 sm:gap-8">
            <span className="hidden sm:inline text-[14px] text-muted-foreground">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="btn-pill btn-secondary !h-9 !px-4 !text-[14px] cursor-pointer"
            >
              Log out
            </button>
          </div>

          {/* Mobile-only Hamburger Menu Toggle */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center -mr-2 text-foreground cursor-pointer"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen glass menu dropdown overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop for click outside */}
          <div
            className="fixed inset-0 z-40 bg-black/10 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Dropdown panel */}
          <div className="glass fixed top-12 left-4 right-4 z-50 md:hidden rounded-2xl p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setTab("services");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left text-[18px] font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                  tab === "services"
                    ? "bg-accent/10 text-accent font-bold"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span>Services</span>
              </button>
              <button
                onClick={() => {
                  setTab("leads");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left text-[18px] font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                  tab === "leads"
                    ? "bg-accent/10 text-accent font-bold"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span className="flex items-center gap-2">
                  Leads
                  {newLeadsCount > 0 && (
                    <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                      {newLeadsCount}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => {
                  setTab("faqs");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left text-[18px] font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                  tab === "faqs"
                    ? "bg-accent/10 text-accent font-bold"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span>FAQs</span>
              </button>
              <button
                onClick={() => {
                  setTab("testimonials");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left text-[18px] font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                  tab === "testimonials"
                    ? "bg-accent/10 text-accent font-bold"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span>Testimonials</span>
              </button>
              <button
                onClick={() => {
                  setTab("settings");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left text-[18px] font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                  tab === "settings"
                    ? "bg-accent/10 text-accent font-bold"
                    : "text-foreground hover:bg-surface"
                }`}
              >
                <span>Settings</span>
              </button>
            </nav>
            <div className="hairline-t pt-5 flex flex-col gap-4">
              <div className="text-[13px] text-muted-foreground px-4">
                Logged in as <span className="text-foreground font-medium block overflow-hidden text-ellipsis">{user?.email}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="btn-pill btn-secondary w-full !h-11 !text-[15px] cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Dashboard */}
      <main className="pt-24 pb-12 px-5 max-w-6xl mx-auto">
        {tab === "services" && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
              <div>
                <h1 className="h-display text-[32px] md:text-[44px]">Services Management</h1>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  Add, edit, or delete Coastal Care services and starting prices.
                </p>
              </div>
              <button
                onClick={() => handleOpenForm(null)}
                className="btn-pill btn-primary self-start md:self-auto cursor-pointer"
              >
                <Plus size={18} /> Add service
              </button>
            </div>

            {/* Services Grid/List */}
            <div className="grid grid-cols-1 gap-5">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-[20px] border border-border p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg md:text-[20px] font-semibold tracking-tight text-foreground">
                        {service.name}
                      </h2>
                      <span className="text-[13px] text-muted-foreground bg-surface px-2 py-0.5 rounded font-mono">
                        {service.id}
                      </span>
                      {service.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                          <Star size={12} className="fill-accent" /> Featured
                        </span>
                      )}
                      {service.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm md:text-[15px] text-muted-foreground line-clamp-2 max-w-3xl">
                      {service.short}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] md:text-[14px]">
                      <div>
                        <span className="text-muted-foreground font-medium">Price:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {service.price_from}
                        </span>{" "}
                        <span className="text-muted-foreground">{service.price_unit}</span>
                        <span className="text-muted-foreground/60 text-[12px] ml-2">
                          (Card label: "{service.from_label}")
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Sort Order:</span>{" "}
                        <span className="font-mono text-foreground">{service.sort_order}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => handleOpenForm(service)}
                      className="btn-pill btn-secondary !h-10 !px-4 !text-[14px] cursor-pointer"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(service.id, service.name)}
                      className="btn-pill btn-secondary !h-10 !px-4 !text-[14px] !text-destructive hover:!bg-destructive/10 cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}

              {services.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[20px] border border-dashed border-border p-8">
                  <AlertCircle className="mx-auto text-muted-foreground mb-3" size={32} />
                  <p className="text-muted-foreground">No services found. Click "Add service" to create one.</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "leads" && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
              <div>
                <h1 className="h-display text-[32px] md:text-[44px]">Leads Inbox</h1>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  Review and manage customer requests submitted from your contact form.
                </p>
              </div>
            </div>

            {/* Filter Tabs Bar */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "all", label: "All", count: leads.length },
                { id: "new", label: "New", count: leads.filter((l) => l.status === "new").length },
                { id: "read", label: "Read", count: leads.filter((l) => l.status === "read").length },
                { id: "archived", label: "Archived", count: leads.filter((l) => l.status === "archived").length },
              ].map((filter) => {
                const active = statusFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id as any)}
                    className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? "bg-accent text-white border-transparent shadow-sm"
                        : "bg-white text-muted-foreground border-border hover:text-foreground hover:bg-surface/50"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                        active ? "bg-white text-accent" : "bg-surface text-muted-foreground"
                      }`}
                    >
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Leads List */}
            <div className="grid grid-cols-1 gap-5">
              {leads
                .filter((lead) => statusFilter === "all" || lead.status === statusFilter)
                .map((lead) => {
                  const isExpanded = expandedLeadIds[lead.id];
                  const messageText = lead.message || "";
                  const needsTruncation = messageText.length > 200;
                  const displayMessage = isExpanded || !needsTruncation
                    ? messageText
                    : `${messageText.slice(0, 200)}...`;

                  return (
                    <div
                      key={lead.id}
                      className="bg-white rounded-[20px] border border-border p-6 md:p-8 flex flex-col gap-6 hover:shadow-md transition-shadow"
                    >
                      {/* Top Row: Info & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg md:text-[20px] font-semibold tracking-tight text-foreground">
                              {lead.name}
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors bg-surface text-foreground border border-border font-mono">
                              {lead.method || "Text"}
                            </span>
                            {lead.status === "new" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                                New
                              </span>
                            )}
                            {lead.status === "read" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                Read
                              </span>
                            )}
                            {lead.status === "archived" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
                                Archived
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-muted-foreground">
                            Submitted on {new Date(lead.created_at).toLocaleString()}
                          </p>
                        </div>

                        {/* Status Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {lead.status === "new" ? (
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "read")}
                              className="btn-pill btn-secondary !h-9 !px-3 !text-[13px] flex items-center gap-1 cursor-pointer"
                              title="Mark as Read"
                            >
                              <Check size={14} /> Mark Read
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "new")}
                              className="btn-pill btn-secondary !h-9 !px-3 !text-[13px] flex items-center gap-1 cursor-pointer"
                              title="Mark as New"
                            >
                              Mark New
                            </button>
                          )}

                          {lead.status !== "archived" ? (
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "archived")}
                              className="btn-pill btn-secondary !h-9 !px-3 !text-[13px] flex items-center gap-1 cursor-pointer"
                              title="Archive Lead"
                            >
                              <Archive size={14} /> Archive
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, "read")}
                              className="btn-pill btn-secondary !h-9 !px-3 !text-[13px] flex items-center gap-1 cursor-pointer"
                              title="Restore Lead"
                            >
                              Restore
                            </button>
                          )}

                          <button
                            onClick={() => setDeleteLeadId(lead.id)}
                            className="btn-pill btn-secondary !h-9 !px-3 !text-[13px] !text-destructive hover:!bg-destructive/10 flex items-center gap-1 cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-surface/30 p-4 rounded-[12px] border border-border/50 text-[14px]">
                        <div className="space-y-1">
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Phone
                          </span>
                          <a href={`tel:${lead.phone}`} className="font-semibold text-accent hover:underline flex items-center gap-1">
                            <Phone size={13} className="shrink-0" /> {lead.phone}
                          </a>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Email
                          </span>
                          <a href={`mailto:${lead.email}`} className="font-semibold text-accent hover:underline flex items-center gap-1 break-all">
                            <Mail size={13} className="shrink-0" /> {lead.email}
                          </a>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Location & Service
                          </span>
                          <div className="flex flex-col text-foreground font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-muted-foreground shrink-0" /> {lead.city || "N/A"}
                            </span>
                            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
                              <Layers size={13} className="shrink-0" /> {lead.service || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            Property Size
                          </span>
                          <span className="font-medium text-foreground">
                            {lead.property_size || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Message Box */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <MessageSquare size={13} />
                          <span>Message</span>
                        </div>
                        <div className="text-[15px] leading-relaxed text-foreground bg-surface/50 p-4 rounded-[12px] border border-border/30 whitespace-pre-wrap">
                          {displayMessage}
                          {needsTruncation && (
                            <button
                              onClick={() => {
                                setExpandedLeadIds((prev) => ({
                                  ...prev,
                                  [lead.id]: !prev[lead.id],
                                }));
                              }}
                              className="ml-2 text-[13px] font-semibold text-accent hover:underline focus:outline-none cursor-pointer"
                            >
                              {isExpanded ? "Show less" : "Show more"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {leads.filter((lead) => statusFilter === "all" || lead.status === statusFilter).length === 0 && (
                <div className="text-center py-12 bg-white rounded-[20px] border border-dashed border-border p-8">
                  <AlertCircle className="mx-auto text-muted-foreground mb-3" size={32} />
                  <p className="text-muted-foreground">No leads found for this filter.</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "faqs" && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
              <div>
                <h1 className="h-display text-[32px] md:text-[44px]">FAQs Management</h1>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  Manage the frequently asked questions displayed on the public site.
                </p>
              </div>
              <button
                onClick={() => handleOpenFaqForm(null)}
                className="btn-pill btn-primary self-start md:self-auto cursor-pointer"
              >
                <Plus size={18} /> Add FAQ
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-[20px] border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-shadow"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-semibold text-accent bg-accent/5 px-2.5 py-0.5 rounded-full">
                        Order {faq.sort_order}
                      </span>
                      {!faq.is_active && (
                        <span className="text-[12px] font-semibold text-muted-foreground bg-surface px-2.5 py-0.5 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center border-t border-hairline/30 md:border-0 pt-4 md:pt-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleOpenFaqForm(faq)}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleConfirmDeleteFaq(faq.id, faq.question)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {faqs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[20px] border border-dashed border-border p-8">
                  <HelpCircle className="mx-auto text-muted-foreground mb-3" size={32} />
                  <p className="text-muted-foreground">No FAQs found. Click "Add FAQ" to get started.</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "testimonials" && (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6 mb-8">
              <div>
                <h1 className="h-display text-[32px] md:text-[44px]">Testimonials Management</h1>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  Manage customer testimonials shown in the quotes slider.
                </p>
              </div>
              <button
                onClick={() => handleOpenTestimonialForm(null)}
                className="btn-pill btn-primary self-start md:self-auto cursor-pointer"
              >
                <Plus size={18} /> Add Testimonial
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-[20px] border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-shadow"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-semibold text-accent bg-accent/5 px-2.5 py-0.5 rounded-full">
                        Order {t.sort_order}
                      </span>
                      {!t.is_active && (
                        <span className="text-[12px] font-semibold text-muted-foreground bg-surface px-2.5 py-0.5 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <blockquote className="text-base italic text-foreground font-medium">
                      “{t.text}”
                    </blockquote>
                    <cite className="block text-[14px] text-muted-foreground not-italic font-semibold font-mono">
                      — {t.who}
                    </cite>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center border-t border-hairline/30 md:border-0 pt-4 md:pt-0 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleOpenTestimonialForm(t)}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface transition-colors cursor-pointer"
                      title="Edit Testimonial"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleConfirmDeleteTestimonial(t.id, t.who)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors cursor-pointer"
                      title="Delete Testimonial"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[20px] border border-dashed border-border p-8">
                  <Quote className="mx-auto text-muted-foreground mb-3" size={32} />
                  <p className="text-muted-foreground">No testimonials found. Click "Add Testimonial" to get started.</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "settings" && (
          <>
            <div className="border-b border-border pb-6 mb-8">
              <h1 className="h-display text-[32px] md:text-[44px]">Site Settings</h1>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Manage owner bio, contact info, serving cities, and overall branding copy.
              </p>
            </div>

            <form onSubmit={handleSubmitSettings} className="bg-white rounded-[20px] border border-border p-6 md:p-8 space-y-6 max-w-4xl">
              {settingsValidationError && (
                <div className="p-4 text-[14px] text-destructive bg-destructive/10 border border-destructive/20 rounded-[10px] font-medium">
                  {settingsValidationError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="settings-brand" className={labelBase}>Brand Name*</label>
                  <input
                    id="settings-brand"
                    type="text"
                    required
                    value={settingsForm.brand}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brand: e.target.value })}
                    className={inputBase}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-owner" className={labelBase}>Owner Name*</label>
                  <input
                    id="settings-owner"
                    type="text"
                    required
                    value={settingsForm.owner}
                    onChange={(e) => setSettingsForm({ ...settingsForm, owner: e.target.value })}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="settings-phone" className={labelBase}>Phone Display Label*</label>
                  <input
                    id="settings-phone"
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className={inputBase}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-phone-href" className={labelBase}>Phone tel: Link*</label>
                  <input
                    id="settings-phone-href"
                    type="text"
                    required
                    value={settingsForm.phone_href}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone_href: e.target.value })}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="settings-email" className={labelBase}>Contact Email Address*</label>
                  <input
                    id="settings-email"
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className={inputBase}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-hours" className={labelBase}>Business Hours Label*</label>
                  <input
                    id="settings-hours"
                    type="text"
                    required
                    value={settingsForm.hours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                    className={inputBase}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-since" className={labelBase}>Since Line Tagline*</label>
                  <input
                    id="settings-since"
                    type="text"
                    required
                    value={settingsForm.since}
                    onChange={(e) => setSettingsForm({ ...settingsForm, since: e.target.value })}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-area-note" className={labelBase}>Service Area Disclaimer Note*</label>
                <textarea
                  id="settings-area-note"
                  required
                  rows={2}
                  value={settingsForm.area_note}
                  onChange={(e) => setSettingsForm({ ...settingsForm, area_note: e.target.value })}
                  className="block w-full rounded-[10px] bg-surface border border-transparent p-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all resize-none"
                />
              </div>

              <ListEditor
                label="Serving Cities (List)"
                items={settingsForm.cities}
                onChange={(items) => setSettingsForm({ ...settingsForm, cities: items })}
                placeholder="e.g. Naples"
              />

              <ListEditor
                label="About Page Bio (Paragraphs List)"
                items={settingsForm.about_bio}
                onChange={(items) => setSettingsForm({ ...settingsForm, about_bio: items })}
                placeholder="Add bio paragraph..."
              />

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={submittingSettings}
                  className="btn-pill btn-primary cursor-pointer disabled:opacity-50 min-w-[140px]"
                >
                  {submittingSettings ? "Saving Settings..." : "Save Settings"}
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-[24px] font-semibold tracking-tight">
              {isEdit ? `Edit Service: ${serviceToEdit?.name}` : "Create Service"}
            </DialogTitle>
            <DialogDescription className="text-[13px] md:text-[14px]">
              Fill out the details below. Required fields are marked.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            {validationError && (
              <div className="p-4 text-[14px] text-destructive bg-destructive/10 border border-destructive/20 rounded-[10px] font-medium">
                {validationError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="form-id" className={labelBase}>ID (slug)*</label>
                <input
                  id="form-id"
                  type="text"
                  disabled={isEdit}
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  onFocus={(e) => {
                    const target = e.target;
                    setTimeout(() => {
                      const len = target.value.length;
                      target.setSelectionRange(len, len);
                    }, 0);
                  }}
                  placeholder="e.g. pressure-washing"
                  required
                  className={`${inputBase} disabled:opacity-50 disabled:bg-surface`}
                />
                {!isEdit && (
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Must be unique, lowercase, numbers and hyphens only. E.g. <code>deep-cleaning</code>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-name" className={labelBase}>Name*</label>
                <input
                  id="form-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={(e) => {
                    const target = e.target;
                    setTimeout(() => {
                      const len = target.value.length;
                      target.setSelectionRange(len, len);
                    }, 0);
                  }}
                  placeholder="e.g. Deep Cleaning"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form-short" className={labelBase}>Short Description*</label>
              <textarea
                id="form-short"
                value={form.short}
                onChange={(e) => setForm({ ...form, short: e.target.value })}
                placeholder="A brief overview of the service displayed in lists..."
                required
                rows={2}
                className="block w-full rounded-[10px] bg-surface border border-transparent p-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="form-from-label" className={labelBase}>From Label*</label>
                <input
                  id="form-from-label"
                  type="text"
                  value={form.from_label}
                  onChange={(e) => setForm({ ...form, from_label: e.target.value })}
                  placeholder="e.g. From"
                  required
                  className={inputBase}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-price-from" className={labelBase}>Price From*</label>
                <input
                  id="form-price-from"
                  type="text"
                  value={form.price_from}
                  onChange={(e) => setForm({ ...form, price_from: e.target.value })}
                  placeholder="e.g. $140"
                  required
                  className={inputBase}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-price-unit" className={labelBase}>Price Unit*</label>
                <input
                  id="form-price-unit"
                  type="text"
                  value={form.price_unit}
                  onChange={(e) => setForm({ ...form, price_unit: e.target.value })}
                  placeholder="e.g. /visit or /hour"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="form-price-note" className={labelBase}>Price Note*</label>
                <input
                  id="form-price-note"
                  type="text"
                  value={form.price_note}
                  onChange={(e) => setForm({ ...form, price_note: e.target.value })}
                  placeholder="e.g. based on size & frequency"
                  required
                  className={inputBase}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-good-for" className={labelBase}>Good For*</label>
                <input
                  id="form-good-for"
                  type="text"
                  value={form.good_for}
                  onChange={(e) => setForm({ ...form, good_for: e.target.value })}
                  placeholder="e.g. busy homeowners, snowbirds"
                  required
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-surface/30 p-4 rounded-[12px] border border-border/50">
              <div className="space-y-1.5">
                <label htmlFor="form-sort-order" className={labelBase}>Sort Order*</label>
                <input
                  id="form-sort-order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  required
                  className={inputBase}
                />
              </div>

              <div className="flex items-center justify-between md:justify-center gap-3 pt-4 md:pt-0">
                <label htmlFor="form-featured" className="text-[14px] font-medium text-foreground cursor-pointer">Featured</label>
                <Switch
                  id="form-featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
              </div>

              <div className="flex items-center justify-between md:justify-center gap-3 pt-4 md:pt-0">
                <label htmlFor="form-is-active" className="text-[14px] font-medium text-foreground cursor-pointer">Active</label>
                <Switch
                  id="form-is-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form-image-url" className={labelBase}>Image URL (optional)</label>
              <input
                id="form-image-url"
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="e.g. https://res.cloudinary.com/..."
                className={inputBase}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to use default local assets. Cloudinary upload is coming later.
              </p>
            </div>

            <ListEditor
              label="Paragraphs (Detailed Description)"
              items={form.paragraphs}
              onChange={(items) => setForm({ ...form, paragraphs: items })}
              placeholder="Add detailed paragraph text..."
            />

            <ListEditor
              label="Includes (Checklist Items)"
              items={form.includes}
              onChange={(items) => setForm({ ...form, includes: items })}
              placeholder="Add included item..."
            />

            <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn-pill btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-pill btn-primary cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[20px] p-6 md:p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-foreground">
              Delete '{deleteName}'?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-muted-foreground space-y-3">
              <p>This removes it from the public site and cannot be undone.</p>
              {isSeededService && (
                <div className="p-3 text-[14px] text-destructive bg-destructive/10 border border-destructive/20 rounded-[10px] font-medium flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Warning: This is one of the seed services. <strong>Consider toggling Inactive instead.</strong>
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={deleting}
              className="btn-pill btn-secondary cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="btn-pill btn-primary !bg-destructive hover:!bg-destructive/80 text-white cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete service"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lead Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteLeadId} onOpenChange={(open) => !open && setDeleteLeadId(null)}>
        <AlertDialogContent className="rounded-[20px] p-6 md:p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-foreground">
              Delete this lead?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-muted-foreground">
              This removes it from the leads list and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={deletingLead}
              className="btn-pill btn-secondary cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteLead();
              }}
              disabled={deletingLead}
              className="btn-pill btn-primary !bg-destructive hover:!bg-destructive/80 text-white cursor-pointer disabled:opacity-50"
            >
              {deletingLead ? "Deleting..." : "Delete lead"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FAQ Add / Edit Dialog */}
      <Dialog open={isFaqFormOpen} onOpenChange={setIsFaqFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-[20px] p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-[24px] font-semibold tracking-tight">
              {faqToEdit ? "Edit FAQ" : "Create FAQ"}
            </DialogTitle>
            <DialogDescription className="text-[13px] md:text-[14px]">
              Add or update the FAQ details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFaq} className="space-y-5 py-4">
            {faqValidationError && (
              <div className="p-4 text-[14px] text-destructive bg-destructive/10 border border-destructive/20 rounded-[10px] font-medium">
                {faqValidationError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="faq-question" className={labelBase}>Question*</label>
              <input
                id="faq-question"
                type="text"
                required
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                className={inputBase}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="faq-answer" className={labelBase}>Answer*</label>
              <textarea
                id="faq-answer"
                required
                rows={4}
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                className="block w-full rounded-[10px] bg-surface border border-transparent p-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center bg-surface/30 p-4 rounded-[12px] border border-border/50">
              <div className="space-y-1.5">
                <label htmlFor="faq-sort-order" className={labelBase}>Sort Order*</label>
                <input
                  id="faq-sort-order"
                  type="number"
                  required
                  value={faqForm.sort_order}
                  onChange={(e) => setFaqForm({ ...faqForm, sort_order: parseInt(e.target.value) || 0 })}
                  className={inputBase}
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <label htmlFor="faq-is-active" className="text-[14px] font-medium text-foreground cursor-pointer">Active</label>
                <Switch
                  id="faq-is-active"
                  checked={faqForm.is_active}
                  onCheckedChange={(checked) => setFaqForm({ ...faqForm, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsFaqFormOpen(false)}
                className="btn-pill btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingFaq}
                className="btn-pill btn-primary cursor-pointer disabled:opacity-50"
              >
                {submittingFaq ? "Saving..." : "Save changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FAQ Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteFaqId} onOpenChange={(open) => !open && setDeleteFaqId(null)}>
        <AlertDialogContent className="rounded-[20px] p-6 md:p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-foreground">
              Delete FAQ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-muted-foreground">
              <p className="mb-2">Are you sure you want to delete the FAQ:</p>
              <strong className="block text-foreground bg-surface p-3 rounded-lg border italic">"{deleteFaqQuestion}"</strong>
              <p className="mt-2">This removes it from the public site and cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={deletingFaq}
              className="btn-pill btn-secondary cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFaq();
              }}
              disabled={deletingFaq}
              className="btn-pill btn-primary !bg-destructive hover:!bg-destructive/80 text-white cursor-pointer disabled:opacity-50"
            >
              {deletingFaq ? "Deleting..." : "Delete FAQ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Testimonial Add / Edit Dialog */}
      <Dialog open={isTestimonialFormOpen} onOpenChange={setIsTestimonialFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-[20px] p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-[24px] font-semibold tracking-tight">
              {testimonialToEdit ? "Edit Testimonial" : "Create Testimonial"}
            </DialogTitle>
            <DialogDescription className="text-[13px] md:text-[14px]">
              Add or update the testimonial details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTestimonial} className="space-y-5 py-4">
            {testimonialValidationError && (
              <div className="p-4 text-[14px] text-destructive bg-destructive/10 border border-destructive/20 rounded-[10px] font-medium">
                {testimonialValidationError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="testimonial-text" className={labelBase}>Text*</label>
              <textarea
                id="testimonial-text"
                required
                rows={4}
                value={testimonialForm.text}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                className="block w-full rounded-[10px] bg-surface border border-transparent p-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="testimonial-who" className={labelBase}>Who (Author/Location)*</label>
              <input
                id="testimonial-who"
                type="text"
                required
                value={testimonialForm.who}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, who: e.target.value })}
                className={inputBase}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center bg-surface/30 p-4 rounded-[12px] border border-border/50">
              <div className="space-y-1.5">
                <label htmlFor="testimonial-sort-order" className={labelBase}>Sort Order*</label>
                <input
                  id="testimonial-sort-order"
                  type="number"
                  required
                  value={testimonialForm.sort_order}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, sort_order: parseInt(e.target.value) || 0 })}
                  className={inputBase}
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <label htmlFor="testimonial-is-active" className="text-[14px] font-medium text-foreground cursor-pointer">Active</label>
                <Switch
                  id="testimonial-is-active"
                  checked={testimonialForm.is_active}
                  onCheckedChange={(checked) => setTestimonialForm({ ...testimonialForm, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsTestimonialFormOpen(false)}
                className="btn-pill btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingTestimonial}
                className="btn-pill btn-primary cursor-pointer disabled:opacity-50"
              >
                {submittingTestimonial ? "Saving..." : "Save changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Testimonial Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTestimonialId} onOpenChange={(open) => !open && setDeleteTestimonialId(null)}>
        <AlertDialogContent className="rounded-[20px] p-6 md:p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-semibold text-foreground">
              Delete Testimonial?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-muted-foreground">
              <p className="mb-2">Are you sure you want to delete the testimonial by:</p>
              <strong className="block text-foreground bg-surface p-3 rounded-lg border font-mono">"{deleteTestimonialWho}"</strong>
              <p className="mt-2">This removes it from the public site and cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={deletingTestimonial}
              className="btn-pill btn-secondary cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteTestimonial();
              }}
              disabled={deletingTestimonial}
              className="btn-pill btn-primary !bg-destructive hover:!bg-destructive/80 text-white cursor-pointer disabled:opacity-50"
            >
              {deletingTestimonial ? "Deleting..." : "Delete testimonial"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
