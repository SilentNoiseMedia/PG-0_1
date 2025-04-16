// Hardcoded data for testing purposes
const mediaTypes = ['Images', 'Icons'];
const customMediaTypes = JSON.parse(localStorage.getItem('customMediaTypes')) || [];

const models = {
    Images: ['SogniAI', 'Midjourney', 'ChatGPT', 'Gemini', 'Leonardo AI'],
    Icons: ['Midjourney', 'Ideogram', 'Freepik Mystic', 'Picsart', 'Google Gemini Imagen 3']
};

const compatibility = {
    Images: {
        SogniAI: 'High',
        Midjourney: 'High',
        ChatGPT: 'Medium',
        Gemini: 'High',
        'Leonardo AI': 'High'
    },
    Icons: {
        Midjourney: 'High',
        Ideogram: 'High',
        'Freepik Mystic': 'High',
        Picsart: 'Medium',
        'Google Gemini Imagen 3': 'High'
    }
};

const variableOptions = {
    style: ['Generic', 'Minimalist', 'Realistic', 'Abstract', 'Decorative'],
    technique: ['3D', 'Filled', 'Line', 'Hand-drawn', 'Digital'],
    colors: ['Multi', 'Duo', 'Mono', 'Gradient', 'Pastel'],
    aesthetic: ['Professional', 'Decorative', 'Games', 'Classic', 'Kids'],
    trendiness: ['Retro', '2000s', '2010s', '2020s', 'New']
};

// Function to capitalize strings
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Function to populate dropdowns
function populateSelect(id, options) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

// Function to generate prompt
function generatePrompt(mediaType) {
    const subject = document.getElementById(`${mediaType}-subject`)?.value || 'example';
    const style = document.getElementById(`${mediaType}-style`)?.value || '';
    const technique = document.getElementById(`${mediaType}-technique`)?.value || '';
    const colors = document.getElementById(`${mediaType}-colors`)?.value || '';
    const aesthetic = document.getElementById(`${mediaType}-aesthetic`)?.value || '';
    const trendiness = document.getElementById(`${mediaType}-trendiness`)?.value || '';
    
    const prompt = `Create a ${subject} ${mediaType.capitalize()} in ${style} style using ${technique} technique, with ${colors} colors, ${aesthetic} aesthetic, and a ${trendiness} trendiness style.`;
    document.getElementById(`${mediaType}-prompt-output`).textContent = prompt;
}

// Function to toggle lock state
function toggleLock(event) {
    const icon = event.target;
    const selectId = icon.getAttribute('data-for');
    if (icon.classList.contains('unlocked')) {
        icon.classList.remove('unlocked');
        icon.classList.add('locked');
        icon.innerHTML = '🔒';
    } else {
        icon.classList.remove('locked');
        icon.classList.add('unlocked');
        icon.innerHTML = '🔓';
    }
}

// Function to randomize selections
function randomizeSelections(mediaType) {
    const selects = document.querySelectorAll(`#${mediaType}-content select`);
    selects.forEach(select => {
        const lockIcon = document.querySelector(`.lock-icon[data-for="${select.id}"]`);
        if (lockIcon && lockIcon.classList.contains('unlocked')) {
            const options = select.getElementsByTagName('option');
            const randomIndex = Math.floor(Math.random() * options.length);
            select.selectedIndex = randomIndex;
        }
    });
    generatePrompt(mediaType);
}

