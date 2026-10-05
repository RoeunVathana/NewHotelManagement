import LightMode from "../DartMode/LightMode";
import "./check.css";
import Request from "../../util/request";
import { useEffect, useState } from "react";
import { BaseUrl } from "../../util/BaseUrl";
import dayjs from "dayjs";

const CheckIn = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [guest, setGuest] = useState("");

  const fetchCheckIn = async () => {
    try {
      const response = await Request("/api/checkIn", "GET");
      setData(response.data || []);
      // console.log("Fetched Check-ins:", response.data);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    }
  };

  useEffect(() => {
    fetchCheckIn();
  }, []);

  // Filter data safely
  const filteredData = data.filter((item) => {
    const employeeName = item?.employee?.full_name || "";
    const guestName = item?.reservation?.guest_name || "";
    const reservationId = String(item?.reservation?.id || item?.reservation_id || "");

    const searchText = search.toLowerCase();

    const matchSearch =
      employeeName.toLowerCase().includes(searchText) ||
      guestName.toLowerCase().includes(searchText) ||
      reservationId.includes(searchText);

    const matchGuest =
      guest === "" ||
      guestName.toLowerCase().includes(guest.toLowerCase());

    return item?.employee && item?.reservation && matchSearch && matchGuest;
  });

  return (
    <div className="dashboard">
      <LightMode title="Check In" />

      {/* ================= SEARCH & FILTER ================= */}
      <div className="checkin-search">
        <div>
          <select
            name="guest"
            id="guest"
            value={guest}
            onChange={(e) => setGuest(e.target.value)}
          >
            <option value="">Select Guest</option>
            {[
              ...new Set(
                data
                  .map((item) => item?.reservation?.guest_name)
                  .filter(Boolean)
              ),
            ].map((guestName, index) => (
              <option value={guestName} key={index}>
                {guestName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search employee, guest or reservation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ================= CHECK-IN CARDS ================= */}
      <div className="checkin-container">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const employee = item?.employee;
            const reservation = item?.reservation;

            return (
              <div className="checkin-card-item" key={item.id}>
                {/* 1. Header: Employee Info & Dynamic Status Badge */}
                <div className="checkin-header">
                  <img
                    src={
                      employee?.image
                        ? BaseUrl + employee.image
                        : "/default-user.png"
                    }
                    alt={employee?.full_name || "Employee"}
                  />

                  <div className="employee-info">
                    <h3>{employee?.full_name || "Unknown Employee"}</h3>
                    <span>{employee?.role || "Staff"}</span>
                    &nbsp; / &nbsp;
                    <span>{employee?.phone || "N/A"}</span>
                  </div>

                  <div className="checkin-badge status-checked-in">
                    Checked In
                  </div>
                </div>

                {/* 2. Key Details Grid: Guest, Room Number, Deposit, Reservation ID */}
                <div className="guest-info">
                  <div>
                    <label>Guest</label>
                    <strong>{reservation?.guest_name || "N/A"}</strong>
                  </div>

                  <div>
                    <label>Email</label>
                    <strong>
                      {reservation?.email ||
                        item?.reservation?.room?.room_number ||
                        reservation?.room_number ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Gender</label>
                    <strong>{employee?.gender || "N/A"}</strong>
                  </div>

                  <div>
                    <label>Reservation</label>
                    <strong>#{item?.reservation_id || reservation?.id}</strong>
                  </div>
                </div>

                {/* 3. Date & Time Metadata */}
                <div className="checkin-dates">
                  <div>
                    <label>Check In Time</label>
                    <p>
                      {item?.checkin_time
                        ? dayjs(item.checkin_time).format("DD MMM YYYY, hh:mm A")
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label>Scheduled Check Out</label>
                    <p>
                      {reservation?.check_out_date
                        ? dayjs(reservation.check_out_date).format("DD MMM YYYY, hh:mm A")
                        : "N/A"} 
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-checkin">
            <h3>No Check-in Found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;