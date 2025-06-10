// Wait for Firebase to initialize from hosting config
let app;

function initializeFirebase() {
    return new Promise((resolve) => {
        if (firebase.apps.length) {
            resolve(firebase.apps[0]);
            return;
        }

        const config = {
            apiKey: "FIREBASE_KEY_REMOVED",
            authDomain: "cynthiazolner-com.firebaseapp.com",
            projectId: "cynthiazolner-com",
            storageBucket: "cynthiazolner-com.firebasestorage.app",
            messagingSenderId: "660825206837",
            appId: "1:660825206837:web:31906827577a5bd1adc17c",
            measurementId: "G-JK597RSP78"
        };

        resolve(firebase.initializeApp(config));
    });
}

// Initialize services after Firebase is ready
async function initializeServices() {
    app = await initializeFirebase();
    const storage = firebase.storage();
    const storageRef = storage.ref();
    return { storage, storageRef };
}

// Load assets after services are initialized
async function loadAssets(storageRef) {
    try {
        await Promise.all([
            loadLogo(storageRef),
            loadProfileImage(storageRef),
            loadSpecialtyIcons(storageRef)
        ]);
    } catch (error) {
        console.error("Error loading assets:", error);
    }
}

// Update asset loading functions to accept storageRef
async function loadLogo(storageRef) {
    try {
        const logoRef = storageRef.child('android-chrome-512x512.avif');
        const logoUrl = await logoRef.getDownloadURL();
        document.querySelector('.logo img').src = logoUrl;
    } catch (error) {
        console.error("Error loading logo:", error);
    }
}

async function loadProfileImage(storageRef) {
    try {
        const profileRef = storageRef.child('pic2a(1).jpg');
        const profileUrl = await profileRef.getDownloadURL();
        document.querySelector('.profile-image img').src = profileUrl;
    } catch (error) {
        console.error("Error loading profile image:", error);
    }
}

async function loadSpecialtyIcons(storageRef) {
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

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const { storageRef } = await initializeServices();
    await loadAssets(storageRef);

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