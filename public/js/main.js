// Initialize Firebase with your config
let app;
try {
    app = firebase.app();
} catch (e) {
    app = firebase.initializeApp({
        apiKey: "FIREBASE_KEY_REMOVED",
        authDomain: "cynthiazolner-com.firebaseapp.com",
        projectId: "cynthiazolner-com",
        storageBucket: "cynthiazolner-com.firebasestorage.app",
        messagingSenderId: "660825206837",
        appId: "1:660825206837:web:31906827577a5bd1adc17c",
        measurementId: "G-JK597RSP78"
    });
}

// Initialize services
const storage = firebase.storage();
const storageRef = storage.ref();

// Load logo when page loads
async function loadLogo() {
    try {
        const logoRef = storageRef.child('android-chrome-512x512.avif');
        const logoUrl = await logoRef.getDownloadURL();
        document.querySelector('.logo img').src = logoUrl;
    } catch (error) {
        console.error("Error loading logo:", error);
    }
}

async function loadProfileImage() {
    try {
        const profileRef = storageRef.child('pic2a(1).jpg');
        const profileUrl = await profileRef.getDownloadURL();
        document.querySelector('.profile-image img').src = profileUrl;
    } catch (error) {
        console.error("Error loading profile image:", error);
    }
}

async function loadSpecialtyIcons() {
    try {
        const icons = document.querySelectorAll('.specialty-icon img');
        
        for (const icon of icons) {
            const iconName = icon.dataset.icon;
            const iconRef = storageRef.child(`${iconName}.png`);
            const iconUrl = await iconRef.getDownloadURL();
            icon.src = iconUrl;
        }
    } catch (error) {
        console.error("Error loading specialty icons:", error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadLogo();
     loadProfileImage();
     loadSpecialtyIcons();
});
    // Form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add form submission logic here
        });
    }

    // Smooth scrolling
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    