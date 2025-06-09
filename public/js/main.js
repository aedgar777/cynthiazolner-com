// Initialize Firebase with your config
firebase.initializeApp({
  apiKey: "FIREBASE_KEY_REMOVED",
  authDomain: "cynthiazolner-com.firebaseapp.com",
  projectId: "cynthiazolner-com",
  storageBucket: "cynthiazolner-com.firebasestorage.app",
  messagingSenderId: "660825206837",
  appId: "1:660825206837:web:31906827577a5bd1adc17c",
  measurementId: "G-JK597RSP78"
});

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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadLogo();
    
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
});