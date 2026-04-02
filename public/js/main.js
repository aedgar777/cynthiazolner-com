let emailJsLoadPromise;
let emailJsInitialized = false;
let specialtyIconManifestPromise;

const SPECIALTY_ICON_MANIFEST_URL = 'js/specialty-icons-manifest.json?v=2026-04-02-1';

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

function getStorageRefIfAvailable() {
    if (!window.firebase || !window.firebase.storage) return null;

    try {
        return firebase.storage().ref();
    } catch (error) {
        console.error('Error creating Firebase storage reference:', error);
        return null;
    }
}

async function loadHeaderVideo(storageRef) {
    if (!storageRef) return;

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
    if (!storageRef) return;

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

function readCachedIconExtensionMap() {
    try {
        return JSON.parse(localStorage.getItem('specialtyIconExtensionMap') || '{}');
    } catch {
        return {};
    }
}

function writeCachedIconExtensionMap(iconMap) {
    try {
        localStorage.setItem('specialtyIconExtensionMap', JSON.stringify(iconMap));
    } catch {
        // Ignore cache write failures.
    }
}

async function resolveSpecialtyIcon(storageRef, iconName, extensions, cachedExtension) {
    if (!storageRef) return null;

    const orderedExtensions = [cachedExtension, ...extensions].filter((extension, index, array) => {
        return extension && array.indexOf(extension) === index;
    });

    for (const extension of orderedExtensions) {
        try {
            const url = await storageRef.child(`${iconName}.${extension}`).getDownloadURL();
            return { url, extension };
        } catch {
            // Try next extension.
        }
    }

    return null;
}

async function getSpecialtyIconManifest() {
    if (!specialtyIconManifestPromise) {
        specialtyIconManifestPromise = fetch(SPECIALTY_ICON_MANIFEST_URL, { cache: 'force-cache' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Manifest request failed: ${response.status}`);
                }
                return response.json();
            });
    }

    return specialtyIconManifestPromise;
}

function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(url);
        image.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
        image.src = url;
    });
}

async function loadSpecialtyIcons(storageRef) {
    const specialtiesSection = document.getElementById('specialties');
    const icons = Array.from(document.querySelectorAll('#specialties img[data-icon]'));
    const extensions = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
    const cachedExtensions = readCachedIconExtensionMap();
    const resolvedExtensions = { ...cachedExtensions };

    let manifestIcons = {};
    try {
        const manifest = await getSpecialtyIconManifest();
        manifestIcons = manifest?.icons || {};
    } catch (error) {
        console.error('Error loading specialty icon manifest:', error);
    }

    const resolvedIcons = [];
    const unresolvedIcons = [];

    icons.forEach((icon) => {
        const iconName = icon.dataset.icon;
        if (!iconName) return;

        const manifestUrl = manifestIcons[iconName];
        if (manifestUrl) {
            resolvedIcons.push({ icon, iconName, url: manifestUrl });
            return;
        }

        unresolvedIcons.push({ icon, iconName });
    });

    if (unresolvedIcons.length > 0) {
        const fallbackIcons = await Promise.all(unresolvedIcons.map(async ({ icon, iconName }) => {
            const resolvedIcon = await resolveSpecialtyIcon(storageRef, iconName, extensions, cachedExtensions[iconName]);
            if (!resolvedIcon) {
                console.error(`Error loading specialty icon "${iconName}": no supported file found (${extensions.join(', ')})`);
                return null;
            }

            resolvedExtensions[iconName] = resolvedIcon.extension;
            return {
                icon,
                iconName,
                url: resolvedIcon.url
            };
        }));

        fallbackIcons.forEach((fallbackIcon) => {
            if (fallbackIcon) {
                resolvedIcons.push(fallbackIcon);
            }
        });
    }

    await Promise.allSettled(resolvedIcons.map(({ url }) => preloadImage(url)));

    resolvedIcons.forEach(({ icon, url }) => {
        icon.src = url;
    });

    writeCachedIconExtensionMap(resolvedExtensions);
    specialtiesSection?.classList.add('icons-ready');
}

function scheduleHeaderVideoLoad(storageRef) {
    if (!storageRef) return;

    const load = () => {
        void loadHeaderVideo(storageRef);
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(load, { timeout: 2000 });
    } else {
        setTimeout(load, 300);
    }
}

async function setupSpecialtiesLoading(storageRef) {
    const specialtiesSection = document.getElementById('specialties');

    if (!specialtiesSection) {
        return;
    }

    specialtiesSection.classList.remove('icons-ready');

    try {
        await loadSpecialtyIcons(storageRef);
    } catch (error) {
        console.error('Error loading specialty icons:', error);
        specialtiesSection.classList.add('icons-ready');
    }
}

function initializeDeferredFirebaseAssets(storageRef) {
    if (!storageRef) return;

    void loadLogo(storageRef);
    scheduleHeaderVideoLoad(storageRef);
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

document.addEventListener('DOMContentLoaded', async () => {
    initializeSmoothScrolling();
    initializeFormHandling();

    const storageRef = getStorageRefIfAvailable();

    try {
        await setupSpecialtiesLoading(storageRef);
    } finally {
        requestAnimationFrame(() => {
            hideLoader();
        });
    }

    initializeDeferredFirebaseAssets(storageRef);
});
