// LocalStorage থেকে ডেটা লোড করা (যাতে রিফ্রেশ দিলে ডাটা না মুছে যায়)
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let examSchedule = JSON.parse(localStorage.getItem('examSchedule')) || [];
let editingIndex = null;
let countdownInterval = null;

// পেজ লোড হলে UI সেট করা
window.onload = function() {
    updateNavbarUI();
    
    // ইউজার লগইন করা থাকলে প্রোফাইল দেখাবে, না থাকলে ল্যান্ডিং পেজ দেখাবে
    if (currentUser) {
        renderProfile();
        showSection('profile-section');
    } else {
        showSection('landing-page');
    }
    
    renderRoutineTable();
    startCountdown();
};

// Display Section Controller
function showSection(sectionId) {
    // ১. সব সেকশন হাইড করা
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none'; // ফোর্স হাইড
    });

    // ২. নির্দিষ্ট সেকশনটি প্রদর্শন করা
    const targetSec = document.getElementById(sectionId);
    if (targetSec) {
        targetSec.classList.add('active');
        targetSec.style.display = 'flex'; // ফোর্স ডিসপ্লে ফ্লেক্স
    } else {
        console.warn("Target section not found: " + sectionId);
    }
    
    // ৩. ড্রপডাউন থাকলে তা বন্ধ করা
    const dropdown = document.getElementById('dropdown-content');
    if (dropdown) dropdown.classList.add('hidden');
}

// Protected Access Controller
function protectedSection(sectionId) {
    if (!currentUser) {
        alert("Please Log In or Sign Up first to access the Student Dashboard!");
        showAuth('login');
        return;
    }
    showSection(sectionId);
}

function showAuth(tab) {
    showSection('auth-page');
    switchAuthTab(tab);
}

function switchAuthTab(tab) {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupBtn = document.getElementById('signup-tab-btn');
    const loginBtn = document.getElementById('login-tab-btn');

    if (tab === 'signup') {
        if (signupForm) signupForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('active');
        if (loginBtn) loginBtn.classList.remove('active');
    } else {
        if (signupForm) signupForm.classList.add('hidden');
        if (loginForm) loginForm.classList.remove('hidden');
        if (signupBtn) signupBtn.classList.remove('active');
        if (loginBtn) loginBtn.classList.add('active');
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-content');
    if (dropdown) dropdown.classList.toggle('hidden');
}

// UI Navbar Updater based on Login Status
function updateNavbarUI() {
    const guestNav = document.getElementById('guest-nav-links');
    const studentDropdown = document.getElementById('student-dropdown');

    if (currentUser) {
        if (guestNav) guestNav.classList.add('hidden');
        if (studentDropdown) studentDropdown.classList.remove('hidden');
    } else {
        if (guestNav) guestNav.classList.remove('hidden');
        if (studentDropdown) studentDropdown.classList.add('hidden');
    }
}

// Handle Sign Up
function handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();

    const existingUser = registeredUsers.find(u => u.email === email || u.username === username);
    if (existingUser) {
        alert("An account with this Email or Username already exists. Please Log In.");
        showAuth('login');
        return;
    }

    const newUser = {
        fname: document.getElementById('reg-fname').value.trim(),
        surname: document.getElementById('reg-surname').value.trim(),
        username: username,
        email: email,
        phone: document.getElementById('reg-phone').value.trim(),
        password: document.getElementById('reg-password').value,
        roll: document.getElementById('reg-roll').value.trim(),
        reg: document.getElementById('reg-registration').value.trim(),
        section: document.getElementById('reg-section').value.trim(),
        group: document.getElementById('reg-group').value,
        institute: document.getElementById('reg-institute').value.trim(),
        address: document.getElementById('reg-address').value.trim(),
        gender: document.getElementById('reg-gender').value
    };

    registeredUsers.push(newUser);
    currentUser = newUser;

    // Save to LocalStorage
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert("Account created successfully!");
    updateNavbarUI();
    renderProfile();
    showSection('profile-section');
    document.getElementById('signup-form').reset();
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const foundUser = registeredUsers.find(
        u => (u.email === identifier || u.username === identifier) && u.password === password
    );

    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert("Logged in successfully!");
        updateNavbarUI();
        renderProfile();
        showSection('profile-section');
        document.getElementById('login-form').reset();
    } else {
        alert("Invalid Email/Username or Password! Please try again.");
    }
}

// Handle Log Out
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNavbarUI();
    alert("You have logged out.");
    showSection('landing-page');
}

