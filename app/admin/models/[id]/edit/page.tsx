"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function EditModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modelId, setModelId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    heroDescription: "",
    power: "",
    depth: "",
    weight: "",
    bucket: "",
    price: "",
    featured: false,
    categoryId: "",
  });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [images, setImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [heroImageId, setHeroImageId] = useState<string>("");
  const [sections, setSections] = useState<
    Array<{ title: string; text: string; image?: { url: string; alt: string } }>
  >([{ title: "", text: "" }]);
  const [downloads, setDownloads] = useState<
    Array<{ name: string; url: string; fileType: string; fileSize?: number }>
  >([]);
  // Features for selected category and current values
  const [categoryFeatures, setCategoryFeatures] = useState<Array<any>>([]);
  const [featureValues, setFeatureValues] = useState<Record<string, any>>({});
  // Parameters for selected category and current values
  const [categoryParameters, setCategoryParameters] = useState<Array<any>>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>(
    {},
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [fileUploadError, setFileUploadError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get ID from params
  useEffect(() => {
    params.then((p) => setModelId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    if (modelId) {
      fetchModel();
      fetchCategories();
    }
  }, [modelId]);

  // Fetch features for current category
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!formData.categoryId) {
        setCategoryFeatures([]);
        setFeatureValues({});
        return;
      }
      try {
        const res = await fetch(
          `/api/admin/features?categoryId=${formData.categoryId}`,
        );
        if (!res.ok) return;
        const defs = await res.json();
        setCategoryFeatures(defs || []);
        // initialize values if not set
        setFeatureValues((prev) => {
          const next = { ...prev };
          (defs || []).forEach((f: any) => {
            if (!(f.id in next)) {
              next[f.id] = f.type === "boolean" ? false : null;
            }
          });
          return next;
        });
      } catch (err) {
        console.error("Error fetching features", err);
      }
    };
    fetchFeatures();
  }, [formData.categoryId]);

  // Fetch parameters for current category
  useEffect(() => {
    const fetchParameters = async () => {
      if (!formData.categoryId) {
        setCategoryParameters([]);
        setParameterValues({});
        return;
      }
      try {
        const res = await fetch(
          `/api/admin/parameters?categoryId=${formData.categoryId}`,
        );
        if (!res.ok) return;
        const defs = await res.json();
        setCategoryParameters(defs || []);
        // initialize values if not set
        setParameterValues((prev) => {
          const next = { ...prev };
          (defs || []).forEach((p: any) => {
            if (!(p.id in next)) {
              next[p.id] = p.type === "boolean" ? false : null;
            }
          });
          return next;
        });
      } catch (err) {
        console.error("Error fetching parameters", err);
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

  const fetchModel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/models/${modelId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch model");
      }
      const data = await response.json();
      setFormData({
        name: data.name,
        description: data.description || "",
        heroDescription: data.heroDescription || "",
        power: data.power,
        depth: data.depth,
        weight: data.weight,
        bucket: data.bucket,
        price: data.price,
        featured: data.featured || false,
        categoryId: data.categoryId || "",
      });
      setImages(data.images || []);
      setHeroImageId(data.heroImageId || "");
      setSections(data.sections || [{ title: "", text: "" }]);
      setDownloads(data.downloads || []);
      // Load feature values from API response (if present)
      if (data.features && Array.isArray(data.features)) {
        const vals: Record<string, any> = {};
        data.features.forEach((f: any) => {
          vals[f.id] = f.value ?? null;
        });
        setFeatureValues(vals);
        // set category features definitions too
        const defs = data.features.map((f: any) => ({
          id: f.id,
          key: f.key,
          label: f.label,
          type: f.type,
          options: f.options,
        }));
        setCategoryFeatures(defs);
      }
      // Load parameter values from API response (if present)
      if (data.parameters && Array.isArray(data.parameters)) {
        const vals: Record<string, any> = {};
        data.parameters.forEach((p: any) => {
          vals[p.id] = p.value ?? null;
        });
        setParameterValues(vals);
        // set category parameters definitions too
        const defs = data.parameters.map((p: any) => ({
          id: p.id,
          key: p.key,
          label: p.label,
          unit: p.unit,
          type: p.type,
          options: p.options,
        }));
        setCategoryParameters(defs);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load model");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading || !session) {
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

        setImages((prev) => [
          ...prev,
          { url: data.url, alt: file.name.split(".")[0] },
        ]);
      }
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

  // Poprawione usuwanie zdjęcia Hero
  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Jeśli usunięto zdjęcie Hero, ustaw Hero na pierwsze dostępne
      if (heroImageId === prev[index]?.url) {
        setHeroImageId(newImages[0]?.url || "");
      }
      return newImages;
    });
  };

  const handleSectionImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side validation: max 20MB
    if (file.size > 20 * 1024 * 1024) {
      setImageUploadError("Plik jest za duży. Maksymalnie 20MB na plik.");
      e.target.value = "";
      return;
    }
    try {
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
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setFileUploadError("");

    try {
      // Client-side validation: max 20MB
      if (file.size > 20 * 1024 * 1024) {
        setFileUploadError("Plik jest za duży. Maksymalnie 20MB na plik.");
        e.target.value = "";
        return;
      }
      const formDataFile = new FormData();
      formDataFile.append("file", file);
      formDataFile.append("modelId", modelId);
      formDataFile.append("fileName", file.name);

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
      e.target.value = "";
    }
  };

  const handleRemoveDownload = (index: number) => {
    setDownloads((prev) => prev.filter((_, i) => i !== index));
  };

  const validateSections = () => {
    return sections.every((s) => s.title.trim() && s.text.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      if (images.length === 0) {
        throw new Error("Proszę dodać przynajmniej jedno zdjęcie");
      }
      if (!validateSections()) {
        throw new Error("Wszystkie sekcje muszą mieć tytuł i opis");
      }
      const response = await fetch(`/api/models/${modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images,
          heroImageId: heroImageId || images[0]?.url,
          sections,
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
        throw new Error(data.error || "Błąd podczas zapisywania modelu");
      }
      setSuccess("Model został pomyślnie zaktualizowany!");
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Błąd podczas zapisywania modelu");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
      {/* Header */}
      <header className="bg-[#1a1f2e] border-b border-[#1b3caf]/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edytuj model</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto">
        <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-8">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
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
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                required
              />
            </div>

            {/* Hero Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Opis Hero (krótki, na górę strony)
              </label>
              <textarea
                name="heroDescription"
                value={formData.heroDescription}
                onChange={handleChange}
                placeholder="Krótki opis widoczny w sekcji Hero..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition resize-none mb-4"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Opis (szczegółowy)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Opis techniki mini-kopiarki..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Kategoria
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white focus:outline-none focus:border-[#1b3caf] transition"
              >
                <option value="">Bez kategorii</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Power */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Moc silnika *
                </label>
                <input
                  type="text"
                  name="power"
                  value={formData.power}
                  onChange={handleChange}
                  placeholder="25 KM"
                  className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                  required
                />
              </div>

              {/* Depth */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Głębokość kopania *
                </label>
                <input
                  type="text"
                  name="depth"
                  value={formData.depth}
                  onChange={handleChange}
                  placeholder="2.8 m"
                  className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                  required
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Masa *
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="2.2 t"
                  className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                  required
                />
              </div>

              {/* Bucket */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Pojemność łyżki *
                </label>
                <input
                  type="text"
                  name="bucket"
                  value={formData.bucket}
                  onChange={handleChange}
                  placeholder="0.06 m³"
                  className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                  required
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cena *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Od 65,000 PLN"
                className="w-full px-4 py-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] transition"
                required
              />
            </div>

            {/* Dynamic Category Features */}
            {categoryFeatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Cechy produktu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {categoryFeatures.map((f: any) => {
                    const val = featureValues[f.id];
                    const label = f.label || f.key;
                    if (f.type === "boolean") {
                      return (
                        <div key={f.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={() =>
                              setFeatureValues((prev) => ({
                                ...prev,
                                [f.id]: !prev[f.id],
                              }))
                            }
                            className="w-4 h-4 rounded border-[#1b3caf]/30 bg-[#242d3d] cursor-pointer accent-[#1b3caf]"
                          />
                          <label className="text-sm text-white">{label}</label>
                        </div>
                      );
                    }

                    if (f.type === "number") {
                      return (
                        <div key={f.id}>
                          <label className="block text-sm text-white mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            value={val ?? ""}
                            onChange={(e) =>
                              setFeatureValues((prev) => ({
                                ...prev,
                                [f.id]:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 rounded bg-[#242d3d] border border-[#1b3caf]/30 text-white"
                          />
                        </div>
                      );
                    }

                    if (f.type === "date") {
                      return (
                        <div key={f.id}>
                          <label className="block text-sm text-white mb-1">
                            {label}
                          </label>
                          <input
                            type="date"
                            value={val ?? ""}
                            onChange={(e) =>
                              setFeatureValues((prev) => ({
                                ...prev,
                                [f.id]: e.target.value || null,
                              }))
                            }
                            className="w-full px-3 py-2 rounded bg-[#242d3d] border border-[#1b3caf]/30 text-white"
                          />
                        </div>
                      );
                    }

                    if (f.options && Array.isArray(f.options)) {
                      return (
                        <div key={f.id}>
                          <label className="block text-sm text-white mb-1">
                            {label}
                          </label>
                          <select
                            value={val ?? ""}
                            onChange={(e) =>
                              setFeatureValues((prev) => ({
                                ...prev,
                                [f.id]: e.target.value || null,
                              }))
                            }
                            className="w-full px-3 py-2 rounded bg-[#242d3d] border border-[#1b3caf]/30 text-white"
                          >
                            <option value="">-- Wybierz --</option>
                            {f.options.map((opt: any, idx: number) => (
                              <option key={idx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <div key={f.id}>
                        <label className="block text-sm text-white mb-1">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={val ?? ""}
                          onChange={(e) =>
                            setFeatureValues((prev) => ({
                              ...prev,
                              [f.id]: e.target.value || null,
                            }))
                          }
                          className="w-full px-3 py-2 rounded bg-[#242d3d] border border-[#1b3caf]/30 text-white"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#1b3caf]/30 bg-[#242d3d] cursor-pointer accent-[#1b3caf]"
              />
              <label
                htmlFor="featured"
                className="text-sm text-white cursor-pointer"
              >
                Oznacz jako wyróżniony (bestseller)
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Zdjęcia modelu *
              </label>

              {imageUploadError && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{imageUploadError}</p>
                </div>
              )}

              <div
                className={`mb-4 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${dragActive ? "border-[#1b3caf] bg-[#1b3caf]/10" : "border-[#1b3caf]/30 bg-[#242d3d]"}`}
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
                  Przeciągnij zdjęcia tutaj lub kliknij (możesz dodać wiele)
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

              {/* Image Preview Gallery + Hero select */}
              {images.length > 0 && (
                <div>
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <label className="block text-sm font-medium text-white mb-3">
                      Wybierz zdjęcie do Hero sekcji
                    </label>
                    <select
                      value={heroImageId}
                      onChange={(e) => setHeroImageId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-[#242d3d] border border-[#1b3caf]/30 text-white focus:outline-none focus:border-[#1b3caf]"
                    >
                      <option value="">Brak (użyj pierwsze zdjęcie)</option>
                      {images.map((image, index) => (
                        <option key={index} value={image.url}>
                          Zdjęcie {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative bg-[#242d3d] border-2 rounded-lg overflow-hidden group transition ${image.url === heroImageId ? "border-[#1b3caf]" : "border-[#1b3caf]/30 hover:border-[#1b3caf]/60"}`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover"
                        />
                        {image.url === heroImageId && (
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

              <p className="text-xs text-[#6b7280] mb-4">
                {images.length > 0
                  ? `Dodano ${images.length} zdjęć`
                  : "Dodaj przynajmniej jedno zdjęcie"}{" "}
                • Max 20MB na plik
              </p>
            </div>

            {/* Pliki do pobrania */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Pliki do pobrania (PDF, instrukcje)
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <Button
                  type="button"
                  variant="primary"
                  className="relative overflow-hidden cursor-pointer"
                  disabled={uploadingFile}
                >
                  {uploadingFile ? "Przesyłanie..." : "Dodaj plik"}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </Button>
                {fileUploadError && (
                  <p className="text-red-400 text-sm">{fileUploadError}</p>
                )}
              </div>

              {downloads.length > 0 && (
                <div className="space-y-2 mb-6">
                  {downloads.map((download, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#242d3d] border border-[#1b3caf]/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1b3caf]/10 rounded flex items-center justify-center text-[#1b3caf] font-bold text-xs uppercase">
                          {download.fileType || "FILE"}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {download.name}
                          </p>
                          <p className="text-[#6b7280] text-xs">
                            {download.fileSize
                              ? `${(download.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDownload(idx)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Usuń
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sekcje opisów produktu z możliwością dodania zdjęcia */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Sekcje opisów produktu
              </h3>
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className="mb-6 p-4 rounded-xl bg-[#242d3d] border border-[#1b3caf]/20"
                >
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
                    className="w-full mb-2 px-4 py-2 rounded-lg bg-[#1a1f2e] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf]"
                  />
                  <textarea
                    placeholder="Opis sekcji..."
                    value={section.text}
                    onChange={(e) =>
                      setSections((secs) =>
                        secs.map((s, i) =>
                          i === idx ? { ...s, text: e.target.value } : s,
                        ),
                      )
                    }
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-[#1a1f2e] border border-[#1b3caf]/30 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] resize-none"
                  />
                  <div className="flex gap-2 mt-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSectionImageUpload(e, idx)}
                      className="block text-xs text-[#b0b0b0]"
                    />
                    {section.image && (
                      <img
                        src={section.image.url}
                        alt={section.image.alt || "Sekcja"}
                        className="h-12 w-auto rounded shadow"
                      />
                    )}
                    {sections.length > 1 && (
                      <button
                        type="button"
                        className="text-red-400 text-xs px-3 py-1 rounded hover:bg-red-400/10"
                        onClick={() =>
                          setSections((secs) =>
                            secs.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        Usuń
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="bg-gradient-to-r from-[#1b3caf] to-[#174a8c] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:scale-105 transition"
                onClick={() =>
                  setSections((secs) => [...secs, { title: "", text: "" }])
                }
              >
                Dodaj kolejną sekcję
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="primary"
                type="submit"
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Anuluj
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
