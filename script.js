let products = [
  {
    id: 1,
    name: "The Sunday Shirt",
    category: "Clothing",
    price: 58,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    badge: "Just in",
    section: "new",
  },
  {
    id: 2,
    name: "Soft Form Knit",
    category: "Clothing",
    price: 74,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    badge: "Just in",
    section: "new",
  },
  {
    id: 3,
    name: "Everywhere Tote",
    category: "Accessories",
    price: 42,
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    badge: "Just in",
    section: "new",
  },
  {
    id: 4,
    name: "Weekend Denim",
    category: "Clothing",
    price: 89,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    badge: "Just in",
    section: "new",
  },
  {
    id: 5,
    name: "Easy Days Jacket",
    category: "Clothing",
    price: 68,
    oldPrice: 96,
    image: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=800&q=80",
    badge: "30% off",
    section: "sale",
  },
  {
    id: 6,
    name: "Soft Hour Shirt",
    category: "Clothing",
    price: 39,
    oldPrice: 55,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    badge: "30% off",
    section: "sale",
  },
  {
    id: 7,
    name: "The Daily Carryall",
    category: "Accessories",
    price: 34,
    oldPrice: 48,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    badge: "Save 30%",
    section: "sale",
  },
  {
    id: 8,
    name: "Sunday Best Pants",
    category: "Clothing",
    price: 52,
    oldPrice: 72,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    badge: "Save 28%",
    section: "sale",
  },
  {
    id: 9,
    name: "Everyday Layer Tee",
    category: "Clothing",
    price: 32,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    badge: "A favourite",
    section: "essentials",
  },
  {
    id: 10,
    name: "Soft Structure Bag",
    category: "Accessories",
    price: 64,
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80",
    badge: "A favourite",
    section: "essentials",
  },
];

const inventoryOverrides = loadInventoryOverrides();
if (Array.isArray(inventoryOverrides.products)) {
  products = inventoryOverrides.products.filter((product) =>
    Number.isInteger(product.id)
    && typeof product.name === "string"
    && ["Clothing", "Accessories"].includes(product.category)
    && Number.isFinite(product.price)
    && typeof product.image === "string"
    && ["new", "sale", "essentials"].includes(product.section),
  );
} else {
  products.forEach((product) => {
    product.available = true;
    const saved = inventoryOverrides[String(product.id)];
    if (saved) {
      if (Number.isFinite(saved.price) && saved.price >= 0) product.price = saved.price;
      if (typeof saved.available === "boolean") product.available = saved.available;
    }
  });
}
products.forEach((product) => {
  if (typeof product.available !== "boolean") product.available = true;
});

const grids = {
  new: document.querySelector("#new-arrivals-grid"),
  sale: document.querySelector("#sale-grid"),
  essentials: document.querySelector("#essentials-grid"),
};

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});
const money = (amount) => pesoFormatter.format(amount);

function renderProduct(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.category = product.category;
  card.dataset.name = product.name.toLowerCase();

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image-wrap";

  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";

  const badge = document.createElement("span");
  badge.className = `product-badge${product.section === "sale" ? " sale-badge" : ""}`;
  badge.textContent = product.badge;

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-button";
  addButton.textContent = "Add to bag";
  addButton.setAttribute("aria-label", `Add ${product.name} to bag`);
  addButton.addEventListener("click", () => addToBag(product));

  const details = document.createElement("div");
  details.className = "product-details";
  const name = document.createElement("p");
  name.className = "product-name";
  name.textContent = product.name;
  const price = document.createElement("p");
  price.className = "product-price";
  if (product.oldPrice) {
    const oldPrice = document.createElement("span");
    oldPrice.className = "old-price";
    oldPrice.textContent = money(product.oldPrice);
    price.append(oldPrice);
  }
  price.append(document.createTextNode(money(product.price)));

  imageWrap.append(image, badge, addButton);
  details.append(name, price);
  card.append(imageWrap, details);
  return card;
}

function renderProducts(section, filter = "all", query = "") {
  const matchingProducts = products.filter((product) => {
    const matchesSection = product.section === section;
    const matchesFilter = filter === "all" || product.category === filter;
    const matchesQuery = product.name.toLowerCase().includes(query);
    return product.available && matchesSection && matchesFilter && matchesQuery;
  });

  grids[section].replaceChildren();
  if (matchingProducts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-results";
    empty.textContent = "No pieces found. Try another search.";
    grids[section].append(empty);
    return;
  }
  grids[section].append(...matchingProducts.map(renderProduct));
}

