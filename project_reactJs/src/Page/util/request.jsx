import axios from "axios";
import { BaseUrl } from "./BaseUrl";
import { getStoreUser, removeStoreUser } from ".././localStorage/userStore";

const Request = async (path = "", method = "GET", data = {}) => {
  const token = getStoreUser();
  const token_client = "";

  const headers =
    data instanceof FormData
      ? {
          Authorization: token
            ? `Bearer ${token}`
            : token_client
              ? `Bearer ${token_client}`
              : "",
        }
      : {
          "Content-Type": "application/json",
          Authorization: token
            ? `Bearer ${token}`
            : token_client
              ? `Bearer ${token_client}`
              : "",
        };

  try {
    const res = await axios({
      method,
      url: BaseUrl + path,
      data,
      headers,
    });

    if (res.data?.status === "error") {
      throw new Error(res.data.message);
    }

    if (res.data?.status === "fail") {
      throw new Error(res.data.message);
    }

    return res.data;
  } catch (error) {
    console.error("Request Error:", error);

    if (error?.response?.status === 401) {
      removeStoreUser();
      window.location.href = "/login";
      throw new Error("Unauthorized. Please login again.", { cause: error });
    }

    throw error;
  }
};

export default Request;
