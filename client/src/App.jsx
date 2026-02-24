import { useEffect, useMemo, useState } from "react";
import SugarBadge from "./components/SugarBadge";
import {
  createProduct,
  createUser,
  deleteProduct,
  deleteUser,
  getProducts,
  getProductStats,
  getUserStats,
  getUsers,
  getSugarScore,
  updateProduct,
  updateUser
} from "./api";

const emptyProductForm = {
  barcode: "",
  nameKh: "",
  nameEn: "",
  brand: "",
  sugarPer100g: "",
  defaultServingSizeG: "100",
  confidence: "manual",
  lastVerifiedAt: "",
  notes: ""
};

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
  age: "",
  birthYear: ""
};

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("products");

  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");
  const [sugarLevel, setSugarLevel] = useState("unknown");
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    lowSugar: 0,
    mediumSugar: 0,
    highSugar: 0,
    verifiedCount: 0,
    communityCount: 0,
    manualCount: 0
  });
  const [productQuery, setProductQuery] = useState("");

  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
    activeCount: 0,
    blockedCount: 0,
    childrenCount: 0,
    adultCount: 0,
    elderlyCount: 0
  });
  const [userQuery, setUserQuery] = useState("");

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [productTableLoading, setProductTableLoading] = useState(false);
  const [userTableLoading, setUserTableLoading] = useState(false);

  const text = (en, kh) => (lang === "kh" ? kh : en);

  const canSubmitProduct = useMemo(() => {
    return productForm.barcode && productForm.nameKh && productForm.sugarPer100g !== "";
  }, [productForm]);

  const canSubmitUser = useMemo(() => {
    return userForm.name && userForm.email && (editingUserId || userForm.password);
  }, [userForm, editingUserId]);

  useEffect(() => {
    loadProducts();
    loadUsers();
  }, []);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateSugarLevel = async (value) => {
    if (value === "") {
      setSugarLevel("unknown");
      return;
    }
    try {
      const data = await getSugarScore(value);
      setSugarLevel(data.sugarLevel);
    } catch {
      setSugarLevel("unknown");
    }
  };

  const loadProducts = async (search = "") => {
    setProductTableLoading(true);
    try {
      const [productRes, statsRes] = await Promise.all([
        getProducts({ q: search, page: 1, limit: 20 }),
        getProductStats()
      ]);
      setProducts(productRes.items || []);
      setProductStats(statsRes);
    } catch {
      setError(text("Cannot load product data", "មិនអាចទាញយកទិន្នន័យផលិតផលបានទេ"));
    } finally {
      setProductTableLoading(false);
    }
  };

  const loadUsers = async (search = "") => {
    setUserTableLoading(true);
    try {
      const [userRes, statsRes] = await Promise.all([
        getUsers({ q: search, page: 1, limit: 20 }),
        getUserStats()
      ]);
      setUsers(userRes.items || []);
      setUserStats(statsRes);
    } catch {
      setError(text("Cannot load user data", "មិនអាចទាញយកទិន្នន័យអ្នកប្រើបានទេ"));
    } finally {
      setUserTableLoading(false);
    }
  };

  const onSubmitProduct = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const payload = {
        ...productForm,
        sugarPer100g: Number(productForm.sugarPer100g),
        defaultServingSizeG: Number(productForm.defaultServingSizeG || 100),
        confidence: productForm.confidence || "manual",
        lastVerifiedAt: productForm.lastVerifiedAt || null
      };
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setStatus(text("Product updated", "បានកែប្រែផលិតផលរួចរាល់"));
      } else {
        await createProduct(payload);
        setStatus(text("Product created", "បានបង្កើតផលិតផលរួចរាល់"));
      }
      resetProductForm();
      await loadProducts(productQuery);
    } catch (err) {
      setError(err?.response?.data?.message || text("Cannot save product", "មិនអាចរក្សាទុកផលិតផលបានទេ"));
    } finally {
      setLoading(false);
    }
  };

  const onEditProduct = (item) => {
    setEditingProductId(item._id);
    setProductForm({
      barcode: item.barcode || "",
      nameKh: item.nameKh || "",
      nameEn: item.nameEn || "",
      brand: item.brand || "",
      sugarPer100g: String(item.sugarPer100g ?? ""),
      defaultServingSizeG: String(item.defaultServingSizeG ?? 100),
      confidence: item.confidence || "manual",
      lastVerifiedAt: item.lastVerifiedAt ? toDateInputValue(item.lastVerifiedAt) : "",
      notes: item.notes || ""
    });
    setSugarLevel(item.sugarLevel || "unknown");
    setStatus(text(`Editing product: ${item.nameKh}`, `កំពុងកែប្រែផលិតផល: ${item.nameKh}`));
    setError("");
  };

  const onDeleteProduct = async (item) => {
    const ok = window.confirm(
      text(`Delete ${item.nameKh || item.barcode} ?`, `លុប ${item.nameKh || item.barcode} ?`)
    );
    if (!ok) return;

    setError("");
    setStatus("");
    try {
      await deleteProduct(item._id);
      if (editingProductId === item._id) {
        resetProductForm();
      }
      setStatus(text("Product deleted", "បានលុបផលិតផលរួចរាល់"));
      await loadProducts(productQuery);
    } catch (err) {
      setError(err?.response?.data?.message || text("Cannot delete product", "មិនអាចលុបផលិតផលបានទេ"));
    }
  };

  const resetProductForm = () => {
    setEditingProductId("");
    setProductForm(emptyProductForm);
    setSugarLevel("unknown");
  };

  const onProductSearch = async (e) => {
    e.preventDefault();
    await loadProducts(productQuery);
  };

  const onSubmitUser = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }
      if (userForm.age !== "") {
        payload.age = Number(userForm.age);
      }
      if (userForm.birthYear !== "") {
        payload.birthYear = Number(userForm.birthYear);
      }

      if (editingUserId) {
        await updateUser(editingUserId, payload);
        setStatus(text("User updated", "បានកែប្រែអ្នកប្រើរួចរាល់"));
      } else {
        await createUser(payload);
        setStatus(text("User created", "បានបង្កើតអ្នកប្រើរួចរាល់"));
      }

      resetUserForm();
      await loadUsers(userQuery);
    } catch (err) {
      setError(err?.response?.data?.message || text("Cannot save user", "មិនអាចរក្សាទុកអ្នកប្រើបានទេ"));
    } finally {
      setLoading(false);
    }
  };

  const onEditUser = (item) => {
    setEditingUserId(item._id);
    setUserForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.role || "user",
      status: item.status || "active",
      age: item.age != null ? String(item.age) : "",
      birthYear: item.birthYear != null ? String(item.birthYear) : ""
    });
    setStatus(text(`Editing user: ${item.email}`, `កំពុងកែប្រែអ្នកប្រើ: ${item.email}`));
    setError("");
  };

  const onDeleteUser = async (item) => {
    const ok = window.confirm(text(`Delete ${item.email} ?`, `លុប ${item.email} ?`));
    if (!ok) return;

    setError("");
    setStatus("");
    try {
      await deleteUser(item._id);
      if (editingUserId === item._id) {
        resetUserForm();
      }
      setStatus(text("User deleted", "បានលុបអ្នកប្រើរួចរាល់"));
      await loadUsers(userQuery);
    } catch (err) {
      setError(err?.response?.data?.message || text("Cannot delete user", "មិនអាចលុបអ្នកប្រើបានទេ"));
    }
  };

  const resetUserForm = () => {
    setEditingUserId("");
    setUserForm(emptyUserForm);
  };

  const onUserSearch = async (e) => {
    e.preventDefault();
    await loadUsers(userQuery);
  };

  const toDateDisplay = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(lang === "kh" ? "km-KH" : "en-US");
  };

  const ageGroupLabel = (value) => {
    if (value === "children") return text("Children", "កុមារ");
    if (value === "elderly") return text("Elderly", "មនុស្សចាស់");
    return text("Adults", "មនុស្សពេញវ័យ");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{text("Admin Dashboard: Cambo Sugar", "ផ្ទាំងគ្រប់គ្រង: Cambo Sugar")}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {text(
              "Manage product and sugar information (g/100g) for Cambodia.",
              "គ្រប់គ្រងទិន្នន័យផលិតផល និងកម្រិតស្ករ (g/100g) សម្រាប់កម្ពុជា។"
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === "products" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {text("Products", "ផលិតផល")}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                activeTab === "users" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {text("Users", "អ្នកប្រើ")}
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                lang === "en" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("kh")}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                lang === "kh" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              ខ្មែរ
            </button>
          </div>
        </header>

        {activeTab === "products" && (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-4 lg:grid-cols-7">
              <StatsCard label={text("Total Products", "ផលិតផលសរុប")} value={productStats.totalProducts} />
              <StatsCard label={text("Low Sugar", "ស្ករតិច")} value={productStats.lowSugar} />
              <StatsCard label={text("Medium Sugar", "ស្ករមធ្យម")} value={productStats.mediumSugar} />
              <StatsCard label={text("High Sugar", "ស្ករខ្ពស់")} value={productStats.highSugar} />
              <StatsCard label={text("Verified", "បានផ្ទៀងផ្ទាត់")} value={productStats.verifiedCount} />
              <StatsCard label={text("Community", "សហគមន៍")} value={productStats.communityCount} />
              <StatsCard label={text("Manual", "បញ្ចូលដៃ")} value={productStats.manualCount} />
            </section>

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editingProductId ? text("Edit Product", "កែប្រែផលិតផល") : text("Create Product", "បង្កើតផលិតផល")}
                  </h2>
                  <SugarBadge level={sugarLevel} lang={lang} />
                </div>

                <form className="space-y-3" onSubmit={onSubmitProduct}>
                  <Field
                    label={text("Barcode", "បាកូដ")}
                    name="barcode"
                    value={productForm.barcode}
                    onChange={handleProductChange}
                    required
                  />
                  <Field
                    label={text("Product Name (Khmer)", "ឈ្មោះទំនិញ (ខ្មែរ)")}
                    name="nameKh"
                    value={productForm.nameKh}
                    onChange={handleProductChange}
                    required
                  />
                  <Field
                    label={text("Name EN", "ឈ្មោះ (អង់គ្លេស)")}
                    name="nameEn"
                    value={productForm.nameEn}
                    onChange={handleProductChange}
                  />
                  <Field label={text("Brand", "ម៉ាក")} name="brand" value={productForm.brand} onChange={handleProductChange} />
                  <Field
                    label={text("Sugar / 100g", "ស្ករ / 100g")}
                    name="sugarPer100g"
                    type="number"
                    step="0.1"
                    value={productForm.sugarPer100g}
                    onChange={(e) => {
                      handleProductChange(e);
                      updateSugarLevel(e.target.value);
                    }}
                    required
                  />
                  <Field
                    label={text("Default Serving (g)", "ទំហំចំណែកលំនាំដើម (g)")}
                    name="defaultServingSizeG"
                    type="number"
                    step="0.1"
                    value={productForm.defaultServingSizeG}
                    onChange={handleProductChange}
                    required
                  />
                  <SelectField
                    label={text("Confidence", "ភាពទុកចិត្ត")}
                    name="confidence"
                    value={productForm.confidence}
                    onChange={handleProductChange}
                  >
                    <option value="verified">{text("Verified", "បានផ្ទៀងផ្ទាត់")}</option>
                    <option value="community">{text("Community", "សហគមន៍")}</option>
                    <option value="manual">{text("Manual", "បញ្ចូលដៃ")}</option>
                  </SelectField>
                  <Field
                    label={text("Last Verified", "ផ្ទៀងផ្ទាត់ចុងក្រោយ")}
                    name="lastVerifiedAt"
                    type="datetime-local"
                    value={productForm.lastVerifiedAt}
                    onChange={handleProductChange}
                  />
                  <Field label={text("Notes", "កំណត់ចំណាំ")} name="notes" value={productForm.notes} onChange={handleProductChange} />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!canSubmitProduct || loading}
                      className="w-full rounded-md bg-brand-500 py-2 font-medium text-white disabled:opacity-50"
                    >
                      {loading
                        ? text("Saving...", "កំពុងរក្សាទុក...")
                        : editingProductId
                          ? text("Update", "កែប្រែ")
                          : text("Create", "បង្កើត")}
                    </button>
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700"
                    >
                      {text("Clear", "សម្អាត")}
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">{text("Product List", "បញ្ជីផលិតផល")}</h2>
                  <form className="flex gap-2" onSubmit={onProductSearch}>
                    <input
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      placeholder={text("Search barcode, name, brand...", "ស្វែងរកបាកូដ ឈ្មោះ ឬម៉ាក...")}
                      className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white">
                      {text("Search", "ស្វែងរក")}
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-2 py-2">{text("Barcode", "បាកូដ")}</th>
                        <th className="px-2 py-2">{text("Name KH", "ឈ្មោះខ្មែរ")}</th>
                        <th className="px-2 py-2">{text("Brand", "ម៉ាក")}</th>
                        <th className="px-2 py-2">{text("Sugar (100g)", "ស្ករ (100g)")}</th>
                        <th className="px-2 py-2">{text("Serving", "ចំណែក")}</th>
                        <th className="px-2 py-2">{text("Level", "កម្រិត")}</th>
                        <th className="px-2 py-2">{text("Trust", "ភាពទុកចិត្ត")}</th>
                        <th className="px-2 py-2">{text("Updated", "បានកែចុងក្រោយ")}</th>
                        <th className="px-2 py-2">{text("Verified", "ផ្ទៀងផ្ទាត់")}</th>
                        <th className="px-2 py-2">{text("Actions", "សកម្មភាព")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item) => (
                        <tr key={item._id} className="border-b border-slate-100">
                          <td className="px-2 py-2">{item.barcode}</td>
                          <td className="px-2 py-2">{item.nameKh}</td>
                          <td className="px-2 py-2">{item.brand || "-"}</td>
                          <td className="px-2 py-2">{item.sugarPer100g} g</td>
                          <td className="px-2 py-2">
                            {item.defaultServingSizeG || 100} g
                            <div className="text-xs text-slate-500">{text("Per serving", "ក្នុងមួយចំណែក")}: {item.sugarPerServingG ?? "-" } g</div>
                          </td>
                          <td className="px-2 py-2">
                            <SugarBadge level={item.sugarLevel} lang={lang} />
                          </td>
                          <td className="px-2 py-2">
                            <ConfidencePill confidence={item.confidence} lang={lang} />
                          </td>
                          <td className="px-2 py-2">{toDateDisplay(item.updatedAt)}</td>
                          <td className="px-2 py-2">{toDateDisplay(item.lastVerifiedAt)}</td>
                          <td className="px-2 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => onEditProduct(item)}
                                className="rounded bg-brand-100 px-2 py-1 text-xs font-medium text-brand-600"
                              >
                                {text("Edit", "កែប្រែ")}
                              </button>
                              <button
                                onClick={() => onDeleteProduct(item)}
                                className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                              >
                                {text("Delete", "លុប")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!productTableLoading && products.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">{text("No products found.", "មិនមានផលិតផលទេ។")}</p>
                )}
                {productTableLoading && (
                  <p className="mt-3 text-sm text-slate-500">{text("Loading products...", "កំពុងផ្ទុកផលិតផល...")}</p>
                )}
              </section>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-4 lg:grid-cols-8">
              <StatsCard label={text("Total Users", "អ្នកប្រើសរុប")} value={userStats.totalUsers} />
              <StatsCard label={text("Admins", "អ្នកគ្រប់គ្រង")} value={userStats.adminCount} />
              <StatsCard label={text("Users", "អ្នកប្រើ")} value={userStats.userCount} />
              <StatsCard label={text("Active", "សកម្ម")} value={userStats.activeCount} />
              <StatsCard label={text("Blocked", "បានទប់ស្កាត់")} value={userStats.blockedCount} />
              <StatsCard label={text("Children", "កុមារ")} value={userStats.childrenCount} />
              <StatsCard label={text("Adults", "មនុស្សពេញវ័យ")} value={userStats.adultCount} />
              <StatsCard label={text("Elderly", "មនុស្សចាស់")} value={userStats.elderlyCount} />
            </section>

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editingUserId ? text("Edit User", "កែប្រែអ្នកប្រើ") : text("Create User", "បង្កើតអ្នកប្រើ")}
                  </h2>
                </div>

                <form className="space-y-3" onSubmit={onSubmitUser}>
                  <Field label={text("Full Name", "ឈ្មោះពេញ")} name="name" value={userForm.name} onChange={handleUserChange} required />
                  <Field label={text("Email", "អ៊ីមែល")} name="email" type="email" value={userForm.email} onChange={handleUserChange} required />
                  <Field
                    label={
                      editingUserId
                        ? text("Password (leave blank to keep)", "ពាក្យសម្ងាត់ (ទុកទទេដើម្បីរក្សាទុកដដែល)")
                        : text("Password", "ពាក្យសម្ងាត់")
                    }
                    name="password"
                    type="password"
                    value={userForm.password}
                    onChange={handleUserChange}
                    required={!editingUserId}
                  />
                  <SelectField label={text("Role", "តួនាទី")} name="role" value={userForm.role} onChange={handleUserChange}>
                    <option value="user">{text("User", "អ្នកប្រើ")}</option>
                    <option value="admin">{text("Admin", "អ្នកគ្រប់គ្រង")}</option>
                  </SelectField>
                  <SelectField label={text("Status", "ស្ថានភាព")} name="status" value={userForm.status} onChange={handleUserChange}>
                    <option value="active">{text("Active", "សកម្ម")}</option>
                    <option value="blocked">{text("Blocked", "បានទប់ស្កាត់")}</option>
                  </SelectField>
                  <Field
                    label={text("Age", "អាយុ")}
                    name="age"
                    type="number"
                    value={userForm.age}
                    onChange={handleUserChange}
                  />
                  <Field
                    label={text("Birth Year", "ឆ្នាំកំណើត")}
                    name="birthYear"
                    type="number"
                    value={userForm.birthYear}
                    onChange={handleUserChange}
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!canSubmitUser || loading}
                      className="w-full rounded-md bg-brand-500 py-2 font-medium text-white disabled:opacity-50"
                    >
                      {loading
                        ? text("Saving...", "កំពុងរក្សាទុក...")
                        : editingUserId
                          ? text("Update", "កែប្រែ")
                          : text("Create", "បង្កើត")}
                    </button>
                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700"
                    >
                      {text("Clear", "សម្អាត")}
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">{text("User List", "បញ្ជីអ្នកប្រើ")}</h2>
                  <form className="flex gap-2" onSubmit={onUserSearch}>
                    <input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder={text("Search name, email, role...", "ស្វែងរកឈ្មោះ អ៊ីមែល ឬតួនាទី...")}
                      className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white">
                      {text("Search", "ស្វែងរក")}
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-2 py-2">{text("Name", "ឈ្មោះ")}</th>
                        <th className="px-2 py-2">{text("Email", "អ៊ីមែល")}</th>
                        <th className="px-2 py-2">{text("Age", "អាយុ")}</th>
                        <th className="px-2 py-2">{text("Group", "ក្រុម")}</th>
                        <th className="px-2 py-2">{text("Daily Limit", "កម្រិតប្រចាំថ្ងៃ")}</th>
                        <th className="px-2 py-2">{text("Role", "តួនាទី")}</th>
                        <th className="px-2 py-2">{text("Status", "ស្ថានភាព")}</th>
                        <th className="px-2 py-2">{text("Created", "បង្កើតថ្ងៃ")}</th>
                        <th className="px-2 py-2">{text("Actions", "សកម្មភាព")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id} className="border-b border-slate-100">
                          <td className="px-2 py-2">{item.name}</td>
                          <td className="px-2 py-2">{item.email}</td>
                          <td className="px-2 py-2">{item.age ?? "-"}</td>
                          <td className="px-2 py-2">{ageGroupLabel(item.ageGroup)}</td>
                          <td className="px-2 py-2">{item.dailySugarLimitG ?? 25} g</td>
                          <td className="px-2 py-2">
                            <StatusPill value={item.role} kind={item.role === "admin" ? "admin" : "user"} lang={lang} />
                          </td>
                          <td className="px-2 py-2">
                            <StatusPill value={item.status} kind={item.status === "active" ? "active" : "blocked"} lang={lang} />
                          </td>
                          <td className="px-2 py-2">{new Date(item.createdAt).toLocaleDateString(lang === "kh" ? "km-KH" : "en-US")}</td>
                          <td className="px-2 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => onEditUser(item)}
                                className="rounded bg-brand-100 px-2 py-1 text-xs font-medium text-brand-600"
                              >
                                {text("Edit", "កែប្រែ")}
                              </button>
                              <button
                                onClick={() => onDeleteUser(item)}
                                className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                              >
                                {text("Delete", "លុប")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!userTableLoading && users.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">{text("No users found.", "មិនមានអ្នកប្រើទេ។")}</p>
                )}
                {userTableLoading && <p className="mt-3 text-sm text-slate-500">{text("Loading users...", "កំពុងផ្ទុកអ្នកប្រើ...")}</p>}
              </section>
            </div>
          </>
        )}

        <section className="mt-6 rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800">{text("System Messages", "សារប្រព័ន្ធ")}</h3>
          {status && <p className="mt-2 text-sm text-brand-600">{status}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </main>
  );
}

