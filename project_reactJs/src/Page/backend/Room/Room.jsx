import { useState, useEffect, useMemo, useCallback } from "react";
import "./room.css";
import LightMode from "../DartMode/LightMode";
import { Modal, Form, Input, Button, Space, Row, Col, InputNumber, Dropdown, Select, Tag } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Request from "../../util/Request";
import { BaseUrl } from "../../util/BaseUrl";
import { alertSuccess, alertError, confirmDelete } from "../../../swertalert/AlertSuccess";
import { useNavigate } from "react-router-dom";
import { getStoreUser } from "../../localStorage/userStore";

const Room = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getStoreUser()) {
      navigate("/login");
    }
    console.log("User: ", getStoreUser());
  }, [navigate]);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [roomType, setRoomType] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const filteredRooms = useMemo(() => {
    let filtered = data;

    if (searchKeyword.trim()) {
      const query = searchKeyword.toLowerCase();
      filtered = data.filter(
        (item) =>
          item.room_number?.toString().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.floor?.toString().toLowerCase().includes(query) ||
          item.status?.toLowerCase().includes(query),
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.status.toLocaleLowerCase() === filterStatus.toLocaleLowerCase(),
      );
    }

    return filtered;
  }, [data, searchKeyword, filterStatus]);

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  const items = [
    { key: "All", label: "All" },
    { key: "Available", label: "Available" },
    { key: "Cleaning", label: "Cleaning" },
    { key: "Occupied", label: "Occupied" },
    { key: "Reserved", label: "Reserved" },
    { key: "Maintenance", label: "Maintenance" },
    { key: "Blocked", label: "Blocked" },
  ];

  // Fetch rooms
  const fetchRoom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Request("/api/room", "get");
      if (res) {
        const list = res.data || [];
        console.log(res);
        setData(list);
      }
    } catch (error) {
      alertError({
        title: "Error",
        text: error?.response?.data?.message || "Failed to load rooms.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch room types
  const fetchRoomType = useCallback(async () => {
    try {
      const res = await Request("/api/roomtype", "get");
      if (res) {
        setRoomType(res.data || []);
        // console.log(res);
      }
    } catch (error) {
      alertError({
        title: "Error",
        text: error?.response?.data?.message || "Failed to load room types.",
      });
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void fetchRoom();
    void fetchRoomType();
  }, [fetchRoom, fetchRoomType]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({
      room_number: item.room_number,
      floor: item.floor,
      description: item.description,
      status: item.status,
      room_type_id: item.room_type_id || item.Room_type_id,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const ok = await confirmDelete(async () => {
        await Request(`/api/room/${id}`, "delete");
      });
      if (ok) {
        fetchRoom();
      }
    } catch (error) {
      alertError({
        title: "Error!",
        text: error?.response?.data?.message || "Failed to delete room.",
      });
    }
  };

  const onFinish = async (values) => {
    try {
      const url = editingId ? `/api/room/${editingId}` : "/api/room";
      const method = editingId ? "put" : "post";

      const data = {
        room_number: values.room_number,
        floor: values.floor,
        description: values.description,
        status: values.status,
        room_type_id: values.room_type_id,
      };

      const res = await Request(url, method, data);

      if (res) {
        setOpen(false);
        form.resetFields();
        setEditingId(null);
        alertSuccess({
          title: "Success!",
          text: editingId
            ? "Updated room successfully"
            : "Created room successfully",
        });
        fetchRoom();
      }
    } catch (error) {
      alertError({
        title: "Error!",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleFilterChange = ({ key }) => {
    setFilterStatus(key);
    setCurrentPage(1);
  };

  return (
    <div className="dashboard">
      <LightMode title="Room" />

      <div className="d-flex justify-content-end align-items-center mb-3">
        <Space>
          <Dropdown menu={{ items, onClick: handleFilterChange }}>
            <Button>
              Filter:{" "}
              {items.find((item) => item.key === filterStatus)?.label || "All"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>

          <Button type="primary" onClick={handleAddNew}>
            + Add New Room Type
          </Button>
        </Space>
      </div>

      <div className="room-type-controls">
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

        <div className="search-box">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by room number or description..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="room-type-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Number</th>
              <th>Floor</th>
              <th>Description</th>
              <th>Max Guests</th>
              <th>Room Name</th>
              <th>Price per night</th>
              <th>Status</th>
              <th>image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRooms.length > 0 ? (
              paginatedRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.room_number || "-"}</td>
                  <td>{room.floor || "-"}</td>
                  <td>{room.description || "-"}</td>
                  <td>{room.room_type?.max_guest || "-"}</td>
                  <td>{room.room_type?.name || "-"}</td>
                  <td>{room.room_type?.price_per_night || "-"}</td>
                  <td>
                    {room.status == "Available" ? (
                      <Tag color="green">Available</Tag>
                    ) : room.status == "Cleaning" ? (
                      <Tag color="blue">Cleaning</Tag>
                    ) : room.status == "Occupied" ? (
                      <Tag color="red">Occupied</Tag>
                    ) : room.status == "Reserved" ? (
                      <Tag color="orange">Reserved</Tag>
                    ) : room.status == "Maintenance" ? (
                      <Tag color="purple">Maintenance</Tag>
                    ) : room.status == "Blocked" ? (
                      <Tag color="red">Blocked</Tag>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {room.room_type.image ? (
                      <img
                        src={`${BaseUrl}${room.room_type.image}`}
                        alt={room.room_type.name || "Room"}
                        className="room-type-photo"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(room)}
                    >
                      ✎ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(room.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="no-data"
                >
                  <span style={{ display: "flex", justifyContent: "center"}}>No items found</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="pagination-info">
        Showing {filteredRooms.length > 0 ? startIndex + 1 : 0} to{" "}
        {Math.min(endIndex, filteredRooms.length)} of {filteredRooms.length}{" "}
        items
      </div>

      <div className="pagination-controls">
        <button
          className="btn-pagination"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="page-numbers">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          className="btn-pagination"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <Modal
        title={editingId ? "Edit Room" : "Add New Room"}
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Room Number"
                name="room_number"
                rules={[
                  { required: true, message: "Please enter room number" },
                ]}
              >
                <InputNumber
                  placeholder="Enter room number"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Floor"
                name="floor"
                rules={[{ required: true, message: "Please enter floor" }]}
              >
                <Input placeholder="Enter floor" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <Input
                  style={{ width: "100%" }}
                  placeholder="Enter description"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Select.Option value="Available">Available</Select.Option>
                  <Select.Option value="Cleaning">Cleaning</Select.Option>
                  <Select.Option value="Occupied">Occupied</Select.Option>
                  <Select.Option value="Reserved">Reserved</Select.Option>
                  <Select.Option value="Maintenance">Maintenance</Select.Option>
                  <Select.Option value="Blocked">Blocked</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Room Type"
                name="room_type_id"
                rules={[{ required: true, message: "Please select Room Type" }]}
              >
                <Select placeholder="Select Room Type">
                  {roomType.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                danger
                onClick={() => {
                  setOpen(false);
                  form.resetFields();
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>

              <Button type="primary" htmlType="submit">
                {editingId ? "Update" : "Save"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Room;