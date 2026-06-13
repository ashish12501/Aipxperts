import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ORDER_STATUSES = ["Pending", "Preparing", "Delivered", "Cancelled"];

const createEmptyItem = (defaultMenuItemId = "") => ({
  menuItemId: defaultMenuItemId,
  quantity: "1",
});

const emptyForm = {
  customerName: "",
  items: [createEmptyItem()],
};

function Orders() {
  const { menuItems, isMenuLoading, fetchMenuItems } = useAuth();
  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [statusValues, setStatusValues] = useState({});
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setError("");
        const response = await api.get("api/orders/");
        const data = response?.data || {};
        const fetchedOrders = Array.isArray(data.orders) ? data.orders : [];

        if (!isMounted) {
          return;
        }

        setOrders(fetchedOrders);
        setCount(Number(data.count || 0));
        setStatusValues(
          fetchedOrders.reduce((acc, order) => {
            acc[order._id] = order.status || "Pending";
            return acc;
          }, {})
        );
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message || "Failed to fetch orders."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders]
  );

  const availableMenuItems = useMemo(
    () => menuItems.filter((item) => item.isAvailable),
    [menuItems]
  );

  const menuItemsById = useMemo(
    () =>
      menuItems.reduce((acc, item) => {
        acc[item._id] = item;
        return acc;
      }, {}),
    [menuItems]
  );

  const openModal = () => {
    setFormData({
      customerName: "",
      items: [createEmptyItem(availableMenuItems[0]?._id || "")],
    });
    setSaveError("");
    setIsModalOpen(true);

    if (menuItems.length === 0) {
      fetchMenuItems().catch(() => {
        // Modal shows saveError when submit, fetch errors are non-blocking here.
      });
    }
  };

  const closeModal = () => {
    if (saveLoading) return;
    setIsModalOpen(false);
  };

  const handleOrderChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleOrderItemChange = (index, event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [name]: value } : item
      ),
    }));
  };

  const addOrderItemRow = () => {
    setFormData((previous) => ({
      ...previous,
      items: [...previous.items, createEmptyItem(availableMenuItems[0]?._id || "")],
    }));
  };

  const removeOrderItemRow = (index) => {
    setFormData((previous) => ({
      ...previous,
      items:
        previous.items.length === 1
          ? previous.items
          : previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setSaveError("");

    if (!formData.customerName.trim()) {
      setSaveError("Customer name is required.");
      return;
    }

    const parsedItems = [];
    for (const item of formData.items) {
      const selectedMenuItem = menuItemsById[item.menuItemId];

      if (!item.menuItemId || !selectedMenuItem) {
        setSaveError("Please select a valid menu item for each row.");
        return;
      }

      if (!selectedMenuItem.isAvailable) {
        setSaveError("Only available menu items can be added to an order.");
        return;
      }

      const quantityValue = Number(item.quantity);
      if (!Number.isInteger(quantityValue) || quantityValue < 1) {
        setSaveError("Item quantity must be an integer >= 1.");
        return;
      }

      const priceValue = Number(selectedMenuItem.price);
      if (Number.isNaN(priceValue) || priceValue < 0) {
        setSaveError("Item price must be >= 0.");
        return;
      }

      parsedItems.push({
        menuItemId: selectedMenuItem._id,
        name: selectedMenuItem.name,
        quantity: quantityValue,
        price: priceValue,
      });
    }

    setSaveLoading(true);

    try {
      const response = await api.post("api/orders/", {
        customerName: formData.customerName.trim(),
        items: parsedItems,
      });

      const createdOrder = response?.data?.order;
      if (!createdOrder) {
        throw new Error("Order created but response was invalid.");
      }

      setOrders((previous) => [createdOrder, ...previous]);
      setCount((previous) => previous + 1);
      setStatusValues((previous) => ({
        ...previous,
        [createdOrder._id]: createdOrder.status || "Pending",
      }));
      setFormData(emptyForm);
      setIsModalOpen(false);
    } catch (requestError) {
      setSaveError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to create order."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    if (!status || typeof status !== "string") {
      setStatusError("Please select a valid status.");
      return;
    }

    const previousStatus = statusValues[orderId];
    setStatusValues((previous) => ({ ...previous, [orderId]: status }));
    setStatusError("");
    setStatusLoadingId(orderId);

    try {
      const response = await api.patch(`api/orders/${orderId}/status`, { status });
      const updatedOrder = response?.data?.order;

      if (!updatedOrder) {
        throw new Error("Order status updated but response was invalid.");
      }

      setOrders((previous) =>
        previous.map((order) => (order._id === orderId ? updatedOrder : order))
      );
      setStatusValues((previous) => ({
        ...previous,
        [orderId]: updatedOrder.status || status,
      }));
    } catch (requestError) {
      setStatusValues((previous) => ({
        ...previous,
        [orderId]: previousStatus || previous[orderId] || "Pending",
      }));
      setStatusError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to update order status."
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Orders
            </h1>
            <p className="mt-2 text-zinc-600">
              Create orders and manage their fulfillment status.
            </p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            + Create Order
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {statusError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statusError}
        </div>
      ) : null}

      <div className="rounded-2xl border border-orange-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 px-5 py-4">
          <p className="text-sm font-semibold tracking-[0.15em] text-zinc-500">
            ORDER LIST
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
            <p>
              Total Orders:{" "}
              <span className="font-semibold text-zinc-900">{count}</span>
            </p>
            <p>
              Revenue:{" "}
              <span className="font-semibold text-zinc-900">
                Rs. {totalRevenue.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            No orders found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/50 text-xs uppercase tracking-[0.12em] text-zinc-500">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-orange-100/70 last:border-b-0"
                  >
                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-zinc-900">
                        {order.customerName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        ID: {order._id}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-zinc-700">
                      <ul className="space-y-1">
                        {order.items?.map((item, index) => (
                          <li key={`${order._id}-item-${index}`}>
                            {item.name} x {item.quantity} (Rs.{" "}
                            {Number(item.price || 0).toLocaleString()})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-900">
                      Rs. {Number(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <select
                        value={statusValues[order._id] || order.status || "Pending"}
                        onChange={(event) => {
                          handleStatusChange(order._id, event.target.value);
                        }}
                        disabled={statusLoadingId === order._id}
                        className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm text-zinc-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {statusLoadingId === order._id ? (
                        <p className="mt-1 text-xs text-zinc-500">Updating...</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-zinc-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-orange-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Create Order
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Add customer and order item details, then save.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-orange-50"
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateOrder}>
              {saveError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-1.5 block text-sm font-semibold text-zinc-700"
                >
                  Customer Name
                </label>
                <input
                  id="customer-name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleOrderChange}
                  className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  placeholder="Rahul Sharma"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-700">Order Items</p>
                  <button
                    type="button"
                    onClick={addOrderItemRow}
                    className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
                  >
                    + Add Item
                  </button>
                </div>

                {!isMenuLoading && availableMenuItems.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    No available menu items found. Add or enable menu items first.
                  </div>
                ) : null}

                {formData.items.map((item, index) => (
                  <div
                    key={`order-item-row-${index}`}
                    className="rounded-xl border border-orange-200 bg-orange-50/60 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                        Item {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeOrderItemRow(index)}
                        className="rounded-md border border-orange-200 px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:bg-orange-100 disabled:opacity-40"
                        disabled={formData.items.length === 1}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        name="menuItemId"
                        value={item.menuItemId}
                        onChange={(event) => handleOrderItemChange(index, event)}
                        className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        required
                        disabled={isMenuLoading}
                      >
                        <option value="">
                          {isMenuLoading
                            ? "Loading menu items..."
                            : "Select available menu item"}
                        </option>
                        {availableMenuItems.map((menuItem) => (
                          <option key={menuItem._id} value={menuItem._id}>
                            {menuItem.name} - Rs.{" "}
                            {Number(menuItem.price || 0).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <input
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) => handleOrderItemChange(index, event)}
                        className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Quantity"
                        required
                      />
                      <div className="flex items-center rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-zinc-600">
                        {item.menuItemId && menuItemsById[item.menuItemId]
                          ? `Price: Rs. ${Number(
                              menuItemsById[item.menuItemId].price || 0
                            ).toLocaleString()}`
                          : "Price will be auto-filled from menu item"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-orange-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saveLoading ? "Saving..." : "Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Orders;
