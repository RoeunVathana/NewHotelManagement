
import LightMode from "../DartMode/LightMode";
import "./checkOut.css";
import Request from "../../util/request";
import { useEffect, useState } from "react";
import { BaseUrl } from "../../util/BaseUrl";
import dayjs from "dayjs";

const CheckOut = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [guest, setGuest] = useState("");

  // =====================================================
  // FETCH CHECK-OUT DATA
  // =====================================================
  const fetchCheckOut = async () => {
    try {
      const response = await Request("/api/checkOut", "GET");

      setData(response.data || []);

      console.log("Fetched Check-outs:", response.data);
    } catch (error) {
      console.error("Error fetching check-outs:", error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchCheckOut();
  }, []);

  // =====================================================
  // FILTER DATA
  // =====================================================
  const filteredData = data.filter((item) => {
    const employeeName =
      item?.employee?.full_name || "";

    const guestName =
      item?.reservation?.guest_name || "";

    const reservationId = String(
      item?.reservation?.id ||
      item?.reservation_id ||
      ""
    );

    const searchText = search.toLowerCase();

    const matchSearch =
      employeeName.toLowerCase().includes(searchText) ||
      guestName.toLowerCase().includes(searchText) ||
      reservationId.includes(searchText);

    const matchGuest =
      guest === "" ||
      guestName.toLowerCase().includes(
        guest.toLowerCase()
      );

    return (
      item?.employee &&
      item?.reservation &&
      matchSearch &&
      matchGuest
    );
  });

  // =====================================================
  // UNIQUE GUEST LIST
  // =====================================================
  const guestList = [
    ...new Set(
      data
        .map(
          (item) =>
            item?.reservation?.guest_name
        )
        .filter(Boolean)
    ),
  ];

  return (
    <div className="dashboard">
      <LightMode title="Check Out" />

      {/* ================= SEARCH & FILTER ================= */}
      <div className="checkOut-search">
        <div>
          <select
            name="guest"
            id="guest"
            value={guest}
            onChange={(e) =>
              setGuest(e.target.value)
            }
          >
            <option value="">
              Select Guest
            </option>

            {guestList.map(
              (guestName, index) => (
                <option
                  value={guestName}
                  key={index}
                >
                  {guestName}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search employee, guest or reservation..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* ================= CHECK-OUT CARDS ================= */}
      <div className="checkOut-container">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const employee = item?.employee;
            const reservation = item?.reservation;

            return (
              <div
                className="checkOut-card-item"
                key={item.id}
              >
                {/* ================= HEADER ================= */}
                <div className="checkOut-header">
                  <img
                    src={
                      employee?.image
                        ? BaseUrl + employee.image
                        : "/default-user.png"
                    }
                    alt={
                      employee?.full_name ||
                      "Employee"
                    }
                  />

                  <div className="employee-info">
                    <h3>
                      {employee?.full_name ||
                        "Unknown Employee"}
                    </h3>

                    <span>
                      {employee?.role ||
                        "Staff"}
                    </span>

                    &nbsp; / &nbsp;

                    <span>
                      {employee?.phone ||
                        "N/A"}
                    </span>
                  </div>

                  {/* CHECK-OUT STATUS */}
                  <div className="checkOut-badge status-checked-out">
                    <span>
                      Checked Out
                    </span>
                  </div>
                </div>

                {/* ================= GUEST INFO ================= */}
                <div className="guest-info">
                  <div>
                    <label>Guest</label>

                    <strong>
                      {reservation?.guest_name ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Email Guest</label>

                    <strong>
                      {reservation?.email ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Emp Phone</label>

                    <strong>
                      {employee?.phone ||
                        "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Reservation</label>

                    <strong>
                      #
                      {item?.reservation_id ||
                        reservation?.id ||
                        "N/A"}
                    </strong>
                  </div>
                </div>

                {/* ================= DATE & TIME ================= */}
                <div className="checkOut-dates">
                  <div>
                    <label>
                      Check In Time
                    </label>

                    <p>
                      {item[0]?.check_in_date
                        ? dayjs(
                          item[0].check_in_date
                        ).format(
                          "DD MMM YYYY, hh:mm A"
                        )
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label>
                      Check Out Time
                    </label>

                    <p>
                      {item?.checkout_time
                        ? dayjs(
                          item.checkout_time
                        ).format(
                          "DD MMM YYYY, hh:mm A"
                        )
                        : reservation?.check_out_date
                          ? dayjs(
                            reservation.check_out_date
                          ).format(
                            "DD MMM YYYY"
                          )
                          : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-checkOut">
            <h3>No Check-out Found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckOut;
