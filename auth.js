const BASE_URL = "https://kalkulator-fum-spray.vercel.app";

// ================= LOAD KANWIL =================
async function loadKanwil() {
  try {
    const res = await fetch(`${BASE_URL}/kanwil`);
    const data = await res.json();

    const select = document.getElementById("kanwil");

    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.nama;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Gagal load kanwil:", err);
  }
}

// ================= LOGIN =================
async function login() {
  const kanwil_id = document.getElementById("kanwil").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kanwil_id, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("message").innerText =
        data.message || "Login gagal";
      return;
    }

    // simpan token
    localStorage.setItem("token", data.token);

    // optional: simpan info user
    localStorage.setItem("user", JSON.stringify(data.user));

    // redirect
    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    document.getElementById("message").innerText = "Error login";
  }
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.replace("login.html");
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  // load dropdown kanwil saat halaman dibuka
  if (document.getElementById("kanwil")) {
    loadKanwil();
  }

  // handle submit login
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      login();
    });
  }
});
