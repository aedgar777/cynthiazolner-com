
document.addEventListener('DOMContentLoaded', async () => {
    try {
     const loader = document.querySelector('.loader-container');
        
        const loaderTimeout = setTimeout(() => {
            if (loader) {
                loader.classList.add('loader-hidden');
                loader.addEventListener('transitionend', () => {
                    loader.remove();
                });
            }
        }, 5000);

        const storage = firebase.storage();
        const storageRef = storage.ref();

        await loadAssets(storageRef);
        
        clearTimeout(loaderTimeout);
        
        loader.classList.add('loader-hidden');
        loader.addEventListener('transitionend', () => {
            loader.remove();
        });
         
        initializeFormHandling();
        initializeSmoothScrolling();
    } catch (error) {
        console.error("Error in initialization:", error);
    }
});


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

            const iconRef = storageRef.child(`${iconName}.jpg`);
            const iconUrl = await iconRef.getDownloadURL();
            icon.src = iconUrl;
        }
    } catch (error) {
        console.error("Error loading specialty icons:", error);
    }
}

function initializeFormHandling() {
    emailjs.init(config.emailjs.publicKey);

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Add loading state
            contactForm.classList.add('form-loading');
            
            try {
                await emailjs.sendForm(
                    config.emailjs.serviceId,
                    config.emailjs.templateId,
                    this
                );
                
                showNotification('Message sent successfully!');
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                showNotification('Failed to send message. Please try again.', false);
            } finally {
                // Remove loading state
                contactForm.classList.remove('form-loading');
            }
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

