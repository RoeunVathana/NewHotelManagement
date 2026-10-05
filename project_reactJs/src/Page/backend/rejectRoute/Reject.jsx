import { useEffect } from 'react'
import { getStoreUser } from '../../localStorage/userStore'


const Reject = () => {
    useEffect(() => {
        const user = getStoreUser();
        if (!user) {
            window.location.href = "/login";
        }
    }, [])
  return (
    <></>
  )
}

export default Reject