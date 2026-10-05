const setStoreUser = (user) => {
  localStorage.setItem("userToken", JSON.stringify(user));
}

const getStoreUser = () => {
  const data = localStorage.getItem("userToken");
  return data ? JSON.parse(data) : null;
}

const removeStoreUser = () => {
  localStorage.removeItem("userToken");
}

export { setStoreUser, getStoreUser, removeStoreUser };