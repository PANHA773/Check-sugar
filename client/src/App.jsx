import { useEffect, useMemo, useState } from "react";
import SugarBadge from "./components/SugarBadge";
import {
  createProduct,
  createUser,
  deleteProduct,
  deleteUser,
  getProducts,
  getProductStats,
  getUserById,
  getUserStats,
  getUsers,
  getSugarScore,
  adminLogin,
  updateUserProfile,
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

const ADMIN_SESSION_KEY = "cambo_admin_session";

export default function App() {
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("products");
  const [adminSession, setAdminSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    profileImage: "",
    password: "",
    confirmPassword: ""
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

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
    try {
      const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
      if (!raw) {
        setAuthReady(true);
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.role === "admin" && parsed?.email) {
        setAdminSession(parsed);
      } else {
        window.localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } catch {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (!adminSession?._id) return;
    loadProducts();
    loadUsers();
    loadAdminProfile(adminSession._id);
  }, [adminSession?._id]);

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const onAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!authForm.email || !authForm.password) {
      setAuthError(text("Email and password are required", "សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់"));
      return;
    }

    setAuthLoading(true);
    try {
      const response = await adminLogin({
        email: authForm.email,
        password: authForm.password
      });
      const user = response?.user;
      if (!user || user.role !== "admin") {
        setAuthError(text("Admin account required", "ត្រូវតែជាគណនី Admin"));
        return;
      }
      const nextSession = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage || ""
      };
      setAdminSession(nextSession);
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
      setAuthForm({ email: "", password: "" });
    } catch (err) {
      setAuthError(err?.response?.data?.message || text("Login failed", "ចូលគណនីមិនជោគជ័យ"));
    } finally {
      setAuthLoading(false);
    }
  };

  const onLogout = () => {
    setAdminSession(null);
    setProducts([]);
    setUsers([]);
    setProfileForm({ name: "", email: "", profileImage: "", password: "", confirmPassword: "" });
    setProfileError("");
    setStatus("");
    setError("");
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const loadAdminProfile = async (id) => {
    if (!id) return;
    setProfileLoading(true);
    setProfileError("");
    try {
      const user = await getUserById(id);
      setProfileForm({
        name: user?.name || "",
        email: user?.email || "",
        profileImage: user?.profileImage || "",
        password: "",
        confirmPassword: ""
      });
      setAdminSession((prev) => {
        if (!prev) return prev;
        const nextName = user?.name || prev.name;
        const nextEmail = user?.email || prev.email;
        const nextProfileImage = user?.profileImage || "";
        const hasChanges =
          nextName !== prev.name ||
          nextEmail !== prev.email ||
          nextProfileImage !== (prev.profileImage || "");

        if (!hasChanges) {
          return prev;
        }

        const next = {
          ...prev,
          name: nextName,
          email: nextEmail,
          profileImage: nextProfileImage
        };
        window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setProfileError(err?.response?.data?.message || text("Cannot load profile", "មិនអាចទាញព័ត៌មានប្រវត្តិរូបបាន"));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError(text("Please choose an image file", "សូមជ្រើសរើសឯកសាររូបភាព"));
      return;
    }
    if (file.size > 1_500_000) {
      setProfileError(text("Image must be under 1.5MB", "រូបភាពត្រូវតែក្រោម 1.5MB"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, profileImage: String(reader.result || "") }));
      setProfileError("");
    };
    reader.onerror = () => {
      setProfileError(text("Cannot read image file", "មិនអាចអានឯកសាររូបភាពបាន"));
    };
    reader.readAsDataURL(file);
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!adminSession?._id) return;

    const nextName = String(profileForm.name || "").trim();
    const nextEmail = String(profileForm.email || "").trim().toLowerCase();
    const nextPassword = String(profileForm.password || "");
    const nextConfirmPassword = String(profileForm.confirmPassword || "");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nextName) {
      setProfileError(text("Name is required", "ត្រូវបញ្ចូលឈ្មោះ"));
      return;
    }
    if (!nextEmail || !emailPattern.test(nextEmail)) {
      setProfileError(text("A valid email is required", "ត្រូវបញ្ចូលអ៊ីមែលត្រឹមត្រូវ"));
      return;
    }
    if (nextPassword && nextPassword.length < 6) {
      setProfileError(text("Password must be at least 6 characters", "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច 6 តួ"));
      return;
    }
    if (nextPassword && nextPassword !== nextConfirmPassword) {
      setProfileError(text("Confirm password does not match", "ការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា"));
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    setStatus("");
    try {
      const updated = await updateUserProfile(adminSession._id, {
        name: nextName,
        email: nextEmail,
        ...(nextPassword ? { password: nextPassword } : {}),
        profileImage: profileForm.profileImage || ""
      });
      setProfileForm({
        name: updated?.name || "",
        email: updated?.email || "",
        profileImage: updated?.profileImage || "",
        password: "",
        confirmPassword: ""
      });
      const nextSession = {
        ...adminSession,
        name: updated?.name || adminSession.name,
        email: updated?.email || adminSession.email,
        profileImage: updated?.profileImage || ""
      };
      setAdminSession(nextSession);
      window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
      setStatus(text("Profile updated", "បានកែប្រែប្រវត្តិរូបរួចរាល់"));
    } catch (err) {
      setProfileError(err?.response?.data?.message || text("Cannot update profile", "មិនអាចកែប្រែប្រវត្តិរូបបាន"));
    } finally {
      setProfileSaving(false);
    }
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

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 px-6 py-4 text-sm backdrop-blur-xl">Loading dashboard...</div>
      </main>
    );
  }

  if (!adminSession) {
    return (
      <AdminLoginPage
        lang={lang}
        text={text}
        authForm={authForm}
        authLoading={authLoading}
        authError={authError}
        onAuthChange={handleAuthChange}
        onLogin={onAdminLogin}
        onSetLang={setLang}
      />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="pointer-events-none absolute left-[-120px] top-[-80px] h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{text("Admin Dashboard: Cambo Sugar", "ផ្ទាំងគ្រប់គ្រង: Cambo Sugar")}</h1>
              <p className="mt-1 text-sm text-slate-300">
                {text(
                  "Manage product and sugar information (g/100g) for Cambodia.",
                  "គ្រប់គ្រងទិន្នន័យផលិតផល និងកម្រិតស្ករ (g/100g) សម្រាប់កម្ពុជា។"
                )}
              </p>
              <p className="mt-2 text-xs font-medium text-cyan-200/80">
                {text("Signed in as", "បានចូលជា")} {adminSession.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/40 bg-slate-800">
                {adminSession.profileImage ? (
                  <img src={adminSession.profileImage} alt="Admin" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-cyan-100">{(adminSession.name || "A").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:brightness-110"
              >
                {text("Logout", "ចាកចេញ")}
              </button>
            </div>
          </div>
          <div className="mt-4 h-px bg-slate-700" />
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <nav className="grid gap-2 md:grid-cols-3">
              <AdminMenuButton
                kind="products"
                active={activeTab === "products"}
                label={text("Products", "ផលិតផល")}
                description={text("Manage food and sugar data", "គ្រប់គ្រងទិន្នន័យទំនិញ និងកម្រិតស្ករ")}
                count={productStats.totalProducts}
                onClick={() => setActiveTab("products")}
              />
              <AdminMenuButton
                kind="users"
                active={activeTab === "users"}
                label={text("Users", "អ្នកប្រើ")}
                description={text("Manage users and roles", "គ្រប់គ្រងអ្នកប្រើ និងតួនាទី")}
                count={userStats.totalUsers}
                onClick={() => setActiveTab("users")}
              />
              <AdminMenuButton
                kind="profile"
                active={activeTab === "profile"}
                label={text("Profile", "ប្រវត្តិរូប")}
                description={text("Edit your admin account", "កែប្រែគណនី Admin របស់អ្នក")}
                onClick={() => setActiveTab("profile")}
              />
            </nav>

            <div className="inline-flex w-fit rounded-xl border border-slate-700 bg-slate-800/70 p-1">
              <button
                onClick={() => setLang("en")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  lang === "en" ? "bg-cyan-500 text-slate-950 shadow-sm" : "text-slate-200 hover:bg-slate-700"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang("kh")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  lang === "kh" ? "bg-cyan-500 text-slate-950 shadow-sm" : "text-slate-200 hover:bg-slate-700"
                }`}
              >
                ខ្មែរ
              </button>
            </div>
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
              <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
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
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 font-semibold text-slate-950 shadow-lg shadow-cyan-900/30 disabled:opacity-50"
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
                      className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-700"
                    >
                      {text("Clear", "សម្អាត")}
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-white">{text("Product List", "បញ្ជីផលិតផល")}</h2>
                  <form className="flex gap-2" onSubmit={onProductSearch}>
                    <input
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      placeholder={text("Search barcode, name, brand...", "ស្វែងរកបាកូដ ឈ្មោះ ឬម៉ាក...")}
                      className="w-64 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-cyan-500 transition focus:ring"
                    />
                    <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/20">
                      {text("Search", "ស្វែងរក")}
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="border-b border-slate-700 text-slate-400">
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
                        <tr key={item._id} className="border-b border-slate-800 transition hover:bg-slate-800/40">
                          <td className="px-2 py-2">{item.barcode}</td>
                          <td className="px-2 py-2">{item.nameKh}</td>
                          <td className="px-2 py-2">{item.brand || "-"}</td>
                          <td className="px-2 py-2">{item.sugarPer100g} g</td>
                          <td className="px-2 py-2">
                            {item.defaultServingSizeG || 100} g
                            <div className="text-xs text-slate-400">{text("Per serving", "ក្នុងមួយចំណែក")}: {item.sugarPerServingG ?? "-" } g</div>
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
                                className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
                              >
                                {text("Edit", "កែប្រែ")}
                              </button>
                              <button
                                onClick={() => onDeleteProduct(item)}
                                className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25"
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
                  <p className="mt-3 text-sm text-slate-400">{text("No products found.", "មិនមានផលិតផលទេ។")}</p>
                )}
                {productTableLoading && (
                  <p className="mt-3 text-sm text-slate-400">{text("Loading products...", "កំពុងផ្ទុកផលិតផល...")}</p>
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
              <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
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
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 font-semibold text-slate-950 shadow-lg shadow-cyan-900/30 disabled:opacity-50"
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
                      className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 font-medium text-slate-200 transition hover:bg-slate-700"
                    >
                      {text("Clear", "សម្អាត")}
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-white">{text("User List", "បញ្ជីអ្នកប្រើ")}</h2>
                  <form className="flex gap-2" onSubmit={onUserSearch}>
                    <input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder={text("Search name, email, role...", "ស្វែងរកឈ្មោះ អ៊ីមែល ឬតួនាទី...")}
                      className="w-64 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none ring-cyan-500 transition focus:ring"
                    />
                    <button className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/20">
                      {text("Search", "ស្វែងរក")}
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-200">
                    <thead className="border-b border-slate-700 text-slate-400">
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
                        <tr key={item._id} className="border-b border-slate-800 transition hover:bg-slate-800/40">
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
                                className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
                              >
                                {text("Edit", "កែប្រែ")}
                              </button>
                              <button
                                onClick={() => onDeleteUser(item)}
                                className="rounded-lg border border-rose-300/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25"
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
                  <p className="mt-3 text-sm text-slate-400">{text("No users found.", "មិនមានអ្នកប្រើទេ។")}</p>
                )}
                {userTableLoading && <p className="mt-3 text-sm text-slate-400">{text("Loading users...", "កំពុងផ្ទុកអ្នកប្រើ...")}</p>}
              </section>
            </div>
          </>
        )}

        {activeTab === "profile" && (
          <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">{text("Admin Profile", "ប្រវត្តិរូប Admin")}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {text(
                "Update your name, email, profile image, and password.",
                "កែប្រែឈ្មោះ អ៊ីមែល រូបភាពប្រវត្តិរូប និងពាក្យសម្ងាត់របស់អ្នក។"
              )}
            </p>

            {profileLoading ? (
              <p className="mt-4 text-sm text-slate-400">{text("Loading profile...", "កំពុងទាញប្រវត្តិរូប...")}</p>
            ) : (
              <form onSubmit={onSaveProfile} className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
                  <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-cyan-300/30 bg-slate-900 shadow-lg shadow-cyan-900/30">
                    {profileForm.profileImage ? (
                      <img src={profileForm.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-cyan-100">
                        {(profileForm.name || adminSession?.name || "A").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <label className="mt-4 block text-sm font-medium text-slate-200">{text("Profile Image", "រូបភាពប្រវត្តិរូប")}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="mt-2 block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-950 hover:file:bg-cyan-400"
                  />
                  {profileForm.profileImage && (
                    <button
                      type="button"
                      onClick={() => setProfileForm((prev) => ({ ...prev, profileImage: "" }))}
                      className="mt-3 w-full rounded-lg border border-rose-300/30 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/25"
                    >
                      {text("Remove Image", "លុបរូបភាព")}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <Field
                    label={text("Display Name", "ឈ្មោះបង្ហាញ")}
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                  />
                  <Field
                    label={text("Email", "អ៊ីមែល")}
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    required
                  />
                  <Field
                    label={text("New Password (optional)", "ពាក្យសម្ងាត់ថ្មី (ស្រេចចិត្ត)")}
                    name="password"
                    type="password"
                    value={profileForm.password}
                    onChange={handleProfileChange}
                  />
                  <Field
                    label={text("Confirm New Password", "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី")}
                    name="confirmPassword"
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={handleProfileChange}
                  />
                  <p className="text-xs text-slate-400">
                    {text("Leave password fields empty to keep current password.", "ទុកពាក្យសម្ងាត់ទទេ ប្រសិនបើមិនចង់ប្តូរ។")}
                  </p>

                  {profileError && <p className="text-sm font-medium text-rose-300">{profileError}</p>}

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 font-semibold text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {profileSaving ? text("Saving...", "កំពុងរក្សាទុក...") : text("Save Profile", "រក្សាទុកប្រវត្តិរូប")}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">{text("System Messages", "សារប្រព័ន្ធ")}</h3>
          {status && <p className="mt-2 text-sm text-emerald-300">{status}</p>}
          {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
        </section>
      </div>
    </main>
  );
}

function AdminLoginPage({ lang, text, authForm, authLoading, authError, onAuthChange, onLogin, onSetLang }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="pointer-events-none absolute left-[-80px] top-[-70px] h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-80px] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

      <section className="w-full max-w-md rounded-3xl border border-cyan-300/20 bg-slate-900/75 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{text("Admin Login", "ចូលប្រើ Admin")}</h1>
          <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800/70 p-1">
            <button
              onClick={() => onSetLang("en")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${lang === "en" ? "bg-cyan-500 text-slate-950" : "text-slate-200 hover:bg-slate-700"}`}
            >
              EN
            </button>
            <button
              onClick={() => onSetLang("kh")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${lang === "kh" ? "bg-cyan-500 text-slate-950" : "text-slate-200 hover:bg-slate-700"}`}
            >
              KH
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-300">
          {text(
            "Only admin accounts can access this dashboard.",
            "មានតែគណនី Admin ប៉ុណ្ណោះដែលអាចចូលផ្ទាំងនេះបាន។"
          )}
        </p>

        <form onSubmit={onLogin} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-200">{text("Email", "អ៊ីមែល")}</span>
            <input
              name="email"
              type="email"
              value={authForm.email}
              onChange={onAuthChange}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-cyan-500 transition focus:ring"
              placeholder="admin@cambo.com"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-200">{text("Password", "ពាក្យសម្ងាត់")}</span>
            <input
              name="password"
              type="password"
              value={authForm.password}
              onChange={onAuthChange}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-cyan-500 transition focus:ring"
              required
            />
          </label>

          {authError && <p className="text-sm font-medium text-rose-300">{authError}</p>}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 font-semibold text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:opacity-60"
          >
            {authLoading ? text("Signing in...", "កំពុងចូល...") : text("Sign in as Admin", "ចូលជា Admin")}
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminMenuButton({ kind, label, description, active, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-3 text-left transition ${
        active
          ? "border-cyan-300/40 bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 text-white shadow-lg shadow-cyan-900/30"
          : "border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg ${
              active ? "bg-cyan-400/25 text-cyan-100" : "bg-slate-700 text-slate-200"
            }`}
          >
            <MenuIcon kind={kind} />
          </span>
          <div className="min-w-0">
            <p className={`truncate text-sm font-semibold ${active ? "text-white" : "text-slate-100"}`}>{label}</p>
            {description && (
              <p className={`mt-0.5 line-clamp-1 text-xs ${active ? "text-cyan-100/90" : "text-slate-400"}`}>{description}</p>
            )}
          </div>
        </div>

        {Number.isFinite(count) && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-cyan-400/25 text-cyan-100" : "bg-slate-700 text-slate-200"}`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );
}

function MenuIcon({ kind }) {
  if (kind === "users") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a3 3 0 0 1 0 5.75" />
      </svg>
    );
  }

  if (kind === "profile") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 16.5 12 21l9-4.5" />
      <path d="M3 12 12 16.5 21 12" />
    </svg>
  );
}

function StatusPill({ value, kind, lang = "en" }) {
  const styles = {
    admin: "bg-indigo-500/20 text-indigo-200 border-indigo-300/30",
    user: "bg-slate-700/40 text-slate-200 border-slate-500/40",
    active: "bg-emerald-500/20 text-emerald-200 border-emerald-300/30",
    blocked: "bg-red-500/20 text-red-200 border-red-300/30"
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
    verified: "bg-emerald-500/20 text-emerald-200 border-emerald-300/30",
    community: "bg-amber-500/20 text-amber-200 border-amber-300/30",
    manual: "bg-slate-700/40 text-slate-200 border-slate-500/40"
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
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/65 p-4 shadow-xl shadow-cyan-950/20 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-wide text-cyan-200/70">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-200">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-cyan-500 transition focus:ring"
      />
    </label>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-200">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-cyan-500 transition focus:ring"
      >
        {children}
      </select>
    </label>
  );
}
