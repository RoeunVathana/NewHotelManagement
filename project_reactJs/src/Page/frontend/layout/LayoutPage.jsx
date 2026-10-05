import {Outlet} from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import Footer from '../Footer/Footer';
const LayoutPage = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

export default LayoutPage