import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, UserRound, X } from "lucide-react";
import { alertError, alertSuccess } from "../../../swertalert/AlertSuccess";
import Request from "../../util/Request";
import "./style/PopupWalkRg.css";

const toDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
    const result = new Date(`${date}T00:00:00`);
    result.setDate(result.getDate() + days);
    return toDateInput(result);
};

const PopupWalkRg = ({ onClose, onCreated }) => {
    const today = toDateInput(new Date());
    const [rooms, setRooms] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        guest_name: "",
        email: "",
        employee_id: "",
        check_in_date: today,
        check_out_date: addDays(today, 1),
        total_guest: "1",
        room_id: "",
    });

    useEffect(() => {
        let isMounted = true;

        Request("/api/room", "get")
            .then((response) => {
                if (!isMounted) return;
                const availableRooms = (response.data || []).filter(
                    (room) => room.status === "Available",
                );
                setRooms(availableRooms);
                setForm((current) => ({
                    ...current,
                    room_id: availableRooms[0]?.id ? String(availableRooms[0].id) : "",
                }));
            })
            .catch((error) => {
                if (!isMounted) return;
                alertError({
                    title: "Rooms unavailable",
                    text: error?.response?.data?.message || "Could not load available rooms.",
                });
            })
            .finally(() => {
                if (isMounted) setLoadingRooms(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        Request("/api/employee", "get")
            .then((response) => {
                if (isMounted) setEmployees(response.data || []);
            })
            .catch((error) => {
                if (!isMounted) return;
                alertError({
                    title: "Employees unavailable",
                    text: error?.response?.data?.message || "Could not load employees.",
                });
            })
            .finally(() => {
                if (isMounted) setLoadingEmployees(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const selectedRoom = rooms.find((room) => String(room.id) === form.room_id);
    const roomPrice = Number(selectedRoom?.room_type?.price_per_night || 0);
    const nights = form.check_in_date && form.check_out_date
        ? Math.ceil(
            (new Date(`${form.check_out_date}T00:00:00`) -
                new Date(`${form.check_in_date}T00:00:00`)) /
            (1000 * 60 * 60 * 24),
        )
        : 0;
    const total = roomPrice * nights;

    const updateForm = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleCheckInChange = (event) => {
        const checkInDate = event.target.value;
        setForm((current) => ({
            ...current,
            check_in_date: checkInDate,
            check_out_date: current.check_out_date <= checkInDate
                ? addDays(checkInDate, 1)
                : current.check_out_date,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.guest_name.trim() || !selectedRoom || !form.employee_id || nights <= 0) {
            alertError({
                title: "Check reservation details",
                text: "Enter a guest name, select an available room and check-in employee, and choose valid stay dates.",
            });
            return;
        }

        setSaving(true);
        try {
            const response = await Request("/api/reservation", "post", {
                customer_id: null,
                reservation_date: today,
                check_in_date: form.check_in_date,
                check_out_date: form.check_out_date,
                total_guest: Number(form.total_guest),
                status: "Checked In",
                guest_name: form.guest_name.trim(),
                email: form.email.trim() || null,
                reservation_details: [{
                    room_id: selectedRoom.id,
                    price: roomPrice,
                    nights,
                    subtotal: total,
                    room_number: selectedRoom.room_number,
                }],
            });

            const createdReservation = response.data?.reservation || response.data?.data?.reservation || response.data;

            await Request("/api/checkIn", "post", {
                reservation_id: createdReservation.id,
                employee_id: Number(form.employee_id),
                checkin_time: new Date().toISOString(),
                deposit: 0,
            });

            await Request(`/api/room/status/${selectedRoom.id}`, "put", {
                status: "Occupied",
            });

            alertSuccess({
                title: "Guest checked in",
                text: `${form.guest_name.trim()} is checked in for ${nights} ${nights === 1 ? "night" : "nights"}.`,
            });
            onCreated?.(createdReservation);
            onClose();
        } catch (error) {
            alertError({
                title: "Reservation failed",
                text: error?.response?.data?.message || error?.message || "Could not create the reservation.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="popup-walkin-overlay" onClick={onClose} role="presentation">
            <section
                className="popup-walkin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-guest-reservation-title"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="popup-walkin-header">
                    <div className="popup-walkin-header-left">
                        <div className="popup-walkin-header-icon"><CalendarDays size={19} /></div>
                        <div>
                            <h2 id="new-guest-reservation-title">New Guest Reservation</h2>
                            <span>Create a direct reservation</span>
                        </div>
                    </div>
                    <button type="button" className="popup-walkin-close" onClick={onClose} aria-label="Close reservation form">
                        <X size={21} />
                    </button>
                </header>

                <form className="popup-walkin-body" onSubmit={handleSubmit}>
                    <section className="popup-walkin-section">
                        <h3 className="popup-walkin-section-title"><UserRound size={16} /> Guest information</h3>
                        <div className="popup-walkin-grid popup-walkin-guest-grid">
                            <div className="popup-walkin-input-group">
                                <label htmlFor="guest-name">Full name <span aria-hidden="true">*</span></label>
                                <input id="guest-name" name="guest_name" value={form.guest_name} onChange={updateForm} autoComplete="name" required />
                            </div>
                            <div className="popup-walkin-input-group">
                                <label htmlFor="guest-email">Email address</label>
                                <input id="guest-email" name="email" type="email" value={form.email} onChange={updateForm} autoComplete="email" />
                            </div>
                            <div className="popup-walkin-input-group">
                                <label htmlFor="check-in-employee">Check-in employee <span aria-hidden="true">*</span></label>
                                <select id="check-in-employee" name="employee_id" value={form.employee_id} onChange={updateForm} disabled={loadingEmployees || employees.length === 0} required>
                                    <option value="">{loadingEmployees ? "Loading employees..." : "Select an employee"}</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="popup-walkin-section">
                        <h3 className="popup-walkin-section-title">Stay details</h3>
                        <div className="popup-walkin-grid popup-walkin-four-grid">
                            <div className="popup-walkin-input-group">
                                <label htmlFor="check-in-date">Check-in</label>
                                <input id="check-in-date" name="check_in_date" type="date" min={today} max={today} value={form.check_in_date} onChange={handleCheckInChange} required />
                            </div>
                            <div className="popup-walkin-input-group">
                                <label htmlFor="check-out-date">Check-out</label>
                                <input id="check-out-date" name="check_out_date" type="date" min={addDays(form.check_in_date, 1)} value={form.check_out_date} onChange={updateForm} required />
                            </div>
                            <div className="popup-walkin-input-group">
                                <label htmlFor="guest-count">Guests</label>
                                <input id="guest-count" name="total_guest" type="number" min="1" max={selectedRoom?.room_type?.max_guest || 20} value={form.total_guest} onChange={updateForm} required />
                            </div>
                            <div className="popup-walkin-input-group">
                                <label htmlFor="room-choice">Available room</label>
                                <select id="room-choice" name="room_id" value={form.room_id} onChange={updateForm} disabled={loadingRooms || rooms.length === 0} required>
                                    <option value="">{loadingRooms ? "Loading rooms..." : "Select a room"}</option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            Room #{room.room_number} · {room.room_type?.name || "Room"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {!loadingRooms && rooms.length === 0 && (
                            <p className="popup-walkin-empty">There are no available rooms right now.</p>
                        )}
                    </section>

                    <section className="popup-walkin-price-summary" aria-live="polite">
                        <div className="popup-walkin-price-row">
                            <span>{nights} {nights === 1 ? "night" : "nights"} × ${roomPrice.toFixed(2)}</span>
                            <strong>${total.toFixed(2)}</strong>
                        </div>
                        <div className="popup-walkin-price-divider" />
                        <div className="popup-walkin-grand-total">
                            <span>Estimated total</span>
                            <strong>${total.toFixed(2)}</strong>
                        </div>
                    </section>

                    <button className="popup-walkin-confirm-button" type="submit" disabled={saving || loadingRooms || loadingEmployees || rooms.length === 0 || employees.length === 0}>
                        {saving ? <LoaderCircle className="popup-walkin-spinner" size={17} /> : null}
                        {saving ? "Checking in guest..." : "Create reservation & check in"}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default PopupWalkRg;