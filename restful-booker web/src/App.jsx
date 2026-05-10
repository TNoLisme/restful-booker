import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Check,
  CircleOff,
  FileJson,
  LayoutDashboard,
  Hotel,
  ListFilter,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import {
  createBooking,
  deleteBooking,
  getBooking,
  getBookingIds,
  login,
  patchBooking,
  pingServer,
  updateBooking,
} from "./services/api";

const emptyBooking = {
  firstname: "",
  lastname: "",
  totalprice: 120,
  depositpaid: true,
  bookingdates: {
    checkin: "2026-05-12",
    checkout: "2026-05-14",
  },
  additionalneeds: "Breakfast",
};

const pageMeta = {
  dashboard: {
    eyebrow: "Admin dashboard",
    title: "Restful-Booker Dashboard",
    description:
      "Chon mot chuc nang API de quan ly booking sau khi dang nhap admin.",
  },
  auth: {
    eyebrow: "POST /auth",
    title: "Dang nhap Admin",
    description: "Lay token quan tri de thuc hien PUT, PATCH va DELETE.",
  },
  list: {
    eyebrow: "GET /booking",
    title: "Get Booking IDs",
    description: "Lay danh sach booking id, ho tro loc theo ten va ngay.",
  },
  detail: {
    eyebrow: "GET /booking/:id",
    title: "Get Booking",
    description: "Nhap booking id de xem du lieu day du cua mot booking.",
  },
  create: {
    eyebrow: "POST /booking",
    title: "Tao booking moi",
    description: "Gui payload day du de tao ban ghi booking tren API.",
  },
  update: {
    eyebrow: "PUT /booking/:id",
    title: "Cap nhat toan bo",
    description: "Thay the toan bo booking theo id. Can dang nhap admin.",
  },
  patch: {
    eyebrow: "PATCH /booking/:id",
    title: "Cap nhat mot phan",
    description: "Sua nhanh mot vai truong cua booking. Can dang nhap admin.",
  },
  delete: {
    eyebrow: "DELETE /booking/:id",
    title: "Xoa booking",
    description: "Xoa mot ban ghi booking theo id. Can dang nhap admin.",
  },
  ping: {
    eyebrow: "GET /ping",
    title: "Kiem tra he thong",
    description: "Kiem tra server Restful-Booker dang online hay offline.",
  },
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [credentials, setCredentials] = useState({
    username: "admin",
    password: "password123",
  });
  const [session, setSession] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [loadingKey, setLoadingKey] = useState("");
  const [toasts, setToasts] = useState([]);
  const [pageResults, setPageResults] = useState({
    dashboard: {
      title: "Dashboard session",
      data: { message: "Login first to receive an auth token." },
    },
    list: {
      title: "GET /booking IDs response",
      data: { message: "Submit the list form to load booking data." },
    },
    detail: {
      title: "GET /booking/:id response",
      data: { message: "Submit a booking id to view detail." },
    },
    create: {
      title: "POST /booking response",
      data: { message: "Submit the create form to create a booking." },
    },
    update: {
      title: "PUT /booking/:id response",
      data: { message: "Submit the update form to replace a booking." },
    },
    patch: {
      title: "PATCH /booking/:id response",
      data: { message: "Submit the patch form to update fields." },
    },
    delete: {
      title: "DELETE /booking/:id response",
      data: { message: "Submit a booking id to delete it." },
    },
    ping: {
      title: "GET /ping response",
      data: { message: "Run health check to see API status." },
    },
  });

  const [listFilters, setListFilters] = useState({
    firstname: "",
    lastname: "",
    checkin: "",
    checkout: "",
  });
  const [bookingIds, setBookingIds] = useState([]);
  const [detailId, setDetailId] = useState("1");
  const [detailBooking, setDetailBooking] = useState(null);
  const [createForm, setCreateForm] = useState({
    ...emptyBooking,
    firstname: "Jim",
    lastname: "Brown",
  });
  const [updateId, setUpdateId] = useState("1");
  const [updateForm, setUpdateForm] = useState({
    ...emptyBooking,
    firstname: "James",
    lastname: "Brown",
  });
  const [patchId, setPatchId] = useState("1");
  const [patchForm, setPatchForm] = useState({
    firstname: "James",
    lastname: "Brown",
    totalprice: "",
  });
  const [deleteId, setDeleteId] = useState("1");

  const currentMeta = pageMeta[activePage];

  const listPreview = useMemo(() => {
    return bookingIds.slice(0, 40);
  }, [bookingIds]);

  useEffect(() => {
    handlePing(false);
  }, []);

  function showToast(title, type = "success") {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, title, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function setApiResult(title, data) {
    setPageResults((current) => ({
      ...current,
      [activePage]: { title, data },
    }));
  }

  function setPageApiResult(page, title, data) {
    setPageResults((current) => ({
      ...current,
      [page]: { title, data },
    }));
  }

  async function runRequest(key, task, successMessage) {
    setLoadingKey(key);
    try {
      const data = await task();
      if (successMessage) showToast(successMessage);
      return data;
    } catch (error) {
      showToast(error.message, "error");
      setApiResult("Request failed", { error: error.message });
      return null;
    } finally {
      setLoadingKey("");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const data = await runRequest(
      "auth",
      () => login(credentials),
      "Dang nhap thanh cong",
    );
    if (!data) return;
    setSession({ username: credentials.username, token: data.token });
    setActivePage("dashboard");
    setPageApiResult("dashboard", "POST /auth response", data);
    hydrateBookingList({});
  }

  async function handleList(event) {
    event.preventDefault();
    hydrateBookingList(listFilters, true);
  }

  async function hydrateBookingList(filters = {}, showSuccess = false) {
    const data = await runRequest(
      "list",
      async () => {
        const ids = await getBookingIds(filters);
        const details = await Promise.allSettled(
          ids
            .slice(0, 40)
            .map(async (item) => ({
              bookingid: item.bookingid,
              ...(await getBooking(item.bookingid)),
            })),
        );

        return details.map((result, index) => {
          if (result.status === "fulfilled") return result.value;
          return ids[index];
        });
      },
      showSuccess ? "Da tai danh sach booking" : "",
    );
    if (!data) return;
    setBookingIds(data);
    setPageApiResult("list", "GET /booking IDs response", data);
  }

  async function handleDetail(event) {
    event.preventDefault();
    const data = await runRequest(
      "detail",
      () => getBooking(detailId),
      "Da tai chi tiet booking",
    );
    if (!data) return;
    setDetailBooking(data);
    setApiResult(`GET /booking/${detailId} response`, data);
  }

  async function handleCreate(event) {
    event.preventDefault();
    const data = await runRequest(
      "create",
      () => createBooking(bookingPayload(createForm)),
      "Da tao booking moi",
    );
    if (!data) return;
    setBookingIds((current) => [{ bookingid: data.bookingid }, ...current]);
    setDetailId(String(data.bookingid));
    setUpdateId(String(data.bookingid));
    setPatchId(String(data.bookingid));
    setDeleteId(String(data.bookingid));
    setApiResult("POST /booking response", data);
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!requireSession()) return;
    const data = await runRequest(
      "update",
      () => updateBooking(updateId, bookingPayload(updateForm), credentials),
      "Da cap nhat toan bo booking",
    );
    if (!data) return;
    setApiResult(`PUT /booking/${updateId} response`, data);
  }

  async function handlePatch(event) {
    event.preventDefault();
    if (!requireSession()) return;
    const payload = Object.fromEntries(
      Object.entries(patchForm)
        .map(([key, value]) => [key, String(value).trim()])
        .filter(([, value]) => value !== ""),
    );
    if (payload.totalprice) payload.totalprice = Number(payload.totalprice);

    const data = await runRequest(
      "patch",
      () => patchBooking(patchId, payload, credentials),
      "Da cap nhat mot phan booking",
    );
    if (!data) return;
    setApiResult(`PATCH /booking/${patchId} response`, data);
  }

  async function handleDelete(event) {
    event.preventDefault();
    if (!requireSession()) return;
    const data = await runRequest(
      "delete",
      () => deleteBooking(deleteId, credentials),
      "Da xoa booking",
    );
    if (!data) return;
    setBookingIds((current) =>
      current.filter((item) => String(item.bookingid) !== String(deleteId)),
    );
    setApiResult(`DELETE /booking/${deleteId} response`, {
      status: 201,
      message: "Created: booking deleted",
    });
  }

  async function handlePing(showSuccess = true) {
    const data = await runRequest(
      "ping",
      () => pingServer(),
      showSuccess ? "Server dang online" : "",
    );
    const online = Boolean(data);
    setServerOnline(online);
    setPageApiResult(
      "ping",
      "GET /ping response",
      online ? { status: 201, message: "Created" } : { status: "offline" },
    );
  }

  function requireSession() {
    if (session) return true;
    showToast("Vui long dang nhap admin truoc", "error");
    setActivePage("dashboard");
    return false;
  }

  if (!session) {
    return (
      <LoginShell
        credentials={credentials}
        isLoading={loadingKey === "auth"}
        onChange={setCredentials}
        onSubmit={handleLogin}
        serverOnline={serverOnline}
        toasts={toasts}
      />
    );
  }

  return (
    <div className="app-shell api-workspace">
      <Sidebar
        activePage={activePage}
        isLoggedIn={Boolean(session)}
        onLogout={() => {
          setSession(null);
          showToast("Da dang xuat");
        }}
        onNavigate={setActivePage}
      />

      <main className="main-panel">
        <Topbar
          meta={currentMeta}
          session={session}
          serverOnline={serverOnline}
        />

        <div className="api-layout">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="api-page"
            initial={{ opacity: 0, y: 10 }}
            key={activePage}
          >
            {activePage === "auth" && (
              <LoginPage
                credentials={credentials}
                isLoading={loadingKey === "auth"}
                onChange={setCredentials}
                onSubmit={handleLogin}
                session={session}
              />
            )}

            {activePage === "dashboard" && (
              <DashboardPage
                bookingCount={bookingIds.length}
                onNavigate={setActivePage}
                serverOnline={serverOnline}
                session={session}
              />
            )}

            {activePage === "list" && (
              <ListPage
                filters={listFilters}
                isLoading={loadingKey === "list"}
                items={listPreview}
                onChange={setListFilters}
                onSubmit={handleList}
              />
            )}

            {activePage === "detail" && (
              <DetailPage
                booking={detailBooking}
                bookingId={detailId}
                isLoading={loadingKey === "detail"}
                onIdChange={setDetailId}
                onSubmit={handleDetail}
              />
            )}

            {activePage === "create" && (
              <BookingWritePage
                form={createForm}
                isLoading={loadingKey === "create"}
                method="POST"
                onChange={setCreateForm}
                onSubmit={handleCreate}
                title="Create booking"
              />
            )}

            {activePage === "update" && (
              <BookingWritePage
                bookingId={updateId}
                form={updateForm}
                isLoading={loadingKey === "update"}
                method="PUT"
                onChange={setUpdateForm}
                onIdChange={setUpdateId}
                onSubmit={handleUpdate}
                requiresAuth
                session={session}
                title="Update full booking"
              />
            )}

            {activePage === "patch" && (
              <PatchPage
                bookingId={patchId}
                form={patchForm}
                isLoading={loadingKey === "patch"}
                onChange={setPatchForm}
                onIdChange={setPatchId}
                onSubmit={handlePatch}
                session={session}
              />
            )}

            {activePage === "delete" && (
              <DeletePage
                bookingId={deleteId}
                isLoading={loadingKey === "delete"}
                onIdChange={setDeleteId}
                onSubmit={handleDelete}
                session={session}
              />
            )}

            {activePage === "ping" && (
              <PingPage
                isLoading={loadingKey === "ping"}
                onSubmit={(event) => {
                  event.preventDefault();
                  handlePing(true);
                }}
                serverOnline={serverOnline}
              />
            )}
          </motion.section>

          <ResponsePanel
            result={pageResults[activePage]}
            session={session}
            serverOnline={serverOnline}
          />
        </div>
      </main>

      <div className={`server-pill ${serverOnline ? "online" : "offline"}`}>
        <Server size={16} />
        {serverOnline ? "Online" : "Offline"}
      </div>

      <ToastStack toasts={toasts} />
    </div>
  );
}

function Sidebar({ activePage, isLoggedIn, onLogout, onNavigate }) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "list", label: "GetBooking", icon: ListFilter },
    { id: "detail", label: "GetBookingIds", icon: Search },
    { id: "create", label: "Create Booking", icon: Plus },
    { id: "update", label: "Update Booking", icon: Save },
    { id: "patch", label: "Patch Booking", icon: Pencil },
    { id: "delete", label: "Delete Booking", icon: Trash2 },
    { id: "ping", label: "Ping Server", icon: Activity },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Hotel size={24} />
        </div>
        <div>
          <strong>Restful Booker</strong>
          <span>API Pages</span>
        </div>
      </div>

      <nav className="nav-list api-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              className={
                activePage === link.id ? "nav-item active" : "nav-item"
              }
              key={link.id}
              onClick={() => onNavigate(link.id)}
              type="button"
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className={isLoggedIn ? "session-card signed" : "session-card"}>
          <User size={18} />
          <span>{isLoggedIn ? "Admin active" : "Guest mode"}</span>
        </div>
        {isLoggedIn && (
          <button className="ghost-button" onClick={onLogout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

function LoginShell({
  credentials,
  isLoading,
  onChange,
  onSubmit,
  serverOnline,
  toasts,
}) {
  return (
    <div className="login-shell">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="login-panel"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.35 }}
      >
        <div className="login-brand">
          <div className="brand-mark">
            <Hotel size={28} />
          </div>
          <div>
            <p className="eyebrow">Restful Booker Admin</p>
            <h1>Login</h1>
          </div>
        </div>

        <p className="login-copy">
          Dang nhap bang tai khoan admin de vao dashboard va su dung cac chuc
          nang GET, POST, PUT, PATCH, DELETE trong API.
        </p>

        <LoginPage
          credentials={credentials}
          isLoading={isLoading}
          onChange={onChange}
          onSubmit={onSubmit}
          session={null}
        />

        <div
          className={
            serverOnline
              ? "login-health online-state"
              : "login-health offline-state"
          }
        >
          <Server size={18} />
          {serverOnline ? "API server online" : "API server offline"}
        </div>
      </motion.section>

      <ToastStack toasts={toasts} />
    </div>
  );
}

function DashboardPage({ bookingCount, onNavigate, serverOnline, session }) {
  const actions = [
    {
      id: "list",
      label: "GetBookingIds",
      method: "GET /booking",
      icon: ListFilter,
    },
    {
      id: "detail",
      label: "GetBooking",
      method: "GET /booking/:id",
      icon: BookOpen,
    },
    { id: "create", label: "Tao booking", method: "POST /booking", icon: Plus },
    {
      id: "update",
      label: "Cap nhat toan bo",
      method: "PUT /booking/:id",
      icon: Save,
    },
    {
      id: "patch",
      label: "Cap nhat mot phan",
      method: "PATCH /booking/:id",
      icon: Pencil,
    },
    {
      id: "delete",
      label: "Xoa booking",
      method: "DELETE /booking/:id",
      icon: Trash2,
    },
    {
      id: "ping",
      label: "Kiem tra he thong",
      method: "GET /ping",
      icon: Activity,
    },
  ];

  return (
    <div className="page-section">
      <div className="metrics-grid dashboard-metrics">
        <MetricCard
          icon={ShieldCheck}
          label="Admin session"
          value={session.username}
        />
        <MetricCard icon={ListFilter} label="Loaded IDs" value={bookingCount} />
        <MetricCard
          icon={Server}
          label="API status"
          value={serverOnline ? "Online" : "Offline"}
        />
      </div>

      <div className="dashboard-actions">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              className="action-card"
              key={action.id}
              onClick={() => onNavigate(action.id)}
              type="button"
            >
              <span className="metric-icon">
                <Icon size={20} />
              </span>
              <span>{action.method}</span>
              <strong>{action.label}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      className="metric-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.div>
  );
}

function Topbar({ meta, session, serverOnline }) {
  return (
    <header className="topbar compact-topbar">
      <div>
        <p className="eyebrow">{meta.eyebrow}</p>
        <h1>{meta.title}</h1>
        <p className="page-description">{meta.description}</p>
      </div>
      <div className="topbar-actions">
        <div className={serverOnline ? "status-chip ok" : "status-chip bad"}>
          {serverOnline ? <Check size={16} /> : <CircleOff size={16} />}
          {serverOnline ? "API Online" : "API Offline"}
        </div>
        <div className="status-chip">
          <ShieldCheck size={16} />
          {session ? session.username : "Guest"}
        </div>
      </div>
    </header>
  );
}

function LoginPage({ credentials, isLoading, onChange, onSubmit, session }) {
  return (
    <form className="glass-form api-card" onSubmit={onSubmit}>
      <SectionHeading
        icon={LogIn}
        eyebrow="Admin credentials"
        title="POST /auth"
      />
      <div className="form-grid">
        <label>
          Username
          <input
            onChange={(event) =>
              onChange({ ...credentials, username: event.target.value })
            }
            value={credentials.username}
          />
        </label>
        <label>
          Password
          <input
            onChange={(event) =>
              onChange({ ...credentials, password: event.target.value })
            }
            type="password"
            value={credentials.password}
          />
        </label>
      </div>
      {session && (
        <div className="info-strip">Token active for admin operations.</div>
      )}
      <SubmitButton icon={LogIn} isLoading={isLoading} label="Login" />
    </form>
  );
}

function ListPage({ filters, isLoading, items, onChange, onSubmit }) {
  return (
    <div className="page-section">
      <form className="glass-form api-card" onSubmit={onSubmit}>
        <SectionHeading
          icon={ListFilter}
          eyebrow="Query parameters"
          title="GET /booking"
        />
        <div className="form-grid">
          <label>
            First name
            <input
              onChange={(event) =>
                onChange({ ...filters, firstname: event.target.value })
              }
              value={filters.firstname}
            />
          </label>
          <label>
            Last name
            <input
              onChange={(event) =>
                onChange({ ...filters, lastname: event.target.value })
              }
              value={filters.lastname}
            />
          </label>
          <label>
            Checkin
            <input
              onChange={(event) =>
                onChange({ ...filters, checkin: event.target.value })
              }
              type="date"
              value={filters.checkin}
            />
          </label>
          <label>
            Checkout
            <input
              onChange={(event) =>
                onChange({ ...filters, checkout: event.target.value })
              }
              type="date"
              value={filters.checkout}
            />
          </label>
        </div>
        <SubmitButton
          icon={Search}
          isLoading={isLoading}
          label="Get booking IDs"
        />
      </form>

      <div className="booking-table-wrap">
        <table className="booking-table api-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Stay</th>
              <th>Deposit</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.bookingid}>
                <td>#{item.bookingid}</td>
                <td>
                  {item.firstname
                    ? `${item.firstname} ${item.lastname}`
                    : "API id only"}
                </td>
                <td>
                  {item.bookingdates
                    ? `${item.bookingdates.checkin} - ${item.bookingdates.checkout}`
                    : "Use Get Booking"}
                </td>
                <td>
                  {typeof item.depositpaid === "boolean" ? (
                    <span
                      className={item.depositpaid ? "badge paid" : "badge due"}
                    >
                      {item.depositpaid ? "Paid" : "Due"}
                    </span>
                  ) : (
                    <span className="source-tag">Unknown</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailPage({ booking, bookingId, isLoading, onIdChange, onSubmit }) {
  return (
    <div className="page-section">
      <form className="glass-form api-card" onSubmit={onSubmit}>
        <SectionHeading
          icon={BookOpen}
          eyebrow="Path parameter"
          title="GET /booking/:id"
        />
        <IdField label="Booking ID" onChange={onIdChange} value={bookingId} />
        <SubmitButton icon={Search} isLoading={isLoading} label="Get detail" />
      </form>

      {booking && (
        <div className="detail-grid api-detail">
          <Detail
            label="Guest"
            value={`${booking.firstname} ${booking.lastname}`}
          />
          <Detail label="Total price" value={`$${booking.totalprice}`} />
          <Detail
            label="Deposit"
            value={booking.depositpaid ? "Paid" : "Due"}
          />
          <Detail
            label="Stay"
            value={`${booking.bookingdates.checkin} - ${booking.bookingdates.checkout}`}
          />
          <Detail
            label="Additional needs"
            value={booking.additionalneeds || "None"}
          />
        </div>
      )}
    </div>
  );
}

function BookingWritePage({
  bookingId,
  form,
  isLoading,
  method,
  onChange,
  onIdChange,
  onSubmit,
  requiresAuth,
  session,
  title,
}) {
  return (
    <form className="glass-form api-card" onSubmit={onSubmit}>
      <SectionHeading
        icon={method === "POST" ? Plus : Save}
        eyebrow={`${method} payload`}
        title={title}
      />
      {bookingId !== undefined && (
        <IdField label="Booking ID" onChange={onIdChange} value={bookingId} />
      )}
      {requiresAuth && !session && <AuthWarning />}
      <FormFields form={form} onChange={onChange} />
      <SubmitButton
        icon={method === "POST" ? Plus : Save}
        isLoading={isLoading}
        label={method === "POST" ? "Create" : "Update full"}
      />
    </form>
  );
}

function PatchPage({
  bookingId,
  form,
  isLoading,
  onChange,
  onIdChange,
  onSubmit,
  session,
}) {
  return (
    <form className="glass-form api-card" onSubmit={onSubmit}>
      <SectionHeading
        icon={Pencil}
        eyebrow="PATCH payload"
        title="Partial update"
      />
      <IdField label="Booking ID" onChange={onIdChange} value={bookingId} />
      {!session && <AuthWarning />}
      <div className="form-grid">
        <label>
          First name
          <input
            onChange={(event) =>
              onChange({ ...form, firstname: event.target.value })
            }
            value={form.firstname}
          />
        </label>
        <label>
          Last name
          <input
            onChange={(event) =>
              onChange({ ...form, lastname: event.target.value })
            }
            value={form.lastname}
          />
        </label>
        <label>
          Total price
          <input
            onChange={(event) =>
              onChange({ ...form, totalprice: event.target.value })
            }
            type="number"
            value={form.totalprice}
          />
        </label>
      </div>
      <SubmitButton icon={Pencil} isLoading={isLoading} label="Patch booking" />
    </form>
  );
}

function DeletePage({ bookingId, isLoading, onIdChange, onSubmit, session }) {
  return (
    <form className="glass-form api-card danger-card" onSubmit={onSubmit}>
      <SectionHeading
        icon={Trash2}
        eyebrow="Danger operation"
        title="DELETE /booking/:id"
      />
      {!session && <AuthWarning />}
      <IdField label="Booking ID" onChange={onIdChange} value={bookingId} />
      <div className="info-strip danger-info">
        This sends DELETE to the real API when the id exists remotely.
      </div>
      <SubmitButton
        icon={Trash2}
        isLoading={isLoading}
        label="Delete booking"
        variant="danger"
      />
    </form>
  );
}

function PingPage({ isLoading, onSubmit, serverOnline }) {
  return (
    <form className="glass-form api-card" onSubmit={onSubmit}>
      <SectionHeading
        icon={Activity}
        eyebrow="Health check"
        title="GET /ping"
      />
      <div
        className={
          serverOnline
            ? "system-state online-state"
            : "system-state offline-state"
        }
      >
        <Server size={34} />
        <strong>{serverOnline ? "Server online" : "Server offline"}</strong>
      </div>
      <SubmitButton
        icon={Activity}
        isLoading={isLoading}
        label="Check server"
      />
    </form>
  );
}

function FormFields({ form, onChange }) {
  return (
    <div className="form-grid">
      <label>
        First name
        <input
          required
          onChange={(event) =>
            onChange({ ...form, firstname: event.target.value })
          }
          value={form.firstname}
        />
      </label>
      <label>
        Last name
        <input
          required
          onChange={(event) =>
            onChange({ ...form, lastname: event.target.value })
          }
          value={form.lastname}
        />
      </label>
      <label>
        Total price
        <input
          min="1"
          onChange={(event) =>
            onChange({ ...form, totalprice: event.target.value })
          }
          required
          type="number"
          value={form.totalprice}
        />
      </label>
      <label>
        Checkin
        <input
          onChange={(event) =>
            onChange({
              ...form,
              bookingdates: {
                ...form.bookingdates,
                checkin: event.target.value,
              },
            })
          }
          required
          type="date"
          value={form.bookingdates.checkin}
        />
      </label>
      <label>
        Checkout
        <input
          onChange={(event) =>
            onChange({
              ...form,
              bookingdates: {
                ...form.bookingdates,
                checkout: event.target.value,
              },
            })
          }
          required
          type="date"
          value={form.bookingdates.checkout}
        />
      </label>
      <label className="toggle-row">
        <input
          checked={form.depositpaid}
          onChange={(event) =>
            onChange({ ...form, depositpaid: event.target.checked })
          }
          type="checkbox"
        />
        Deposit paid
      </label>
      <label className="wide">
        Additional needs
        <input
          onChange={(event) =>
            onChange({ ...form, additionalneeds: event.target.value })
          }
          value={form.additionalneeds}
        />
      </label>
    </div>
  );
}

function ResponsePanel({ result, session, serverOnline }) {
  return (
    <aside className="response-panel">
      <div className="response-header">
        <div>
          <p className="eyebrow">API response</p>
          <h2>{result.title}</h2>
        </div>
        <FileJson size={22} />
      </div>
      <pre>{JSON.stringify(result.data, null, 2)}</pre>
      <div className="response-meta">
        <span className={serverOnline ? "badge paid" : "badge due"}>
          {serverOnline ? "Online" : "Offline"}
        </span>
        <span className="source-tag">
          {session ? "Token active" : "No token"}
        </span>
      </div>
    </aside>
  );
}

function SectionHeading({ icon: Icon, eyebrow, title }) {
  return (
    <div className="form-heading">
      <Icon size={22} />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function IdField({ label, onChange, value }) {
  return (
    <label className="id-field">
      {label}
      <input
        min="1"
        onChange={(event) => onChange(event.target.value)}
        required
        type="number"
        value={value}
      />
    </label>
  );
}

function SubmitButton({ icon: Icon, isLoading, label, variant = "primary" }) {
  const className = variant === "danger" ? "danger-button" : "primary-button";
  return (
    <button className={className} disabled={isLoading} type="submit">
      {isLoading ? <Loader2 className="spin" size={17} /> : <Icon size={17} />}
      {label}
    </button>
  );
}

function AuthWarning() {
  return (
    <div className="info-strip warning-info">
      Admin login is required before sending this request.
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={toast.type === "error" ? "toast error" : "toast"}
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
            key={toast.id}
          >
            {toast.title}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function bookingPayload(form) {
  return {
    firstname: form.firstname.trim(),
    lastname: form.lastname.trim(),
    totalprice: Number(form.totalprice),
    depositpaid: Boolean(form.depositpaid),
    bookingdates: {
      checkin: form.bookingdates.checkin,
      checkout: form.bookingdates.checkout,
    },
    additionalneeds: form.additionalneeds.trim() || "None",
  };
}

export default App;