// Render Profile Details
function renderProfile() {
    const container = document.getElementById('profile-details-display');
    if (!currentUser || !container) return;

    container.innerHTML = `
        <div class="profile-item"><span>Full Name</span><strong>${currentUser.fname} ${currentUser.surname}</strong></div>
        <div class="profile-item"><span>Username</span><strong>${currentUser.username}</strong></div>
        <div class="profile-item"><span>Email Address</span><strong>${currentUser.email}</strong></div>
        <div class="profile-item"><span>Phone Number</span><strong>${currentUser.phone}</strong></div>
        <div class="profile-item"><span>Roll / Reg No.</span><strong>Roll: ${currentUser.roll} | Reg: ${currentUser.reg}</strong></div>
        <div class="profile-item"><span>Section & Group</span><strong>${currentUser.section} (${currentUser.group})</strong></div>
        <div class="profile-item"><span>Educational Institute</span><strong>${currentUser.institute}</strong></div>
        <div class="profile-item"><span>Address</span><strong>${currentUser.address}</strong></div>
        <div class="profile-item"><span>Gender</span><strong>${currentUser.gender}</strong></div>
    `;
}

// Profile Edit Controls
function toggleProfileEdit(isEditMode) {
    if (!currentUser) return;

    const displayGrid = document.getElementById('profile-details-display');
    const editForm = document.getElementById('edit-profile-form');
    const editBtn = document.getElementById('edit-profile-btn');

    if (isEditMode) {
        if (displayGrid) displayGrid.classList.add('hidden');
        if (editForm) editForm.classList.remove('hidden');
        if (editBtn) editBtn.classList.add('hidden');

        document.getElementById('edit-fname').value = currentUser.fname || '';
        document.getElementById('edit-surname').value = currentUser.surname || '';
        document.getElementById('edit-username').value = currentUser.username || '';
        document.getElementById('edit-email').value = currentUser.email || '';
        document.getElementById('edit-phone').value = currentUser.phone || '';
        document.getElementById('edit-gender').value = currentUser.gender || '';
        document.getElementById('edit-roll').value = currentUser.roll || '';
        document.getElementById('edit-reg').value = currentUser.reg || '';
        document.getElementById('edit-section').value = currentUser.section || '';
        document.getElementById('edit-group').value = currentUser.group || '';
        document.getElementById('edit-institute').value = currentUser.institute || '';
        document.getElementById('edit-address').value = currentUser.address || '';
    } else {
        if (displayGrid) displayGrid.classList.remove('hidden');
        if (editForm) editForm.classList.add('hidden');
        if (editBtn) editBtn.classList.remove('hidden');
    }
}

