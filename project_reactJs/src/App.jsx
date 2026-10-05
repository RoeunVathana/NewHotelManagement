import { Routes, Route } from "react-router-dom";

import Layout from "./Page/components/Layout";
import Login from "./Page/backend/user_account/Login";
import Register from "./Page/backend/user_account/Register";
import Dashboard from "./Page/backend/dashboard/Dashboard";
import RoomType from "./Page/backend/roomType/RoomType";
import Room from "./Page/backend/Room/Room";
import Branches from "./Page/backend/branches/Branches";
import Protect from "./Page/backend/Protect/Protect";
import ResetPassword from './Page/backend/user_account/resetPassword';
import Staff from "./Page/backend/Staff/Staff";
import Walk_inAndReg from "./Page/backend/Guest/Walk_inAndReg";
import Reservation from "./Page/backend/Reservations/Reservation";
import Employees from "./Page/backend/Employees/Employees";
import CheckIn from "./Page/backend/checkIn/CheckIn";
import CheckOut from "./Page/backend/checkOut/CheckOut";
import Payment from "./Page/backend/Payment/Payment";

import LayoutPage from "./Page/frontend/layout/LayoutPage";
import Homepage from "./Page/frontend/Homepage/Homepage";
import AboutPage from "./Page/frontend/AboutPage/AboutPage";


const App = () => {
  return (
    <Routes>
      <Route element={<Protect />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/room" element={<Room />} />
          <Route path="/room_type" element={<RoomType />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/walk_in_and_reg" element={<Walk_inAndReg />} />
          <Route path="/reservations" element={<Reservation />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/check_in" element={<CheckIn />} />
          <Route path="/check_out" element={<CheckOut />} />
          <Route path="/payment" element={<Payment />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<LayoutPage />}>
        <Route path="/index" element={<Homepage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Routes>
  );
};

export default App;
