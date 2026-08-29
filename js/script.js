document.addEventListener('DOMContentLoaded', () => {

    /* ======================================================================
       AUTHENTICATION LOGIC (unchanged behavior from the original site)
       ====================================================================== */
    const studentIdInput = document.getElementById('student-id');
    const loginButton = document.getElementById('login-btn');
    const errorMessageDisplay = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-btn');

    // Hardcoded valid student IDs (for client-side demo only) — never rendered in the UI
    const VALID_STUDENT_IDS = ['23321013','2025','2026','2027','2028','2029','2030'];

    const handleLogin = () => {
        if (studentIdInput && errorMessageDisplay) {
            const studentId = studentIdInput.value.trim();
            if (VALID_STUDENT_IDS.includes(studentId)) {
                sessionStorage.setItem('loggedInStudentId', studentId);
                errorMessageDisplay.textContent = '';
                errorMessageDisplay.classList.remove('show');
                window.location.href = 'index.html';
            } else {
                errorMessageDisplay.textContent = 'Invalid Student ID. Please check it and try again.';
                errorMessageDisplay.classList.add('show');
            }
        }
    };

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
        studentIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
        studentIdInput.focus();
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('loggedInStudentId');
            window.location.href = 'login.html';
        });
    }

    // Global authentication check for protected pages
    if (window.location.pathname.endsWith('login.html')) {
        if (sessionStorage.getItem('loggedInStudentId')) {
            window.location.href = 'index.html';
        }
    } else {
        if (!sessionStorage.getItem('loggedInStudentId')) {
            window.location.href = 'login.html';
        }
    }


    /* ======================================================================
       COLLAPSIBLE PANELS (Academic Procedures & FAQ) — unchanged toggle logic,
       animation is handled purely via CSS max-height transitions
       ====================================================================== */
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-expanded', 'false');

        const content = trigger.nextElementSibling;

        const toggle = () => {
            const isActive = trigger.classList.toggle('active');
            content.classList.toggle('active');
            trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        };

        trigger.addEventListener('click', toggle);
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
            }
        });
    });


    /* ======================================================================
       CGPA CALCULATOR LOGIC (unchanged calculation, adds a subtle pulse
       animation on the result numbers when they update)
       ====================================================================== */
    const prevCgpaInput = document.getElementById('prev-cgpa');
    const prevCreditsInput = document.getElementById('prev-credits');
    const coursesContainer = document.getElementById('courses-container');
    const addCourseBtn = document.getElementById('add-course-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const currentGpaDisplay = document.getElementById('current-gpa');
    const currentGpaCreditsDisplay = document.getElementById('current-gpa-credits');
    const cumulativeGpaDisplay = document.getElementById('cumulative-gpa');
    const cumulativeGpaCreditsDisplay = document.getElementById('cumulative-gpa-credits');
    const performanceText = document.getElementById('performance-text');

    let courseCounter = 9; // Start from 9 as example rows are hardcoded in the markup

    const pulse = (el) => {
        if (!el) return;
        const box = el.closest('.result-box');
        if (!box) return;
        box.classList.remove('pulse');
        // Force reflow so the animation can restart
        void box.offsetWidth;
        box.classList.add('pulse');
    };

    const calculateCGPA = () => {
        let totalCurrentGradePoints = 0;
        let totalCurrentCredits = 0;

        const courseRows = coursesContainer ? coursesContainer.querySelectorAll('.course-input-row') : [];
        courseRows.forEach(row => {
            const creditHoursInput = row.querySelector('input[type="number"]');
            const gradeSelect = row.querySelector('select');

            const creditHours = parseFloat(creditHoursInput.value);
            const gradeValue = parseFloat(gradeSelect.value);

            if (!isNaN(creditHours) && creditHours > 0 && !isNaN(gradeValue)) {
                totalCurrentGradePoints += creditHours * gradeValue;
                totalCurrentCredits += creditHours;
            }
        });

        const currentSemesterGPA = totalCurrentCredits > 0 ? (totalCurrentGradePoints / totalCurrentCredits) : 0;
        if (currentGpaDisplay) { currentGpaDisplay.textContent = currentSemesterGPA.toFixed(2); pulse(currentGpaDisplay); }
        if (currentGpaCreditsDisplay) currentGpaCreditsDisplay.textContent = totalCurrentCredits;

        const prevCgpa = parseFloat(prevCgpaInput ? prevCgpaInput.value : 0) || 0;
        const prevCredits = parseFloat(prevCreditsInput ? prevCreditsInput.value : 0) || 0;

        const totalCumulativeGradePoints = (prevCgpa * prevCredits) + totalCurrentGradePoints;
        const totalCumulativeCredits = prevCredits + totalCurrentCredits;

        const cumulativeGPA = totalCumulativeCredits > 0 ? (totalCumulativeGradePoints / totalCumulativeCredits) : 0;
        if (cumulativeGpaDisplay) { cumulativeGpaDisplay.textContent = cumulativeGPA.toFixed(2); pulse(cumulativeGpaDisplay); }
        if (cumulativeGpaCreditsDisplay) cumulativeGpaCreditsDisplay.textContent = totalCumulativeCredits;

        if (performanceText) {
            updatePerformanceStatus(cumulativeGPA);
        }
    };

    const updatePerformanceStatus = (cgpa) => {
        if (cgpa >= 3.90) {
            performanceText.textContent = 'Exceptional! 🌟';
            performanceText.style.backgroundColor = 'var(--tool-soft)';
            performanceText.style.color = 'var(--tool)';
        } else if (cgpa >= 3.50) {
            performanceText.textContent = 'Excellent 💪';
            performanceText.style.backgroundColor = 'var(--success-soft)';
            performanceText.style.color = 'var(--success)';
        } else if (cgpa >= 2.00) {
            performanceText.textContent = 'Good Standing 💪';
            performanceText.style.backgroundColor = 'var(--warning-soft)';
            performanceText.style.color = 'var(--warning)';
        } else {
            performanceText.textContent = 'Academic Probation ⚠️';
            performanceText.style.backgroundColor = 'var(--danger-soft)';
            performanceText.style.color = 'var(--danger)';
        }
    };

    const addCourseRow = (courseName = '', creditHours = '', grade = '') => {
        courseCounter++;
        const newRow = document.createElement('div');
        newRow.classList.add('course-input-row');
        newRow.innerHTML = `
            <div class="course-input-group">
                <label for="course-name-${courseCounter}">Course Name</label>
                <input type="text" id="course-name-${courseCounter}" value="${courseName}">
            </div>
            <div class="course-input-group">
                <label for="credit-hours-${courseCounter}">Credit Hours</label>
                <input type="number" id="credit-hours-${courseCounter}" value="${creditHours}" step="0.5">
            </div>
            <div class="course-input-group">
                <label for="grade-${courseCounter}">Grade</label>
                <select id="grade-${courseCounter}">
                    <option value="">Select...</option>
                    <option value="4.00" ${grade === '4.00' ? 'selected' : ''}>A+ (4)</option>
                    <option value="3.70" ${grade === '3.70' ? 'selected' : ''}>A- (3.7)</option>
                    <option value="3.30" ${grade === '3.30' ? 'selected' : ''}>B+ (3.3)</option>
                    <option value="3.00" ${grade === '3.00' ? 'selected' : ''}>B (3)</option>
                    <option value="2.70" ${grade === '2.70' ? 'selected' : ''}>B- (2.7)</option>
                    <option value="2.30" ${grade === '2.30' ? 'selected' : ''}>C+ (2.3)</option>
                    <option value="2.00" ${grade === '2.00' ? 'selected' : ''}>C (2)</option>
                    <option value="1.70" ${grade === '1.70' ? 'selected' : ''}>C- (1.7)</option>
                    <option value="1.30" ${grade === '1.30' ? 'selected' : ''}>D+ (1.3)</option>
                    <option value="1.00" ${grade === '1.00' ? 'selected' : ''}>D (1)</option>
                    <option value="0.00" ${grade === '0.00' ? 'selected' : ''}>F (0)</option>
                </select>
            </div>
            <button type="button" class="remove-course-btn material-icons" aria-label="Remove course">remove_circle</button>
        `;
        coursesContainer.appendChild(newRow);

        newRow.querySelector('input[type="number"]').addEventListener('input', calculateCGPA);
        newRow.querySelector('select').addEventListener('change', calculateCGPA);
        newRow.querySelector('.remove-course-btn').addEventListener('click', () => {
            newRow.remove();
            calculateCGPA();
        });
    };

    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => addCourseRow());
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            coursesContainer.innerHTML = '';
            prevCgpaInput.value = '';
            prevCreditsInput.value = '';
            calculateCGPA();
        });
    }

    if (prevCgpaInput) {
        prevCgpaInput.addEventListener('input', calculateCGPA);
    }
    if (prevCreditsInput) {
        prevCreditsInput.addEventListener('input', calculateCGPA);
    }

    if (coursesContainer) {
        coursesContainer.querySelectorAll('.course-input-row').forEach(row => {
            row.querySelector('input[type="number"]').addEventListener('input', calculateCGPA);
            row.querySelector('select').addEventListener('change', calculateCGPA);
            row.querySelector('.remove-course-btn').addEventListener('click', () => {
                row.remove();
                calculateCGPA();
            });
        });
        calculateCGPA();
    }


    /* ======================================================================
       FAQ SEARCH & FILTER LOGIC (unchanged matching rules; adds an empty
       state message when a search/filter yields nothing)
       ====================================================================== */
    const faqSearchInput = document.getElementById('faq-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqEmptyState = document.getElementById('faq-empty-state');

    if (faqSearchInput) {
        const filterFaqs = () => {
            const searchTerm = faqSearchInput.value.toLowerCase();
            const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
            let visibleCount = 0;

            faqItems.forEach(item => {
                const questionText = item.querySelector('h4').textContent.toLowerCase();
                const category = item.dataset.category;

                const matchesSearch = questionText.includes(searchTerm);
                const matchesCategory = (activeCategory === 'all' || category === activeCategory);

                if (matchesSearch && matchesCategory) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (faqEmptyState) {
                faqEmptyState.classList.toggle('show', visibleCount === 0);
            }
        };

        faqSearchInput.addEventListener('keyup', filterFaqs);
        faqSearchInput.addEventListener('input', filterFaqs);

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterFaqs();
            });
        });

        filterFaqs();
    }


    /* ======================================================================
       DISCLAIMER MODAL (unchanged sessionStorage / mobile-only behavior)
       ====================================================================== */
    const disclaimerModal = document.getElementById('disclaimerModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const isMobileView = window.innerWidth <= 768;

    const showModal = () => {
        if (disclaimerModal) {
            disclaimerModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    const hideModal = () => {
        if (disclaimerModal) {
            disclaimerModal.classList.remove('active');
            document.body.style.overflow = '';
            sessionStorage.setItem('disclaimerShown', 'true');
        }
    };

    if (!window.location.pathname.endsWith('login.html') && isMobileView && !sessionStorage.getItem('disclaimerShown')) {
        showModal();
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    if (disclaimerModal) {
        disclaimerModal.addEventListener('click', (event) => {
            if (event.target === disclaimerModal) {
                hideModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && disclaimerModal.classList.contains('active')) {
                hideModal();
            }
        });
    }


    /* ======================================================================
       MOBILE NAVIGATION DRAWER (new — purely presentational UI addition)
       ====================================================================== */
    const sidebar = document.querySelector('.sidebar');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const drawerOverlay = document.querySelector('.drawer-overlay');

    const openDrawer = () => {
        if (!sidebar) return;
        sidebar.classList.add('open');
        drawerOverlay?.classList.add('active');
        hamburgerBtn?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        drawerOverlay?.classList.remove('active');
        hamburgerBtn?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    if (hamburgerBtn) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.addEventListener('click', () => {
            sidebar?.classList.contains('open') ? closeDrawer() : openDrawer();
        });
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }
    // Close drawer after selecting a page (internal navigation) or on resize back to desktop
    sidebar?.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeDrawer);
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeDrawer();
    });


    /* ======================================================================
       DARK MODE TOGGLE (new — persisted via localStorage)
       ====================================================================== */
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggleBtn?.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    };
    const savedTheme = localStorage.getItem('fyatTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('fyatTheme', next);
        });
    }

});