// Function to copy to clipboard
function copyToClipboard(mediaType) {
    const outputText = document.getElementById(`${mediaType}-prompt-output`)?.textContent || '';
    if (navigator.clipboard) {
        navigator.clipboard.writeText(outputText).then(() => {
            alert('Prompt copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(outputText);
        });
    } else {
        fallbackCopy(outputText);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('Prompt copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please try again or copy manually.');
    }
    document.body.removeChild(textarea);
}

// Function to setup media tabs
function setupMediaTabs() {
    const mediaButtonsContainer = document.querySelector('.media-type-container');
    const mediaContentsContainer = document.querySelector('.app-container');
    const modelTabsContainer = document.getElementById('model-tabs');

    // Clear existing media buttons except add button
    mediaButtonsContainer.innerHTML = '';
    mediaTypes.forEach(media => {
        const button = document.createElement('button');
        button.classList.add('media-button');
        button.setAttribute('data-media', media.toLowerCase());
        button.textContent = media;
        mediaButtonsContainer.appendChild(button);
    });

    customMediaTypes.forEach(media => {
        const button = document.createElement('button');
        button.classList.add('media-button');
        button.setAttribute('data-media', media.toLowerCase());
        button.textContent = media;
        mediaButtonsContainer.appendChild(button);
    });

    const addButton = document.createElement('button');
    addButton.id = 'add-media-button';
    addButton.classList.add('media-button', 'add-button');
    addButton.textContent = '+ Add Media Type';
    mediaButtonsContainer.appendChild(addButton);

    const mediaButtons = document.querySelectorAll('.media-button:not(#add-media-button)');
    const mediaContents = document.querySelectorAll('.media-content');

    mediaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mediaType = button.getAttribute('data-media');
            mediaButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            mediaContents.forEach(content => content.classList.remove('active'));
            const activeContent = document.getElementById(`${mediaType}-content`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
            // Load model tabs for the selected media type
            const availableModels = models[mediaType.capitalize()] || [];
            modelTabsContainer.innerHTML = '';
            availableModels.forEach(model => {
                const modelButton = document.createElement('button');
                modelButton.classList.add('tab-button');
                modelButton.setAttribute('data-tab', model.toLowerCase().replace(/\s/g, '-'));
                modelButton.textContent = model;
                const compatibilityLevel = compatibility[mediaType.capitalize()]?.[model] || 'Unknown';
                if (compatibilityLevel === 'Low') {
                    modelButton.classList.add('low-compatibility');
                    const warningSpan = document.createElement('span');
                    warningSpan.classList.add('caution-symbol');
                    warningSpan.textContent = ' ⚠️';
                    warningSpan.title = 'This model may not produce optimal results for this media type';
                    modelButton.appendChild(warningSpan);
                }
                modelTabsContainer.appendChild(modelButton);
            });
            // Setup model tabs
            setupModelTabs();
            // Initialize content for media type
            initMediaContent(mediaType);
        });
    });

    // Add media type functionality
    const addMediaButton = document.getElementById('add-media-button');
    const addMediaModal = document.getElementById('add-media-modal');
    const newMediaInput = document.getElementById('new-media-type');
    const confirmAddMedia = document.getElementById('confirm-add-media');
    const cancelAddMedia = document.getElementById('cancel-add-media');

    addMediaButton.addEventListener('click', () => {
        addMediaModal.style.display = 'flex';
        newMediaInput.value = '';
        newMediaInput.focus();
    });

    confirmAddMedia.addEventListener('click', () => {
        const newMedia = newMediaInput.value.trim();
        if (newMedia && !mediaTypes.includes(newMedia) && !customMediaTypes.includes(newMedia)) {
            customMediaTypes.push(newMedia);
            localStorage.setItem('customMediaTypes', JSON.stringify(customMediaTypes));
            setupMediaTabs();
        }
        addMediaModal.style.display = 'none';
    });

    cancelAddMedia.addEventListener('click', () => {
        addMediaModal.style.display = 'none';
    });

    // Trigger the first media tab on load
    mediaButtons[0]?.click();
}

// Function to setup model tabs
function setupModelTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            const activeContent = document.getElementById(`${tabName}-content`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// Function to initialize media content
function initMediaContent(mediaType) {
    const subjectInput = document.getElementById(`${mediaType}-subject`);
    const styleSelect = document.getElementById(`${mediaType}-style`);
    const techniqueSelect = document.getElementById(`${mediaType}-technique`);
    const colorsSelect = document.getElementById(`${mediaType}-colors`);
    const aestheticSelect = document.getElementById(`${mediaType}-aesthetic`);
    const trendinessSelect = document.getElementById(`${mediaType}-trendiness`);
    const randomButton = document.getElementById(`${mediaType}-random-button`);
    const copyButton = document.getElementById(`${mediaType}-copy-button`);

    populateSelect(`${mediaType}-style`, variableOptions.style);
    populateSelect(`${mediaType}-technique`, variableOptions.technique);
    populateSelect(`${mediaType}-colors`, variableOptions.colors);
    populateSelect(`${mediaType}-aesthetic`, variableOptions.aesthetic);
    populateSelect(`${mediaType}-trendiness`, variableOptions.trendiness);

    const generate = () => generatePrompt(mediaType);
    subjectInput?.addEventListener('input', generate);
    styleSelect?.addEventListener('change', generate);
    techniqueSelect?.addEventListener('change', generate);
    colorsSelect?.addEventListener('change', generate);
    aestheticSelect?.addEventListener('change', generate);
    trendinessSelect?.addEventListener('change', generate);

    randomButton?.addEventListener('click', () => randomizeSelections(mediaType));
    copyButton?.addEventListener('click', () => copyToClipboard(mediaType));

    generate();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupMediaTabs();
    // For testing, we can add some custom media types
    if (customMediaTypes.length === 0) {
        customMediaTypes.push('Wallpaper', 'Texture', 'Logo');
        localStorage.setItem('customMediaTypes', JSON.stringify(customMediaTypes));
        setupMediaTabs();
    }
});
