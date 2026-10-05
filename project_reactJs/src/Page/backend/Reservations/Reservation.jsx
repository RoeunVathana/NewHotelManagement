import { useEffect, useState } from "react";

import {
  CalendarDays,
  Check,
  Filter,
  Plus,
  ChevronDown,
  Receipt,
  UserRound,
  X,
} from "lucide-react";

import "./style/reservation.css";
import LightMode from "../DartMode/LightMode";
import Request from "../../util/Request";
import { alertError, alertSuccess } from "../../../swertalert/AlertSuccess";
import PopupBooking from "./PopupBooking";
import PopupWalkRg from "./PopupWalkRg";

const Reservation = () => {
  const [status, setStatus] = useState("All Statuses");
  const [channel, setChannel] = useState("All Channels");
  const [dataReservation, setDataReservation] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [pendingEmployeeAction, setPendingEmployeeAction] = useState(null);

  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
  const [isWalkinPopupOpen, setIsWalkinPopupOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // =========================================================
  // Format API date
  // =========================================================
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // Get first reservation detail
  // =========================================================
  const getDetail = (reservation) => {
    return reservation?.reservation_details?.[0] || null;
  };

  // =========================================================
  // Get room
  // =========================================================
  const getRoom = (reservation) => {
    return getDetail(reservation)?.room || null;
  };

  // =========================================================
  // Get room type
  // =========================================================
  const getRoomType = (reservation) => {
    return getRoom(reservation)?.room_type || null;
  };

  // =========================================================
  // Get stay text
  // =========================================================
  const getStay = (reservation) => {
    const checkIn = formatDate(reservation?.check_in_date);
    const checkOut = formatDate(reservation?.check_out_date);

    return `${checkIn} → ${checkOut}`;
  };

  // =========================================================
  // Get nights and guests
  // =========================================================
  const getStayInfo = (reservation) => {
    const detail = getDetail(reservation);

    const nights = Number(detail?.nights || 0);
    const guests = Number(reservation?.total_guest || 0);

    return `${nights} ${nights === 1 ? "night" : "nights"}, ${guests} ${guests === 1 ? "guest" : "guests"
      }`;
  };

  // =========================================================
  // Get amount
  // =========================================================
  const getAmountValue = (reservation) => {
    const detail = getDetail(reservation);

    if (detail?.subtotal !== undefined && detail?.subtotal !== null) {
      return Number(detail.subtotal || 0);
    }

    const price = Number(detail?.price || 0);
    const nights = Number(detail?.nights || 0);

    return price * nights;
  };

  // =========================================================
  // Format amount
  // =========================================================
  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // Filter reservations
  // =========================================================
  const filteredReservations = dataReservation.filter((item) => {
    const statusMatch = status === "All Statuses" || item.status === status;

    const channelMatch =
      channel === "All Channels" || (item.source || "Direct") === channel;

    return statusMatch && channelMatch;
  });

  // =========================================================
  // Status class
  // =========================================================
  const getStatusClass = (value) => {
    switch (value) {
      case "Checked In":
        return "status checked-in";

      case "Checked Out":
        return "status checked-out";

      case "Confirmed":
        return "status confirmed";

      case "Cancelled":
        return "status cancelled";

      case "Reserved":
        return "status confirmed";

      default:
        return "status";
    }
  };

  // =========================================================
  // Fetch reservations
  // =========================================================
  useEffect(() => {
    let isMounted = true;

    Request("/api/reservation", "get")
      .then((res) => {
        if (!isMounted) return;

        setDataReservation(Array.isArray(res.data) ? res.data : []);
        console.log("Fetched Reservations:", res.data);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Fetch reservations error:", error);
        setDataReservation([]);
        alertError({
          title: "Error",
          text:
            error?.response?.data?.message || "Failed to load reservations.",
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshReservations = async () => {
    try {
      const response = await Request("/api/reservation", "get");
      setDataReservation(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      alertError({
        title: "Reservation created",
        text: error?.response?.data?.message || "The reservation was created, but the list could not be refreshed.",
      });
    }
  };

  const requestEmployeeSelection = async (action, item) => {
    setPendingEmployeeAction({ action, item });
    setSelectedEmployeeId("");

    if (employees.length || employeesLoading) return;

    setEmployeesLoading(true);
    try {
      const response = await Request("/api/employee", "get");
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setPendingEmployeeAction(null);
      alertError({
        title: "Employees unavailable",
        text: error?.response?.data?.message || "Could not load employees.",
      });
    } finally {
      setEmployeesLoading(false);
    }
  };

  const confirmEmployeeAction = () => {
    if (!selectedEmployeeId || !pendingEmployeeAction) return;

    const { action, item } = pendingEmployeeAction;
    const employeeId = Number(selectedEmployeeId);
    setPendingEmployeeAction(null);

    if (action === "checkin") {
      void handleCheckIn(item, employeeId);
    } else {
      void handleCheckOut(item, employeeId);
    }
  };

  // =========================================================
  // Check In
  // =========================================================
  const handleCheckIn = async (item, employeeId) => {
    if (!item?.id || !employeeId || loadingId !== null) {
      return;
    }

    const roomId = getDetail(item)?.room?.id;

    if (!roomId) {
      alertError({
        title: "Check In Failed",
        text: "This reservation does not have a room.",
      });

      return;
    }

    try {
      setLoadingId(item.id);
      setLoadingAction("checkin");

      // Update reservation status
      await Request(`/api/reservation/status/${item.id}`, "put", {
        status: "Checked In",
      });

      // Update room status
      await Request(`/api/room/status/${roomId}`, "put", {
        status: "Occupied",
      });

      // Create check-in
      await Request("/api/checkIn", "post", {
        reservation_id: item.id,
        checkin_time: new Date().toISOString(),
        deposit: 0,
        employee_id: employeeId,
      });

      // Update local state
      setDataReservation((prevData) =>
        prevData.map((reservation) =>
          reservation.id === item.id
            ? {
              ...reservation,
              status: "Checked In",
            }
            : reservation,
        ),
      );

      // =====================================================
      // SUCCESS FEEDBACK
      // =====================================================
      alertSuccess({
        title: "Check In Successful",
        text: `${item.guest_name || "Guest"} has been checked in successfully.`,
      });
    } catch (error) {
      console.error("Check in error:", error);

      alertError({
        title: "Check In Failed",
        text: error?.response?.data?.message || "Failed to check in guest.",
      });
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  };

  // =========================================================
  // Check Out
  // =========================================================
  const handleCheckOut = async (item, employeeId) => {
    if (!item?.id || !employeeId || loadingId !== null) {
      return;
    }

    const roomId = getDetail(item)?.room?.id;

    if (!roomId) {
      alertError({
        title: "Check Out Failed",
        text: "This reservation does not have a room.",
      });

      return;
    }

    try {
      setLoadingId(item.id);
      setLoadingAction("checkout");

      const totalAmount = getAmountValue(item);

      // Create checkout record
      await Request("/api/checkOut", "post", {
        reservation_id: item.id,
        checkout_time: new Date().toISOString(),
        total_amount: totalAmount,
        employee_id: employeeId,
        damage_fee: 0,
        discount: 0,
      });

      // Update reservation status
      await Request(`/api/reservation/status/${item.id}`, "put", {
        status: "Checked Out",
      });

      // Update room status
      await Request(`/api/room/status/${roomId}`, "put", {
        status: "Available",
      });
      // Remove room relationship
      await Request(`/api/reservationDetail/${getRoom(item).id}`, "put");

      // Update local state
      setDataReservation((prevData) =>
        prevData.map((reservation) =>
          reservation.id === item.id
            ? {
              ...reservation,
              status: "Checked Out",
            }
            : reservation,
        ),
      );

      // =====================================================
      // SUCCESS FEEDBACK
      // =====================================================
      alertSuccess({
        title: "Check Out Successful",
        text: `${item.guest_name || "Guest"} has been checked out successfully.`,
      });
    } catch (error) {
      console.error("Check out error:", error);

      alertError({
        title: "Check Out Failed",
        text: error?.response?.data?.message || "Failed to check out guest.",
      });
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  };

  // =========================================================
  // Cancel Reservation
  // =========================================================
  const handleCancel = async (item) => {
    if (!item?.id || loadingId !== null) {
      return;
    }

    const roomId = getRoom(item)?.id;

    if (!roomId) {
      alertError({
        title: "Cancel Failed",
        text: "This reservation does not have a room.",
      });

      return;
    }

    try {
      setLoadingId(item.id);
      setLoadingAction("cancel");

      await Request(`/api/reservation/status/${item.id}`, "put", {
        status: "Cancelled",
      });

      await Request(`/api/reservationDetail/${roomId}`, "put");

      await Request(`/api/room/status/${roomId}`, "put", {
        status: "Available",
      });

      // Update local state
      setDataReservation((prevData) =>
        prevData.map((reservation) =>
          reservation.id === item.id
            ? {
              ...reservation,
              status: "Cancelled",
            }
            : reservation,
        ),
      );

      // =====================================================
      // SUCCESS FEEDBACK
      // =====================================================
      alertSuccess({
        title: "Reservation Cancelled",
        text: `Reservation BK-${String(item.id).padStart(
          4,
          "0",
        )} has been cancelled successfully.`,
      });
    } catch (error) {
      console.error("Cancel reservation error:", error);

      alertError({
        title: "Cancel Failed",
        text: error?.response?.data?.message || "Failed to cancel reservation.",
      });
    } finally {
      setLoadingId(null);
      setLoadingAction(null);
    }
  };

  // =========================================================
  // Render
  // =========================================================
  return (
    <div className="dashboard reservation-page">
      <LightMode title="Reservations" />

      <main className="reservation-container">
        {/* Header */}
        <section className="reservation-header">
          <div className="reservation-title">
            <div className="title-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <h1>Reservations & Bookings</h1>

              <p>Manage all guest arrivals, departures, and OTA sync</p>
            </div>
          </div>

          <button
            type="button"
            className="create-booking-btn"
            onClick={() => setIsWalkinPopupOpen(true)}
          >
            <Plus size={18} />
            Create New Booking
          </button>
        </section>

        {/* Filters */}
        <section className="reservation-filter">
          <div className="filter-left">
            <div className="filter-label">
              <Filter size={16} />
              <span>Filter:</span>
            </div>

            <div className="status-buttons">
              {[
                "All Statuses",
                "Reserved",
                "Confirmed",
                "Checked In",
                "Checked Out",
                "Cancelled",
              ].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    status === item ? "filter-btn active" : "filter-btn"
                  }
                  onClick={() => setStatus(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Channel */}
          <div className="channel-filter">
            <span>Channel:</span>

            <div className="select-wrapper">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option>All Channels</option>
                <option>Direct</option>
                <option>Corporate</option>
                <option>Booking.com</option>
                <option>Expedia</option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="reservation-table-wrapper">
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Room</th>
                <th>Stay Dates</th>
                <th>Status</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-reservation">
                      Loading reservations...
                    </div>
                  </td>
                </tr>
              ) : filteredReservations.length > 0 ? (
                filteredReservations.map((item) => {
                  const roomType = getRoomType(item);
                  const isLoading = loadingId === item.id;

                  return (
                    <tr key={item.id}>
                      {/* Booking ID */}
                      <td>
                        <span className="booking-id">
                          BK-
                          {String(item.id).padStart(4, "0")}
                        </span>
                      </td>

                      {/* Guest */}
                      <td>
                        <div className="guest-info">
                          <strong>{item.guest_name || "Unknown Guest"}</strong>

                          {item.email && <span>{item.email}</span>}
                        </div>
                      </td>

                      {/* Room */}
                      <td>
                        <div className="room-info">
                          <strong>#{item.reservation_details[0]?.room_number || "-"}</strong>

                          <span>{roomType?.name || "Unknown Room Type"}</span>
                        </div>
                      </td>

                      {/* Stay */}
                      <td>
                        <div className="stay-info">
                          <strong>{getStay(item)}</strong>

                          <span>({getStayInfo(item)})</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={getStatusClass(item.status)}>
                          {item.status || "Unknown"}
                        </span>
                      </td>

                      {/* Source */}
                      <td>
                        <span className="source-badge">
                          {item.source || "Direct"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td>
                        <div className="amount-info">
                          <strong>${formatAmount(getAmountValue(item))}</strong>

                          <span>Paid: ${formatAmount(item.paid)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          {/* Check In */}
                          {(item.status === "Confirmed" ||
                            item.status === "Reserved") && (
                              <button
                                type="button"
                                className="action-btn check-in"
                                onClick={() => requestEmployeeSelection("checkin", item)}
                                disabled={loadingId !== null}
                              >
                                {isLoading && loadingAction === "checkin"
                                  ? "Checking In..."
                                  : "Check In"}
                              </button>
                            )}

                          {/* Check Out */}
                          {item.status === "Checked In" && (
                            <button
                              type="button"
                              className="action-btn check-out"
                                onClick={() => requestEmployeeSelection("checkout", item)}
                              disabled={loadingId !== null}
                            >
                              {isLoading && loadingAction === "checkout"
                                ? "Checking Out..."
                                : "Check Out"}
                            </button>
                          )}

                          {/* Payment */}
                          <button
                            type="button"
                            className="icon-action"
                            title="Payment"
                            disabled={loadingId !== null}
                            onClick={() => {
                              setSelectedReservation(item);
                              setIsBookingPopupOpen(true);
                            }}
                          >
                            <Receipt size={17} />
                          </button>

                          {/* Cancel */}
                          {(item.status === "Confirmed" ||
                            item.status === "Reserved") && (
                              <button
                                type="button"
                                className="icon-action cancel"
                                title="Cancel"
                                disabled={loadingId !== null}
                                onClick={() => handleCancel(item)}
                              >
                                {isLoading && loadingAction === "cancel" ? (
                                  "..."
                                ) : (
                                  <X size={16} />
                                )}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-reservation">
                      No reservations found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {isBookingPopupOpen && (
        <div className="popup-booking-container">
          <PopupBooking
            reservation={selectedReservation}
            onClose={() => {
              setIsBookingPopupOpen(false);
              setSelectedReservation(null);
            }}
          />
        </div>
      )}

      {
        isWalkinPopupOpen && (
          <div className="popup-walkin-container">
            <PopupWalkRg
              onClose={() => setIsWalkinPopupOpen(false)}
              onCreated={refreshReservations}
            />
          </div>
        )
      }
      {pendingEmployeeAction && (
        <div
          className="reservation-employee-overlay"
          onClick={() => setPendingEmployeeAction(null)}
          role="presentation"
        >
          <section
            className="reservation-employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="reservation-employee-header">
              <div className="reservation-employee-icon"><UserRound size={19} /></div>
              <div>
                <h2 id="employee-picker-title">
                  {pendingEmployeeAction.action === "checkin" ? "Check in guest" : "Check out guest"}
                </h2>
                <p>{pendingEmployeeAction.item.guest_name || "Guest"}</p>
              </div>
              <button
                type="button"
                className="reservation-employee-close"
                onClick={() => setPendingEmployeeAction(null)}
                aria-label="Close employee selection"
              >
                <X size={19} />
              </button>
            </header>
            <div className="reservation-employee-body">
              <label htmlFor="reservation-employee-select">Handled by</label>
              <select
                id="reservation-employee-select"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                disabled={employeesLoading || employees.length === 0}
              >
                <option value="">
                  {employeesLoading ? "Loading employees..." : "Select an employee"}
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
              {!employeesLoading && employees.length === 0 && (
                <p className="reservation-employee-empty">No employees are available.</p>
              )}
              <div className="reservation-employee-actions">
                <button type="button" onClick={() => setPendingEmployeeAction(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="reservation-employee-submit"
                  onClick={confirmEmployeeAction}
                  disabled={!selectedEmployeeId || employeesLoading || loadingId !== null}
                >
                  <Check size={16} />
                  Confirm
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Reservation;