const bag = new Map();
const accountDialog = document.querySelector("#account-dialog");
const orderDialog = document.querySelector("#order-dialog");
const accountForm = document.querySelector("#account-form");
const accountStatus = document.querySelector("#account-status");
const adminDashboard = document.querySelector("#admin-dashboard");
const adminPanel = document.querySelector("#admin-panel");
const orderContent = document.querySelector("#order-content");
const orders = [];
const demoAccounts = {
  admin: { password: "admin123", name: "Admin", role: "admin" },
  ami: { password: "ami123", name: "Ami", role: "shopper" },
};
let currentAccount = readAccount();
let toastTimer;
const toast = document.querySelector("#toast");
const bagButton = document.querySelector(".bag-button");
const loginButton = document.querySelector("#login-button");

function addToBag(product) {
  bag.set(product.id, (bag.get(product.id) || 0) + 1);
  updateBagCount();
  toast.textContent = `${product.name} added to your bag`;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function updateBagCount() {
  const count = [...bag.values()].reduce((total, quantity) => total + quantity, 0);
  document.querySelector("#bag-count").textContent = String(count);
  bagButton.setAttribute("aria-label", `Shopping bag, ${count} items`);
}

function readAccount() {
  try {
    const account = JSON.parse(window.sessionStorage.getItem("sada-account"));
    return account
      && typeof account.username === "string"
      && demoAccounts[account.username]
      && account.role === demoAccounts[account.username].role
      ? account
      : null;
  } catch (error) {
    console.error("Unable to read the signed-in account.", error);
    return null;
  }
}

function updateAccountButton() {
  loginButton.textContent = currentAccount ? `Hi, ${currentAccount.name}` : "Log in";
  loginButton.setAttribute(
    "aria-label",
    currentAccount ? `Account for ${currentAccount.name}` : "Log in",
  );
}

function openAccountDialog() {
  if (currentAccount) {
    accountForm.hidden = true;
    document.querySelector("#login-error").hidden = true;
    accountStatus.hidden = currentAccount.role === "admin";
    adminDashboard.hidden = currentAccount.role !== "admin";
    accountDialog.classList.toggle("admin-mode", currentAccount.role === "admin");
    if (currentAccount.role === "admin") {
      document.querySelector("#account-title").textContent = "Admin dashboard";
      document.querySelector("#account-greeting").textContent = "";
      renderAdminDashboard();
    } else {
      accountDialog.classList.remove("admin-mode");
      document.querySelector("#account-title").textContent = "Your account";
      document.querySelector("#account-greeting").textContent = `You're signed in as Ami (${currentAccount.username}).`;
    }
  } else {
    document.querySelector("#account-title").textContent = "Log in";
    accountForm.hidden = false;
    accountStatus.hidden = true;
    adminDashboard.hidden = true;
    document.querySelector("#login-error").hidden = true;
    accountForm.reset();
  }
  accountDialog.showModal();
}

function loadInventoryOverrides() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("sada-inventory") || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch (error) {
    console.error("Unable to load demo inventory settings.", error);
    return {};
  }
}

function saveInventoryOverrides() {
  const saved = {
    products: products.map(({ id, name, category, price, oldPrice, image, badge, section, available }) => ({
      id, name, category, price, oldPrice, image, badge, section, available,
    })),
  };
  try {
    window.localStorage.setItem("sada-inventory", JSON.stringify(saved));
    return true;
  } catch (error) {
    console.error("Unable to save demo inventory settings.", error);
    return false;
  }
}

function renderAdminDashboard() {
  document.querySelector("#admin-product-count").textContent = String(products.length);
  document.querySelector("#admin-order-count").textContent = String(orders.length);
  const activeTab = document.querySelector(".admin-tab[aria-selected='true']")?.dataset.adminTab || "products";
  if (activeTab === "orders") {
    renderAdminOrders();
  } else {
    renderAdminProducts();
  }
}

