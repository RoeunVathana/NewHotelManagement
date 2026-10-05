import {Navigate, Outlet} from 'react-router-dom'

const Protect = () => {
  const token = localStorage.getItem('userToken')
  return token ? <Outlet /> : <Navigate to="/login" />
}

export default Protect