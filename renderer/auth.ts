import io from "socket.io-client";
const signIn = document.getElementById("sign-in")!;

export function initAuth(socket: ReturnType<typeof io>) {
  signIn.innerHTML = `
      <div class="sign-in-container">

        <div class="auth-tabs">
          <div class="auth-tab active" data-tab="signin">Sign In</div>
          <div class="auth-tab" data-tab="signup">Sign Up</div>
        </div>

        <div class="auth-panel" id="panel-signin">
          <h2>Welcome back to Cativity!</h2>
          <input type="text" id="signin-username" placeholder="Username" />
          <input type="password" id="signin-password" placeholder="Password" />
          <div id="auth-error" class="auth-error hidden"></div>
          <button id="signin-btn">Sign In</button>
        </div>

        <div class="auth-panel hidden" id="panel-signup">
          <h2>Create your cativity account </h2>
          <input type="text" id="signup-username" placeholder="Choose a username" />
          <input type="password" id="signup-password" placeholder="Choose a password" />

          <div class="color-selection">
            <label>Choose your cat color:</label>
            <div class="color-options">
              <div class="color-option" data-color="orange" style="background:#ff9966;"></div>
              <div class="color-option" data-color="gray" style="background:#999;"></div>
              <div class="color-option" data-color="black" style="background:#333;"></div>
              <div class="color-option" data-color="white" style="background:#fff;border:2px solid #ddd;"></div>
              <div class="color-option selected" data-color="brown" style="background:#8B4513;"></div>
            </div>
          </div>
            <div id="auth-error" class="auth-error hidden"></div>
          <button id="signup-btn">Create Account</button>
        </div>

      </div>
    `;

  /* Tabs */
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = {
    signin: document.getElementById("panel-signin")!,
    signup: document.getElementById("panel-signup")!,
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.getAttribute("data-tab");
      panels.signin.classList.toggle("hidden", target !== "signin");
      panels.signup.classList.toggle("hidden", target !== "signup");
    });
  });

  /* Sign In */
  document.getElementById("signin-btn")!.addEventListener("click", () => {
    const username = (
      document.getElementById("signin-username") as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById("signin-password") as HTMLInputElement
    ).value.trim();
    if (!username || !password) return showError("Enter username and password");
    else if (!username) return showError("Enter username");
    else if (!password) return showError("Enter password");
    socket.emit("signIn", {username, password});
  });

  /* Sign Up */
  let selectedColor = "brown";
  const colorOptions = document.querySelectorAll(".color-option");
  colorOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      colorOptions.forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      selectedColor = opt.getAttribute("data-color")!;
    });
  });

  document.getElementById("signup-btn")!.addEventListener("click", () => {
    const username = (
      document.getElementById("signup-username") as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById("signup-password") as HTMLInputElement
    ).value.trim();
    if (!username || !password) return showError("Enter username and password");
    else if (!username) return showError("Enter username");
    else if (!password) return showError("Enter password");
    socket.emit("signUp", {username, password, color: selectedColor});
  });

  socket.on("authError", (msg: string) => {
    showError(msg);
  });
}

function showError(msg: string) {
  const box = document.getElementById("auth-error")!;
  box.textContent = msg;
  box.classList.remove("hidden");
}
