import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  listAllServicesAdmin,
  createService,
  updateService,
  deleteService,
} from "@/server/adminServices";
import { listLeads, updateLeadStatus, deleteLead, type DBLead } from "@/server/leads";
import type { DBService } from "@/lib/supabase.client";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Archive,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Layers,
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
    const [services, leads] = await Promise.all([
      listAllServicesAdmin(),
      listLeads(),
    ]);
    return { services, leads };
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
  const { services, leads } = Route.useLoaderData();
  const { session, user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  // Tab State
  const [tab, setTab] = useState<"services" | "leads">("services");

  // Lead filter & expanded states
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [expandedLeadIds, setExpandedLeadIds] = useState<Record<string, boolean>>({});

  // Lead delete alert states
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [deletingLead, setDeletingLead] = useState(false);

  // Dialog / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<DBService | null>(null);
  const [form, setForm] = useState<ServiceFormState>(defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete Alert States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!serviceToEdit;

  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  const handleUpdateLeadStatus = async (id: string, nextStatus: "new" | "read" | "archived") => {
    try {
      const res = await updateLeadStatus({ data: { id, status: nextStatus } });
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
      const res = await deleteLead({ data: deleteLeadId });
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
      const res = await deleteService({ data: deleteId });
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
          },
        });
      } else {
        res = await createService({ data: payload });
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
            
            {/* Tabs */}
            <nav className="flex items-center gap-4 border-l border-border pl-4">
              <button
                onClick={() => setTab("services")}
                className={`text-[14px] font-medium transition-colors cursor-pointer ${
                  tab === "services"
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setTab("leads")}
                className={`text-[14px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
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
            </nav>
          </div>
          <div className="flex items-center gap-4 sm:gap-8">
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
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="pt-24 pb-12 px-5 max-w-6xl mx-auto">
        {tab === "services" ? (
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
        ) : (
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
    </div>
  );
}
