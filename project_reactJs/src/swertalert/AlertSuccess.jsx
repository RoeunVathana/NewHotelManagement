import Swal from "sweetalert2";

// ✅ Success Alert
export const alertSuccess = ({
  title = "",
  text = "",
  confirmButtonText = "OK",
}) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText,
    draggable: true,
  });
};

// ❌ Error Alert (add this)
export const alertError = ({
  title = "Error!",
  text = "Something went wrong",
}) => {
  return Swal.fire({
    title,
    text,
    icon: "error",
  });
};

// ⚠️ Confirm Delete with Loading
export const confirmDelete = async (onConfirm) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return false;

  try {
    // 🔄 Show loading
    Swal.fire({
      title: "Deleting...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // 👉 API call
    await onConfirm();

    // ✅ Success
    await Swal.fire({
      title: "Deleted!",
      text: "Your file has been deleted.",
      icon: "success",
    });

    return true;
  } catch (error) {
    // ❌ Error
    await alertError({
      text: error?.message || "Failed to delete data",
    });

    return false;
  }
};

// export const alertError = ({
//   title = "Oops...",
//   text = "Something went wrong!",
//   footer = null, // optional link or message
// }) => {
//   return Swal.fire({
//     icon: "error",
//     title,
//     text,
//     footer,
//   });
// };

// import { confirmDelete, alertSuccess } from "./alert";
// import request from "./request";

// const handleDelete = async (id) => {
//   const ok = await confirmDelete(async () => {
//     await request(`product/${id}`, "DELETE");
//   });

//   if (ok) {
//     console.log("Deleted successfully");
//   }
// };