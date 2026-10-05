import { useState, useEffect, useMemo, useCallback } from "react";
import "./roomType.css";
import LightMode from "../DartMode/LightMode";
import { Modal, Form, Input, Button, Space, Row, Col, InputNumber, Upload, Dropdown, Tag } from "antd";
import { UploadOutlined, DownOutlined } from "@ant-design/icons";
import Request from "../../util/Request";
import { BaseUrl } from "../../util/BaseUrl";
import { alertSuccess, alertError, confirmDelete } from "../../../swertalert/AlertSuccess";

const RoomType = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filteredRoomTypes = useMemo(() => {
    const query = searchKeyword.toLowerCase().trim();

    return data.filter((item) => {
      const matchesSearch = !query
        ? true
        : (item.name?.toLowerCase() || "").includes(query) ||
          (item.description?.toLowerCase() || "").includes(query);

      const matchesStatus =
        filterStatus === "all" || String(item.status) === String(filterStatus);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchKeyword, filterStatus]);

  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoomTypes = filteredRoomTypes.slice(startIndex, endIndex);

  // Attach Ant Design form instance
  const [form] = Form.useForm();

  const items = [
    { key: "all", label: "All" },
    { key: "1", label: "Active" },
    { key: "0", label: "Inactive" },
  ];

  // Fetch data from backend
  const fetchRoomType = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Request("/api/roomtype", "get");
      if (res) {
        const list = res.data || [];
        setData(list);
      }
    } catch (error) {
      alertError({
        title: "Error",
        text: error?.response?.data?.message || "Failed to load room types.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Run once on component mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void fetchRoomType();
  }, [fetchRoomType]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFilterChange = ({ key }) => {
    setFilterStatus(key);
    setCurrentPage(1);
  };

  // Open modal for adding a new item
  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    setOpen(true);
  };

  // Open modal and prefill data for editing
  const handleEdit = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      price_per_night: item.price_per_night,
      max_guest: item.max_guest,
      image: item.image
        ? [
            {
              uid: "-1",
              name: item.image.split("/").pop(),
              status: "done",
              url: BaseUrl + item.image,
            },
          ]
        : [],
    });
    setOpen(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      const ok = await confirmDelete(async () => {
        await Request(`/api/roomtype/${id}`, "delete");
      });
      if (ok) {
        fetchRoomType();
      }
    } catch (error) {
      alertError({
        title: "Error!",
        text: error?.response?.data?.message || "Failed to delete room type.",
      });
    }
  };

  // Submit handler for creating and updating
  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("price_per_night", values.price_per_night);
      formData.append("max_guest", values.max_guest);

      // Append image file only if a new file object exists
      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      const url = editingId ? `/api/roomtype/${editingId}` : "/api/roomtype";
      const method = editingId ? "put" : "post";

      const res = await Request(url, method, formData);

      if (res) {
        setOpen(false);
        form.resetFields();
        setEditingId(null);
        alertSuccess({
          title: "Success!",
          text: editingId
            ? "Updated room type successfully"
            : "Created room type successfully",
        });
        fetchRoomType();
      }
    } catch (error) {
      alertError({
        title: "Error!",
        text: error?.response?.data?.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="dashboard">
      <LightMode title="Room Type" />

      <div className="d-flex justify-content-end align-items-center mb-3">
        <Space>
          <Dropdown menu={{ items, onClick: handleFilterChange }}>
            <Button>
              Filter: {items.find((item) => item.key === filterStatus)?.label || "All"} <DownOutlined />
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
            placeholder="Search by name or description..."
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
        <>
          <table className="room-type-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price per Night</th>
                <th>Max Guest</th>
                <th>Status</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoomTypes.length > 0 ? (
                paginatedRoomTypes.map((roomType) => (
                  <tr key={roomType.id}>
                    <td>{roomType.id}</td>
                    <td>{roomType.name || "-"}</td>
                    <td>{roomType.description || "-"}</td>
                    <td>{roomType.price_per_night || "-"}</td>
                    <td>{roomType.max_guest || "-"}</td>
                    <td>{roomType.status ? <Tag color="green">"Active" </Tag>: <Tag color="red">Inactive</Tag>}</td>
                    <td>
                      {roomType.image ? (
                        <img
                          src={`${BaseUrl}${roomType.image}`}
                          alt={roomType.name || "Room"}
                          className="room-type-photo"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    {/* <td>
                      <video 
                        width={200}
                        src={BaseUrl + roomType.image}
                        controls
                        playsInline
                      />
                    </td> */}
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(roomType)}
                      >
                        ✎ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(roomType.id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                   <span style={{ display: "flex", justifyContent: "center"}}>No items found</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <div className="pagination-info">
        Showing {filteredRoomTypes.length > 0 ? startIndex + 1 : 0} to{" "}
        {Math.min(endIndex, filteredRoomTypes.length)} of {filteredRoomTypes.length}{" "}
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
          onClick={() =>
            setCurrentPage(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <Modal
        title={editingId ? "Edit Room Type" : "Add New Room Type"}
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
                label="Room Type Name"
                name="name"
                rules={[{ required: true, message: "Please enter room type" }]}
              >
                <Input placeholder="Enter room type" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input placeholder="Enter description" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Price Per Night"
                name="price_per_night"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Enter price" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Max Guest"
                name="max_guest"
                rules={[{ required: true, message: "Please enter max guest" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="Enter max guest" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Room Image"
                name="image"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  {
                    required: !editingId,
                    message: "Please upload a room image",
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
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

export default RoomType;