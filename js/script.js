document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication Logic (NEW) ---
    const studentIdInput = document.getElementById('student-id');
    const loginButton = document.getElementById('login-btn');
    const errorMessageDisplay = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-btn');

    // Hardcoded valid student IDs (for client-side demo only)
    const VALID_STUDENT_IDS = ['23321013', '1000056944', '1000056417', '1000056456', '1000056396','1000056500', '1000056961', '1000056501', '1000056502', '1000056505','1000056507', '1000056503', '1000056508', '1000056504', '1000056509','1000056510', '1000056511', '1000056512', '2025'];

    // Function to handle login
    const handleLogin = () => {
        if (studentIdInput && errorMessageDisplay) {
            const studentId = studentIdInput.value.trim();
            if (VALID_STUDENT_IDS.includes(studentId)) {
                sessionStorage.setItem('loggedInStudentId', studentId); // Store login status
                errorMessageDisplay.textContent = ''; // Clear any previous errors
                window.location.href = 'index.html'; // Redirect to home page
            } else {
                errorMessageDisplay.textContent = 'Invalid Student ID. Please try again.';
            }
        }
    };

    // Attach login event listener if on the login page
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
        // Allow pressing Enter key to log in
        studentIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // Handle logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            sessionStorage.removeItem('loggedInStudentId'); // Clear login status
            window.location.href = 'login.html'; // Redirect to login page
        });
    }

    // --- Global Authentication Check for Protected Pages ---
    // This runs on every page load to ensure user is logged in
    // It should be at the very top of the script to execute early.
    // Only redirect if NOT on the login page.
    if (window.location.pathname.endsWith('login.html')) {
        // If already on login page, and logged in, redirect to index
        if (sessionStorage.getItem('loggedInStudentId')) {
            window.location.href = 'index.html';
        }
    } else {
        // For all other pages, if not logged in, redirect to login
        if (!sessionStorage.getItem('loggedInStudentId')) {
            window.location.href = 'login.html';
        }
    }


    // --- Existing Collapsible Panels (for Academic Procedures & FAQ) ---
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling; // The collapsible-content div
            trigger.classList.toggle('active');
            content.classList.toggle('active');
        });
    });

    // --- Existing CGPA Calculator Logic ---
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

    let courseCounter = 9; // Start from 3 as 3 examples are hardcoded

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
        if (currentGpaDisplay) currentGpaDisplay.textContent = currentSemesterGPA.toFixed(2);
        if (currentGpaCreditsDisplay) currentGpaCreditsDisplay.textContent = totalCurrentCredits;

        const prevCgpa = parseFloat(prevCgpaInput ? prevCgpaInput.value : 0) || 0;
        const prevCredits = parseFloat(prevCreditsInput ? prevCreditsInput.value : 0) || 0;

        const totalCumulativeGradePoints = (prevCgpa * prevCredits) + totalCurrentGradePoints;
        const totalCumulativeCredits = prevCredits + totalCurrentCredits;

        const cumulativeGPA = totalCumulativeCredits > 0 ? (totalCumulativeGradePoints / totalCumulativeCredits) : 0;
        if (cumulativeGpaDisplay) cumulativeGpaDisplay.textContent = cumulativeGPA.toFixed(2);
        if (cumulativeGpaCreditsDisplay) cumulativeGpaCreditsDisplay.textContent = totalCumulativeCredits;

        if (performanceText) {
            updatePerformanceStatus(cumulativeGPA);
        }
    };

    const updatePerformanceStatus = (cgpa) => {
        if (cgpa >= 3.90) {
            performanceText.textContent = 'Exceptional! 🌟';
            performanceText.style.backgroundColor = 'var(--accent-color)';
            performanceText.style.color = 'white';
        } else if (cgpa >= 3.50) {
            performanceText.textContent = 'Excellent 💪';
            performanceText.style.backgroundColor = 'var(--neutral-gpa)';
            performanceText.style.color = 'var(--text-color)'; // For yellow background, make text dark
        } else if (cgpa >= 2.00) {
            performanceText.textContent = 'Good Standing 💪';
            performanceText.style.backgroundColor = 'var(--neutral-gpa)';
            performanceText.style.color = 'var(--text-color)'; // For yellow background, make text dark
        } else {
            performanceText.textContent = 'Academic Probation ⚠️';
            performanceText.style.backgroundColor = 'var(--bad-gpa)';
            performanceText.style.color = 'white';
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
            <button type="button" class="remove-course-btn material-icons">remove_circle</button>
        `;
        coursesContainer.appendChild(newRow);

        // Add event listeners to the new inputs for recalculation
        newRow.querySelector('input[type="number"]').addEventListener('input', calculateCGPA);
        newRow.querySelector('select').addEventListener('change', calculateCGPA);
        newRow.querySelector('.remove-course-btn').addEventListener('click', () => {
            newRow.remove();
            calculateCGPA(); // Recalculate after removing a row
        });
    };

    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => addCourseRow());
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            coursesContainer.innerHTML = ''; // Clear all course rows
            prevCgpaInput.value = '';
            prevCreditsInput.value = '';
            calculateCGPA(); // Recalculate after clearing
        });
    }

    // Event listeners for initial inputs
    if (prevCgpaInput) {
        prevCgpaInput.addEventListener('input', calculateCGPA);
    }
    if (prevCreditsInput) {
        prevCreditsInput.addEventListener('input', calculateCGPA);
    }

    // Initial calculation on page load (if there are pre-filled courses)
    if (coursesContainer) {
        // Add event listeners to hardcoded example rows if they exist
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


    // --- Existing FAQ Search and Filter Logic ---
    const faqSearchInput = document.getElementById('faq-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqSearchInput) {
        const filterFaqs = () => {
            const searchTerm = faqSearchInput.value.toLowerCase();
            const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';

            faqItems.forEach(item => {
                const questionText = item.querySelector('h4').textContent.toLowerCase();
                const category = item.dataset.category;

                const matchesSearch = questionText.includes(searchTerm);
                const matchesCategory = (activeCategory === 'all' || category === activeCategory);

                if (matchesSearch && matchesCategory) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        };

        faqSearchInput.addEventListener('keyup', filterFaqs);

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterFaqs();
            });
        });

        // Initial filter on load
        filterFaqs();
    }


    // --- Existing Disclaimer Modal Logic ---
    const disclaimerModal = document.getElementById('disclaimerModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const isMobileView = window.innerWidth <= 768; // Define what constitutes a mobile view

    // Function to show the modal
    const showModal = () => {
        if (disclaimerModal) { // Ensure modal exists before trying to show
            disclaimerModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        }
    };

    // Function to hide the modal
    const hideModal = () => {
        if (disclaimerModal) { // Ensure modal exists before trying to hide
            disclaimerModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            sessionStorage.setItem('disclaimerShown', 'true'); // Set flag that modal has been shown
        }
    };

    // Check if modal should be shown on load
    // Only show if NOT on login page and NOT already shown
    if (!window.location.pathname.endsWith('login.html') && isMobileView && !sessionStorage.getItem('disclaimerShown')) {
        showModal();
    }

    // Event listener to close the modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }

    // Close modal if user clicks outside of the modal content
    if (disclaimerModal) {
        disclaimerModal.addEventListener('click', (event) => {
            if (event.target === disclaimerModal) {
                hideModal();
            }
        });
    }

    // Note: The resize listener for the disclaimer modal is commented out
    // as it can be annoying. If you want it, uncomment the block below.
    /*
    window.addEventListener('resize', () => {
        const wasMobile = isMobileView;
        isMobileView = window.innerWidth <= 768;
        if (!window.location.pathname.endsWith('login.html') && !wasMobile && isMobileView && !sessionStorage.getItem('disclaimerShown')) {
            showModal();
        } else if (wasMobile && !isMobileView && disclaimerModal && disclaimerModal.classList.contains('active')) {
            hideModal();
        }
    });
    */
});
