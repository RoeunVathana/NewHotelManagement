import { useState, useEffect } from "react";
import "./employees.css";
import LightMode from "../DartMode/LightMode";

import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Row,
  Col,
  InputNumber,
  Upload,
} from "antd";

import Request from "../../util/Request";

import {
  alertSuccess,
  alertError,
  confirmDelete,
} from "../../../swertalert/AlertSuccess";

import { useNavigate } from "react-router";
import { getStoreUser } from "../../localStorage/userStore";
import { BaseUrl } from "../../util/BaseUrl";
const Employees = () => {
  const navigate = useNavigate();

  // =====================================================
  // CHECK LOGIN
  // =====================================================
  useEffect(() => {
    if (!getStoreUser()) {
      navigate("/login");
    }

    console.log("User: ", getStoreUser());
  }, [navigate]);

  // =====================================================
  // STATE
  // =====================================================
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  // =====================================================
  // SEARCH
  // =====================================================
  const query = searchKeyword.trim().toLowerCase();

  const filteredEmployees = data.filter(
    (item) =>
      !query ||
      item.full_name?.toLowerCase().includes(query) ||
      item.role?.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query)
  );

  // =====================================================
  // PAGINATION
  // =====================================================
  const totalPages =
    Math.ceil(filteredEmployees.length / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    endIndex
  );

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================
  const fetchEmployees = async () => {
    setLoading(true);

    try {
      const res = await Request("/api/employee", "get");

      if (res) {
        const list = res.data || [];

        console.log("Employees:", res);

        setData(list);
      }
    } catch (error) {
      console.error(error);

      alertError({
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to load Employees.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchEmployees();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // =====================================================
  // ADD NEW
  // =====================================================
  const handleAddNew = () => {
    setEditingId(null);

    form.resetFields();

    setOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================
  const handleEdit = (item) => {
    console.log("Edit employee:", item);

    setEditingId(item.id);

    form.setFieldsValue({
      full_name: item.full_name,
      gender: item.gender,
      phone: item.phone,
      role: item.role,
      salary: item.salary,
      email: item.email,
      password: item.password || "",
    });

    setOpen(true);
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async (id) => {
    try {
      const ok = await confirmDelete(async () => {
        await Request(`/api/employee/${id}`, "delete");
      });

      if (ok) {
        alertSuccess({
          title: "Deleted!",
          text: "Employee deleted successfully",
        });

        fetchEmployees();
      }
    } catch (error) {
      console.error(error);

      alertError({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "Failed to delete Employees.",
      });
    }
  };

  // =====================================================
  // FORM SUBMIT
  // =====================================================
  const onFinish = async (values) => {
    try {
      console.log("Form values:", values);

      const url = editingId
        ? `/api/employee/${editingId}`
        : "/api/employee";

      const method = editingId ? "put" : "post";

      // =====================================================
      // FORM DATA
      // =====================================================
      const formData = new FormData();

      formData.append("full_name", values.full_name);
      formData.append("gender", values.gender);
      formData.append("phone", values.phone);
      formData.append("role", values.role);
      formData.append("salary", values.salary);
      formData.append("email", values.email);

      // Password
      if (values.password) {
        formData.append("password", values.password);
      }

      // Image
      if (values.image) {
        formData.append("image", values.image);
      }

      // =====================================================
      // DEBUG FORM DATA
      // =====================================================
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // =====================================================
      // API REQUEST
      // =====================================================
      const res = await Request(url, method, formData);

      console.log("Response:", res);

      if (res) {
        setOpen(false);

        form.resetFields();

        setEditingId(null);

        alertSuccess({
          title: "Success!",
          text: editingId
            ? "Updated Employees successfully"
            : "Created Employees successfully",
        });

        fetchEmployees();
      }
    } catch (error) {
      console.error(error);

      alertError({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          "Something went wrong.",
      });
    }
  };

  // =====================================================
  // CANCEL MODAL
  // =====================================================
  const handleCancel = () => {
    setOpen(false);

    form.resetFields();

    setEditingId(null);
  };

  // =====================================================
  // RETURN
  // =====================================================
  return (
    <div className="dashboard">

      <LightMode title="Employees" />

      {/* =====================================================
          ADD BUTTON
      ===================================================== */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        <Space>
          <Button
            type="primary"
            onClick={handleAddNew}
          >
            + Add New Employees
          </Button>
        </Space>
      </div>

      {/* =====================================================
          CONTROLS
      ===================================================== */}
      <div className="room-type-controls">

        {/* ITEMS PER PAGE */}
        <div className="items-per-page">
          <label>Show</label>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={3}>3</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={50}>50</option>
          </select>

          <span>items per page</span>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <label>Search:</label>

          <input
            type="text"
            placeholder="Search by name, role, phone, or email..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}
      {loading ? (
        <div className="loading">
          Loading...
        </div>
      ) : (
        <table className="room-type-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <tr key={employee.id}>

                  {/* ID */}
                  <td>
                    {employee.id}
                  </td>

                  {/* IMAGE */}
                  <td>
                    {employee.image ? (
                      <img
                        src={BaseUrl + employee.image}
                        alt={employee.full_name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* FULL NAME */}
                  <td>
                    {employee.full_name || "-"}
                  </td>

                  {/* GENDER */}
                  <td>
                    {employee.gender || "-"}
                  </td>

                  {/* PHONE */}
                  <td>
                    {employee.phone || "-"}
                  </td>

                  {/* ROLE */}
                  <td>
                    {employee.role || "-"}
                  </td>

                  {/* SALARY */}
                  <td>
                    {employee.salary || "-"}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {employee.email || "-"}
                  </td>

                  {/* ACTIONS */}
                  <td className="actions">

                    <button
                      className="btn-edit"
                      onClick={() =>
                        handleEdit(employee)
                      }
                    >
                      ✎ Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(employee.id)
                      }
                    >
                      🗑 Delete
                    </button>

                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="no-data"
                >
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    No employees found
                  </span>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      )}

      {/* =====================================================
          PAGINATION INFO
      ===================================================== */}
      <div className="pagination-info">
        Showing{" "}
        {filteredEmployees.length > 0
          ? startIndex + 1
          : 0}{" "}
        to{" "}
        {Math.min(
          endIndex,
          filteredEmployees.length
        )}{" "}
        of {filteredEmployees.length} items
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}
      <div className="pagination-controls">

        <button
          className="btn-pagination"
          onClick={() =>
            setCurrentPage(
              Math.max(
                1,
                currentPage - 1
              )
            )
          }
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="page-numbers">

          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i + 1}
                className={`page-number ${
                  currentPage === i + 1
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentPage(i + 1)
                }
              >
                {i + 1}
              </button>
            )
          )}

        </div>

        <button
          className="btn-pagination"
          onClick={() =>
            setCurrentPage(
              Math.min(
                totalPages,
                currentPage + 1
              )
            )
          }
          disabled={
            currentPage === totalPages
          }
        >
          Next
        </button>

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}
      <Modal
        title={
          editingId
            ? "Edit Employees"
            : "Add New Employees"
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >

          {/* =================================================
              FULL NAME + GENDER
          ================================================= */}
          <Row gutter={16}>

            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="full_name"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter full name",
                  },
                ]}
              >
                <Input
                  placeholder="Enter full name"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter gender",
                  },
                ]}
              >
                <Input
                  placeholder="Enter gender"
                />
              </Form.Item>
            </Col>

          </Row>

          {/* =================================================
              PHONE + ROLE
          ================================================= */}
          <Row gutter={16}>

            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter phone",
                  },
                ]}
              >
                <Input
                  placeholder="Enter phone number"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter role",
                  },
                ]}
              >
                <Input
                  placeholder="Enter role"
                />
              </Form.Item>
            </Col>

          </Row>

          {/* =================================================
              SALARY + EMAIL
          ================================================= */}
          <Row gutter={16}>

            <Col span={12}>
              <Form.Item
                label="Salary"
                name="salary"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter salary",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{
                    width: "100%",
                  }}
                  placeholder="Enter salary"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message:
                      "Please enter email",
                  },
                  {
                    type: "email",
                    message:
                      "Please enter a valid email",
                  },
                ]}
              >
                <Input
                  placeholder="Enter email"
                />
              </Form.Item>
            </Col>

          </Row>

          {/* =================================================
              PASSWORD + IMAGE
          ================================================= */}
          <Row gutter={16}>

            {/* PASSWORD */}
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: !editingId,
                    message:
                      "Please enter password",
                  },
                  {
                    min: 6,
                    message:
                      "Password must be at least 6 characters",
                  },
                ]}
              >
                <Input.Password
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
              </Form.Item>
            </Col>

            {/* IMAGE */}
            <Col span={12}>
              <Form.Item
                label="Image"
                name="image"
                valuePropName="file"
                getValueFromEvent={(e) =>
                  e?.file
                }
                rules={[
                  {
                    required: !editingId,
                    message:
                      "Please select an image",
                  },
                ]}
              >
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() =>
                    false
                  }
                  accept="image/*"
                >
                  <Button>
                    Choose Image
                  </Button>
                </Upload>
              </Form.Item>
            </Col>

          </Row>

          {/* =================================================
              BUTTONS
          ================================================= */}
          <Form.Item>

            <Space
              style={{
                width: "100%",
                justifyContent:
                  "flex-end",
              }}
            >

              <Button
                danger
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
              >
                {editingId
                  ? "Update"
                  : "Save"}
              </Button>

            </Space>

          </Form.Item>

        </Form>

      </Modal>

    </div>
  );
};

export default Employees;