// Authgear Configuration
const authgearClient = new Authgear.Client({
  endpoint: "https://wilsondevaus.authgear.cloud/",
  clientID: "f9bd4c770a9a69a1"
});

// Initialize Authgear
async function initializeAuth() {
  try {
    await authgearClient.configure();
    updateAuthUI();
  } catch (error) {
    console.error("Error initializing Authgear:", error);
  }
}

// Update UI based on auth state
async function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");

  if (authgearClient.sessionState === "AUTHENTICATED") {
    // User is logged in
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (userInfo) {
      userInfo.style.display = "inline";
      try {
        const user = await authgearClient.fetchUserInfo();
        userInfo.textContent = `Welcome, ${user.email || user.preferred_username || "User"}`;
      } catch (error) {
        console.error("Error fetching user info:", error);
        userInfo.textContent = "Welcome!";
      }
    }
  } else {
    // User is not logged in
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userInfo) userInfo.style.display = "none";
  }
}

// Login handler
async function handleLogin() {
  try {
    await authgearClient.startLogin({ redirectURI: window.location.origin + window.location.pathname });
  } catch (error) {
    console.error("Error during login:", error);
  }
}

// Logout handler
async function handleLogout() {
  try {
    await authgearClient.logout({ redirectURI: window.location.origin });
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

// Initialize auth when page loads
window.addEventListener("DOMContentLoaded", initializeAuth);