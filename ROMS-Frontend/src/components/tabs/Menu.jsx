import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  isAvailable: true,
};

function Menu() {
  const {
    menuItems,
    isMenuLoading,
    fetchMenuItems,
    prependMenuItem,
    upsertMenuItem,
  } = useAuth();
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setError("");
    fetchMenuItems().catch((requestError) => {
      setError(
        requestError?.response?.data?.message || "Failed to fetch menu items."
      );
    });
  }, [fetchMenuItems]);

  const openModal = () => {
    setFormData(emptyForm);
    setEditingItemId(null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      price: String(item?.price ?? ""),
      category: item?.category || "",
      isAvailable: Boolean(item?.isAvailable),
    });
    setEditingItemId(item?._id || null);
    setSaveError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saveLoading) return;
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveMenuItem = async (event) => {
    event.preventDefault();
    setSaveError("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      formData.price === ""
    ) {
      setSaveError("All fields are required.");
      return;
    }

    const priceValue = Number(formData.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setSaveError("Price must be a valid number greater than or equal to 0.");
      return;
    }

    setSaveLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceValue,
        category: formData.category.trim(),
        isAvailable: Boolean(formData.isAvailable),
      };

      if (editingItemId) {
        const response = await api.put(`api/menu/${editingItemId}`, payload);
        const updatedItem = response?.data?.menuItem;

        if (!updatedItem) {
          throw new Error("Menu item was updated but response was invalid.");
        }

        upsertMenuItem(updatedItem);
      } else {
        const response = await api.post("api/menu/", payload);
        const createdItem = response?.data?.menuItem;

        if (!createdItem) {
          throw new Error("Menu item was created but response was invalid.");
        }

        prependMenuItem(createdItem);
      }

      setIsModalOpen(false);
      setEditingItemId(null);
      setFormData(emptyForm);
    } catch (requestError) {
      setSaveError(
        requestError?.response?.data?.message || requestError?.message || "Failed to create menu item."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-orange-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Menu Management
            </h1>
            <p className="mt-2 text-zinc-600">
              Browse and manage all menu items from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            + Add Menu Item
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-orange-200 bg-white">
        <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
          <p className="text-sm font-semibold tracking-[0.15em] text-zinc-500">
            MENU ITEMS
          </p>
          <p className="text-sm font-medium text-zinc-600">
            Total:{" "}
            <span className="font-semibold text-zinc-900">{menuItems.length}</span>
          </p>
        </div>

        {isMenuLoading ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            Loading menu items...
          </p>
        ) : menuItems.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            No menu items found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-orange-100 bg-orange-50/50 text-xs uppercase tracking-[0.12em] text-zinc-500">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-orange-100/70 last:border-b-0"
                  >
                    <td className="px-5 py-4 align-top">
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      <p className="mt-1 max-w-xl text-sm text-zinc-600">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-medium text-zinc-700">
                      {item.category}
                    </td>
                    <td className="px-5 py-4 align-top text-sm font-semibold text-zinc-900">
                      Rs. {Number(item.price || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Sold Out"}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-sm text-zinc-600">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-50"
                      >
                        Edit
                      </button>
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
          <div className="w-full max-w-xl rounded-2xl border border-orange-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  {editingItemId ? "Edit Menu Item" : "Add Menu Item"}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {editingItemId
                    ? "Update details for this menu item and save changes."
                    : "Fill the details and save to add the item to your menu."}
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

            <form className="space-y-4" onSubmit={handleSaveMenuItem}>
              {saveError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="menu-name"
                  className="mb-1.5 block text-sm font-semibold text-zinc-700"
                >
                  Name
                </label>
                <input
                  id="menu-name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  placeholder="Chicken Biryani"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="menu-description"
                  className="mb-1.5 block text-sm font-semibold text-zinc-700"
                >
                  Description
                </label>
                <textarea
                  id="menu-description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="min-h-24 w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  placeholder="Authentic Hyderabadi chicken biryani with aromatic basmati rice and spices."
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="menu-price"
                    className="mb-1.5 block text-sm font-semibold text-zinc-700"
                  >
                    Price
                  </label>
                  <input
                    id="menu-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="299"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="menu-category"
                    className="mb-1.5 block text-sm font-semibold text-zinc-700"
                  >
                    Category
                  </label>
                  <input
                    id="menu-category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-zinc-700 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="Main Course"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-zinc-300 accent-orange-500"
                />
                Available for ordering
              </label>

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
                  {saveLoading
                    ? editingItemId
                      ? "Updating..."
                      : "Saving..."
                    : editingItemId
                    ? "Update Item"
                    : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Menu;