function renderAdminProducts() {
  adminPanel.replaceChildren();
  const list = document.createElement("div");
  list.className = "admin-product-list";
  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "admin-product-row";
    const name = document.createElement("div");
    name.className = "admin-product-name";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const category = document.createElement("small");
    const sectionName = product.section === "new"
      ? "New Arrivals"
      : product.section === "sale" ? "Sale" : "Essentials";
    category.textContent = `${sectionName} · ${product.category}`;
    name.append(title, category);

    const priceLabel = document.createElement("label");
    priceLabel.className = "admin-price-field";
    priceLabel.textContent = "Price";
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.min = "0";
    priceInput.step = "0.01";
    priceInput.value = product.price.toFixed(2);
    priceInput.setAttribute("aria-label", `${product.name} price`);
    priceLabel.append(priceInput);
    priceInput.addEventListener("change", () => {
      const newPrice = Number(priceInput.value);
      if (!Number.isFinite(newPrice) || newPrice < 0) {
        priceInput.value = product.price.toFixed(2);
        return;
      }
      const previousPrice = product.price;
      product.price = newPrice;
      if (!saveInventoryOverrides()) {
        product.price = previousPrice;
        priceInput.value = previousPrice.toFixed(2);
        adminPanel.dataset.error = "Unable to save inventory changes in this browser.";
        renderAdminDashboard();
        return;
      }
      refreshProductGrids();
    });

    const availability = document.createElement("label");
    availability.className = "admin-availability";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = product.available;
    checkbox.setAttribute("aria-label", `${product.name} available in store`);
    const availabilityText = document.createElement("span");
    availabilityText.textContent = "Available";
    availability.append(checkbox, availabilityText);
    checkbox.addEventListener("change", () => {
      const previousAvailability = product.available;
      product.available = checkbox.checked;
      if (!saveInventoryOverrides()) {
        product.available = previousAvailability;
        adminPanel.dataset.error = "Unable to save inventory changes in this browser.";
        renderAdminDashboard();
        return;
      }
      refreshProductGrids();
      renderAdminDashboard();
    });
    const removeButton = document.createElement("button");
    removeButton.className = "admin-remove-button";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${product.name}`);
    removeButton.addEventListener("click", () => {
      const index = products.findIndex((item) => item.id === product.id);
      if (index < 0) return;
      const [removed] = products.splice(index, 1);
      if (!saveInventoryOverrides()) {
        products.splice(index, 0, removed);
        adminPanel.dataset.error = "Unable to save product removal in this browser.";
        renderAdminDashboard();
        return;
      }
      bag.delete(product.id);
      updateBagCount();
      refreshProductGrids();
      renderAdminDashboard();
    });
    row.append(name, priceLabel, availability, removeButton);
    list.append(row);
  });
  adminPanel.append(list);
  if (adminPanel.dataset.error) {
    const error = document.createElement("p");
    error.className = "login-error";
    error.textContent = adminPanel.dataset.error;
    adminPanel.append(error);
  }
}

async function resizeUploadedImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a valid image file.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image files must be 10 MB or smaller.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const maxDimension = 1200;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare this image in the browser.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    bitmap.close();
  }
}

const adminAddForm = document.querySelector("#admin-add-form");
const adminImageUrl = document.querySelector("#admin-image-url");
const adminImageFile = document.querySelector("#admin-image-file");
const adminImagePreview = document.querySelector("#admin-image-preview");
let imagePreviewObjectUrl = null;

function showImagePreview(source) {
  if (!source) {
    adminImagePreview.hidden = true;
    adminImagePreview.removeAttribute("src");
    return;
  }
  adminImagePreview.src = source;
  adminImagePreview.hidden = false;
}

function clearImagePreviewObjectUrl() {
  if (imagePreviewObjectUrl) {
    URL.revokeObjectURL(imagePreviewObjectUrl);
    imagePreviewObjectUrl = null;
  }
}

adminImageFile.addEventListener("change", () => {
  clearImagePreviewObjectUrl();
  const file = adminImageFile.files[0];
  if (!file) {
    showImagePreview(adminImageUrl.value.trim());
    return;
  }
  adminImageUrl.value = "";
  imagePreviewObjectUrl = URL.createObjectURL(file);
  showImagePreview(imagePreviewObjectUrl);
});

adminImageUrl.addEventListener("input", () => {
  if (adminImageUrl.value.trim()) {
    clearImagePreviewObjectUrl();
    adminImageFile.value = "";
  }
  showImagePreview(adminImageUrl.value.trim());
});

adminAddForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get("name")).trim();
  const imageUrlValue = String(formData.get("image")).trim();
  const imageFile = adminImageFile.files[0];
  const price = Number(formData.get("price"));
  const category = String(formData.get("category"));
  const section = String(formData.get("section"));
  const error = document.querySelector("#admin-product-error");
  const submitButton = form.querySelector('button[type="submit"]');
  error.hidden = true;

  if (!name || !Number.isFinite(price) || price <= 0) {
    error.textContent = "Enter a product name and a price above zero.";
    error.hidden = false;
    return;
  }
  if (!imageUrlValue && !imageFile) {
    error.textContent = "Choose an image file or enter an image URL.";
    error.hidden = false;
    return;
  }

  submitButton.disabled = true;
  let image = imageUrlValue;
  if (imageFile) {
    try {
      image = await resizeUploadedImage(imageFile);
    } catch (imageError) {
      error.textContent = imageError instanceof Error ? imageError.message : "Unable to prepare the selected image.";
      error.hidden = false;
      submitButton.disabled = false;
      return;
    }
  } else {
    let imageUrl;
    try {
      imageUrl = new URL(imageUrlValue);
    } catch {
      imageUrl = null;
    }
    if (!imageUrl || !["https:", "http:"].includes(imageUrl.protocol)) {
      error.textContent = "Enter a valid image URL beginning with http:// or https://.";
      error.hidden = false;
      submitButton.disabled = false;
      return;
    }
  }

  const product = {
    id: products.reduce((highest, item) => Math.max(highest, item.id), 0) + 1,
    name,
    category,
    price,
    image,
    badge: section === "new" ? "Just in" : section === "sale" ? "Sale" : "A favourite",
    section,
    available: true,
  };
  products.push(product);
  if (!saveInventoryOverrides()) {
    products.pop();
    error.textContent = "Unable to save this product in browser storage. Try a smaller image or use an image URL.";
    error.hidden = false;
    submitButton.disabled = false;
    return;
  }
  form.reset();
  clearImagePreviewObjectUrl();
  showImagePreview("");
  submitButton.disabled = false;
  refreshProductGrids();
  renderAdminDashboard();
  toast.textContent = `${name} added to ${section === "new" ? "New Arrivals" : section === "sale" ? "Sale" : "Essentials"}`;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2500);
});

function renderAdminOrders() {
  adminPanel.replaceChildren();
  if (orders.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-bag";
    empty.textContent = "No demo orders have been placed in this session.";
    adminPanel.append(empty);
    return;
  }
  const list = document.createElement("div");
  list.className = "admin-order-list";
  [...orders].reverse().forEach((order) => {
    const card = document.createElement("article");
    card.className = "admin-order-card";
    const heading = document.createElement("strong");
    heading.textContent = `Order ${order.id}`;
    const metadata = document.createElement("p");
    metadata.textContent = `${order.username} · ${order.createdAt} · ${money(order.total)}`;
    const details = document.createElement("p");
    details.textContent = order.items.map(({ name, quantity }) => `${name} × ${quantity}`).join(", ");
    const address = document.createElement("p");
    address.textContent = `Delivery: ${order.address}`;
    card.append(heading, metadata, details, address);
    list.append(card);
  });
  adminPanel.append(list);
}

function refreshProductGrids() {
  const query = document.querySelector("#search-input").value.trim().toLowerCase();
  renderProducts("new", activeCategory, query);
  renderProducts("sale", "all", query);
  renderProducts("essentials", "all", query);
}

function renderOrder() {
  orderContent.replaceChildren();
  const items = [...bag.entries()]
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
    .filter((item) => item.product);

  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-bag";
    empty.textContent = "Your bag is waiting for something lovely.";
    orderContent.append(empty);
    return;
  }

  const itemList = document.createElement("div");
  itemList.className = "order-items";
  let total = 0;
  items.forEach(({ product, quantity }) => {
    total += product.price * quantity;
    const row = document.createElement("div");
    row.className = "order-item";
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    const detail = document.createElement("div");
    const name = document.createElement("p");
    name.className = "order-item-name";
    name.textContent = product.name;
    const amount = document.createElement("p");
    amount.className = "order-item-meta";
    amount.textContent = `Qty ${quantity} · ${money(product.price * quantity)}`;
    detail.append(name, amount);
    row.append(image, detail);
    itemList.append(row);
  });

  const totalRow = document.createElement("p");
  totalRow.className = "order-total";
  totalRow.textContent = `Subtotal ${money(total)}`;
  orderContent.append(itemList, totalRow);

  if (!currentAccount) {
    const loginPrompt = document.createElement("div");
    loginPrompt.className = "checkout-gate";
    const message = document.createElement("p");
    message.textContent = "Ready to order? Log in or create an account to continue.";
    const button = document.createElement("button");
    button.className = "dialog-primary";
    button.type = "button";
    button.textContent = "Log in to place order";
    button.addEventListener("click", () => {
      orderDialog.close();
      openAccountDialog();
    });
    loginPrompt.append(message, button);
    orderContent.append(loginPrompt);
    return;
  }

  if (currentAccount.role === "admin") {
    const adminNotice = document.createElement("p");
    adminNotice.className = "empty-bag";
    adminNotice.textContent = "You are signed in as admin. Log in as ami to place a shopper order.";
    orderContent.append(adminNotice);
    return;
  }

  const form = document.createElement("form");
  form.className = "dialog-form checkout-form";
  form.id = "checkout-form";
  const heading = document.createElement("h3");
  heading.textContent = "Delivery details";
  form.append(heading);
  [
    { label: "Full name", name: "fullName", autocomplete: "name" },
    { label: "Delivery address", name: "address", autocomplete: "street-address" },
    { label: "City", name: "city", autocomplete: "address-level2" },
    { label: "Postal code", name: "postalCode", autocomplete: "postal-code" },
  ].forEach(({ label, name, autocomplete }) => {
    const field = document.createElement("label");
    field.textContent = label;
    const input = document.createElement("input");
    input.name = name;
    input.autocomplete = autocomplete;
    input.required = true;
    field.append(input);
    form.append(field);
  });
  const notice = document.createElement("p");
  notice.className = "demo-note";
  notice.textContent = "Demo storefront: orders and payments are not processed.";
  const submit = document.createElement("button");
  submit.className = "dialog-primary";
  submit.type = "submit";
  submit.textContent = "Place demo order";
  form.append(notice, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const orderItems = [...bag.entries()].map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return { name: product.name, quantity };
    });
    orders.push({
      id: String(Date.now()).slice(-6),
      username: currentAccount.username,
      createdAt: new Date().toLocaleString(),
      items: orderItems,
      total,
      address: String(formData.get("address")),
    });
    bag.clear();
    updateBagCount();
    orderDialog.close();
    toast.textContent = "Your demo order is placed. No payment was processed.";
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
  });
  orderContent.append(form);
}

bagButton.addEventListener("click", () => {
  renderOrder();
  orderDialog.showModal();
});

loginButton.addEventListener("click", openAccountDialog);

accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(accountForm);
  const username = String(formData.get("username")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const user = demoAccounts[username];
  if (!user || user.password !== password) {
    document.querySelector("#login-error").hidden = false;
    document.querySelector("#account-password").value = "";
    return;
  }
  currentAccount = { username, name: user.name, role: user.role };
  try {
    window.sessionStorage.setItem("sada-account", JSON.stringify(currentAccount));
  } catch (error) {
    currentAccount = null;
    console.error("Unable to save the demo account session.", error);
    document.querySelector("#login-error").textContent = "Unable to start a session in this browser.";
    document.querySelector("#login-error").hidden = false;
    return;
  }
  updateAccountButton();
  accountDialog.close();
  if (currentAccount.role === "admin") {
    openAccountDialog();
  } else if (bag.size > 0) {
    renderOrder();
    orderDialog.showModal();
  } else {
    toast.textContent = `Welcome to SADA, ${currentAccount.name}`;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2500);
  }
  accountForm.reset();
});

function logout() {
  try {
    window.sessionStorage.removeItem("sada-account");
  } catch (error) {
    console.error("Unable to end the demo account session.", error);
  }
  currentAccount = null;
  updateAccountButton();
  accountDialog.close();
  accountDialog.classList.remove("admin-mode");
  accountForm.reset();
  accountForm.hidden = false;
  accountStatus.hidden = true;
  adminDashboard.hidden = true;
}

document.querySelector("#logout-button").addEventListener("click", logout);
document.querySelector("#admin-logout-button").addEventListener("click", logout);

document.querySelectorAll(".admin-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((tab) => {
      const isSelected = tab === button;
      tab.classList.toggle("active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
    });
    renderAdminDashboard();
  });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

let activeCategory = "all";
document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts("new", activeCategory, document.querySelector("#search-input").value.trim().toLowerCase());
  });
});

document.querySelector("#search-input").addEventListener("input", (event) => {
  const query = event.currentTarget.value.trim().toLowerCase();
  renderProducts("new", activeCategory, query);
  renderProducts("sale", "all", query);
  renderProducts("essentials", "all", query);
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector("#newsletter-message").textContent = "Thanks for joining us. Keep an eye on your inbox.";
  event.currentTarget.reset();
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
updateAccountButton();
document.querySelectorAll(".filter-button").forEach((button) => {
  button.setAttribute("aria-pressed", String(button.dataset.filter === "all"));
});
renderProducts("new");
renderProducts("sale");
renderProducts("essentials");
