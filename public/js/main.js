
let app;

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


document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener('DOMContentLoaded', async () => {
    try {
   
        const app = firebase.app();
        const storage = firebase.storage();
        const storageRef = storage.ref();

        await Promise.all([
            loadLogo(storageRef),
            loadProfileImage(storageRef),
            loadSpecialtyIcons(storageRef)
        ]);

        initializeFormHandling();
        initializeSmoothScrolling();
    } catch (error) {
        console.error("Error initializing app:", error);
    }
});
});
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

            console.log('Loading icon:', iconName);

            const iconRef = storageRef.child(`${iconName}.png`);
            const iconUrl = await iconRef.getDownloadURL();
            icon.src = iconUrl;
        }
    } catch (error) {
        console.error("Error loading specialty icons:", error);
    }
}

function initializeFormHandling() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add form submission logic here
        });
    }
}

function initializeSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

