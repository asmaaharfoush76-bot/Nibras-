// =========================================
// NEBRAS | نِبراس
// Main JavaScript
// =========================================

// ================================
// SUPABASE CONFIGURATION
// ================================

const SUPABASE_URL = "https://wooixczgctxqhljfnjjn.supabase.co";

// ضعي هنا نفس الـ anon/public key الموجود عندك حاليًا
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvb2l4Y3pnY3R4cWhsamZuampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDMzMzgsImV4cCI6MjEwNDYxOTMzOH0.jtxLOcID-x3VHY0mDQgg3HyxZhE6ltoDDC9IdNGW3Cc";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// =========================================
// ELEMENTS
// =========================================

const authModal = document.getElementById("authModal");
const closeAuthBtn = document.getElementById("closeAuthBtn");

const loginNavBtn = document.getElementById("loginNavBtn");
const startLearningBtn = document.getElementById("startLearningBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");

const logoutBtn = document.getElementById("logoutBtn");

const studentDashboard =
  document.getElementById("studentDashboard");

const adminDashboard =
  document.getElementById("adminDashboard");

const studentName =
  document.getElementById("studentName");

const studentPoints =
  document.getElementById("studentPoints");

const studentLevel =
  document.getElementById("studentLevel");

const studentLessons =
  document.getElementById("studentLessons");

const studentExams =
  document.getElementById("studentExams");

const lessonsContainer =
  document.getElementById("lessonsContainer");

const booksContainer =
  document.getElementById("booksContainer");

const examsContainer =
  document.getElementById("examsContainer");

const themeToggle =
  document.getElementById("themeToggle");

const toast =
  document.getElementById("toast");


// =========================================
// AUTH MODAL
// =========================================

function openAuthModal(mode = "login") {

  authModal.classList.remove("hidden");

  if (mode === "register") {
    showRegister();
  } else {
    showLogin();
  }
}


function closeAuthModal() {
  authModal.classList.add("hidden");
  clearAuthMessage();
}


function showLogin() {

  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  authTitle.textContent = "أهلاً بك في نِبراس";

  authSubtitle.textContent =
    "سجّل دخولك وابدأ رحلتك التعليمية.";

  clearAuthMessage();
}


function showRegister() {

  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");

  authTitle.textContent =
    "أنشئ حسابك في نِبراس";

  authSubtitle.textContent =
    "أنشئ حسابك وابدأ رحلتك التعليمية.";

  clearAuthMessage();
}


function showAuthMessage(message, type = "error") {

  authMessage.textContent = message;

  if (type === "success") {
    authMessage.style.color = "#22c55e";
  } else {
    authMessage.style.color = "#ef4444";
  }
}


function clearAuthMessage() {
  authMessage.textContent = "";
}


// =========================================
// LOGIN
// =========================================

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;

  if (!email || !password) {
    showAuthMessage("من فضلك املأ كل البيانات.");
    return;
  }

  showAuthMessage("جاري تسجيل الدخول...", "success");

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    showAuthMessage(
      getAuthErrorMessage(error.message)
    );

    return;
  }

  closeAuthModal();

  showToast("تم تسجيل الدخول بنجاح ✨");

  await loadUserData(data.user);

  document
    .getElementById("studentDashboard")
    .scrollIntoView({
      behavior: "smooth"
    });
});


// =========================================
// REGISTER
// =========================================

registerForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const fullName =
    document.getElementById("registerName")
      .value
      .trim();

  const email =
    document.getElementById("registerEmail")
      .value
      .trim();

  const password =
    document.getElementById("registerPassword")
      .value;

  if (!fullName || !email || !password) {

    showAuthMessage(
      "من فضلك املأ جميع البيانات."
    );

    return;
  }

  if (fullName.split(/\s+/).length < 3) {

    showAuthMessage(
      "اكتب الاسم الثلاثي."
    );

    return;
  }

  if (password.length < 6) {

    showAuthMessage(
      "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
    );

    return;
  }

  showAuthMessage(
    "جاري إنشاء الحساب...",
    "success"
  );

  const { data, error } =
    await supabaseClient.auth.signUp({

      email,

      password,

      options: {
        data: {
          full_name: fullName
        },

        // إصلاح رابط الرجوع بعد تأكيد البريد
        emailRedirectTo:
          "https://asmaaharfoush76-bot.github.io/Nibras-/"
      }

    });

  if (error) {

    showAuthMessage(
      getAuthErrorMessage(error.message)
    );

    return;
  }

  if (data.session) {

    closeAuthModal();

    showToast(
      "تم إنشاء الحساب بنجاح 🎉"
    );

    await loadUserData(data.user);

  } else {

    showAuthMessage(
      "تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيد الحساب.",
      "success"
    );

  }

});


