import { useEffect, useState } from "react";
import { Mail, Phone, Search, UserRoundPlus, UsersRound, X, LoaderCircle } from "lucide-react";
import { alertError, alertSuccess } from "../../../swertalert/AlertSuccess";
import Request from "../../util/Request";
import LightMode from "../DartMode/LightMode";
import "./walk_in.css";

const createEmptyForm = () => ({
  first_name: "",
  last_name: "",
  gender: "Male",
  phone: "",
  email: "",
  nationality: "",
  passport_no: "",
  address: "",
  password: "",
});

const getGuestName = (guest) => guest.full_name || [guest.first_name, guest.last_name].filter(Boolean).join(" ") || "Unnamed guest";

const getInitials = (guest) => getGuestName(guest)
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0].toUpperCase())
  .join("");

const getErrorMessage = (error) => error?.response?.data?.message
  || error?.response?.data?.errors?.map((item) => item.msg).join(", ")
  || error?.message
  || "Please try again.";

const Walk_inAndReg = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(createEmptyForm);

  useEffect(() => {
    let isMounted = true;

    Request("/api/customer", "get")
      .then((response) => {
        if (isMounted) setGuests(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        if (isMounted) {
          alertError({
            title: "Guests unavailable",
            text: getErrorMessage(error),
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredGuests = guests.filter((guest) => {
    const searchText = search.trim().toLowerCase();
    return !searchText || [
      getGuestName(guest),
      guest.email,
      guest.phone,
      guest.passport_no,
      guest.nationality,
    ].filter(Boolean).join(" ").toLowerCase().includes(searchText);
  });

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const closeRegisterForm = () => {
    if (saving) return;
    setRegisterOpen(false);
    setForm(createEmptyForm());
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        full_name: `${form.first_name.trim()} ${form.last_name.trim()}`,
        phone: form.phone.trim(),
        email: form.email.trim(),
        nationality: form.nationality.trim(),
        passport_no: form.passport_no.trim() || null,
        address: form.address.trim() || null,
      };
      const response = await Request("/api/customer", "post", payload);
      const customer = response.data;

      if (!customer?.id) {
        throw new Error("The customer API did not return the created guest.");
      }

      setGuests((current) => [customer, ...current]);
      setRegisterOpen(false);
      setForm(createEmptyForm());
      alertSuccess({
        title: "Guest registered",
        text: `${getGuestName(customer)} was added successfully.`,
      });
    } catch (error) {
      alertError({
        title: "Registration failed",
        text: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <LightMode title="Walk In Registration" />

      <div className="walkin-page">
        <div className="walkin-header">
          <div className="walkin-title">
            <div className="title-icon">
              <UsersRound size={23} />
            </div>

            <div>
              <h2>Guest Profiles</h2>
              <p>Manage registered guest contact and identity details</p>
            </div>
          </div>

          <button type="button" className="register-btn" onClick={() => setRegisterOpen(true)}>
            <UserRoundPlus size={17} />
            Register Walk-In Guest
          </button>
        </div>

        <div className="vip-filter">
          <label className="guest-search" htmlFor="guest-search">
            <Search size={16} />
            <input
              id="guest-search"
              type="search"
              placeholder="Search name, email, phone, passport..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <span className="guest-count">{filteredGuests.length} guests</span>
        </div>

        <div className="guest-grid">
          {loading ? (
            <div className="guest-list-state">Loading guest profiles...</div>
          ) : filteredGuests.length ? (
            filteredGuests.map((guest) => (
              <article className="guest-card" key={guest.id}>
                <div className="guest-top">
                  <div className="guest-avatar gray">{getInitials(guest)}</div>
                  <div className="guest-main-info">
                    <div className="guest-name-row"><h3>{getGuestName(guest)}</h3></div>
                    <div className="guest-document">
                      {guest.passport_no ? `Passport: ${guest.passport_no}` : guest.nationality || "Guest profile"}
                    </div>
                  </div>
                  <span className="guest-profile-badge">Guest</span>
                </div>

                <div className="guest-contact">
                  <div className="contact-item"><Phone size={15} /><span>{guest.phone || "No phone"}</span></div>
                  <div className="contact-item"><Mail size={15} /><span>{guest.email || "No email"}</span></div>
                </div>

                <div className="guest-divider" />
                <div className="guest-details-section">
                  <div className="preferences-title">GUEST DETAILS</div>
                  <div className="preference-list">
                    {guest.nationality && <span className="preference-tag">{guest.nationality}</span>}
                    {guest.address && <span className="preference-tag">{guest.address}</span>}
                    {!guest.nationality && !guest.address && <span className="guest-no-details">No additional details</span>}
                  </div>
                </div>

                <div className="guest-divider" />
                <div className="guest-bottom">
                  <div className="stay-info">
                    <span className="stay-label">Registered</span>
                    <strong>{guest.createdAt ? new Date(guest.createdAt).toLocaleDateString() : "Date unavailable"}</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="guest-list-state">
              {search ? "No guests match your search." : "No guest profiles found. Register the first guest to get started."}
            </div>
          )}
        </div>
      </div>

      {registerOpen && (
        <div className="walkin-modal-overlay" onClick={closeRegisterForm} role="presentation">
          <section
            className="walkin-register-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkin-register-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="walkin-register-header">
              <div>
                <h2 id="walkin-register-title">Register Walk-In Guest</h2>
                <p>Create a guest profile</p>
              </div>
              <button type="button" onClick={closeRegisterForm} aria-label="Close registration form" disabled={saving}>
                <X size={19} />
              </button>
            </header>

            <form onSubmit={handleRegister}>
              <div className="walkin-register-grid">
                <label>First name<input name="first_name" placeholder="Enter first name" value={form.first_name} onChange={updateForm} required autoComplete="given-name" /></label>
                <label>Last name<input name="last_name" placeholder="Enter last name" value={form.last_name} onChange={updateForm} required autoComplete="family-name" /></label>
                <label>Gender<select name="gender" value={form.gender} onChange={updateForm} required><option>Male</option><option>Female</option><option>Other</option></select></label>
                <label>Phone<input name="phone" type="tel" placeholder="Enter phone number" value={form.phone} onChange={updateForm} required autoComplete="tel" /></label>
                <label>Email<input name="email" type="email" placeholder="name@example.com" value={form.email} onChange={updateForm} required autoComplete="email" /></label>
                <label>Nationality<input name="nationality" placeholder="Enter nationality" value={form.nationality} onChange={updateForm} required /></label>
                <label>Passport number<input name="passport_no" placeholder="Enter passport number" value={form.passport_no} onChange={updateForm} /></label>
                <label>Initial password<input name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={updateForm} minLength={8} required autoComplete="new-password" /></label>
                <label className="walkin-register-address">Address<textarea name="address" placeholder="Enter street address, city, and country" value={form.address} onChange={updateForm} rows="2" /></label>
              </div>
              <footer className="walkin-register-actions">
                <button type="button" onClick={closeRegisterForm} disabled={saving}>Cancel</button>
                <button type="submit" className="walkin-register-submit" disabled={saving}>
                  {saving && <LoaderCircle className="walkin-register-spinner" size={16} />}
                  {saving ? "Registering..." : "Register guest"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Walk_inAndReg;