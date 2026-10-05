import { useEffect, useState, useCallback } from "react";
import LightMode from "../DartMode/LightMode";
import "./Branches.css";
import "./staff.css";

import { alertError } from "../../../swertalert/AlertSuccess";
import Request from "../../util/Request";
import { BaseUrl } from "../../util/BaseUrl";

import Hook from "./Hook";
import {
  UserRound,
  LogOut,
  ReceiptText,
} from "lucide-react";
import dayjs from "dayjs";
const Branches = () => {
  // =========================================================
  // STATE
  // =========================================================
  const [filter, setFilter] = useState("All");
  const [filterFloor, setFilterFloor] = useState("All");

  const [data, setData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [activeTab, setActiveTab] = useState("Room & Guest");

  const [buttonActive, setButtonActive] = useState("Available");

  // Staff assigned to cleaning
  const [selectStaff, setSelectStaff] = useState("");

  // =========================================================
  // LOADING STATES
  // =========================================================

  // Loading when getting all rooms
  const [roomsLoading, setRoomsLoading] = useState(false);

  // Loading when changing room status
  // Example: Available -> Cleaning
  const [loadingStatus, setLoadingStatus] = useState("");

  // Loading when assigning staff
  const [staffLoading, setStaffLoading] = useState(false);

  // Loading when marking room clean
  const [cleanLoading, setCleanLoading] = useState(false);

  // =========================================================
  // STAFF
  // =========================================================
  const {
    dataStaff,
    setState,
    state,
    makePaymentMethod,
    loadingReservation,
    reservations,
    handleCheckOut,
    CheckOutloading,
    employee
  } = Hook();
  // =========================================================
  // LOAD ALL ROOMS
  // =========================================================
  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);

    try {
      const res = await Request("/api/room", "get");

      // console.log("ROOM API RESPONSE:", res);

      const rooms = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rooms)
          ? res.rooms
          : [];

      setData(rooms);

      return rooms;
    } catch (error) {
      // console.error("Load rooms error:", error);

      alertError({
        title: "Error",
        text: error?.response?.data?.message || "Failed to load rooms.",
      });

      setData([]);

      return [];
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRooms();
      // console.log("Rooms loaded " + JSON.stringify(reservations));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRooms, loadingReservation, CheckOutloading, reservations]);

  // =========================================================
  // OPEN ROOM
  // =========================================================
  const openRoom = (room) => {
    if (!room) return;

    setSelectedRoom(room);

    setActiveTab("Room & Guest");

    setButtonActive(room.status || "Available");

    // If room already has cleaning staff
    setSelectStaff(room?.staffs?.id ? String(room.staffs.id) : "");
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================
  const closeRoom = () => {
    // Don't close while important action is running
    if (staffLoading || cleanLoading || loadingStatus) {
      return;
    }

    setSelectedRoom(null);
    setSelectStaff("");
  };

  // =========================================================
  // UPDATE ROOM STATUS
  // =========================================================
  const loadRoomsByStatus = async (status) => {
    if (!selectedRoom?.id) {
      // console.log("No room selected");
      return;
    }

    // Prevent duplicate status requests
    if (loadingStatus) {
      return;
    }

    setLoadingStatus(status);

    try {
      await Request(`/api/room/status/${selectedRoom.id}`, "put", {
        status,
      });

      // -----------------------------------------------------
      // Update main room list
      // -----------------------------------------------------
      setData((prevRooms) =>
        Array.isArray(prevRooms)
          ? prevRooms.map((room) =>
            room.id === selectedRoom.id
              ? {
                ...room,
                status,
                ...(status !== "Cleaning" ? { staffs: null } : {}),
              }
              : room,
          )
          : [],
      );

      // -----------------------------------------------------
      // Update selected room
      // -----------------------------------------------------
      setSelectedRoom((prevRoom) => {
        if (!prevRoom) {
          return null;
        }

        return {
          ...prevRoom,
          status,
          ...(status !== "Cleaning" ? { staffs: null } : {}),
        };
      });

      // -----------------------------------------------------
      // Update active status button
      // -----------------------------------------------------
      setButtonActive(status);

      // -----------------------------------------------------
      // Clear staff if room is not Cleaning
      // -----------------------------------------------------
      if (status !== "Cleaning") {
        setSelectStaff("");
      }

      // console.log(
      //   `Room ${selectedRoom.room_number} status changed to ${status}`,
      // );
    } catch (error) {
      console.error("Update room status error:", error);

      alertError({
        title: "Error",
        text: error?.response?.data?.message || "Failed to update room status.",
      });
    } finally {
      setLoadingStatus("");
    }
  };

  // =========================================================
  // ASSIGN STAFF TO CLEAN ROOM
  // =========================================================
  const handleSelectStaff = async (staffId) => {
    if (!selectedRoom?.id) {
      alertError({
        title: "Error",
        text: "Please select a room first.",
      });

      return;
    }

    if (!staffId) {
      setSelectStaff("");
      return;
    }

    // Prevent duplicate staff requests
    if (staffLoading) {
      return;
    }

    setStaffLoading(true);

    try {
      await Request("/api/staffRoom", "post", {
        room_id: selectedRoom.id,
        staff_id: Number(staffId),
      });

      const selectedStaff = dataStaff?.find(
        (staff) => String(staff.id) === String(staffId),
      );

      // -----------------------------------------------------
      // Update selected room
      // -----------------------------------------------------
      setSelectedRoom((prevRoom) => {
        if (!prevRoom) {
          return null;
        }

        return {
          ...prevRoom,
          staffs: selectedStaff || null,
        };
      });

      // -----------------------------------------------------
      // Update main room list
      // -----------------------------------------------------
      setData((prevRooms) =>
        Array.isArray(prevRooms)
          ? prevRooms.map((room) =>
            room.id === selectedRoom.id
              ? {
                ...room,
                staffs: selectedStaff || null,
              }
              : room,
          )
          : [],
      );

      setSelectStaff(String(staffId));

      // console.log("Staff assigned successfully:", selectedStaff);
    } catch (error) {
      // console.error("Assign staff error:", error);

      alertError({
        title: "Error",
        text:
          error?.response?.data?.message || "Failed to assign staff to room.",
      });
    } finally {
      setStaffLoading(false);
    }
  };

  // =========================================================
  // MARK ROOM CLEAN
  // =========================================================
  const handleMarkClean = async () => {
    if (!selectedRoom?.id) {
      alertError({
        title: "Error",
        text: "No room selected.",
      });

      return;
    }

    // Prevent duplicate clean requests
    if (cleanLoading) {
      return;
    }

    const staffId = selectStaff || selectedRoom?.staffs?.id;

    setCleanLoading(true);

    try {
      // -----------------------------------------------------
      // 1. Remove staff assignment
      // -----------------------------------------------------
      if (staffId) {
        await Request(`/api/staffRoom/staff_id/${staffId}`, "delete");
      }

      // -----------------------------------------------------
      // 2. Change room status to Available
      // -----------------------------------------------------
      await Request(`/api/room/status/${selectedRoom.id}`, "put", {
        status: "Available",
      });

      // -----------------------------------------------------
      // 3. Update selected room
      // -----------------------------------------------------
      setSelectedRoom((prevRoom) => {
        if (!prevRoom) {
          return null;
        }

        return {
          ...prevRoom,
          status: "Available",
          staffs: null,
        };
      });

      // -----------------------------------------------------
      // 4. Update room list
      // -----------------------------------------------------
      setData((prevRooms) =>
        Array.isArray(prevRooms)
          ? prevRooms.map((room) =>
            room.id === selectedRoom.id
              ? {
                ...room,
                status: "Available",
                staffs: null,
              }
              : room,
          )
          : [],
      );

      // -----------------------------------------------------
      // 5. Reset staff
      // -----------------------------------------------------
      setSelectStaff("");

      // -----------------------------------------------------
      // 6. Update active button
      // -----------------------------------------------------
      setButtonActive("Available");

      // -----------------------------------------------------
      // 7. Reload from backend
      // -----------------------------------------------------
      await loadRooms();

      // console.log(`Room ${selectedRoom.room_number} marked clean.`);
    } catch (error) {
      // console.error("Mark clean error:", error);

      alertError({
        title: "Error",
        text: error?.response?.data?.message || "Failed to mark room as clean.",
      });
    } finally {
      setCleanLoading(false);
    }
  };

  // =========================================================
  // SAFE ROOMS ARRAY
  // =========================================================
  const rooms = Array.isArray(data) ? data : [];

  // =========================================================
  // FILTER BY STATUS
  // =========================================================
  const filteredRooms =
    filter === "All"
      ? rooms
      : rooms.filter(
        (room) =>
          String(room.status || "").toLowerCase() ===
          String(filter).toLowerCase(),
      );

  // =========================================================
  // FLOOR RANGE
  // =========================================================
  const floorRanges = {
    101: [101, 110],
    201: [201, 210],
    301: [301, 310],
    401: [401, 410],
  };

  const selectedFloorRange = floorRanges[filterFloor];

  // =========================================================
  // FILTER BY FLOOR
  // =========================================================
  const filteredRoomsByFloor = !selectedFloorRange
    ? filteredRooms
    : filteredRooms.filter((room) => {
      const roomNumber = Number(room.room_number);

      return (
        roomNumber >= selectedFloorRange[0] &&
        roomNumber <= selectedFloorRange[1]
      );
    });

  // =========================================================
  // ROOM COUNT
  // =========================================================
  const totalRooms = rooms.length;

  const showingRooms = filteredRoomsByFloor.length;

  let totalTax_price = Number(selectedRoom?.room_type?.price_per_night) || 0;
  let totalPrice = Number(selectedRoom?.room_type?.price_per_night) || 0;

  const occupiedReservation =
    selectedRoom && Array.isArray(reservations)
      ? reservations.find((reservation) =>
        reservation?.reservation_details?.some(
          (detail) => detail.room_id === selectedRoom.id,
        ),
      )
      : null;

  const handleRoomCheckOut = async () => {
    const checkoutCompleted = await handleCheckOut(selectedRoom);

    if (checkoutCompleted) {
      setSelectedRoom(null);
      setSelectStaff("");
      setActiveTab("Room & Guest");
    }
  };

  // =========================================================
  // RETURN UI
  // =========================================================
  return (
    <div className="dashboard-container">
      <LightMode title="Room" />

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="header-card">
        <div className="header-top">
          <h1 className="dashboard-title">
            <span className="title-icon">⣿</span>
            Room Status Board{" "}
            <span className="room-count">({totalRooms} rooms)</span>
          </h1>

          {/* =================================================
              STATUS FILTERS
          ================================================= */}
          <div className="status-filters">
            <button
              className="filter-badge badge-all"
              onClick={() => setFilter("All")}
              disabled={roomsLoading}
            >
              All ({totalRooms})
            </button>

            <button
              className="filter-badge badge-available"
              onClick={() => setFilter("Available")}
              disabled={roomsLoading}
            >
              ● Available
            </button>

            <button
              className="filter-badge badge-occupied"
              onClick={() => setFilter("Occupied")}
              disabled={roomsLoading}
            >
              ● Occupied
            </button>

            <button
              className="filter-badge badge-reserved"
              onClick={() => setFilter("Reserved")}
              disabled={roomsLoading}
            >
              ● Reserved
            </button>

            <button
              className="filter-badge badge-cleaning"
              onClick={() => setFilter("Cleaning")}
              disabled={roomsLoading}
            >
              ● Cleaning
            </button>

            <button
              className="filter-badge badge-maintenance"
              onClick={() => setFilter("Maintenance")}
              disabled={roomsLoading}
            >
              ● Maint
            </button>

            <button
              className="filter-badge badge-block"
              onClick={() => setFilter("Blocked")}
              disabled={roomsLoading}
            >
              ● Block
            </button>
          </div>
        </div>

        {/* ===================================================
            FLOOR FILTER
        =================================================== */}
        <div className="floor-bar">
          <div className="floor-options">
            <span>Floors:</span>

            <button
              className={`floor-btn ${filterFloor === "All" ? "active" : ""}`}
              onClick={() => setFilterFloor("All")}
              disabled={roomsLoading}
            >
              All Floors
            </button>

            <button
              className={`floor-btn ${filterFloor === "101" ? "active" : ""}`}
              onClick={() => setFilterFloor("101")}
              disabled={roomsLoading}
            >
              Floor 1 (101-110)
            </button>

            <button
              className={`floor-btn ${filterFloor === "201" ? "active" : ""}`}
              onClick={() => setFilterFloor("201")}
              disabled={roomsLoading}
            >
              Floor 2 (201-210)
            </button>

            <button
              className={`floor-btn ${filterFloor === "301" ? "active" : ""}`}
              onClick={() => setFilterFloor("301")}
              disabled={roomsLoading}
            >
              Floor 3 (301-310)
            </button>

            <button
              className={`floor-btn ${filterFloor === "401" ? "active" : ""}`}
              onClick={() => setFilterFloor("401")}
              disabled={roomsLoading}
            >
              Floor 4 Suites (401-410)
            </button>
          </div>

          <span>
            Showing {showingRooms} of {totalRooms}
          </span>
        </div>
      </div>

      {/* =====================================================
          ROOM GRID
      ===================================================== */}
      <div className="room-grid">
        {roomsLoading ? (
          <div
            style={{
              width: "100%",
              minHeight: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div className="room-loading-spinner"></div>

            <p>Loading rooms...</p>
          </div>
        ) : filteredRoomsByFloor.length > 0 ? (
          filteredRoomsByFloor.map((room, roomIndex) => {
            const statusClass = String(
              room.status || "Available",
            ).toLowerCase();

            return (
              <div
                key={`${room.id}-${roomIndex}`}
                className={`room-card card-${statusClass}`}
                onClick={() => openRoom(room)}
              >
                {/* ROOM IMAGE */}
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    overflow: "hidden",
                    marginBottom: "10px",
                  }}
                >
                  {room.room_type?.image ? (
                    <img
                      src={BaseUrl + room.room_type.image}
                      alt={room.room_type?.name || "Room"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eee",
                        borderRadius: "10px",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>

                {/* CARD HEADER */}
                <div className="card-header">
                  <div>
                    <h3 className="room-number">{room.room_number}</h3>

                    <div className="room-type">
                      {room.status == "Cleaning"
                        ? room.staffs?.name
                        : room.room_type?.name}
                    </div>
                  </div>

                  <span className={`status-tag badge-${statusClass}`}>
                    {room.status || "Available"}
                  </span>
                </div>

                {/* CARD BODY */}
                <div className="card-body">
                  {(() => {
                    const reservedForRoom = reservations.find((pre) =>
                      pre.reservation_details?.some(
                        (detail) => detail.room_id === room.id,
                      ),
                    );

                    if (reservedForRoom) {
                      return (
                        <div className="guest-info1">
                          <span className="guest-name">
                            {reservedForRoom?.guest_name}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div className="price-tag">
                        $
                        {Number(room.room_type?.price_per_night || 0).toFixed(
                          2,
                        )}
                        <span>/nt</span>
                      </div>
                    );
                  })()}

                  {room.note && <div className="note-text">🚫 {room.note}</div>}
                </div>

                {/* CARD FOOTER */}
                <div className="card-footer">
                  <span className="room-code">🔑 {room.code || "-"}</span>

                  <button
                    className="manage-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRoom(room);
                    }}
                    disabled={roomsLoading}
                  >
                    MANAGE
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ textAlign: "center" }}>Empty rooms found</p>
          </div>
        )}
      </div>

      {/* =====================================================
          ROOM MODAL
      ===================================================== */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={closeRoom}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* =================================================
                MODAL HEADER
            ================================================= */}
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-room-badge">
                  {selectedRoom.room_number}
                </div>

                <div>
                  <div className="modal-title-row">
                    <h2>{selectedRoom.room_type?.name}</h2>

                    <span
                      className={`status-pill badge-${String(
                        selectedRoom.status || "Available",
                      ).toLowerCase()}`}
                    >
                      {selectedRoom.status}
                    </span>
                  </div>

                  <p className="modal-subtitle">
                    Floor {selectedRoom.floor || 1} • Base Rate $
                    {Number(
                      selectedRoom.room_type?.price_per_night || 0,
                    ).toFixed(2)}
                    /night
                  </p>
                </div>
              </div>

              <button
                className="modal-close-btn"
                onClick={closeRoom}
                disabled={staffLoading || cleanLoading || !!loadingStatus}
              >
                ✕
              </button>
            </div>

            {/* =================================================
                MODAL TABS
            ================================================= */}
            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === "Room & Guest" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("Room & Guest")}
                disabled={staffLoading || cleanLoading || !!loadingStatus}
              >
                Room & Guest
              </button>

              {selectedRoom.status !== "Cleaning" &&
                selectedRoom.status !== "Reserved" &&
                selectedRoom.status !== "Occupied" &&
                selectedRoom.status !== "Blocked" &&
                selectedRoom.status !== "Maintenance" && (
                  <button
                    className={`tab-btn ${activeTab === "+ Quick Check-In" ? "active" : ""}`}
                    onClick={() => setActiveTab("+ Quick Check-In")}
                    disabled={staffLoading || cleanLoading || !!loadingStatus}
                  >
                    + Quick Check-In
                  </button>
                )}

              <button
                className={`tab-btn ${activeTab === "Smart Lock" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("Smart Lock")}
                disabled={staffLoading || cleanLoading || !!loadingStatus}
              >
                Smart Lock
              </button>
            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}
            <div className="modal-body">
              {/* =================================================
                  ROOM & GUEST
              ================================================= */}
              {activeTab === "Room & Guest" && (
                <>
                  {/* =================================================
                      CLEANING SECTION
                  ================================================= */}
                  {selectedRoom.status === "Cleaning" && (
                    <div className="staff-Cleaning">
                      <div className="staff-Cleaning-title">
                        <i></i>

                        <span>Room Needs Cleaning</span>
                      </div>

                      <div className="fs-6">
                        Room marked dirty for housekeeping inspection
                      </div>

                      <div className="staff-Cleaning-btn">
                        <div>
                          <button
                            onClick={handleMarkClean}
                            disabled={
                              cleanLoading || staffLoading || !!loadingStatus
                            }
                          >
                            {cleanLoading
                              ? "Marking Clean..."
                              : "Mark Clean & Available"}
                          </button>
                        </div>

                        <div>
                          <select
                            value={selectStaff}
                            onChange={(e) => handleSelectStaff(e.target.value)}
                            disabled={
                              staffLoading || cleanLoading || !!loadingStatus
                            }
                          >
                            <option value="">
                              {staffLoading ? "Assigning..." : "Select Staff"}
                            </option>

                            {Array.isArray(dataStaff) &&
                              dataStaff.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                  {staff.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedRoom.status === "Occupied" && occupiedReservation && (
                    <div className="staff-Occupied">
                      {/* Header */}
                      <div className="staff-Occupied-title">
                        <div className="staff-Occupied-guest">
                          <UserRound size={15} />
                          <p>{occupiedReservation.guest_name || "Guest"}</p>
                        </div>

                        <p className="staff-Occupied-booking">
                          BK-00{occupiedReservation.id ?? selectedRoom.id}
                        </p>
                      </div>

                      {/* Guest information */}
                      <div className="staff-Occupied-content">
                        <div className="staff-Occupied-left">
                          <p>Contact Phone</p>
                          <span>+855 {occupiedReservation.phone || "N/A"}</span>
                        </div>

                        <div className="staff-Occupied-right">
                          <p>Stay Dates</p>
                          <span>
                            {dayjs(occupiedReservation.check_in_date).format("MM-DD-YYYY") || "-"} to {dayjs(occupiedReservation.check_out_date).format("MM-DD-YYYY") || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="staff-Occupied-btn">
                        <button
                          className="checkout-btn"
                          onClick={handleRoomCheckOut}
                          disabled={CheckOutloading}
                        >
                          <LogOut size={15} />
                          {CheckOutloading ? "Checking Out..." : "Check-Out Guest"}
                        </button>

                        <button className="folio-btn">
                          <ReceiptText size={15} />
                          View Folio
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      CHANGE STATUS
                  ================================================= */}
                  <label className="section-label mt-1">
                    Change Room Status:
                  </label>

                  <div className="status-grid">
                    {/* AVAILABLE */}
                    <button
                      className={`status-btn ${buttonActive === "Available"
                        ? "btn-available"
                        : "btn-available-active"
                        }`}
                      onClick={() => loadRoomsByStatus("Available")}
                      disabled={!!loadingStatus || staffLoading || cleanLoading}
                    >
                      {loadingStatus === "Available"
                        ? "Updating..."
                        : "Available"}
                    </button>

                    {/* CLEANING */}
                    <button
                      className={`status-btn ${buttonActive === "Cleaning"
                        ? "btn-cleaning"
                        : "btn-cleaning-active"
                        }`}
                      onClick={() => loadRoomsByStatus("Cleaning")}
                      disabled={!!loadingStatus || staffLoading || cleanLoading}
                    >
                      {loadingStatus === "Cleaning"
                        ? "Updating..."
                        : "Cleaning"}
                    </button>

                    {/* MAINTENANCE */}
                    <button
                      className={`status-btn ${buttonActive === "Maintenance"
                        ? "btn-maintenance"
                        : "btn-maintenance-active"
                        }`}
                      onClick={() => loadRoomsByStatus("Maintenance")}
                      disabled={!!loadingStatus || staffLoading || cleanLoading}
                    >
                      {loadingStatus === "Maintenance"
                        ? "Updating..."
                        : "Maintenance"}
                    </button>

                    {/* BLOCKED */}
                    <button
                      className={`status-btn ${buttonActive === "Blocked"
                        ? "btn-block"
                        : "btn-block-active"
                        }`}
                      onClick={() => loadRoomsByStatus("Blocked")}
                      disabled={!!loadingStatus || staffLoading || cleanLoading}
                    >
                      {loadingStatus === "Blocked"
                        ? "Updating..."
                        : "Block Room"}
                    </button>

                    {/* RESERVED */}
                    <button
                      className={`status-btn ${buttonActive === "Reserved"
                        ? "btn-reserved"
                        : "btn-reserved-active"
                        }`}
                      onClick={() => loadRoomsByStatus("Reserved")}
                      disabled={!!loadingStatus || staffLoading || cleanLoading}
                    >
                      {loadingStatus === "Reserved"
                        ? "Updating..."
                        : "Reserved"}
                    </button>

                    {/* OCCUPIED */}
                    {/* <button
                      className={`status-btn ${
                        buttonActive === "Occupied"
                          ? "btn-occupied"
                          : "btn-occupied-active"
                      }`}
                      onClick={() => loadRoomsByStatus("Occupied")}
                      disabled={!!loadingStatus || staffLoading || cleanLoading}
                    >
                      {loadingStatus === "Occupied"
                        ? "Updating..."
                        : "Occupied"}
                    </button> */}
                  </div>

                  {/* =================================================
                      AMENITIES
                  ================================================= */}
                  <label
                    className="section-label"
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    Amenities & Features
                  </label>

                  <div className="amenities-list">
                    <span className="amenity-chip">✓ Queen Bed</span>

                    <span className="amenity-chip">✓ Work Desk</span>

                    <span className="amenity-chip">✓ Smart TV</span>
                  </div>
                </>
              )}

              {/* =================================================
                  QUICK CHECK-IN
              ================================================= */}
              {activeTab === "+ Quick Check-In" && (
                <div className="tab-content-placeholder">
                  <div className="guest-info1">
                    <div>
                      <label>Guest Full name</label>

                      <input
                        value={state.guest_name}
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            guest_name: e.target.value,
                          }));
                        }}
                        type="text"
                        placeholder="e.g. Vikram Malhotra"
                        disabled={
                          !!loadingStatus || staffLoading || cleanLoading
                        }
                      />
                    </div>

                    <div>
                      <label>Employee Name</label>

                      <select
                        value={state.employee_id}
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            employee_id: e.target.value,
                          }));
                        }}
                        disabled={
                          !!loadingStatus || staffLoading || cleanLoading
                        }
                      >
                        <option value="">Select Employee</option>

                        {Array.isArray(employee) && employee.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="guest-info1">
                    <div>
                      <label>Phone Number*</label>

                      <input
                        type="tel"
                        value={state.phone}
                        placeholder="+855 123 456 789"
                        disabled={
                          !!loadingStatus || staffLoading || cleanLoading
                        }
                        required
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <label>Email</label>

                      <input
                        type="email"
                        value={state.email}
                        placeholder="example@gmail.com"
                        disabled={
                          !!loadingStatus || staffLoading || cleanLoading
                        }
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="guest-info1">
                    <div>
                      <label>Check-Out Date</label>

                      <input
                        type="date"
                        value={state.check_out_date}
                        disabled={
                          !!loadingStatus || staffLoading || cleanLoading
                        }
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            check_out_date: e.target.value,
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <label>Number of Guests</label>

                      <select
                        value={state.total_guest}
                        onChange={(e) => {
                          setState((prev) => ({
                            ...prev,
                            total_guest: e.target.value,
                          }));
                        }}
                      >
                        <option value="1">1 Adult</option>

                        <option value="2">2 Adults</option>

                        <option value="3">3 Adults</option>

                        <option value="4">4 Adults</option>
                      </select>
                    </div>
                  </div>

                  <div className="placement">
                    <div className="room-rate">
                      <span>Room Rate (1 Night):</span>

                      <span>{totalPrice.toFixed(2)} USD</span>
                    </div>

                    <div className="tax">
                      <span>Estimated Tax (5% GST):</span>

                      <span>6.00 USD</span>
                    </div>

                    <div className="ruler"></div>

                    <div className="total-payable mb-1">
                      <span>Total Payable:</span>

                      <span>{totalTax_price.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="btn-walk-in">
                    <button
                      type="button"
                      className="walk-btn"
                      onClick={() => makePaymentMethod(selectedRoom)}
                    >
                      Complete Walk-In Check-In
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================
                  SMART LOCK
              ================================================= */}
              {activeTab === "Smart Lock" && (
                <div className="tab-content-placeholder">
                  <div className="smart-lock">
                    <div className="smart-lock-title">
                      <span>RFID / IoT Smart Lock #LK-103</span>
                    </div>

                    <div className="smart-lock-info">
                      <div className="pin-code">
                        <span>Current PIN Access Code:</span>

                        <h5>1234</h5>
                      </div>

                      <div>
                        <button>Regenerate PIN</button>
                      </div>
                    </div>

                    <div className="smart-lock-ruler"></div>

                    <div className="smart-lock-footer">
                      <span>Last Opened: Never</span>

                      <span>
                        <button>Lock (Click to Unlock)</button>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
