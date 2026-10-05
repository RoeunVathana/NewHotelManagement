import "./style/PopupBooking.css";
import dayjs from "dayjs";
import { Building2, Printer, X } from "lucide-react";

const PopupBooking = ({ onClose, reservation }) => {
    const detail = reservation?.reservation_details?.[0];
    const room = detail?.room;
    const roomType = room?.room_type;
    const bookingNumber = reservation?.id ? `BK-${String(reservation.id).padStart(4, "0")}` : "-";
    const checkIn = reservation?.check_in_date;
    const checkOut = reservation?.check_out_date;
    const nights = Number(detail?.nights || 0);
    const subtotal = detail?.subtotal;
    const total = Number(subtotal ?? (Number(detail?.price || 0) * nights));
    const paid = Number(reservation?.paid || 0);
    const balance = Math.max(total - paid, 0);

    const handleOverlayClick = () => {
        if (onClose) onClose();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="popup-booking-overlay" onClick={handleOverlayClick} role="presentation">
            <div className="popup-booking-modal" onClick={(e) => e.stopPropagation()}>

                {/* ================= HEADER ================= */}
                <div className="popup-booking-header">
                    <div className="popup-booking-title">
                        <span className="popup-booking-icon"><Building2 size={18} /></span>
                        Guest Folio & Tax Invoice {bookingNumber}
                    </div>

                    <div className="popup-booking-header-actions">
                        <button type="button" className="popup-booking-print-btn" onClick={handlePrint}>
                            <Printer size={14} />
                            Print Invoice
                        </button>

                        <button type="button" className="popup-booking-close-btn" onClick={onClose} aria-label="Close invoice">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ================= BODY ================= */}
                <div className="popup-booking-body">

                    {/* Hotel Information */}
                    <div className="popup-booking-hotel-section">

                        <div className="popup-booking-hotel-info">
                            <div className="popup-booking-hotel-name-row">
                                <div className="popup-booking-hotel-logo">
                                    <Building2 size={18} />
                                </div>

                                <div>
                                    <h2>HotelPro Grand Palace & Spa</h2>
                                    <p>Luxury Hospitality & Convention Center</p>
                                </div>
                            </div>

                            <div className="popup-booking-hotel-contact">
                                42 Heritage Boulevard, Central Avenue
                            </div>

                            <div className="popup-booking-hotel-contact">
                                GSTIN: 07AAAA0000A1Z5 | Phone: +91 (11) 4567-8900
                            </div>
                        </div>

                        <div className="popup-booking-tax-info">
                            <div className="popup-booking-tax-label">
                                TAX INVOICE
                            </div>

                            <strong>INV-{bookingNumber}</strong>

                            <span>Date: {reservation?.createdAt ? dayjs(reservation.createdAt).format("DD/MM/YYYY") : "-"}</span>
                        </div>

                    </div>

                    <div className="popup-booking-divider"></div>

                    {/* ================= GUEST DETAILS ================= */}
                    <div className="popup-booking-guest-details">

                        {/* Billed To */}
                        <div className="popup-booking-billed-to">
                            <label>BILLED TO:</label>

                            <h3>{reservation?.guest_name || "Unknown Guest"}</h3>

                            <p>{reservation?.phone_guest || "Phone not provided"}</p>
                            <p>{reservation?.email || "Email not provided"}</p>
                        </div>

                        {/* Stay Particulars */}
                        <div className="popup-booking-stay-particulars">
                            <label>STAY PARTICULARS:</label>

                            <div className="popup-booking-stay-row">
                                <span>Room:</span>
                                <strong>#{room?.room_number || detail?.room_number || "-"} {roomType?.name || ""}</strong>
                            </div>

                            <div className="popup-booking-stay-row">
                                <span>Check-In:</span>
                                <strong>{checkIn ? dayjs(checkIn).format("DD/MM/YYYY") : "-"}</strong>
                            </div>

                            <div className="popup-booking-stay-row">
                                <span>Check-Out:</span>
                                <strong>{checkOut ? dayjs(checkOut).format("DD/MM/YYYY") : "-"} ({nights} {nights === 1 ? "night" : "nights"})</strong>
                            </div>

                            <div className="popup-booking-stay-row">
                                <span>Guests:</span>
                                <strong>{reservation?.total_guest || 0} guests</strong>
                            </div>
                        </div>

                    </div>

                    {/* ================= PAYMENT TABLE ================= */}
                    <div className="popup-booking-payment-table">

                        <div className="popup-booking-table-header">
                            <div>Date</div>
                            <div>Description</div>
                            <div>Category</div>
                            <div>Amount</div>
                        </div>

                        <div className="popup-booking-table-row">
                            <div className="popup-booking-payment-date">
                                {reservation?.createdAt ? dayjs(reservation.createdAt).format("YYYY-MM-DD") : "-"}
                            </div>

                            <div>
                                OTA Booking Advance Deposit
                            </div>

                            <div>
                                <span className="popup-booking-category-badge">
                                    Payment
                                </span>
                            </div>

                            <div className="popup-booking-payment-amount">
                                {total.toFixed(2)}
                            </div>
                        </div>

                    </div>

                    {/* ================= TOTAL ================= */}
                    <div className="popup-booking-invoice-total">

                        <div className="popup-booking-total-row">
                            <span>Subtotal / Charges:</span>
                            <strong>${total.toFixed(2)}</strong>
                        </div>

                        <div className="popup-booking-total-row popup-booking-payment-received">
                            <span>Total Payments Received:</span>
                            <strong>${paid.toFixed(2)}</strong>
                        </div>

                        <div className="popup-booking-total-line"></div>

                        <div className="popup-booking-balance-row">
                            <span>Balance Due:</span>
                            <strong>${balance.toFixed(2)}</strong>
                        </div>

                    </div>

                    {/* ================= FOOTER ================= */}
                    <div className="popup-booking-invoice-footer">

                        <span>
                            Thank you for choosing HotelPro Grand Palace.
                            Have a pleasant stay!
                        </span>

                        <span>
                            Computer Generated Invoice • Authorized Signatory
                        </span>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default PopupBooking;