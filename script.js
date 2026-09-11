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
// =========================================
// NEBRAS | ADMIN MANAGEMENT CENTER
// =========================================

(function () {

  let adminReady = false;

  // -----------------------------------------
  // انتظار ظهور لوحة الأدمن
  // -----------------------------------------

  function waitForAdminPanel() {

    const panel =
      document.getElementById("adminDashboard");

    if (!panel) {
      setTimeout(waitForAdminPanel, 1000);
      return;
    }

    if (
      panel.classList.contains("hidden") ||
      adminReady
    ) {
      setTimeout(waitForAdminPanel, 1000);
      return;
    }

    adminReady = true;

    createAdminManager();
  }


  // -----------------------------------------
  // إنشاء مركز الإدارة
  // -----------------------------------------

  function createAdminManager() {

    const panel =
      document.getElementById("adminDashboard");

    if (
      panel.querySelector(".nibras-admin-manager")
    ) {
      return;
    }

    const manager =
      document.createElement("div");

    manager.className =
      "nibras-admin-manager";

    manager.innerHTML = `

      <div class="nibras-admin-title">

        <div>
          <span>NEBRAS MANAGEMENT</span>
          <h2>مركز إدارة نِبراس</h2>
          <p>
            إدارة الطلاب والدروس والكتب والامتحانات والنتائج.
          </p>
        </div>

        <div class="nibras-admin-lock">
          🔐 ADMIN
        </div>

      </div>


      <div class="nibras-admin-tabs">

        <button
          class="nibras-admin-tab active"
          data-admin-tab="students">
          👨‍🎓 الطلاب
        </button>

        <button
          class="nibras-admin-tab"
          data-admin-tab="lessons">
          📚 الدروس
        </button>

        <button
          class="nibras-admin-tab"
          data-admin-tab="books">
          📖 الكتب
        </button>

        <button
          class="nibras-admin-tab"
          data-admin-tab="exams">
          📝 الامتحانات
        </button>

        <button
          class="nibras-admin-tab"
          data-admin-tab="results">
          📊 النتائج
        </button>

        <button
          class="nibras-admin-tab"
          data-admin-tab="badges">
          🏆 النقاط والشارات
        </button>

      </div>


      <div
        id="nibrasAdminContent"
        class="nibras-admin-content">
      </div>

    `;

    panel.appendChild(manager);

    addAdminStyles();

    manager
      .querySelectorAll(".nibras-admin-tab")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            manager
              .querySelectorAll(
                ".nibras-admin-tab"
              )
              .forEach(btn =>
                btn.classList.remove("active")
              );

            button.classList.add("active");

            loadAdminSection(
              button.dataset.adminTab
            );

          }
        );

      });

    loadAdminSection("students");
  }


  // -----------------------------------------
  // الأقسام
  // -----------------------------------------

  async function loadAdminSection(section) {

    const container =
      document.getElementById(
        "nibrasAdminContent"
      );

    if (!container) return;

    container.innerHTML = `
      <div class="admin-loading">
        جاري تحميل البيانات...
      </div>
    `;


    if (section === "students") {
      await loadStudents(container);
    }

    if (section === "lessons") {
      await loadAdminLessons(container);
    }

    if (section === "books") {
      await loadAdminBooks(container);
    }

    if (section === "exams") {
      await loadAdminExams(container);
    }

    if (section === "results") {
      await loadAdminResults(container);
    }

    if (section === "badges") {
      await loadAdminBadges(container);
    }

  }


  // =========================================
  // STUDENTS
  // =========================================

  async function loadStudents(container) {

    const {
      data,
      error
    } = await supabaseClient
      .from("profiles")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      container.innerHTML = `
        <div class="admin-error">
          تعذر تحميل الطلاب.
          <br>
          ${escapeHtml(error.message)}
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="admin-section-head">

        <div>
          <h3>الطلاب</h3>
          <p>
            عدد الطلاب: ${data?.length || 0}
          </p>
        </div>

      </div>


      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>

            <tr>
              <th>الاسم</th>
              <th>البريد</th>
              <th>الدور</th>
              <th>النقاط</th>
              <th>المستوى</th>
              <th>إجراء</th>
            </tr>

          </thead>

          <tbody>

            ${
              data && data.length
              ? data.map(student => `

                <tr>

                  <td>
                    ${escapeHtml(
                      student.full_name || "—"
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      student.email || "—"
                    )}
                  </td>

                  <td>
                    ${
                      student.role === "admin"
                      ? "🔐 Admin"
                      : "طالب"
                    }
                  </td>

                  <td>
                    ${student.points ?? 0}
                  </td>

                  <td>
                    ${student.level ?? 1}
                  </td>

                  <td>

                    <button
                      class="admin-small-btn"
                      onclick="window.nibrasAdmin.editStudent(
                        '${student.id}',
                        ${student.points ?? 0},
                        ${student.level ?? 1}
                      )">
                      تعديل
                    </button>

                  </td>

                </tr>

              `).join("")
              : `
                <tr>
                  <td colspan="6">
                    لا يوجد طلاب حتى الآن.
                  </td>
                </tr>
              `
            }

          </tbody>

        </table>

      </div>

    `;
  }


  // =========================================
  // EDIT STUDENT
  // =========================================

  async function editStudent(
    id,
    oldPoints,
    oldLevel
  ) {

    const points =
      prompt(
        "اكتب عدد النقاط الجديد:",
        oldPoints
      );

    if (points === null) return;


    const level =
      prompt(
        "اكتب مستوى الطالب الجديد:",
        oldLevel
      );

    if (level === null) return;


    const {
      error
    } = await supabaseClient
      .from("profiles")
      .update({
        points: Number(points) || 0,
        level: Number(level) || 1
      })
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر تحديث بيانات الطالب."
      );

      console.error(error);

      return;
    }


    showToast(
      "تم تحديث بيانات الطالب ✅"
    );

    loadAdminSection("students");
  }


  // =========================================
  // LESSONS
  // =========================================

  async function loadAdminLessons(container) {

    const {
      data,
      error
    } = await supabaseClient
      .from("lessons")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      container.innerHTML = `
        <div class="admin-error">
          ${escapeHtml(error.message)}
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="admin-section-head">

        <div>
          <h3>الدروس</h3>
          <p>
            إضافة ونشر وحذف الدروس.
          </p>
        </div>

        <button
          class="admin-main-btn"
          onclick="window.nibrasAdmin.addLesson()">
          + إضافة درس
        </button>

      </div>


      <div class="admin-items">

        ${
          data && data.length
          ? data.map(lesson => `

            <div class="admin-item">

              <div>

                <span class="admin-item-tag">
                  ${escapeHtml(lesson.subject)}
                </span>

                <h4>
                  ${escapeHtml(lesson.title)}
                </h4>

                <p>
                  ${escapeHtml(
                    lesson.description || ""
                  )}
                </p>

                <small>
                  ${
                    lesson.is_published
                    ? "🟢 منشور"
                    : "🟡 غير منشور"
                  }
                </small>

              </div>

              <div class="admin-actions">

                <button
                  class="admin-small-btn"
                  onclick="window.nibrasAdmin.toggleLesson(
                    ${lesson.id},
                    ${lesson.is_published}
                  )">
                  ${
                    lesson.is_published
                    ? "إلغاء النشر"
                    : "نشر"
                  }
                </button>

                <button
                  class="admin-delete-btn"
                  onclick="window.nibrasAdmin.deleteLesson(
                    ${lesson.id}
                  )">
                  حذف
                </button>

              </div>

            </div>

          `).join("")
          : `
            <div class="admin-empty">
              لا توجد دروس حتى الآن.
            </div>
          `
        }

      </div>

    `;
  }


  async function addLesson() {

    const title =
      prompt("اسم الدرس:");

    if (!title) return;


    const subject =
      prompt(
        "المادة:",
        "الفيزياء"
      );

    if (!subject) return;


    const description =
      prompt(
        "وصف الدرس:"
      ) || "";


    const videoUrl =
      prompt(
        "رابط فيديو الدرس (اختياري):"
      ) || "";


    const {
      error
    } = await supabaseClient
      .from("lessons")
      .insert({
        title,
        subject,
        description,
        video_url: videoUrl,
        is_published: false
      });


    if (error) {

      showToast(
        "تعذر إضافة الدرس."
      );

      console.error(error);

      return;
    }


    showToast(
      "تمت إضافة الدرس ✅"
    );

    loadAdminSection("lessons");
  }


  async function toggleLesson(
    id,
    currentStatus
  ) {

    const {
      error
    } = await supabaseClient
      .from("lessons")
      .update({
        is_published: !currentStatus
      })
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر تغيير حالة الدرس."
      );

      return;
    }


    showToast(
      !currentStatus
      ? "تم نشر الدرس ✅"
      : "تم إلغاء نشر الدرس."
    );

    loadAdminSection("lessons");
  }


  async function deleteLesson(id) {

    if (
      !confirm(
        "هل أنتِ متأكدة من حذف هذا الدرس؟"
      )
    ) {
      return;
    }


    const {
      error
    } = await supabaseClient
      .from("lessons")
      .delete()
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر حذف الدرس."
      );

      return;
    }


    showToast(
      "تم حذف الدرس 🗑️"
    );

    loadAdminSection("lessons");
  }


  // =========================================
  // BOOKS
  // =========================================

  async function loadAdminBooks(container) {

    const {
      data,
      error
    } = await supabaseClient
      .from("books")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      container.innerHTML = `
        <div class="admin-error">
          ${escapeHtml(error.message)}
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="admin-section-head">

        <div>
          <h3>الكتب</h3>
          <p>
            إدارة الكتب وملفات PDF.
          </p>
        </div>

        <button
          class="admin-main-btn"
          onclick="window.nibrasAdmin.addBook()">
          + إضافة كتاب
        </button>

      </div>


      <div class="admin-items">

        ${
          data && data.length
          ? data.map(book => `

            <div class="admin-item">

              <div>

                <span class="admin-item-tag">
                  ${escapeHtml(book.subject)}
                </span>

                <h4>
                  ${escapeHtml(book.title)}
                </h4>

                <p>
                  ${escapeHtml(
                    book.description || ""
                  )}
                </p>

                <small>
                  ${
                    book.is_published
                    ? "🟢 منشور"
                    : "🟡 غير منشور"
                  }
                </small>

              </div>


              <div class="admin-actions">

                <button
                  class="admin-small-btn"
                  onclick="window.nibrasAdmin.toggleBook(
                    ${book.id},
                    ${book.is_published}
                  )">
                  ${
                    book.is_published
                    ? "إلغاء النشر"
                    : "نشر"
                  }
                </button>


                <button
                  class="admin-delete-btn"
                  onclick="window.nibrasAdmin.deleteBook(
                    ${book.id}
                  )">
                  حذف
                </button>

              </div>

            </div>

          `).join("")
          : `
            <div class="admin-empty">
              لا توجد كتب حتى الآن.
            </div>
          `
        }

      </div>

    `;
  }


  async function addBook() {

    const title =
      prompt("اسم الكتاب:");

    if (!title) return;


    const subject =
      prompt(
        "المادة:",
        "الفيزياء"
      );

    if (!subject) return;


    const description =
      prompt(
        "وصف الكتاب:"
      ) || "";


    const fileUrl =
      prompt(
        "رابط ملف PDF:"
      ) || "";


    const {
      error
    } = await supabaseClient
      .from("books")
      .insert({
        title,
        subject,
        description,
        file_url: fileUrl,
        is_published: false
      });


    if (error) {

      showToast(
        "تعذر إضافة الكتاب."
      );

      console.error(error);

      return;
    }


    showToast(
      "تمت إضافة الكتاب ✅"
    );

    loadAdminSection("books");
  }


  async function toggleBook(
    id,
    currentStatus
  ) {

    const {
      error
    } = await supabaseClient
      .from("books")
      .update({
        is_published: !currentStatus
      })
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر تغيير حالة الكتاب."
      );

      return;
    }


    showToast(
      !currentStatus
      ? "تم نشر الكتاب ✅"
      : "تم إلغاء نشر الكتاب."
    );

    loadAdminSection("books");
  }


  async function deleteBook(id) {

    if (
      !confirm(
        "هل أنتِ متأكدة من حذف هذا الكتاب؟"
      )
    ) {
      return;
    }


    const {
      error
    } = await supabaseClient
      .from("books")
      .delete()
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر حذف الكتاب."
      );

      return;
    }


    showToast(
      "تم حذف الكتاب 🗑️"
    );

    loadAdminSection("books");
  }


  // =========================================
  // EXAMS
  // =========================================

  async function loadAdminExams(container) {

    const {
      data,
      error
    } = await supabaseClient
      .from("exams")
      .select("*")
      .order("created_at", {
        ascending: false
      });


    if (error) {

      container.innerHTML = `
        <div class="admin-error">
          ${escapeHtml(error.message)}
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="admin-section-head">

        <div>
          <h3>الامتحانات</h3>
          <p>
            إنشاء الامتحانات وإدارة الأسئلة.
          </p>
        </div>

        <button
          class="admin-main-btn"
          onclick="window.nibrasAdmin.addExam()">
          + إنشاء امتحان
        </button>

      </div>


      <div class="admin-items">

        ${
          data && data.length
          ? data.map(exam => `

            <div class="admin-item">

              <div>

                <span class="admin-item-tag">
                  ${escapeHtml(exam.subject)}
                </span>

                <h4>
                  ${escapeHtml(exam.title)}
                </h4>

                <p>
                  ${escapeHtml(
                    exam.description || ""
                  )}
                </p>

                <small>
                  ${
                    exam.duration_minutes
                    ? `⏱ ${exam.duration_minutes} دقيقة`
                    : ""
                  }

                  &nbsp;

                  ${
                    exam.is_published
                    ? "🟢 منشور"
                    : "🟡 غير منشور"
                  }
                </small>

              </div>


              <div class="admin-actions">

                <button
                  class="admin-small-btn"
                  onclick="window.nibrasAdmin.addQuestion(
                    ${exam.id}
                  )">
                  + سؤال
                </button>


                <button
                  class="admin-small-btn"
                  onclick="window.nibrasAdmin.showQuestions(
                    ${exam.id}
                  )">
                  الأسئلة
                </button>


                <button
                  class="admin-small-btn"
                  onclick="window.nibrasAdmin.toggleExam(
                    ${exam.id},
                    ${exam.is_published}
                  )">
                  ${
                    exam.is_published
                    ? "إلغاء النشر"
                    : "نشر"
                  }
                </button>


                <button
                  class="admin-delete-btn"
                  onclick="window.nibrasAdmin.deleteExam(
                    ${exam.id}
                  )">
                  حذف
                </button>

              </div>

            </div>

          `).join("")
          : `
            <div class="admin-empty">
              لا توجد امتحانات حتى الآن.
            </div>
          `
        }

      </div>

    `;
  }


  async function addExam() {

    const title =
      prompt("اسم الامتحان:");

    if (!title) return;


    const subject =
      prompt(
        "المادة:",
        "الفيزياء"
      );

    if (!subject) return;


    const description =
      prompt(
        "وصف الامتحان:"
      ) || "";


    const duration =
      prompt(
        "مدة الامتحان بالدقائق:",
        "60"
      );


    const {
      data,
      error
    } = await supabaseClient
      .from("exams")
      .insert({
        title,
        subject,
        description,
        duration_minutes:
          Number(duration) || 60,
        is_published: false
      })
      .select()
      .single();


    if (error) {

      showToast(
        "تعذر إنشاء الامتحان."
      );

      console.error(error);

      return;
    }


    showToast(
      "تم إنشاء الامتحان ✅"
    );

    loadAdminSection("exams");
  }


  async function addQuestion(examId) {

    const question =
      prompt("نص السؤال:");

    if (!question) return;


    const optionA =
      prompt("الاختيار A:");

    if (!optionA) return;


    const optionB =
      prompt("الاختيار B:");

    if (!optionB) return;


    const optionC =
      prompt("الاختيار C:");

    if (!optionC) return;


    const optionD =
      prompt("الاختيار D:");

    if (!optionD) return;


    const correct =
      prompt(
        "الإجابة الصحيحة: A أو B أو C أو D",
        "A"
      );

    if (!correct) return;


    const order =
      prompt(
        "ترتيب السؤال:",
        "1"
      );


    const points =
      prompt(
        "درجة السؤال:",
        "1"
      );


    const {
      error
    } = await supabaseClient
      .from("exam_questions")
      .insert({

        exam_id: examId,

        question_text: question,

        option_a: optionA,

        option_b: optionB,

        option_c: optionC,

        option_d: optionD,

        correct_answer:
          correct.toUpperCase(),

        question_order:
          Number(order) || 1,

        points:
          Number(points) || 1

      });


    if (error) {

      showToast(
        "تعذر إضافة السؤال."
      );

      console.error(error);

      return;
    }


    showToast(
      "تمت إضافة السؤال ✅"
    );
  }


  async function showQuestions(examId) {

    const {
      data,
      error
    } = await supabaseClient
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("question_order", {
        ascending: true
      });


    if (error) {

      showToast(
        "تعذر تحميل الأسئلة."
      );

      return;
    }


    if (!data || data.length === 0) {

      alert(
        "لا توجد أسئلة في هذا الامتحان حتى الآن."
      );

      return;
    }


    const text =
      data.map(
        (question, index) => {

          return `
السؤال ${index + 1}:
${question.question_text}

A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

الإجابة الصحيحة: ${question.correct_answer}
الدرجة: ${question.points}
          `;

        }
      ).join("\n----------------\n");


    alert(text);
  }


  async function toggleExam(
    id,
    currentStatus
  ) {

    const {
      error
    } = await supabaseClient
      .from("exams")
      .update({
        is_published: !currentStatus
      })
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر تغيير حالة الامتحان."
      );

      return;
    }


    showToast(
      !currentStatus
      ? "تم نشر الامتحان ✅"
      : "تم إلغاء نشر الامتحان."
    );

    loadAdminSection("exams");
  }


  async function deleteExam(id) {

    if (
      !confirm(
        "حذف الامتحان سيحذف أسئلته أيضًا. هل أنتِ متأكدة؟"
      )
    ) {
      return;
    }


    const {
      error
    } = await supabaseClient
      .from("exams")
      .delete()
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر حذف الامتحان."
      );

      return;
    }


    showToast(
      "تم حذف الامتحان 🗑️"
    );

    loadAdminSection("exams");
  }


  // =========================================
  // RESULTS
  // =========================================

  async function loadAdminResults(container) {

    const {
      data,
      error
    } = await supabaseClient
      .from("exam_attempts")
      .select("*")
      .order("submitted_at", {
        ascending: false
      });


    if (error) {

      container.innerHTML = `
        <div class="admin-error">
          ${escapeHtml(error.message)}
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="admin-section-head">

        <div>
          <h3>النتائج</h3>
          <p>
            نتائج محاولات الطلاب للامتحانات.
          </p>
        </div>

      </div>


      <div class="admin-table-wrap">

        <table class="admin-table">

          <thead>

            <tr>
              <th>الطالب</th>
              <th>الامتحان</th>
              <th>الدرجة</th>
              <th>الإجمالي</th>
              <th>التاريخ</th>
            </tr>

          </thead>

          <tbody>

            ${
              data && data.length
              ? data.map(result => `

                <tr>

                  <td>
                    ${escapeHtml(
                      result.student_id
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      result.exam_id
                    )}
                  </td>

                  <td>
                    ${result.score ?? 0}
                  </td>

                  <td>
                    ${result.total_points ?? 0}
                  </td>

                  <td>
                    ${
                      result.submitted_at
                      ? new Date(
                          result.submitted_at
                        ).toLocaleString("ar-EG")
                      : "—"
                    }
                  </td>

                </tr>

              `).join("")
              : `
                <tr>
                  <td colspan="5">
                    لا توجد نتائج حتى الآن.
                  </td>
                </tr>
              `
            }

          </tbody>

        </table>

      </div>

    `;
  }


  // =========================================
  // BADGES
  // =========================================

  async function loadAdminBadges(container) {

    const {
      data,
      error
    } = await supabaseClient
      .from("badges")
      .select("*")
      .order("required_points", {
        ascending: true
      });


    if (error) {

      container.innerHTML = `
        <div class="admin-error">
          ${escapeHtml(error.message)}
        </div>
      `;

      return;
    }


    container.innerHTML = `

      <div class="admin-section-head">

        <div>
          <h3>النقاط والشارات</h3>
          <p>
            إنشاء الشارات المرتبطة بتقدم الطلاب.
          </p>
        </div>

        <button
          class="admin-main-btn"
          onclick="window.nibrasAdmin.addBadge()">
          + إضافة شارة
        </button>

      </div>


      <div class="admin-items">

        ${
          data && data.length
          ? data.map(badge => `

            <div class="admin-item">

              <div>

                <span class="admin-badge-icon">
                  ${escapeHtml(
                    badge.icon || "🏆"
                  )}
                </span>

                <h4>
                  ${escapeHtml(badge.name)}
                </h4>

                <p>
                  ${escapeHtml(
                    badge.description || ""
                  )}
                </p>

                <small>
                  تحتاج إلى
                  ${badge.required_points ?? 0}
                  نقطة
                </small>

              </div>


              <div class="admin-actions">

                <button
                  class="admin-delete-btn"
                  onclick="window.nibrasAdmin.deleteBadge(
                    ${badge.id}
                  )">
                  حذف
                </button>

              </div>

            </div>

          `).join("")
          : `
            <div class="admin-empty">
              لا توجد شارات حتى الآن.
            </div>
          `
        }

      </div>

    `;
  }


  async function addBadge() {

    const name =
      prompt("اسم الشارة:");

    if (!name) return;


    const description =
      prompt(
        "وصف الشارة:"
      ) || "";


    const icon =
      prompt(
        "أيقونة الشارة:",
        "🏆"
      ) || "🏆";


    const points =
      prompt(
        "عدد النقاط المطلوبة:",
        "100"
      );


    const {
      error
    } = await supabaseClient
      .from("badges")
      .insert({

        name,

        description,

        icon,

        required_points:
          Number(points) || 0

      });


    if (error) {

      showToast(
        "تعذر إضافة الشارة."
      );

      console.error(error);

      return;
    }


    showToast(
      "تمت إضافة الشارة 🏆"
    );

    loadAdminSection("badges");
  }


  async function deleteBadge(id) {

    if (
      !confirm(
        "هل أنتِ متأكدة من حذف الشارة؟"
      )
    ) {
      return;
    }


    const {
      error
    } = await supabaseClient
      .from("badges")
      .delete()
      .eq("id", id);


    if (error) {

      showToast(
        "تعذر حذف الشارة."
      );

      return;
    }


    showToast(
      "تم حذف الشارة 🗑️"
    );

    loadAdminSection("badges");
  }


  // =========================================
  // ADMIN PUBLIC API
  // =========================================

  window.nibrasAdmin = {

    editStudent,

    addLesson,
    toggleLesson,
    deleteLesson,

    addBook,
    toggleBook,
    deleteBook,

    addExam,
    addQuestion,
    showQuestions,
    toggleExam,
    deleteExam,

    addBadge,
    deleteBadge

  };


  // =========================================
  // ADMIN CSS
  // =========================================

  function addAdminStyles() {

    if (
      document.getElementById(
        "nibras-admin-styles"
      )
    ) {
      return;
    }


    const style =
      document.createElement("style");

    style.id =
      "nibras-admin-styles";


    style.textContent = `

      .nibras-admin-manager {
        margin-top: 30px;
        padding: 24px;
        border-radius: 24px;
        background: rgba(255,255,255,.96);
        box-shadow: 0 20px 50px rgba(0,0,0,.08);
      }

      .dark-mode .nibras-admin-manager {
        background: #0d1b2d;
        color: #fff;
      }

      .nibras-admin-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 25px;
      }

      .nibras-admin-title span {
        color: #3b82f6;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1px;
      }

      .nibras-admin-title h2 {
        margin: 5px 0;
      }

      .nibras-admin-title p {
        margin: 0;
        opacity: .7;
      }

      .nibras-admin-lock {
        padding: 10px 15px;
        border-radius: 12px;
        background: rgba(59,130,246,.1);
        color: #3b82f6;
        font-weight: 800;
      }

      .nibras-admin-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 25px;
      }

      .nibras-admin-tab {
        border: 0;
        padding: 11px 16px;
        border-radius: 12px;
        cursor: pointer;
        background: #eef3f9;
        color: #07111f;
        font-family: inherit;
        font-weight: 700;
      }

      .nibras-admin-tab.active {
        background: #3b82f6;
        color: white;
      }

      .dark-mode .nibras-admin-tab {
        background: #17283d;
        color: white;
      }

      .admin-section-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
      }

      .admin-section-head h3 {
        margin: 0 0 5px;
      }

      .admin-section-head p {
        margin: 0;
        opacity: .65;
      }

      .admin-main-btn {
        border: 0;
        background: #3b82f6;
        color: white;
        padding: 11px 17px;
        border-radius: 12px;
        cursor: pointer;
        font-family: inherit;
        font-weight: 800;
      }

      .admin-small-btn,
      .admin-delete-btn {
        border: 0;
        padding: 8px 12px;
        border-radius: 9px;
        cursor: pointer;
        font-family: inherit;
        font-weight: 700;
      }

      .admin-small-btn {
        background: #e8f1ff;
        color: #2563eb;
      }

      .admin-delete-btn {
        background: #fee2e2;
        color: #dc2626;
      }

      .admin-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 12px;
      }

      .admin-table-wrap {
        overflow-x: auto;
      }

      .admin-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
      }

      .admin-table th,
      .admin-table td {
        padding: 13px;
        text-align: right;
        border-bottom: 1px solid rgba(127,127,127,.15);
      }

      .admin-table th {
        font-weight: 800;
      }

      .admin-items {
        display: grid;
        gap: 14px;
      }

      .admin-item {
        padding: 18px;
        border: 1px solid rgba(127,127,127,.15);
        border-radius: 16px;
        display: flex;
        justify-content: space-between;
        gap: 15px;
      }

      .admin-item h4 {
        margin: 8px 0;
      }

      .admin-item p {
        opacity: .7;
        margin: 5px 0;
      }

      .admin-item small {
        opacity: .7;
      }

      .admin-item-tag {
        display: inline-block;
        padding: 5px 9px;
        border-radius: 8px;
        background: rgba(59,130,246,.1);
        color: #2563eb;
        font-size: 12px;
        font-weight: 800;
      }

      .admin-badge-icon {
        font-size: 30px;
      }

      .admin-empty,
      .admin-loading,
      .admin-error {
        padding: 30px;
        text-align: center;
        border-radius: 16px;
        background: rgba(127,127,127,.06);
      }

      .admin-error {
        color: #dc2626;
      }

      @media (max-width: 700px) {

        .nibras-admin-title {
          flex-direction: column;
          align-items: flex-start;
        }

        .admin-section-head {
          flex-direction: column;
          align-items: flex-start;
        }

        .admin-item {
          flex-direction: column;
        }

        .nibras-admin-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .nibras-admin-tab {
          width: 100%;
        }

      }

    `;

    document.head.appendChild(style);
  }


  // =========================================
  // START ADMIN CENTER
  // =========================================

  waitForAdminPanel();

})();
