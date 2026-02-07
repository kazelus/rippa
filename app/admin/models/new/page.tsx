"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/Button";
import RichTextEditor from "@/components/RichTextEditor";
import Link from "next/link";

// Add animation styles
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

export default function AddModelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    heroDescription: "",
    price: "",
    featured: false,
    visible: true,
    categoryId: "",
    heroImageId: "",
  });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  // Features for selected category
  const [categoryFeatures, setCategoryFeatures] = useState<Array<any>>([]);
  const [featureValues, setFeatureValues] = useState<Record<string, any>>({});
  // Parameters for selected category
  const [categoryParameters, setCategoryParameters] = useState<Array<any>>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    {},
  );
  const [images, setImages] = useState<
    Array<{ id?: string; url: string; alt: string }>
  >([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sections, setSections] = useState<
    Array<{ title: string; text: string; image?: { url: string; alt: string } }>
  >([{ title: "", text: "" }]);
  // Section image upload state (per section)
  const [sectionImageUploading, setSectionImageUploading] = useState<boolean[]>(
    [],
  );
  const [sectionTemplates, setSectionTemplates] = useState<
    Array<{ id: string; name: string; title: string; text: string }>
  >([]);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState<
    number | null
  >(null);
  const [savingTemplate, setSavingTemplate] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState("");
  // Handle section image upload
  const handleSectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSectionImageUploading((prev) => {
      const arr = [...prev];
      arr[idx] = true;
      return arr;
    });
    try {
      // Client-side validation: max 20MB
      if (file.size > 20 * 1024 * 1024) {
        setImageUploadError("Plik jest za duży. Maksymalnie 20MB na plik.");
        return;
      }
      const formDataImage = new FormData();
      formDataImage.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataImage,
      });
      if (!response.ok) throw new Error("Błąd podczas upload'u");
      const data = await response.json();
      setSections((secs) =>
        secs.map((s, i) =>
          i === idx
            ? { ...s, image: { url: data.url, alt: file.name.split(".")[0] } }
            : s,
        ),
      );
    } catch {}
    setSectionImageUploading((prev) => {
      const arr = [...prev];
      arr[idx] = false;
      return arr;
    });
  };

  const [downloads, setDownloads] = useState<
    Array<{ name: string; url: string; fileType: string; fileSize?: number }>
  >([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState("");
  const [fileDragActive, setFileDragActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Variant groups state
  type VariantOption = {
    name: string;
    priceModifier: number;
    isDefault: boolean;
    images: Array<{ url: string; alt: string; isHero?: boolean }>;
    parameterOverrides: Record<string, any>;
  };
  type VariantGroup = {
    name: string;
    options: VariantOption[];
  };
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [variantImageUploading, setVariantImageUploading] = useState<
    string | null
  >(null);

  // Accessories state (linked model IDs)
  const [linkedAccessoryIds, setLinkedAccessoryIds] = useState<string[]>([]);
  const [allModels, setAllModels] = useState<
    Array<{ id: string; name: string; imageUrl?: string | null }>
  >([]);
  const [accessorySearch, setAccessorySearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCategories();
      // Fetch all models for accessories picker
      fetch("/api/models?all=true")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setAllModels(
            (data || []).map((m: any) => ({
              id: m.id,
              name: m.name,
              imageUrl: m.images?.[0]?.url || null,
            })),
          );
        })
        .catch((err) => console.error("Error fetching models:", err));
    }
  }, [session]);

  // Fetch features when category changes
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        let res;
        if (!formData.categoryId) {
          // No category selected: fetch global features only
          res = await fetch(`/api/admin/features`);
        } else {
          res = await fetch(
            `/api/admin/features?categoryId=${formData.categoryId}`,
          );
        }
        if (!res.ok) return;
        const data = await res.json();
        // If no category selected, filter to global features (categoryId === null)
        const defs = !formData.categoryId
          ? (data || []).filter((d: any) => d.categoryId === null)
          : data || [];
        setCategoryFeatures(defs);
        // initialize feature values map
        const initValues: Record<string, any> = {};
        (defs || []).forEach((f: any) => {
          initValues[f.id] = f.type === "boolean" ? false : null;
        });
        setFeatureValues(initValues);
        return;
      } catch (err) {
        console.error("Error fetching features:", err);
        return;
      }
    };
    fetchFeatures();
  }, [formData.categoryId]);

  // Fetch parameters when category changes
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        let res;
        if (!formData.categoryId) {
          res = await fetch(`/api/admin/parameters`);
        } else {
          res = await fetch(
            `/api/admin/parameters?categoryId=${formData.categoryId}`,
          );
        }
        if (!res.ok) return;
        const data = await res.json();
        const defs = !formData.categoryId
          ? (data || []).filter((d: any) => d.categoryId === null)
          : data || [];
        setCategoryParameters(defs);
        const initValues: Record<string, any> = {};
        (defs || []).forEach((p: any) => {
          initValues[p.id] = p.type === "boolean" ? false : null;
        });
        setParameterValues(initValues);
        return;
      } catch (err) {
        console.error("Error fetching parameters:", err);
        return;
      }
    };
    fetchParameters();
  }, [formData.categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] flex items-center justify-center">
        <p className="text-white">Ładowanie...</p>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    // Prevent browser default behavior (opening file) for drag events
    if ("dataTransfer" in e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let files: File[] = [];
    if ("dataTransfer" in e) {
      files = Array.from(e.dataTransfer.files);
    } else {
      files = Array.from(e.target.files || []);
    }
    if (!files.length) return;
    setUploadingImage(true);
    setImageUploadError("");
    try {
      const uploadedImages: Array<{ url: string; alt: string }> = [];
      for (const file of files) {
        // Client-side validation: max 20MB
        if (file.size > 20 * 1024 * 1024) {
          setImageUploadError("Plik jest za duży. Maksymalnie 20MB na plik.");
          continue;
        }
        const formDataImage = new FormData();
        formDataImage.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataImage,
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Błąd podczas upload'u");
        }
        const data = await response.json();
        uploadedImages.push({ url: data.url, alt: file.name.split(".")[0] });
      }
      setImages((prev) => [...prev, ...uploadedImages]);
      if ("target" in e) (e.target as HTMLInputElement).value = "";
    } catch (err: any) {
      setImageUploadError(err.message || "Błąd podczas upload'u zdjęcia");
    } finally {
      setUploadingImage(false);
      setDragActive(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setFileDragActive(true);
    } else if (e.type === "dragleave") {
      setFileDragActive(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    if ("dataTransfer" in e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let file: File | undefined;
    if ("dataTransfer" in e) {
      file = e.dataTransfer.files?.[0];
    } else {
      file = e.target.files?.[0];
    }

    if (!file) return;

    setUploadingFile(true);
    setFileUploadError("");
    setFileDragActive(false);

    try {
      // Client-side validation: max 20MB
      if (file.size > 20 * 1024 * 1024) {
        setFileUploadError("Plik jest za duży. Maksymalnie 20MB na plik.");
        (e.target as HTMLInputElement).value = "";
        return;
      }
      const formDataFile = new FormData();
      formDataFile.append("file", file);
      formDataFile.append("fileName", file.name);
      // modelId will be associated when saving the model

      const response = await fetch("/api/downloads", {
        method: "POST",
        body: formDataFile,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd podczas upload'u");
      }

      const data = await response.json();
      setDownloads((prev) => [
        ...prev,
        {
          name: data.name,
          url: data.url,
          fileType: data.fileType,
          fileSize: data.fileSize,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setFileUploadError(err.message || "Wystąpił błąd podczas przesyłania.");
    } finally {
      setUploadingFile(false);
      // Reset input
      (e.target as HTMLInputElement).value = "";
    }
  };

  const handleRemoveDownload = (index: number) => {
    setDownloads((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      if (images.length === 0)
        throw new Error("Proszę dodać przynajmniej jedno zdjęcie");

      const heroImageUrl = formData.heroImageId
        ? images[parseInt(formData.heroImageId)]?.url
        : images[0]?.url;

      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          heroDescription: formData.heroDescription,
          price: formData.price,
          featured: formData.featured,
          visible: formData.visible,
          categoryId: formData.categoryId,
          heroImageId: heroImageUrl,
          images,
          sections: sections.map((s) => ({
            title: s.title,
            text: s.text,
            image: s.image,
          })),
          downloads,
          features: Object.keys(featureValues).map((k) => ({
            featureId: k,
            value: featureValues[k],
          })),
          parameters: Object.keys(parameterValues).map((k) => ({
            parameterId: k,
            value: parameterValues[k],
          })),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Błąd podczas tworzenia modelu");
      }

      const createdModel = await response.json();
      const newModelId = createdModel.id;

      // Save variants if any
      if (variantGroups.some((g) => g.name.trim())) {
        const varRes = await fetch(`/api/admin/models/${newModelId}/variants`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groups: variantGroups.filter((g) => g.name.trim()),
          }),
        });
        if (!varRes.ok) {
          console.error("Error saving variants:", await varRes.text());
        }
      }

      // Save accessories links if any
      if (linkedAccessoryIds.length > 0) {
        const accRes = await fetch("/api/admin/accessories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: newModelId,
            accessoryModelIds: linkedAccessoryIds,
          }),
        });
        if (!accRes.ok) {
          console.error("Error saving accessories:", await accRes.text());
        }
      }

      setSuccess("Model został pomyślnie dodany!");
      setFormData({
        name: "",
        description: "",
        heroDescription: "",
        price: "",
        featured: false,
        visible: true,
        categoryId: "",
        heroImageId: "",
      });
      setImages([]);
      setSections([{ title: "", text: "" }]);
      setDownloads([]);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Błąd podczas dodawania modelu");
    } finally {
      setIsLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, name: "Podstawowe" },
    { id: 1, name: "Cechy & Parametry" },
    { id: 2, name: "Zdjęcia" },
    { id: 3, name: "Sekcje" },
    { id: 4, name: "Pliki" },
    { id: 5, name: "Warianty" },
    { id: 6, name: "Akcesoria" },
  ];

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setSections(newSections);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    setSections(newSections);
  };

  // Fetch section templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/admin/section-templates");
        if (res.ok) {
          const data = await res.json();
          setSectionTemplates(data);
        }
      } catch (err) {
        console.error("Error fetching section templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  const loadSectionTemplate = (templateId: string, sectionIdx: number) => {
    const template = sectionTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setSections((secs) =>
      secs.map((s, i) =>
        i === sectionIdx
          ? { ...s, title: template.title || "", text: template.text || "" }
          : s,
      ),
    );
    setTemplateDropdownOpen(null);
  };

  const saveSectionAsTemplate = async (sectionIdx: number) => {
    const section = sections[sectionIdx];
    if (!templateName.trim()) return;
    setSavingTemplate(sectionIdx);
    try {
      const res = await fetch("/api/admin/section-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName.trim(),
          title: section.title,
          text: section.text,
        }),
      });
      if (res.ok) {
        const newTemplate = await res.json();
        setSectionTemplates((prev) => [newTemplate, ...prev]);
        setTemplateName("");
        setSavingTemplate(null);
      }
    } catch (err) {
      console.error("Error saving template:", err);
      setSavingTemplate(null);
    }
  };

  const deleteSectionTemplate = async (templateId: string) => {
    try {
      const res = await fetch(`/api/admin/section-templates/${templateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSectionTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
        <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30 sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Dodaj nowy model</h1>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="text-sm">
                ← Powrót
              </Button>
            </Link>
          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400">{success}</p>
            </div>
          )}

          <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-[#1b3caf]/30 bg-[#151a24]">
              {tabs.map((tab) => {
                // SVG Icons for each tab
                const getIcon = (id: number) => {
                  switch (id) {
                    case 0: // Podstawowe
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      );
                    case 1: // Cechy & Parametry
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      );
                    case 2: // Zdjęcia
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      );
                    case 3: // Sekcje
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      );
                    case 4: // Pliki
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      );
                    case 5: // Warianty
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                      );
                    case 6: // Akcesoria
                      return (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      );
                    default:
                      return null;
                  }
                };

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "text-white bg-[#1a1f2e] border-b-2 border-[#1b3caf]"
                        : "text-[#6b7280] hover:text-white hover:bg-[#1a1f2e]/50"
                    }`}
                  >
                    {getIcon(tab.id)}
                    {tab.name}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Tab Content */}
              <div className="space-y-6">
                {/* Tab 0: Podstawowe */}
                {activeTab === 0 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Nazwa modelu *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Rippa RE25"
                        className="w-full px-5 py-4 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white text-lg placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-2 focus:ring-[#1b3caf]/30 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Opis Hero (krótki, na górę strony)
                      </label>
                      <textarea
                        name="heroDescription"
                        value={formData.heroDescription}
                        onChange={handleChange}
                        placeholder="Krótki opis widoczny w sekcji Hero..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white text-base placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-2 focus:ring-[#1b3caf]/30 transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Opis (szczegółowy)
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Opis techniki mini-kopiarki..."
                        rows={7}
                        className="w-full px-5 py-4 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white text-base placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-2 focus:ring-[#1b3caf]/30 transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Kategoria
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white text-base focus:outline-none focus:border-[#1b3caf] focus:ring-2 focus:ring-[#1b3caf]/30 transition"
                      >
                        <option value="">Bez kategorii</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Cena *
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="np. Od 65 000 PLN netto"
                        className="w-full px-5 py-4 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white text-lg placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-2 focus:ring-[#1b3caf]/30 transition"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#242d3d] rounded-lg border border-[#1b3caf]/20">
                      <input
                        type="checkbox"
                        name="featured"
                        id="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-[#1b3caf]/30 bg-[#151a24] cursor-pointer accent-[#1b3caf]"
                      />
                      <label
                        htmlFor="featured"
                        className="text-sm text-white cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-lg">⭐</span>
                        Oznacz jako wyróżniony (bestseller)
                      </label>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-[#242d3d] rounded-lg border border-[#1b3caf]/20">
                      <input
                        type="checkbox"
                        name="visible"
                        id="visible"
                        checked={formData.visible}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-[#1b3caf]/30 bg-[#151a24] cursor-pointer accent-[#1b3caf]"
                      />
                      <label
                        htmlFor="visible"
                        className="text-sm text-white cursor-pointer flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Widoczny na stronie sklepu
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab 1: Cechy & Parametry */}
                {activeTab === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Dynamic category features */}
                    {categoryFeatures.length > 0 && (
                      <div className="p-5 bg-[#242d3d] rounded-lg border border-[#1b3caf]/20">
                        <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="text-lg">✨</span>
                          Dodatkowe cechy kategorii
                        </h4>
                        <div className="space-y-4">
                          {categoryFeatures.map((f) => (
                            <div
                              key={f.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg"
                            >
                              <label className="sm:w-1/3 text-sm font-medium text-white">
                                {f.label}
                              </label>
                              <div className="flex-1">
                                {f.type === "boolean" && (
                                  <input
                                    type="checkbox"
                                    checked={!!featureValues[f.id]}
                                    onChange={(e) =>
                                      setFeatureValues((prev) => ({
                                        ...prev,
                                        [f.id]: e.target.checked,
                                      }))
                                    }
                                    className="w-5 h-5 accent-[#1b3caf]"
                                  />
                                )}
                                {f.type === "number" && (
                                  <input
                                    type="number"
                                    value={featureValues[f.id] ?? ""}
                                    onChange={(e) =>
                                      setFeatureValues((prev) => ({
                                        ...prev,
                                        [f.id]: e.target.value
                                          ? Number(e.target.value)
                                          : null,
                                      }))
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                  />
                                )}
                                {f.type === "date" && (
                                  <input
                                    type="date"
                                    value={featureValues[f.id] ?? ""}
                                    onChange={(e) =>
                                      setFeatureValues((prev) => ({
                                        ...prev,
                                        [f.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                  />
                                )}
                                {f.type === "enum" && (
                                  <select
                                    value={featureValues[f.id] ?? ""}
                                    onChange={(e) =>
                                      setFeatureValues((prev) => ({
                                        ...prev,
                                        [f.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                  >
                                    <option value="">Wybierz</option>
                                    {(f.options
                                      ? JSON.parse(f.options)
                                      : []
                                    ).map((opt: any, i: number) => (
                                      <option key={i} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {(!f.type || f.type === "text") && (
                                  <input
                                    type="text"
                                    value={featureValues[f.id] ?? ""}
                                    onChange={(e) =>
                                      setFeatureValues((prev) => ({
                                        ...prev,
                                        [f.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dynamic category parameters */}
                    {categoryParameters.length > 0 && (
                      <div className="p-5 bg-[#242d3d] rounded-lg border border-[#1b3caf]/20">
                        <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Parametry techniczne
                        </h4>
                        <div className="space-y-6">
                          {/* Group parameters by group field */}
                          {(() => {
                            const grouped = categoryParameters.reduce(
                              (acc: any, p: any) => {
                                const groupName = p.group || "Ogólne";
                                if (!acc[groupName]) acc[groupName] = [];
                                acc[groupName].push(p);
                                return acc;
                              },
                              {},
                            );

                            return Object.entries(grouped).map(
                              ([groupName, params]: [string, any]) => (
                                <div key={groupName} className="space-y-3">
                                  <h5 className="text-sm font-semibold text-[#1b3caf] uppercase tracking-wider border-b border-[#1b3caf]/30 pb-2">
                                    {groupName}
                                  </h5>
                                  <div className="space-y-3">
                                    {params.map((p: any) => (
                                      <div
                                        key={p.id}
                                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#1a1f2e] rounded-lg"
                                      >
                                        <label className="sm:w-1/3 text-sm font-medium text-white">
                                          {p.label}
                                          {p.unit && (
                                            <span className="text-[#6b7280] ml-1">
                                              ({p.unit})
                                            </span>
                                          )}
                                        </label>
                                        <div className="flex-1">
                                          {p.type === "boolean" && (
                                            <input
                                              type="checkbox"
                                              checked={!!parameterValues[p.id]}
                                              onChange={(e) =>
                                                setParameterValues((prev) => ({
                                                  ...prev,
                                                  [p.id]: e.target.checked,
                                                }))
                                              }
                                              className="w-5 h-5 accent-[#1b3caf]"
                                            />
                                          )}
                                          {p.type === "number" && (
                                            <input
                                              type="number"
                                              value={
                                                parameterValues[p.id] ?? ""
                                              }
                                              onChange={(e) =>
                                                setParameterValues((prev) => ({
                                                  ...prev,
                                                  [p.id]: e.target.value
                                                    ? Number(e.target.value)
                                                    : null,
                                                }))
                                              }
                                              placeholder={
                                                p.unit
                                                  ? `Wartość w ${p.unit}`
                                                  : ""
                                              }
                                              className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                            />
                                          )}
                                          {p.type === "enum" && (
                                            <select
                                              value={
                                                parameterValues[p.id] ?? ""
                                              }
                                              onChange={(e) =>
                                                setParameterValues((prev) => ({
                                                  ...prev,
                                                  [p.id]: e.target.value,
                                                }))
                                              }
                                              className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                            >
                                              <option value="">Wybierz</option>
                                              {(p.options
                                                ? JSON.parse(p.options)
                                                : []
                                              ).map((opt: any, i: number) => (
                                                <option key={i} value={opt}>
                                                  {opt}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                          {(!p.type || p.type === "text") && (
                                            <input
                                              type="text"
                                              value={
                                                parameterValues[p.id] ?? ""
                                              }
                                              onChange={(e) =>
                                                setParameterValues((prev) => ({
                                                  ...prev,
                                                  [p.id]: e.target.value,
                                                }))
                                              }
                                              placeholder={
                                                p.unit
                                                  ? `Wartość w ${p.unit}`
                                                  : ""
                                              }
                                              className="w-full px-4 py-2 rounded-lg bg-[#151a24] border border-[#1b3caf]/20 text-white"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ),
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {categoryFeatures.length === 0 &&
                      categoryParameters.length === 0 && (
                        <div className="text-center py-12 text-[#6b7280]">
                          <p className="text-lg">
                            Brak dodatkowych cech lub parametrów
                          </p>
                          <p className="text-sm mt-2">
                            Wybierz kategorię, aby wyświetlić powiązane cechy i
                            parametry
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Tab 2: Zdjęcia */}
                {activeTab === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Zdjęcia modelu *
                      </label>
                      {imageUploadError && (
                        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                          <p className="text-red-400 text-sm">
                            {imageUploadError}
                          </p>
                        </div>
                      )}
                      <div
                        className={`mb-6 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition ${dragActive ? "border-[#1b3caf] bg-[#1b3caf]/10" : "border-[#1b3caf]/30 bg-[#242d3d] hover:bg-[#242d3d]/70"}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleImageUpload}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg
                          width="32"
                          height="32"
                          fill="none"
                          viewBox="0 0 32 32"
                          className="mb-2 text-[#1b3caf]"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 22V10m0 0l-4 4m4-4l4 4"
                          />
                          <rect
                            x="4"
                            y="4"
                            width="24"
                            height="24"
                            rx="6"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        <span className="text-white text-sm">
                          Przeciągnij zdjęcia tutaj lub kliknij (możesz dodać
                          wiele)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </div>
                      {images.length > 0 && (
                        <div>
                          <div className="mb-4 pb-4 border-b border-white/10">
                            <label className="block text-sm font-medium text-white mb-3">
                              Wybierz zdjęcie do Hero sekcji
                            </label>
                            <select
                              value={formData.heroImageId}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  heroImageId: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white focus:outline-none focus:border-[#1b3caf]"
                            >
                              <option value="">
                                Brak (użyj pierwsze zdjęcie)
                              </option>
                              {images.map((image, index) => (
                                <option key={index} value={String(index)}>
                                  Zdjęcie {index + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {images.map((image, index) => (
                              <div
                                key={index}
                                className={`relative bg-[#242d3d] border-2 rounded-lg overflow-hidden group transition ${
                                  String(index) === formData.heroImageId
                                    ? "border-[#1b3caf]"
                                    : "border-[#1b3caf]/30 hover:border-[#1b3caf]/60"
                                }`}
                              >
                                <img
                                  src={image.url}
                                  alt={image.alt}
                                  className="w-full h-32 object-cover"
                                />
                                {String(index) === formData.heroImageId && (
                                  <div className="absolute top-1 right-1 bg-[#1b3caf] text-white text-xs px-2 py-1 rounded">
                                    Hero
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  <span className="text-white text-sm font-medium">
                                    Usuń
                                  </span>
                                </button>
                                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                  {image.alt}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-[#6b7280]">
                        {images.length > 0
                          ? `Dodano ${images.length} zdjęć`
                          : "Dodaj przynajmniej jedno zdjęcie"}{" "}
                        • Max 20MB na plik
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 3: Sekcje */}
                {activeTab === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Sekcje opisów produktu
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="bg-gradient-to-r from-[#1b3caf] to-[#174a8c] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:scale-105 transition flex items-center gap-2"
                          onClick={() =>
                            setSections((secs) => [
                              ...secs,
                              { title: "", text: "" },
                            ])
                          }
                        >
                          <span>➕</span> Dodaj sekcję
                        </button>
                      </div>
                    </div>

                    {/* Szablony sekcji - zarządzanie */}
                    {sectionTemplates.length > 0 && (
                      <div className="p-4 rounded-xl bg-[#1a1f2e] border border-[#1b3caf]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#b0b0b0] flex items-center gap-2">
                            📋 Zapisane szablony ({sectionTemplates.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sectionTemplates.map((tpl) => (
                            <div
                              key={tpl.id}
                              className="flex items-center gap-1 bg-[#242d3d] rounded-lg px-3 py-1.5 text-sm"
                            >
                              <span className="text-white">{tpl.name}</span>
                              <button
                                type="button"
                                onClick={() => deleteSectionTemplate(tpl.id)}
                                className="text-red-400 hover:text-red-300 ml-1 p-0.5"
                                title="Usuń szablon"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sections.map((section, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-[#242d3d] border border-[#1b3caf]/20 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-[#1b3caf]">
                            Sekcja #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Template dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setTemplateDropdownOpen(
                                    templateDropdownOpen === idx ? null : idx,
                                  )
                                }
                                className="p-2 rounded-lg text-white bg-[#1b3caf]/30 hover:bg-[#1b3caf]/50 transition"
                                title="Szablony sekcji"
                              >
                                <span className="text-lg">📋</span>
                              </button>
                              {templateDropdownOpen === idx && (
                                <div className="absolute right-0 top-full mt-1 w-72 bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl shadow-2xl z-50 overflow-hidden">
                                  <div className="p-3 border-b border-[#1b3caf]/20">
                                    <p className="text-xs font-semibold text-[#b0b0b0] mb-2">
                                      Załaduj szablon:
                                    </p>
                                    {sectionTemplates.length === 0 ? (
                                      <p className="text-xs text-[#6b7280]">
                                        Brak zapisanych szablonów
                                      </p>
                                    ) : (
                                      <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {sectionTemplates.map((tpl) => (
                                          <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() =>
                                              loadSectionTemplate(tpl.id, idx)
                                            }
                                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-[#1b3caf]/30 transition flex items-center justify-between"
                                          >
                                            <span>{tpl.name}</span>
                                            <span className="text-xs text-[#6b7280]">
                                              {tpl.title
                                                ? tpl.title.slice(0, 20)
                                                : "—"}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <p className="text-xs font-semibold text-[#b0b0b0] mb-2">
                                      Zapisz jako szablon:
                                    </p>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Nazwa szablonu..."
                                        value={
                                          savingTemplate === idx
                                            ? templateName
                                            : ""
                                        }
                                        onChange={(e) => {
                                          setSavingTemplate(idx);
                                          setTemplateName(e.target.value);
                                        }}
                                        onFocus={() => setSavingTemplate(idx)}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          saveSectionAsTemplate(idx)
                                        }
                                        disabled={
                                          !templateName.trim() ||
                                          savingTemplate !== idx
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium disabled:opacity-50 transition"
                                      >
                                        💾
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => moveSectionUp(idx)}
                              disabled={idx === 0}
                              className={`p-2 rounded-lg transition ${
                                idx === 0
                                  ? "text-[#6b7280] cursor-not-allowed opacity-50"
                                  : "text-white bg-[#1b3caf]/30 hover:bg-[#1b3caf]/50"
                              }`}
                              title="Przesuń w górę"
                            >
                              <span className="text-lg">⬆️</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSectionDown(idx)}
                              disabled={idx === sections.length - 1}
                              className={`p-2 rounded-lg transition ${
                                idx === sections.length - 1
                                  ? "text-[#6b7280] cursor-not-allowed opacity-50"
                                  : "text-white bg-[#1b3caf]/30 hover:bg-[#1b3caf]/50"
                              }`}
                              title="Przesuń w dół"
                            >
                              <span className="text-lg">⬇️</span>
                            </button>
                            {sections.length > 1 && (
                              <button
                                type="button"
                                className="p-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition"
                                onClick={() =>
                                  setSections((secs) =>
                                    secs.filter((_, i) => i !== idx),
                                  )
                                }
                                title="Usuń sekcję"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Nagłówek sekcji"
                          value={section.title}
                          onChange={(e) =>
                            setSections((secs) =>
                              secs.map((s, i) =>
                                i === idx ? { ...s, title: e.target.value } : s,
                              ),
                            )
                          }
                          className="w-full px-4 py-3 rounded-lg bg-[#1a1f2e] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] font-medium"
                        />
                        <RichTextEditor
                          value={section.text}
                          onChange={(val) =>
                            setSections((secs) =>
                              secs.map((s, i) =>
                                i === idx ? { ...s, text: val } : s,
                              ),
                            )
                          }
                          placeholder="Opis sekcji..."
                        />

                        <div className="flex gap-3 items-center pt-2">
                          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1b3caf]/20 hover:bg-[#1b3caf]/30 text-white text-sm transition">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>
                              {section.image
                                ? "Zmień zdjęcie"
                                : "Dodaj zdjęcie"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSectionImageUpload(e, idx)}
                              className="hidden"
                              disabled={sectionImageUploading[idx]}
                            />
                          </label>
                          {section.image && (
                            <div className="flex items-center gap-2">
                              <img
                                src={section.image.url}
                                alt={section.image.alt || "Sekcja"}
                                className="h-16 w-auto rounded-lg shadow-lg border-2 border-[#1b3caf]/30"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setSections((secs) =>
                                    secs.map((s, i) =>
                                      i === idx
                                        ? { ...s, image: undefined }
                                        : s,
                                    ),
                                  )
                                }
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Usuń zdjęcie"
                              >
                                ❌
                              </button>
                            </div>
                          )}
                          {sectionImageUploading[idx] && (
                            <span className="text-[#1b3caf] text-sm">
                              Przesyłanie...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 4: Pliki */}
                {activeTab === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Pliki do pobrania
                    </h3>

                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                        fileDragActive
                          ? "border-[#1b3caf] bg-[#1b3caf]/10 scale-[1.02]"
                          : uploadingFile
                            ? "border-[#1b3caf] bg-[#1b3caf]/10"
                            : "border-[#1b3caf]/30 hover:border-[#1b3caf]/60 bg-[#242d3d]/50 hover:bg-[#242d3d]/70"
                      }`}
                      onClick={() =>
                        document.getElementById("file-upload-input")?.click()
                      }
                      onDragEnter={handleFileDrag}
                      onDragOver={handleFileDrag}
                      onDragLeave={handleFileDrag}
                      onDrop={handleFileUpload}
                    >
                      <input
                        id="file-upload-input"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />

                      {uploadingFile ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 border-4 border-[#1b3caf] border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-[#1b3caf] font-medium">
                            Przesyłanie...
                          </p>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-16 h-16 mx-auto mb-4 text-[#1b3caf]/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-base text-white font-medium mb-1">
                            Przeciągnij plik tutaj lub kliknij
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            PDF, DOC, XLS i inne • Maksymalnie 20MB
                          </p>
                        </>
                      )}
                    </div>

                    {fileUploadError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="text-red-400 text-sm">
                          {fileUploadError}
                        </p>
                      </div>
                    )}

                    {downloads.length > 0 && (
                      <div className="space-y-3">
                        {downloads.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-lg bg-[#242d3d] border border-[#1b3caf]/20 hover:border-[#1b3caf]/40 transition group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                              <div className="bg-[#1b3caf]/20 p-3 rounded-lg flex-shrink-0">
                                <svg
                                  className="w-6 h-6 text-[#1b3caf]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-semibold text-[#1b3caf] uppercase px-2 py-0.5 bg-[#1b3caf]/10 rounded">
                                    {file.fileType}
                                  </span>
                                  <span className="text-xs text-[#6b7280]">
                                    {file.fileSize
                                      ? (file.fileSize / 1024 / 1024).toFixed(2)
                                      : "?"}{" "}
                                    MB
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDownload(idx)}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                              title="Usuń plik"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {downloads.length === 0 && !uploadingFile && (
                      <div className="text-center py-12 text-[#6b7280] bg-[#242d3d]/30 rounded-lg border border-[#1b3caf]/10">
                        <svg
                          className="w-16 h-16 mx-auto mb-3 text-[#6b7280]/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-base font-medium">
                          Brak plików do pobrania
                        </p>
                        <p className="text-sm mt-1">
                          Dodaj dokumenty, specyfikacje lub inne pliki
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tab 5: Warianty */}
              {activeTab === 5 && (
                <div className="space-y-6 animate-fadeIn p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Grupy wariantów
                      </h3>
                      <p className="text-sm text-[#6b7280] mt-1">
                        Definiuj opcje konfiguracji, np. Kabina, Silnik. Każda
                        grupa może mieć wiele opcji z własnymi zdjęciami i
                        cenami.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setVariantGroups((prev) => [
                          ...prev,
                          {
                            name: "",
                            options: [
                              {
                                name: "",
                                priceModifier: 0,
                                isDefault: true,
                                images: [],
                                parameterOverrides: {},
                              },
                            ],
                          },
                        ])
                      }
                      className="px-4 py-2 bg-[#1b3caf] text-white text-sm rounded-lg hover:bg-[#1b3caf]/80 transition flex-shrink-0"
                    >
                      + Dodaj grupę
                    </button>
                  </div>

                  {variantGroups.length === 0 && (
                    <div className="text-center py-16 text-[#6b7280] bg-[#242d3d]/30 rounded-lg border border-[#1b3caf]/10">
                      <svg
                        className="w-16 h-16 mx-auto mb-3 text-[#6b7280]/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      <p className="text-base font-medium">Brak wariantów</p>
                      <p className="text-sm mt-1">
                        Dodaj grupy wariantów, np. Kabina, Silnik
                      </p>
                    </div>
                  )}

                  {variantGroups.map((group, gi) => (
                    <div
                      key={gi}
                      className="bg-[#242d3d] border border-[#1b3caf]/20 rounded-xl p-6 space-y-5"
                    >
                      {/* Group header */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-[#8b92a9] mb-1">
                            Nazwa grupy wariantów
                          </label>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setVariantGroups((prev) =>
                                prev.map((g, i) =>
                                  i === gi ? { ...g, name: val } : g,
                                ),
                              );
                            }}
                            placeholder="np. Kabina, Silnik, Układ hydrauliczny..."
                            className="w-full px-4 py-2.5 bg-[#151a24] border border-[#1b3caf]/30 rounded-lg text-white focus:ring-2 focus:ring-[#1b3caf] focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setVariantGroups((prev) =>
                              prev.filter((_, i) => i !== gi),
                            )
                          }
                          className="mt-5 text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition"
                          title="Usuń grupę"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Options */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-[#8b92a9]">
                            Opcje wariantu
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setVariantGroups((prev) =>
                                prev.map((g, i) =>
                                  i === gi
                                    ? {
                                        ...g,
                                        options: [
                                          ...g.options,
                                          {
                                            name: "",
                                            priceModifier: 0,
                                            isDefault: false,
                                            images: [],
                                            parameterOverrides: {},
                                          },
                                        ],
                                      }
                                    : g,
                                ),
                              );
                            }}
                            className="text-xs text-[#1b3caf] hover:text-[#0f9fdf] transition"
                          >
                            + Dodaj opcję
                          </button>
                        </div>

                        {group.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className="bg-[#151a24] border border-[#1b3caf]/10 rounded-lg p-4 space-y-4"
                          >
                            {/* Option name + price + delete */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setVariantGroups((prev) =>
                                      prev.map((g, i) =>
                                        i === gi
                                          ? {
                                              ...g,
                                              options: g.options.map((o, j) =>
                                                j === oi
                                                  ? { ...o, name: val }
                                                  : o,
                                              ),
                                            }
                                          : g,
                                      ),
                                    );
                                  }}
                                  placeholder={`Opcja ${oi + 1}, np. "${group.name || "..."} podstawowa"`}
                                  className="w-full px-3 py-2 bg-[#0f1419] border border-[#1b3caf]/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#1b3caf] focus:border-transparent"
                                />
                              </div>
                              <div className="w-36">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={opt.priceModifier}
                                    onChange={(e) => {
                                      const val =
                                        parseFloat(e.target.value) || 0;
                                      setVariantGroups((prev) =>
                                        prev.map((g, i) =>
                                          i === gi
                                            ? {
                                                ...g,
                                                options: g.options.map(
                                                  (o, j) =>
                                                    j === oi
                                                      ? {
                                                          ...o,
                                                          priceModifier: val,
                                                        }
                                                      : o,
                                                ),
                                              }
                                            : g,
                                        ),
                                      );
                                    }}
                                    className="w-full px-3 py-2 bg-[#0f1419] border border-[#1b3caf]/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#1b3caf] focus:border-transparent"
                                    placeholder="0"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-xs">
                                    PLN
                                  </span>
                                </div>
                              </div>
                              <label
                                className="flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                                title="Opcja domyślna"
                              >
                                <input
                                  type="radio"
                                  name={`default-${gi}`}
                                  checked={opt.isDefault}
                                  onChange={() => {
                                    setVariantGroups((prev) =>
                                      prev.map((g, i) =>
                                        i === gi
                                          ? {
                                              ...g,
                                              options: g.options.map(
                                                (o, j) => ({
                                                  ...o,
                                                  isDefault: j === oi,
                                                }),
                                              ),
                                            }
                                          : g,
                                      ),
                                    );
                                  }}
                                  className="accent-[#1b3caf]"
                                />
                                <span className="text-xs text-[#8b92a9]">
                                  Domyślna
                                </span>
                              </label>
                              {group.options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVariantGroups((prev) =>
                                      prev.map((g, i) =>
                                        i === gi
                                          ? {
                                              ...g,
                                              options: g.options.filter(
                                                (_, j) => j !== oi,
                                              ),
                                            }
                                          : g,
                                      ),
                                    );
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-400/10 rounded transition flex-shrink-0"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Option images */}
                            <div>
                              <label className="block text-xs font-medium text-[#8b92a9] mb-2">
                                Zdjęcia tej opcji (podmienią galerię i hero gdy
                                wybrana)
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {opt.images.map((img, ii) => (
                                  <div
                                    key={ii}
                                    className="relative w-20 h-20 group/img"
                                  >
                                    <img
                                      src={img.url}
                                      alt={img.alt}
                                      className={`w-full h-full object-cover rounded-lg border-2 ${img.isHero ? "border-[#1b3caf]" : "border-white/10"}`}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition rounded-lg flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        title="Ustaw jako Hero"
                                        onClick={() => {
                                          setVariantGroups((prev) =>
                                            prev.map((g, i) =>
                                              i === gi
                                                ? {
                                                    ...g,
                                                    options: g.options.map(
                                                      (o, j) =>
                                                        j === oi
                                                          ? {
                                                              ...o,
                                                              images:
                                                                o.images.map(
                                                                  (im, k) => ({
                                                                    ...im,
                                                                    isHero:
                                                                      k === ii,
                                                                  }),
                                                                ),
                                                            }
                                                          : o,
                                                    ),
                                                  }
                                                : g,
                                            ),
                                          );
                                        }}
                                        className={`p-1 rounded ${img.isHero ? "text-[#1b3caf]" : "text-white hover:text-[#1b3caf]"}`}
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                          />
                                        </svg>
                                      </button>
                                      <button
                                        type="button"
                                        title="Usuń"
                                        onClick={() => {
                                          setVariantGroups((prev) =>
                                            prev.map((g, i) =>
                                              i === gi
                                                ? {
                                                    ...g,
                                                    options: g.options.map(
                                                      (o, j) =>
                                                        j === oi
                                                          ? {
                                                              ...o,
                                                              images:
                                                                o.images.filter(
                                                                  (_, k) =>
                                                                    k !== ii,
                                                                ),
                                                            }
                                                          : o,
                                                    ),
                                                  }
                                                : g,
                                            ),
                                          );
                                        }}
                                        className="text-red-400 hover:text-red-300 p-1 rounded"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {/* Upload button */}
                                <label className="w-20 h-20 flex items-center justify-center bg-[#0f1419] border-2 border-dashed border-[#1b3caf]/30 rounded-lg cursor-pointer hover:border-[#1b3caf]/60 transition">
                                  {variantImageUploading === `${gi}-${oi}` ? (
                                    <div className="w-5 h-5 border-2 border-[#1b3caf] border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-[#6b7280]"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                      />
                                    </svg>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setVariantImageUploading(`${gi}-${oi}`);
                                      try {
                                        const fd = new FormData();
                                        fd.append("file", file);
                                        const res = await fetch("/api/upload", {
                                          method: "POST",
                                          body: fd,
                                        });
                                        if (!res.ok)
                                          throw new Error("Upload error");
                                        const data = await res.json();
                                        setVariantGroups((prev) =>
                                          prev.map((g, i) =>
                                            i === gi
                                              ? {
                                                  ...g,
                                                  options: g.options.map(
                                                    (o, j) =>
                                                      j === oi
                                                        ? {
                                                            ...o,
                                                            images: [
                                                              ...o.images,
                                                              {
                                                                url: data.url,
                                                                alt: file.name.split(
                                                                  ".",
                                                                )[0],
                                                                isHero:
                                                                  o.images
                                                                    .length ===
                                                                  0,
                                                              },
                                                            ],
                                                          }
                                                        : o,
                                                  ),
                                                }
                                              : g,
                                          ),
                                        );
                                      } catch (err) {
                                        console.error(
                                          "Variant image upload error:",
                                          err,
                                        );
                                      } finally {
                                        setVariantImageUploading(null);
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Parameter overrides */}
                            <div>
                              <label className="block text-xs font-medium text-[#8b92a9] mb-2">
                                Nadpisania parametrów (opcjonalne)
                              </label>
                              <div className="space-y-2">
                                {Object.entries(opt.parameterOverrides).map(
                                  ([key, value], pi) => (
                                    <div
                                      key={pi}
                                      className="flex items-center gap-2"
                                    >
                                      <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => {
                                          const newKey = e.target.value;
                                          const entries = Object.entries(
                                            opt.parameterOverrides,
                                          );
                                          entries[pi] = [newKey, value];
                                          const newOverrides =
                                            Object.fromEntries(entries);
                                          setVariantGroups((prev) =>
                                            prev.map((g, i) =>
                                              i === gi
                                                ? {
                                                    ...g,
                                                    options: g.options.map(
                                                      (o, j) =>
                                                        j === oi
                                                          ? {
                                                              ...o,
                                                              parameterOverrides:
                                                                newOverrides,
                                                            }
                                                          : o,
                                                    ),
                                                  }
                                                : g,
                                            ),
                                          );
                                        }}
                                        placeholder="Etykieta parametru"
                                        className="flex-1 px-3 py-1.5 bg-[#0f1419] border border-[#1b3caf]/20 rounded text-white text-xs focus:ring-1 focus:ring-[#1b3caf]"
                                      />
                                      <input
                                        type="text"
                                        value={String(value)}
                                        onChange={(e) => {
                                          const newVal = e.target.value;
                                          setVariantGroups((prev) =>
                                            prev.map((g, i) =>
                                              i === gi
                                                ? {
                                                    ...g,
                                                    options: g.options.map(
                                                      (o, j) =>
                                                        j === oi
                                                          ? {
                                                              ...o,
                                                              parameterOverrides:
                                                                {
                                                                  ...o.parameterOverrides,
                                                                  [key]: newVal,
                                                                },
                                                            }
                                                          : o,
                                                    ),
                                                  }
                                                : g,
                                            ),
                                          );
                                        }}
                                        placeholder="Wartość"
                                        className="flex-1 px-3 py-1.5 bg-[#0f1419] border border-[#1b3caf]/20 rounded text-white text-xs focus:ring-1 focus:ring-[#1b3caf]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newOverrides = {
                                            ...opt.parameterOverrides,
                                          };
                                          delete newOverrides[key];
                                          setVariantGroups((prev) =>
                                            prev.map((g, i) =>
                                              i === gi
                                                ? {
                                                    ...g,
                                                    options: g.options.map(
                                                      (o, j) =>
                                                        j === oi
                                                          ? {
                                                              ...o,
                                                              parameterOverrides:
                                                                newOverrides,
                                                            }
                                                          : o,
                                                    ),
                                                  }
                                                : g,
                                            ),
                                          );
                                        }}
                                        className="text-red-400 hover:text-red-300 p-1"
                                      >
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  ),
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVariantGroups((prev) =>
                                      prev.map((g, i) =>
                                        i === gi
                                          ? {
                                              ...g,
                                              options: g.options.map((o, j) =>
                                                j === oi
                                                  ? {
                                                      ...o,
                                                      parameterOverrides: {
                                                        ...o.parameterOverrides,
                                                        "": "",
                                                      },
                                                    }
                                                  : o,
                                              ),
                                            }
                                          : g,
                                      ),
                                    );
                                  }}
                                  className="text-xs text-[#1b3caf] hover:text-[#0f9fdf] transition"
                                >
                                  + Dodaj nadpisanie parametru
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 6: Akcesoria */}
              {activeTab === 6 && (
                <div className="p-6 animate-fadeIn">
                  <h3 className="text-xl font-semibold text-white mb-6">
                    Powiązane akcesoria
                  </h3>
                  <p className="text-[#b0b0b0] text-sm mb-6">
                    Wybierz modele, które będą wyświetlane jako akcesoria na
                    stronie tego produktu. Akcesoria to pełnoprawne produkty z
                    własnymi stronami, zdjęciami i wariantami.
                  </p>

                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Szukaj modelu..."
                      value={accessorySearch}
                      onChange={(e) => setAccessorySearch(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[#8b92a9] focus:outline-none focus:ring-2 focus:ring-[#1b3caf]"
                    />
                  </div>

                  {/* Linked accessories */}
                  {linkedAccessoryIds.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-white font-medium mb-3">
                        Przypisane akcesoria ({linkedAccessoryIds.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {linkedAccessoryIds.map((accId) => {
                          const m = allModels.find((mod) => mod.id === accId);
                          if (!m) return null;
                          return (
                            <div
                              key={accId}
                              className="flex items-center gap-3 bg-[#1b3caf]/10 border border-[#1b3caf]/30 rounded-lg p-3"
                            >
                              {m.imageUrl ? (
                                <img
                                  src={m.imageUrl}
                                  alt={m.name}
                                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-5 h-5 text-[#6b7280]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                  </svg>
                                </div>
                              )}
                              <span className="text-white text-sm font-medium flex-1 truncate">
                                {m.name}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setLinkedAccessoryIds((prev) =>
                                    prev.filter((id) => id !== accId),
                                  )
                                }
                                className="text-red-400 hover:text-red-300 text-sm flex-shrink-0"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available models to add */}
                  <h4 className="text-white font-medium mb-3">
                    Dostępne modele
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {allModels
                      .filter(
                        (m) =>
                          !linkedAccessoryIds.includes(m.id) &&
                          m.name
                            .toLowerCase()
                            .includes(accessorySearch.toLowerCase()),
                      )
                      .map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            setLinkedAccessoryIds((prev) => [...prev, m.id])
                          }
                          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 hover:border-[#1b3caf]/50 transition text-left"
                        >
                          {m.imageUrl ? (
                            <img
                              src={m.imageUrl}
                              alt={m.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-[#6b7280]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                          )}
                          <span className="text-[#b0b0b0] text-sm font-medium flex-1 truncate">
                            {m.name}
                          </span>
                          <span className="text-[#1b3caf] text-lg flex-shrink-0">
                            +
                          </span>
                        </button>
                      ))}
                    {allModels.filter(
                      (m) =>
                        !linkedAccessoryIds.includes(m.id) &&
                        m.name
                          .toLowerCase()
                          .includes(accessorySearch.toLowerCase()),
                    ).length === 0 && (
                      <p className="text-[#8b92a9] text-sm col-span-full py-4 text-center">
                        {accessorySearch
                          ? "Nie znaleziono modeli pasujących do wyszukiwania"
                          : "Brak dostępnych modeli do dodania"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation buttons - always visible */}
              <div className="flex gap-4 pt-6 border-t border-[#1b3caf]/30 mt-8">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Zapisywanie..." : "Dodaj model"}
                </Button>
                <Link href="/admin/dashboard" className="flex-shrink-0">
                  <Button variant="outline" className="w-full">
                    ← Anuluj
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
