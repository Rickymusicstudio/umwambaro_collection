"use client";

import { shopCategories } from "@/constants/site";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  Check,
  Edit3,
  ImagePlus,
  Package,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Price from "@/components/ui/Price";

type AdminProduct = {
  id: string;
  sku: string | null;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  condition: "new" | "chaguwa" | null;
  brand: string | null;
  price: number;
  compare_price: number | null;
  currency: string;
  stock: number;
  image: string | null;
  hover_image: string | null;
  images: string[];
  rating: number | null;
  reviews: number;
  colors: string[];
  sizes: string[];
  featured: boolean;
  trending: boolean;
  best_seller: boolean;
  is_active: boolean;
  created_at: string;
};

type FormState = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  condition: "new" | "chaguwa";
  brand: string;
  price: string;
  comparePrice: string;
  stock: string;
  image: string;
  hoverImage: string;
  images: string;
  colors: string;
  sizes: string;
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;
  isActive: boolean;
};

type UploadingFile = {
  name: string;
  progress: "uploading" | "done" | "error";
};

const STORAGE_BUCKET = "product-images";

const emptyForm: FormState = {
  sku: "",
  name: "",
  slug: "",
  description: "",
  category: "Women",
  condition: "new",
  brand: "Umwambaro",
  price: "",
  comparePrice: "",
  stock: "0",
  image: "",
  hoverImage: "",
  images: "",
  colors: "",
  sizes: "S, M, L, XL",
  featured: false,
  trending: false,
  bestSeller: false,
  isActive: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(product: AdminProduct): FormState {
  const images = product.images ?? [];

  return {
    sku: product.sku ?? "",
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    category: product.category,
    condition: product.condition ?? "new",
    brand: product.brand ?? "",
    price: String(product.price),
    comparePrice:
      product.compare_price == null ? "" : String(product.compare_price),
    stock: String(product.stock),
    image: product.image ?? images[0] ?? "",
    hoverImage: product.hover_image ?? images[1] ?? "",
    images: images.join(", "),
    colors: product.colors.join(", "),
    sizes: product.sizes.join(", "),
    featured: product.featured,
    trending: product.trending,
    bestSeller: product.best_seller,
    isActive: product.is_active,
  };
}

function extractStoragePath(url: string) {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

function uniqueImages(images: string[]) {
  return [...new Set(images.map((image) => image.trim()).filter(Boolean))];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseBrowserClient();

  async function loadProducts() {
    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }

    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProducts((data ?? []) as AdminProduct[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((product) =>
      [product.name, product.sku, product.category, product.brand]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q))
    );
  }, [products, query]);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setUploadingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function editProduct(product: AdminProduct) {
    setForm(toForm(product));
    setEditingId(product.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFiles(files: File[]) {
    if (!files.length || !supabase) return;

    setError("");
    setMessage("");
    setUploading(true);

    const invalid = files.find(
      (file) =>
        !file.type.startsWith("image/") ||
        file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      setError(
        `${invalid.name} is not valid. Use image files up to 5 MB each.`
      );
      setUploading(false);
      return;
    }

    setUploadingFiles(
      files.map((file) => ({ name: file.name, progress: "uploading" }))
    );

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const folder = editingId ?? crypto.randomUUID();
      const filePath = `${folder}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setUploadingFiles((current) =>
          current.map((item) =>
            item.name === file.name
              ? { ...item, progress: "error" }
              : item
          )
        );
        setError(
          `Unable to upload ${file.name}: ${uploadError.message}. Make sure the product-images bucket and storage policies have been created.`
        );
        continue;
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);

      setUploadingFiles((current) =>
        current.map((item) =>
          item.name === file.name
            ? { ...item, progress: "done" }
            : item
        )
      );
    }

    if (uploadedUrls.length) {
      const currentImages = list(form.images);
      const nextImages = uniqueImages([...currentImages, ...uploadedUrls]);

      setForm((current) => ({
        ...current,
        images: nextImages.join(", "),
        image: current.image || nextImages[0] || "",
        hoverImage: current.hoverImage || nextImages[1] || "",
      }));

      setMessage(
        `${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} uploaded successfully. Save the product to keep the changes.`
      );
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function uploadImages(event: ChangeEvent<HTMLInputElement>) {
    void uploadFiles(Array.from(event.target.files ?? []));
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  }

  function removeImage(url: string) {
    const images = list(form.images).filter((image) => image !== url);

    setForm((current) => ({
      ...current,
      images: images.join(", "),
      image: current.image === url ? images[0] ?? "" : current.image,
      hoverImage:
        current.hoverImage === url ? images[1] ?? "" : current.hoverImage,
    }));
  }

  function setMainImage(url: string) {
    setForm((current) => ({ ...current, image: url }));
  }

  function setHoverImage(url: string) {
    setForm((current) => ({ ...current, hoverImage: url }));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setMessage("");
    setError("");

    const images = uniqueImages(list(form.images));
    const price = Number(form.price);
    const comparePrice = form.comparePrice ? Number(form.comparePrice) : null;
    const stock = Number(form.stock);
    const slug = slugify(form.slug || form.name);

    if (!form.name.trim() || !slug || Number.isNaN(price) || price < 0) {
      setError("Name, slug and a valid price are required.");
      setSaving(false);
      return;
    }

    if (comparePrice !== null && (Number.isNaN(comparePrice) || comparePrice < price)) {
      setError("Compare price must be greater than or equal to the selling price.");
      setSaving(false);
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      setError("Stock must be zero or greater.");
      setSaving(false);
      return;
    }

    const payload = {
      sku: form.sku.trim() || null,
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      category: form.category.trim(),
      condition: form.condition,
      brand: form.brand.trim() || null,
      price,
      compare_price: comparePrice,
      currency: "RWF",
      stock,
      image: form.image.trim() || images[0] || null,
      hover_image: form.hoverImage.trim() || images[1] || null,
      images,
      colors: list(form.colors),
      sizes: list(form.sizes),
      featured: form.featured,
      trending: form.trending,
      best_seller: form.bestSeller,
      is_active: form.isActive,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId)
        .select("*")
        .single();
    } else {
      result = await supabase
        .from("products")
        .insert(payload)
        .select("*")
        .single();
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingId
        ? "Product updated successfully."
        : "Product created successfully."
    );
    setSaving(false);
    resetForm();
    await loadProducts();
  }

  async function deleteProduct(product: AdminProduct) {
    if (!supabase) return;

    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) {
      return;
    }

    setError("");
    setMessage("");

    const storagePaths = product.images
      .map(extractStoragePath)
      .filter((path): path is string => Boolean(path));

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      // Products that customers already ordered must stay for the order history:
      // hide them from the shop instead of deleting.
      if (deleteError.code === "23503" || /foreign key|order_items/i.test(deleteError.message)) {
        const { error: hideError } = await supabase
          .from("products")
          .update({ is_active: false })
          .eq("id", product.id);
        if (hideError) {
          setError(hideError.message);
          return;
        }
        setMessage(`“${product.name}” has orders, so it was hidden from the shop instead of deleted.`);
        await loadProducts();
        return;
      }
      setError(deleteError.message);
      return;
    }

    if (storagePaths.length) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(storagePaths);

      if (storageError) {
        setMessage(
          "Product deleted, but some stored images could not be removed."
        );
      }
    }

    setMessage("Product deleted.");
    await loadProducts();
  }

  async function toggleActive(product: AdminProduct) {
    if (!supabase) return;

    const { error: updateError } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadProducts();
  }

  const formImages = uniqueImages(list(form.images));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Catalog management</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Create, edit, publish and manage products directly in Supabase.
          </p>
        </div>
        <Button
          type="button"
          onClick={resetForm}
          leftIcon={<Plus size={16} />}
        >
          New product
        </Button>
      </div>

      {(message || error) && (
        <div
          className={`rounded-lg p-4 text-sm ${
            error
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || message}
        </div>
      )}

      <form
        onSubmit={saveProduct}
        className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c45500]">
              {editingId ? "Edit product" : "New product"}
            </p>
            <h3 className="mt-1 text-2xl font-semibold">
              {editingId ? "Update catalog item" : "Add to your catalog"}
            </h3>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100"
              aria-label="Cancel editing"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Product name">
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                  slug: form.slug || slugify(event.target.value),
                })
              }
              className={inputClass}
            />
          </Field>

          <Field label="SKU">
            <input
              value={form.sku}
              onChange={(event) =>
                setForm({ ...form, sku: event.target.value })
              }
              className={inputClass}
              placeholder="UMW-005"
            />
          </Field>

          <Field label="Slug">
            <input
              required
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: slugify(event.target.value) })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <select
              required
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
              className={inputClass}
            >
              {[...new Set([...shopCategories.map((c) => c.name), form.category].filter(Boolean))].map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </Field>

          <Field label="Condition">
            <select
              value={form.condition}
              onChange={(event) =>
                setForm({
                  ...form,
                  condition: event.target.value as "new" | "chaguwa",
                })
              }
              className={inputClass}
            >
              <option value="new">New</option>
              <option value="chaguwa">Chaguwa (Used)</option>
            </select>
          </Field>

          <Field label="Brand">
            <input
              value={form.brand}
              onChange={(event) =>
                setForm({ ...form, brand: event.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Price (RWF)">
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: event.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Compare price (RWF)">
            <input
              type="number"
              min="0"
              value={form.comparePrice}
              onChange={(event) =>
                setForm({ ...form, comparePrice: event.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Stock">
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) =>
                setForm({ ...form, stock: event.target.value })
              }
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5">
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className={`${inputClass} min-h-28 py-3`}
            />
          </Field>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-semibold">Product images</h4>
                <p className="mt-1 text-sm text-neutral-500">
                  Upload JPG, PNG or WebP images up to 5 MB each.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={uploadImages}
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void uploadFiles(Array.from(event.dataTransfer.files));
              }}
              disabled={uploading}
              className={`mt-5 flex min-h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-6 text-center transition ${
                dragging
                  ? "border-[#c45500] bg-amber-50"
                  : "border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-50"
              } ${uploading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                {uploading ? (
                  <Upload className="animate-pulse text-[#c45500]" size={22} />
                ) : (
                  <ImagePlus className="text-neutral-500" size={22} />
                )}
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-800">
                {uploading ? "Uploading images..." : "Upload product images"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Drag and drop images here, or click to browse
              </p>
              <p className="mt-2 text-[11px] text-neutral-400">
                JPG, PNG, WebP or GIF · up to 5 MB each · multiple images supported
              </p>
            </button>

            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadingFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs"
                  >
                    <span className="max-w-[75%] truncate">{file.name}</span>
                    <span
                      className={
                        file.progress === "error"
                          ? "text-red-600"
                          : file.progress === "done"
                            ? "text-emerald-600"
                            : "text-neutral-500"
                      }
                    >
                      {file.progress === "done"
                        ? "Uploaded"
                        : file.progress === "error"
                          ? "Failed"
                          : "Uploading..."}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {formImages.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {formImages.map((url) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
                  >
                    <div className="aspect-square bg-neutral-100">
                      <img
                        src={url}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-2">
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setMainImage(url)}
                          className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                            form.image === url
                              ? "bg-[#232f3e] text-white"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {form.image === url ? "Main" : "Set main"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setHoverImage(url)}
                          className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                            form.hoverImage === url
                              ? "bg-[#c45500] text-white"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {form.hoverImage === url ? "Hover" : "Set hover"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white text-center">
                <div>
                  <ImagePlus className="mx-auto text-neutral-300" size={30} />
                  <p className="mt-2 text-sm font-medium text-neutral-600">
                    No images uploaded yet
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Upload your product photos above.
                  </p>
                </div>
              </div>
            )}

          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Colors">
              <input
                value={form.colors}
                onChange={(event) =>
                  setForm({ ...form, colors: event.target.value })
                }
                className={inputClass}
                placeholder="Black, Cream, Blue"
              />
            </Field>

            <Field label="Sizes">
              <input
                value={form.sizes}
                onChange={(event) =>
                  setForm({ ...form, sizes: event.target.value })
                }
                className={inputClass}
                placeholder="S, M, L, XL"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-[#d5d9d9] bg-[#ffffff] p-4 sm:p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-neutral-900">Homepage placement</p>
            <p className="mt-1 text-xs text-neutral-500">
              Optional. New Arrivals are detected automatically from the product creation date.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Toggle
              label="Featured"
              checked={form.featured}
              onChange={(value) => setForm({ ...form, featured: value })}
            />
            <Toggle
              label="Trending"
              checked={form.trending}
              onChange={(value) => setForm({ ...form, trending: value })}
            />
            <Toggle
              label="Best seller"
              checked={form.bestSeller}
              onChange={(value) => setForm({ ...form, bestSeller: value })}
            />
            <Toggle
              label="Published"
              checked={form.isActive}
              onChange={(value) => setForm({ ...form, isActive: value })}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={saving}
            leftIcon={<Save size={16} />}
          >
            {editingId ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Products ({products.length})</h3>
            <p className="mt-1 text-sm text-neutral-500">
              All catalog records, including inactive products.
            </p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="h-11 rounded-xl border border-neutral-300 px-4 text-sm outline-none focus:border-black sm:w-72"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-neutral-300" size={40} />
            <p className="mt-4 text-sm text-neutral-500">
              No matching products.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="text-neutral-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{product.name}</h4>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium">
                      {product.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {product.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    SKU {product.sku || "—"} · Stock {product.stock} · {product.images.length} image{product.images.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {product.slug}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <Price price={product.price} size="sm" />
                  <button
                    type="button"
                    onClick={() => toggleActive(product)}
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold hover:bg-neutral-50"
                  >
                    {product.is_active ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => editProduct(product)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold hover:bg-neutral-50"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-black";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 text-sm font-medium">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
          checked
            ? "border-black bg-[#232f3e] text-white"
            : "border-neutral-300 bg-white"
        }`}
      >
        {checked && <Check size={13} />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}
