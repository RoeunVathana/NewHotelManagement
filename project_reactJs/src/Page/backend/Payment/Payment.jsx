import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./payment.css";
import { alertError, alertSuccess } from "../../../swertalert/AlertSuccess";
import Request from "../../util/Request";
import { QRCodeSVG } from "qrcode.react";

const KHR_EXCHANGE_RATE = 4100;
const INITIAL_EXPIRATION_SECONDS = 5 * 60;

const createPaidReservation = async ({ reservationDraft, room, amount, paymentMethod }) => {
  const response = await Request("/api/reservation", "POST", reservationDraft);
  const reservation = response.data?.reservation || response.data;

  if (!reservation?.id) {
    throw new Error("Reservation could not be created after payment.");
  }

  await Request(`/api/room/status/${room.id}`, "PUT", {
    status: "Occupied",
  });

  await Request("/api/payment", "POST", {
    reservation_id: reservation.id,
    amount,
    payment_method: paymentMethod,
    payment_date: new Date().toISOString(),
    status: "COMPLETED",
  });

  return reservation;
};

const Payment = () => {
  const [activeTab, setActiveTab] = useState("khqr");
  const [changeOption, setChangeOption] = useState("exact");
  const [dataPayment, setDataPayment] = useState({});
  const [paymentStatus, setPaymentStatus] = useState("pending"); // 'pending' | 'checking' | 'completed' | 'error'
  const [paymentError, setPaymentError] = useState("");
  const [qrVerified, setQrVerified] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(true);
  const [expiresIn, setExpiresIn] = useState(0);

  // Form states for Card and Cash options
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
    saveCard: true,
  });

  const [cashDetails, setCashDetails] = useState({
    recipientName: "",
    phone: "",
    address: "",
    instructions: "",
  });

  const expiresInRef = useRef(0);
  const paymentFinalizingRef = useRef(false);
  const paymentConfirmedRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const reservationDraft = location.state?.reservationDraft;
  const room = location.state?.room;
  const amount = Number(location.state?.amount || 0);
  const amountKHR = amount * KHR_EXCHANGE_RATE;

  const handleCloseModal = () => {
    navigate("/");
  };

  const saveQrImage = () => {
    const qrSvg = document.querySelector(".qr-image svg");
    if (!qrSvg) {
      alertError({ title: "Error", text: "QR code is not ready yet" });
      return;
    }

    const svgBlob = new Blob([new XMLSerializer().serializeToString(qrSvg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `khqr-${dataPayment.md5 || "payment"}.svg`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const copyPayLink = async () => {
    if (!dataPayment.qr) {
      alertError({ title: "Error", text: "QR code is not ready yet" });
      return;
    }

    try {
      await navigator.clipboard.writeText(dataPayment.qr);
      alertSuccess({ title: "Copied", text: "KHQR payment code copied" });
    } catch {
      alertError({ title: "Error", text: "Unable to copy the payment code" });
    }
  };
  // --- 1. GENERATE KHQR PAYMENT (WITH LOADING STATE) ---
  useEffect(() => {
    let isMounted = true;

    const loadPayment = async () => {
      if (!reservationDraft || !room?.id || !amount) {
        if (isMounted) {
          setIsGeneratingQr(false);
          setPaymentStatus("error");
        }
        alertError({
          title: "Payment Error",
          text: "Booking payment details are missing.",
        });
        return;
      }

      setIsGeneratingQr(true);

      try {
        const res = await Request("/api/khqr/generate", "POST", {
          amount,
          payment_method: "khqr",
          currency: "KHR",
          billNumber: `BOOK-${room.id}-${Date.now()}`,
        });

        if (res.success && res.data?.qr && isMounted) {
          const verifyResponse = await Request("/api/khqr/verify", "POST", {
            qrString: res.data.qr,
          });

          if (!verifyResponse.success || !verifyResponse.data?.isValid) {
            throw new Error("Generated KHQR is invalid");
          }

          setDataPayment(res.data);
          setQrVerified(true);
          setExpiresIn(INITIAL_EXPIRATION_SECONDS);
          expiresInRef.current = INITIAL_EXPIRATION_SECONDS;
        }
      } catch (error) {
        if (isMounted) {
          setPaymentStatus("error");
          alertError({
            title: "Error",
            text: error?.response?.data?.message || "Something went wrong generating QR",
          });
        }
      } finally {
        if (isMounted) {
          setIsGeneratingQr(false);
        }
      }
    };

    void loadPayment();

    return () => {
      isMounted = false;
    };
  }, [amount, reservationDraft, room?.id]);

  // --- 2. EXPIRATION TIMER ---
  useEffect(() => {
    if (expiresIn <= 0 || paymentStatus === "completed") {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setExpiresIn((remaining) => {
        const nextRemaining = Math.max(remaining - 1, 0);
        expiresInRef.current = nextRemaining;
        return nextRemaining;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresIn, paymentStatus]);

  // --- 3. CHECK PAYMENT STATUS POLLING (AUTOMATIC CLOSE ON SUCCESS) ---
  useEffect(() => {
    if (
      !qrVerified ||
      !dataPayment.md5 ||
      activeTab !== "khqr"
    ) {
      return undefined;
    }

    let isActive = true;
    let isChecking = false;

    const checkPayment = async () => {
      if (
        !isActive ||
        isChecking ||
        paymentFinalizingRef.current ||
        paymentConfirmedRef.current ||
        paymentStatus === "completed" ||
        expiresInRef.current === 0
      ) {
        return;
      }

      isChecking = true;

      try {
        const response = await Request("/api/khqr/check-payment", "POST", {
          md5: dataPayment.md5,
        });

        if (response.success && response.isCompleted && isActive) {
          paymentConfirmedRef.current = true;
          paymentFinalizingRef.current = true;

          await createPaidReservation({
            reservationDraft,
            room,
            amount,
            paymentMethod: "KHQR",
          });

          if (isActive) {
            setPaymentStatus("completed");

            // 2. Alert Success
            alertSuccess({
              title: "Payment Successful!",
              text: "Your payment was confirmed. Redirecting...",
            });

            // 3. Immediately redirect / close modal page
            setTimeout(() => {
              navigate("/branches");
            }, 1000);
          }
        }
      } catch (error) {
        const statusCode = error?.response?.status;

        if (statusCode !== 404 && isActive) {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Payment verification request failed.";

          console.error("Payment verification failed:", error);
          setPaymentStatus("error");
          setPaymentError(message);
        }
        paymentFinalizingRef.current = paymentConfirmedRef.current;
      } finally {
        isChecking = false;
      }
    };

    const timer = window.setInterval(() => {
      void checkPayment();
    }, 3000);

    void checkPayment();

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [
    activeTab,
    dataPayment.md5,
    navigate,
    paymentStatus,
    qrVerified,
    reservationDraft,
    amount,
    room,
  ]);

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      alertError({ title: "Incomplete Details", text: "Please fill in all card details." });
      return;
    }

    try {
      const paymentResponse = await Request("/api/payment/card", "POST", {
        reservation_data: reservationDraft,
        amount,
        card_details: cardDetails,
      });

      if (paymentResponse.success) {
        await createPaidReservation({
          reservationDraft,
          room,
          amount,
          paymentMethod: "CARD",
        });
        alertSuccess({ title: "Payment Successful", text: "Paid via Card successfully." });
        navigate("/branches");
      }
    } catch (error) {
      alertError({ title: "Card Error", text: error?.response?.data?.message || "Card payment failed" });
    }
  };

  const handleCashPayment = async (e) => {
    e.preventDefault();
    try {
      const paymentResponse = await Request("/api/payment/cash", "POST", {
        reservation_data: reservationDraft,
        amount,
        change_option: changeOption,
        details: cashDetails,
      });

      if (paymentResponse.success) {
        await createPaidReservation({
          reservationDraft,
          room,
          amount,
          paymentMethod: "CASH",
        });
        alertSuccess({ title: "Order Confirmed", text: "Cash on delivery details saved." });
        navigate("/branches");
      }
    } catch (error) {
      alertError({ title: "Error", text: error?.response?.data?.message || "Cash confirmation failed" });
    }
  };

  const formattedExpiry = `${String(Math.floor(expiresIn / 60)).padStart(2, "0")}:${String(expiresIn % 60).padStart(2, "0")}`;
  const qrExpired = expiresIn === 0;

  return (
    <div className="payment-page">
      <div className="payment-modal_page" onClick={(e) => e.stopPropagation()}>
        {/* Top Header Status Bar */}
        <div className="modal_page-header">
          <div className="header1-left">
            <span className="shield-icon">🔒</span>
            <span className="session-text">
              Secure Session #{room?.id ? `ROOM-${room.id}` : "PENDING"}
            </span>
            <span className="status-badge">● Bakong Core v2.4 Active</span>
          </div>
          <div className="header1-right">
            <span className="licensed-text">✓ Central Bank of Cambodia Licensed</span>
            <button type="button" className="close-btn" onClick={handleCloseModal}>
              ×
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="modal_page-body">
          {/* Left Column: Order Summary */}
          <div className="left-panel1">
            <div className="merchant-info">
              <div className="merchant-logo">⚛</div>
              <div className="merchant-details">
                <h3>
                  QuantumPay <span className="verified-check">✓</span>
                </h3>
                <p>ID: #QP-84920 • Official Merchant</p>
              </div>
              <span className="badge-testnet">TESTNET & PROD</span>
            </div>

            <div className="amount-card">
              <p className="amount-label">AMOUNT DUE TO PAY</p>
              <h1 className="amount-val">
                ${amount.toFixed(2)} <span>USD</span>
              </h1>
              <p className="khr-val">
                ៛{amountKHR.toLocaleString()} KHR (Govt. Rate 4,100)
              </p>
            </div>

            <div className="order-breakdown">
              <p className="breakdown-title">ORDER BREAKDOWN</p>
              <div className="item-row main-item">
                <span>
                  ✓ Room Booking
                  <br />
                  <small>{room?.name || "Standard Room"}</small>
                </span>
                <span className="price">${amount.toFixed(2)}</span>
              </div>

              <hr />

              <div className="meta-row">
                <span>Account Recipient</span>
                <span className="val">billing@nexus.io</span>
              </div>
              <div className="meta-row">
                <span>Payment Reference</span>
                <span className="val">QNT-{room?.id || "PENDING"}</span>
              </div>
            </div>

            <div className="compliance-box">
              <div className="comp-title">Central Bank KHQR Standardized</div>
              <p>Direct NBC (National Bank of Cambodia) clearing gateway. Zero processing fee.</p>
            </div>

            <div className="left-footer">
              <span>🔒 256-Bit TLS End-to-End</span>
              <span>PCI-DSS Level 1</span>
            </div>
          </div>

          {/* Right Column: Payment Options */}
          <div className="right-panel1">
            {/* Tabs */}
            <div className="tab-bar1">
              <button
                type="button"
                className={`tab-btn1 ${activeTab === "khqr" ? "active" : ""}`}
                onClick={() => setActiveTab("khqr")}
              >
                🔴 KHQR (Scan to Pay)
              </button>
              <button
                type="button"
                className={`tab-btn1 ${activeTab === "card" ? "active" : ""}`}
                onClick={() => setActiveTab("card")}
              >
                💳 Visa / Mastercard
              </button>
              <button
                type="button"
                className={`tab-btn1 ${activeTab === "cash" ? "active" : ""}`}
                onClick={() => setActiveTab("cash")}
              >
                💵 Cash on Hand
              </button>
            </div>

            {/* TAB 1: KHQR */}
            {activeTab === "khqr" && (
              <div className="tab-content khqr-view">
                <div className="status-banner">
                  <span className="live-feed">
                    <span className="status-dot pulsing"></span>
                    Bakong Live Feed - Listening
                  </span>
                  <span>⏱ {qrExpired ? "QR expired" : `Expires in: ${formattedExpiry}`}</span>
                </div>

                <div className="khqr-card">
                  <div className="khqr-header">
                    <span className="kh-tag">KH KHQR</span>
                    <div className="currency-pills">
                      <span>BAKONG</span>
                      <span className="currency-active">$ USD</span>
                    </div>
                  </div>

                  <div className="qr-box">
                    <p className="merchant-name">QUANTUMPAY CAMBODIA TECHNOLOGIES</p>

                    <div className="qr-image">
                      {isGeneratingQr ? (
                        <div className="qr-loading-container">
                          <div className="spinner"></div>
                          <p>Generating KHQR Code...</p>
                        </div>
                      ) : (
                        <QRCodeSVG
                          value={dataPayment.qr || ""}
                          size={250}
                          level="M"
                          includeMargin={true}
                        />
                      )}
                    </div>

                    <p className="qr-price">
                      ${amount.toFixed(2)} USD / ៛{amountKHR.toLocaleString()} KHR
                    </p>
                  </div>
                  <div className="qr-progress-bar"></div>
                </div>

                <div className={`awaiting-box ${paymentStatus}`}>
                  <span className="pulse-icon">
                    {paymentStatus === "completed" ? "✅" : paymentStatus === "error" ? "⚠️" : "📡"}
                  </span>
                  <div>
                    <strong>
                      {paymentStatus === "completed"
                        ? "Payment confirmed!"
                        : paymentStatus === "error"
                          ? "Unable to verify payment"
                          : "Waiting for payment..."}
                    </strong>
                    <p>
                      {paymentStatus === "completed"
                        ? "Your reservation payment is complete. Redirecting..."
                        : paymentStatus === "error"
                          ? paymentError || "Please try again or contact support."
                          : "Scan this QR code with any Bakong-enabled banking app. We are continuously checking payment status."}
                    </p>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="sec-btn"
                    onClick={saveQrImage}
                    disabled={isGeneratingQr || !dataPayment.qr || qrExpired}
                  >
                    📥 Save QR Image
                  </button>
                  <button
                    type="button"
                    className="sec-btn"
                    onClick={copyPayLink}
                    disabled={isGeneratingQr || !dataPayment.qr || qrExpired}
                  >
                    📋 Copy Pay Link
                  </button>
                </div>

                <div className="banks-footer">
                  <p>SCAN WITH ANY BAKONG-ENABLED MOBILE BANKING APP</p>
                  <div className="bank-names">
                    <span>ABA Bank</span>
                    <span>Wing Bank</span>
                    <span>ACLEDA Bank</span>
                    <span>Canadia Bank</span>
                    <span>TrueMoney</span>
                    <span className="more">+50 More</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CREDIT / DEBIT CARD */}
            {activeTab === "card" && (
              <div className="tab-content card-view">
                <div className="credit-card-preview">
                  <div className="card-top">
                    <span>📶 NEXUS DEBIT / CREDIT</span>
                    <span className="card-brand">VISA</span>
                  </div>
                  <div className="card-number">
                    {cardDetails.number ? cardDetails.number : "•••• •••• •••• ••••"}
                  </div>
                  <div className="card-bottom">
                    <div>
                      <small>CARDHOLDER</small>
                      <p>{cardDetails.name.toUpperCase() || "YOUR NAME"}</p>
                    </div>
                    <div>
                      <small>EXPIRES</small>
                      <p>{cardDetails.expiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                <form className="card-form" onSubmit={handleCardPayment}>
                  <div className="card-form-group">
                    <label>Cardholder Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    />
                  </div>

                  <div className="card-form-group">
                    <label>Card Number</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        placeholder="4000 0000 0000 0000"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      />
                      <span className="brand-badge">VISA</span>
                    </div>
                  </div>

                  <div className="card-form-row">
                    <div className="card-form-group">
                      <label>Expiration Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      />
                    </div>
                    <div className="card-form-group">
                      <label>Security Code</label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="toggle-row">
                    <div>
                      <strong>Save card for 1-Click payments</strong>
                      <p>Tokenized safely under NBC and Visa standards</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle-switch"
                      checked={cardDetails.saveCard}
                      onChange={(e) => setCardDetails({ ...cardDetails, saveCard: e.target.checked })}
                    />
                  </div>

                  <button type="submit" className="card-submit-btn">
                    🔒 Pay ${amount.toFixed(2)} with Visa
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: CASH ON HAND */}
            {activeTab === "cash" && (
              <div className="tab-content cash-view">
                <div className="cash-banner">
                  <span className="cash-icon">💵</span>
                  <div>
                    <strong>Pay with Cash on Delivery / Cash on Hand</strong>
                    <p>
                      Pay securely with physical cash upon package handover or in-person service
                      completion.
                    </p>
                  </div>
                </div>

                <div className="cash-details-card">
                  <div className="cash-amount-header">
                    <div>
                      <small>EXACT CASH PAYABLE</small>
                      <h2>
                        ${amount.toFixed(2)} <small>USD</small> <span className="or">or</span> ៛
                        {amountKHR.toLocaleString()} <small>KHR</small>
                      </h2>
                    </div>
                    <span className="accepted-badge">USD & KHR Accepted</span>
                  </div>

                  <p className="change-label">
                    Will you need change? (e.g. paying with $100 or $50 notes)
                  </p>
                  <div className="pill-group">
                    {["exact", "150", "200", "other"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={changeOption === opt ? "pill pill-active" : "pill"}
                        onClick={() => setChangeOption(opt)}
                      >
                        {opt === "exact"
                          ? "Exact Amount"
                          : opt === "other"
                            ? "Other amount"
                            : `Need change for $${opt}`}
                      </button>
                    ))}
                  </div>
                </div>

                <form className="cash-form" onSubmit={handleCashPayment}>
                  <div className="cash-form-row">
                    <div className="cash-form-group">
                      <label>Recipient Full Name</label>
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        value={cashDetails.recipientName}
                        onChange={(e) =>
                          setCashDetails({ ...cashDetails, recipientName: e.target.value })
                        }
                      />
                    </div>
                    <div className="cash-form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        placeholder="+855 XX XXX XXX"
                        value={cashDetails.phone}
                        onChange={(e) =>
                          setCashDetails({ ...cashDetails, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="cash-form-group">
                    <label>Delivery / Handover Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Tower 2, Floor 8..."
                      value={cashDetails.address}
                      onChange={(e) =>
                        setCashDetails({ ...cashDetails, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="cash-form-group">
                    <label>Special Delivery Instruction</label>
                    <input
                      type="text"
                      placeholder="Call upon arrival..."
                      value={cashDetails.instructions}
                      onChange={(e) =>
                        setCashDetails({ ...cashDetails, instructions: e.target.value })
                      }
                    />
                  </div>

                  <div className="guarantee-box">
                    <span className="check-icon">✓</span>
                    <p>
                      <strong>Verified Handover Guarantee:</strong> Receipt with official merchant
                      stamp provided upon cash handover. Both USD and KHR accepted at official NBC rate
                      (1 USD = 4,100 KHR).
                    </p>
                  </div>

                  <button type="submit" className="cash-submit-btn">
                    💎 Confirm Order with Cash on Hand (${amount.toFixed(2)})
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Footer Actions */}
            <div className="right-footer">
              <button type="button" className="cancel-link" onClick={handleCloseModal}>
                Cancel transaction
              </button>
              <span className="shield-tag">● NexusPay Tokenized Shield</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;