function StatusPill({ value, kind, lang = "en" }) {
  const styles = {
    admin: "bg-indigo-100 text-indigo-700 border-indigo-200",
    user: "bg-slate-100 text-slate-700 border-slate-200",
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    blocked: "bg-red-100 text-red-700 border-red-200"
  };

  const labels = {
    admin: lang === "kh" ? "អ្នកគ្រប់គ្រង" : "Admin",
    user: lang === "kh" ? "អ្នកប្រើ" : "User",
    active: lang === "kh" ? "សកម្ម" : "Active",
    blocked: lang === "kh" ? "បានទប់ស្កាត់" : "Blocked"
  };

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${styles[kind] || styles.user}`}>
      {labels[value] || value}
    </span>
  );
}

function ConfidencePill({ confidence, lang = "en" }) {
  const styleMap = {
    verified: "bg-emerald-100 text-emerald-700 border-emerald-200",
    community: "bg-amber-100 text-amber-700 border-amber-200",
    manual: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const labelMap = {
    verified: lang === "kh" ? "បានផ្ទៀងផ្ទាត់" : "Verified",
    community: lang === "kh" ? "សហគមន៍" : "Community",
    manual: lang === "kh" ? "បញ្ចូលដៃ" : "Manual"
  };

  const key = ["verified", "community", "manual"].includes(confidence) ? confidence : "manual";

  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${styleMap[key]}`}>{labelMap[key]}</span>;
}

function StatsCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
      />
    </label>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-700">{label}</span>
      <select
        {...props}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-brand-500 focus:ring"
      >
        {children}
      </select>
    </label>
  );
}