function saveProfileChanges(event) {
    event.preventDefault();

    // আগের ইমেইল ও ইউজারনেম সেভ করে রাখা যেন সঠিকভাবে ফিন্ড করা যায়
    const oldEmail = currentUser.email;
    const oldUsername = currentUser.username;

    currentUser.fname = document.getElementById('edit-fname').value.trim();
    currentUser.surname = document.getElementById('edit-surname').value.trim();
    currentUser.username = document.getElementById('edit-username').value.trim();
    currentUser.email = document.getElementById('edit-email').value.trim();
    currentUser.phone = document.getElementById('edit-phone').value.trim();
    currentUser.gender = document.getElementById('edit-gender').value;
    currentUser.roll = document.getElementById('edit-roll').value.trim();
    currentUser.reg = document.getElementById('edit-reg').value.trim();
    currentUser.section = document.getElementById('edit-section').value.trim();
    currentUser.group = document.getElementById('edit-group').value;
    currentUser.institute = document.getElementById('edit-institute').value.trim();
    currentUser.address = document.getElementById('edit-address').value.trim();

    // registeredUsers তালিকায় নিখুঁতভাবে আপডেট করা
    const userIdx = registeredUsers.findIndex(u => u.email === oldEmail || u.username === oldUsername);
    if (userIdx !== -1) {
        registeredUsers[userIdx] = currentUser;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    renderProfile();
    toggleProfileEdit(false);
    alert("Profile updated successfully!");
}

// Exam & Subject Management
function addOrUpdateExam(event) {
    event.preventDefault();

    const dateVal = document.getElementById('exam-date').value;
    
    // Fix Timezone Day Calculation Bug
    const dateParts = dateVal.split('-');
    const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const calculatedDay = daysArr[localDate.getDay()];

    const examData = {
        name: document.getElementById('sub-name').value.trim(),
        code: document.getElementById('sub-code').value.trim(),
        date: dateVal,
        day: calculatedDay,
        time: document.getElementById('exam-time').value.trim(),
        gap: document.getElementById('exam-gap').value
    };

    if (editingIndex !== null) {
        examSchedule[editingIndex] = examData;
        editingIndex = null;
        document.getElementById('save-btn').textContent = "Save Subject";
    } else {
        examSchedule.push(examData);
    }

    localStorage.setItem('examSchedule', JSON.stringify(examSchedule));

    document.getElementById('schedule-form').reset();
    renderRoutineTable();
    startCountdown();
    showSection('exam-section');
}

function renderRoutineTable() {
    const tbody = document.getElementById('routine-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    examSchedule.sort((a, b) => new Date(a.date) - new Date(b.date));

    examSchedule.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td><strong>${item.day}</strong></td>
            <td>${item.gap} Days</td>
            <td>${item.code}</td>
            <td>${item.time}</td>
            <td><strong>${item.name}</strong></td>
            <td>
                <button class="action-btn edit-btn" onclick="editExam(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteExam(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editExam(index) {
    const item = examSchedule[index];
    document.getElementById('sub-name').value = item.name;
    document.getElementById('sub-code').value = item.code;
    document.getElementById('exam-date').value = item.date;
    document.getElementById('exam-time').value = item.time;
    document.getElementById('exam-gap').value = item.gap;

    editingIndex = index;
    document.getElementById('save-btn').textContent = "Update Subject";
    showSection('routine-section');
}

function deleteExam(index) {
    examSchedule.splice(index, 1);
    editingIndex = null;
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.textContent = "Save Subject";
    
    localStorage.setItem('examSchedule', JSON.stringify(examSchedule));
    renderRoutineTable();
    startCountdown();
}

// Countdown Logic
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    const titleElem = document.getElementById('next-exam-title');

    if (examSchedule.length === 0) {
        if (titleElem) titleElem.textContent = "No Upcoming Exams Scheduled";
        resetTimerDisplay();
        return;
    }

    const updateTimer = () => {
        const now = new Date().getTime();
        
        let nextExam = examSchedule.find(item => {
            const parts = item.date.split('-');
            const examTime = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59).getTime();
            return examTime > now;
        });

        if (!nextExam) {
            if (titleElem) titleElem.textContent = "All Exams Completed!";
            resetTimerDisplay();
            if (countdownInterval) clearInterval(countdownInterval);
            return;
        }

        if (titleElem) titleElem.textContent = `Next Exam: ${nextExam.name} (${nextExam.date})`;
        
        const parts = nextExam.date.split('-');
        const targetTime = new Date(parts[0], parts[1] - 1, parts[2], 9, 0, 0).getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
            resetTimerDisplay();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const dElem = document.getElementById('cd-days');
        const hElem = document.getElementById('cd-hours');
        const mElem = document.getElementById('cd-minutes');
        const sElem = document.getElementById('cd-seconds');

        if (dElem) dElem.textContent = String(days).padStart(2, '0');
        if (hElem) hElem.textContent = String(hours).padStart(2, '0');
        if (mElem) mElem.textContent = String(minutes).padStart(2, '0');
        if (sElem) sElem.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer(); // সঙ্গে সঙ্গে একবার রান হবে
    countdownInterval = setInterval(updateTimer, 1000);
}

function resetTimerDisplay() {
    const dElem = document.getElementById('cd-days');
    const hElem = document.getElementById('cd-hours');
    const mElem = document.getElementById('cd-minutes');
    const sElem = document.getElementById('cd-seconds');

    if (dElem) dElem.textContent = "00";
    if (hElem) hElem.textContent = "00";
    if (mElem) mElem.textContent = "00";
    if (sElem) sElem.textContent = "00";
}

// Password Reset Modal Handlers
function showForgotPasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) modal.classList.remove('hidden');
}

function closePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) modal.classList.add('hidden');
}

function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match! Please try again.");
        return;
    }

    let userIndex = registeredUsers.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        registeredUsers[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        alert("Password reset successfully! Please log in with your new password.");
        
        // ইনপুট ক্লিয়ার ও মোডাল বন্ধ
        const resetForm = document.querySelector('#password-modal form');
        if (resetForm) resetForm.reset();
        
        closePasswordModal();
        showAuth('login');
    } else {
        alert("No account found with this email address.");
    }
}