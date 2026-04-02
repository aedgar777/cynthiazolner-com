let emailJsLoadPromise;
let emailJsInitialized = false;

function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    notification.offsetHeight;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, 3000);
}

function hideLoader() {
    const loader = document.querySelector('.loader-container');
    if (!loader || loader.classList.contains('loader-hidden')) return;

    loader.classList.add('loader-hidden');

    const removeLoader = () => loader.remove();
    loader.addEventListener('transitionend', removeLoader, { once: true });
    setTimeout(removeLoader, 650);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (window.emailjs) {
                resolve();
            } else {
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
            }
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

async function ensureEmailJsInitialized() {
    if (!emailJsLoadPromise) {
        emailJsLoadPromise = loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
    }

    await emailJsLoadPromise;

    if (!window.emailjs) {
        throw new Error('EmailJS library was not initialized.');
    }

    if (!emailJsInitialized) {
        window.emailjs.init(config.emailjs.publicKey);
        emailJsInitialized = true;
    }

    return window.emailjs;
}

async function loadHeaderVideo(storageRef) {
    try {
        const videoElement = document.getElementById('headerVideo');
        if (!videoElement) return;

        const videoRef = storageRef.child('7569929953984734264.mp4');
        videoElement.src = await videoRef.getDownloadURL();

        videoElement.addEventListener('loadeddata', () => {
            videoElement.style.opacity = '1';
        }, { once: true });

        videoElement.addEventListener('error', (errorEvent) => {
            console.error('Error loading video:', errorEvent);
        }, { once: true });
    } catch (error) {
        console.error('Error loading header video:', error);
    }
}

async function loadLogo(storageRef) {
    try {
        const logoRef = storageRef.child('android-chrome-512x512.avif');
        const logoUrl = await logoRef.getDownloadURL();
        const logo = document.querySelector('.logo img');
        if (logo) {
            logo.src = logoUrl;
        }
    } catch (error) {
        console.error('Error loading logo:', error);
    }
}

async function loadSpecialtyIcons(storageRef) {
    const icons = document.querySelectorAll('#specialties img[data-icon]');
    const extensions = ['avif', 'webp', 'jpg', 'jpeg', 'png'];

    for (const icon of icons) {
        const iconName = icon.dataset.icon;
        if (!iconName) continue;

        let loaded = false;

        for (const extension of extensions) {
            try {
                const iconRef = storageRef.child(`${iconName}.${extension}`);
                icon.src = await iconRef.getDownloadURL();
                loaded = true;
                break;
            } catch {
                // Try next extension silently.
            }
        }

        if (!loaded) {
            console.error(`Error loading specialty icon "${iconName}": no supported file found (${extensions.join(', ')})`);
        }
    }
}

function scheduleHeaderVideoLoad(storageRef) {
    const load = () => {
        void loadHeaderVideo(storageRef);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(load, { timeout: 2000 });
    } else {
        setTimeout(load, 300);
    }
}

function setupSpecialtiesLazyLoading(storageRef) {
    const specialtiesSection = document.getElementById('specialties');

    if (!specialtiesSection || !('IntersectionObserver' in window)) {
        void loadSpecialtyIcons(storageRef);
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        if (!entries.some(entry => entry.isIntersecting)) return;

        currentObserver.disconnect();
        void loadSpecialtyIcons(storageRef);
    }, { rootMargin: '200px 0px' });

    observer.observe(specialtiesSection);
}

async function initializeFirebaseAssets() {
    if (!window.firebase?.storage) return;

    try {
        const storageRef = firebase.storage().ref();

        void loadLogo(storageRef);
        scheduleHeaderVideoLoad(storageRef);
        setupSpecialtiesLazyLoading(storageRef);
    } catch (error) {
        console.error('Error initializing Firebase assets:', error);
    }
}

function initializeFormHandling() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    if (!contactForm || !successMessage) return;

    const warmEmailJs = () => {
        void ensureEmailJsInitialized().catch((error) => {
            console.error('EmailJS preload failed:', error);
        });
    };

    contactForm.addEventListener('focusin', warmEmailJs, { once: true });

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        contactForm.classList.add('form-loading');
        const formElements = contactForm.querySelectorAll('input, textarea, button');
        formElements.forEach(element => element.setAttribute('disabled', 'true'));

        try {
            const emailjs = await ensureEmailJsInitialized();

            const templateParams = {
                from_name: document.getElementById('from_name').value,
                from_email: document.getElementById('from_email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            await emailjs.send(
                config.emailjs.serviceId,
                config.emailjs.templateId,
                templateParams
            );

            contactForm.style.display = 'none';
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.classList.add('show');
            }, 50);

            contactForm.reset();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to send message. Please try again.', false);

            contactForm.classList.remove('form-loading');
            formElements.forEach(element => element.removeAttribute('disabled'));
        }
    });
}

function initializeSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            event.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSmoothScrolling();
    initializeFormHandling();

    requestAnimationFrame(() => {
        hideLoader();
    });

    void initializeFirebaseAssets();
});