// =========================================
// LOAD CURRENT USER
// =========================================

async function checkCurrentUser() {

  const {
    data: {
      session
    }
  } = await supabaseClient.auth.getSession();

  if (session && session.user) {

    await loadUserData(session.user);

  } else {

    hideDashboards();

    loginNavBtn.textContent =
      "تسجيل الدخول";
  }
}


// =========================================
// LOAD USER DATA
// =========================================

async function loadUserData(user) {

  if (!user) return;

  const {
    data: profile,
    error
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {

    console.error(
      "Profile error:",
      error
    );

    showToast(
      "تعذر تحميل بيانات الحساب."
    );

    return;
  }

  studentName.textContent =
    profile.full_name || "طالب نِبراس";

  studentPoints.textContent =
    profile.points ?? 0;

  studentLevel.textContent =
    profile.level ?? 1;

  studentDashboard.classList.remove("hidden");

  loginNavBtn.textContent =
    "حسابي";

  if (profile.role === "admin") {

    adminDashboard.classList.remove(
      "hidden"
    );

  } else {

    adminDashboard.classList.add(
      "hidden"
    );

  }

  await loadStudentStats(user.id);

  await loadLessons();

  await loadBooks();

  await loadExams();
}


// =========================================
// HIDE DASHBOARDS
// =========================================

function hideDashboards() {

  studentDashboard.classList.add(
    "hidden"
  );

  adminDashboard.classList.add(
    "hidden"
  );
}


// =========================================
// STUDENT STATS
// =========================================

async function loadStudentStats(userId) {

  const {
    count: lessonsCount
  } = await supabaseClient
    .from("progress")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("student_id", userId)
    .eq("completed", true);

  studentLessons.textContent =
    lessonsCount || 0;


  const {
    count: examsCount
  } = await supabaseClient
    .from("exam_attempts")
    .select("*", {
      count: "exact",
      head: true
    })
    .eq("student_id", userId);

  studentExams.textContent =
    examsCount || 0;
}


// =========================================
// LOAD LESSONS
// =========================================

async function loadLessons() {

  const {
    data,
    error
  } = await supabaseClient
    .from("lessons")
    .select("*")
    .eq("is_published", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(
      "Lessons error:",
      error
    );

    return;
  }

  if (!data || data.length === 0) {

    return;
  }

  lessonsContainer.innerHTML =
    data.map(lesson => `

      <article class="content-card">

        <div class="content-card-body">

          <div class="content-card-meta">

            <span class="meta-tag">
              ${escapeHtml(lesson.subject)}
            </span>

          </div>

          <h3>
            ${escapeHtml(lesson.title)}
          </h3>

          <p>
            ${escapeHtml(
              lesson.description || ""
            )}
          </p>

          ${
            lesson.video_url
              ? `
                <a
                  class="primary-btn"
                  href="${safeUrl(lesson.video_url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  مشاهدة الدرس
                </a>
              `
              : ""
          }

        </div>

      </article>

    `).join("");
}


// =========================================
// LOAD BOOKS
// =========================================

async function loadBooks() {

  const {
    data,
    error
  } = await supabaseClient
    .from("books")
    .select("*")
    .eq("is_published", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(
      "Books error:",
      error
    );

    return;
  }

  if (!data || data.length === 0) {

    return;
  }

  booksContainer.innerHTML =
    data.map(book => `

      <article class="content-card">

        <div class="content-card-body">

          <div class="content-card-meta">

            <span class="meta-tag">
              ${escapeHtml(book.subject)}
            </span>

          </div>

          <h3>
            ${escapeHtml(book.title)}
          </h3>

          <p>
            ${escapeHtml(
              book.description || ""
            )}
          </p>

          ${
            book.file_url
              ? `
                <a
                  class="primary-btn"
                  href="${safeUrl(book.file_url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  فتح الكتاب
                </a>
              `
              : ""
          }

        </div>

      </article>

    `).join("");
}


// =========================================
// LOAD EXAMS
// =========================================

async function loadExams() {

  const {
    data,
    error
  } = await supabaseClient
    .from("exams")
    .select("*")
    .eq("is_published", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(
      "Exams error:",
      error
    );

    return;
  }

  if (!data || data.length === 0) {

    return;
  }

  examsContainer.innerHTML =
    data.map(exam => `

      <article class="content-card">

        <div class="content-card-body">

          <div class="content-card-meta">

            <span class="meta-tag">
              ${escapeHtml(exam.subject)}
            </span>

            ${
              exam.duration_minutes
                ? `
                  <span class="meta-tag">
                    ${exam.duration_minutes} دقيقة
                  </span>
                `
                : ""
            }

          </div>

          <h3>
            ${escapeHtml(exam.title)}
          </h3>

          <p>
            ${escapeHtml(
              exam.description || ""
            )}
          </p>

        </div>

      </article>

    `).join("");
}


// =========================================
// LOGOUT
// =========================================

logoutBtn.addEventListener(
  "click",
  async () => {

    const {
      error
    } = await supabaseClient.auth.signOut();

    if (error) {

      showToast(
        "حدث خطأ أثناء تسجيل الخروج."
      );

      return;
    }

    hideDashboards();

    loginNavBtn.textContent =
      "تسجيل الدخول";

    showToast(
      "تم تسجيل الخروج 👋"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// =========================================
// AUTH STATE LISTENER
// =========================================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (session && session.user) {

      await loadUserData(
        session.user
      );

    } else {

      hideDashboards();

      loginNavBtn.textContent =
        "تسجيل الدخول";

    }

  }
);


// =========================================
// THEME
// =========================================

function loadTheme() {

  const savedTheme =
    localStorage.getItem(
      "nebras_theme"
    );

  if (savedTheme === "dark") {

    document.body.classList.add(
      "dark-mode"
    );

    themeToggle.textContent = "☀";

  } else {

    document.body.classList.remove(
      "dark-mode"
    );

    themeToggle.textContent = "☾";

  }
}


themeToggle.addEventListener(
  "click",
  () => {

    const isDark =
      document.body.classList.toggle(
        "dark-mode"
      );

    localStorage.setItem(
      "nebras_theme",
      isDark ? "dark" : "light"
    );

    themeToggle.textContent =
      isDark ? "☀" : "☾";

  }
);


// =========================================
// BUTTONS
// =========================================

loginNavBtn.addEventListener(
  "click",
  () => {

    const dashboardVisible =
      !studentDashboard.classList.contains(
        "hidden"
      );

    if (dashboardVisible) {

      studentDashboard.scrollIntoView({
        behavior: "smooth"
      });

    } else {

      openAuthModal("login");

    }

  }
);


startLearningBtn.addEventListener(
  "click",
  async () => {

    const {
      data: {
        session
      }
    } = await supabaseClient.auth.getSession();

    if (session) {

      document
        .getElementById("subjects")
        .scrollIntoView({
          behavior: "smooth"
        });

    } else {

      openAuthModal("register");

    }

  }
);


closeAuthBtn.addEventListener(
  "click",
  closeAuthModal
);


document
  .querySelector(".modal-overlay")
  .addEventListener(
    "click",
    closeAuthModal
  );


showRegisterBtn.addEventListener(
  "click",
  () => showRegister()
);


showLoginBtn.addEventListener(
  "click",
  () => showLogin()
);


// =========================================
// TOAST
// =========================================

function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

  }, 3000);
}


// =========================================
// ERROR TRANSLATION
// =========================================

function getAuthErrorMessage(message) {

  const text =
    String(message || "")
      .toLowerCase();

  if (
    text.includes("invalid login credentials")
  ) {

    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

  }

  if (
    text.includes("user already registered")
  ) {

    return "هذا البريد الإلكتروني مسجل بالفعل.";

  }

  if (
    text.includes("password should be at least")
  ) {

    return "كلمة المرور قصيرة جدًا.";

  }

  if (
    text.includes("email not confirmed")
  ) {

    return "يجب تأكيد البريد الإلكتروني أولًا.";

  }

  return message ||
    "حدث خطأ، حاول مرة أخرى.";
}


// =========================================
// SECURITY HELPERS
// =========================================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function safeUrl(value) {

  try {

    const url =
      new URL(value);

    if (
      url.protocol === "https:" ||
      url.protocol === "http:"
    ) {

      return url.href;

    }

  } catch (error) {

    return "#";

  }

  return "#";
}


// =========================================
// START
// =========================================

loadTheme();

checkCurrentUser();
