look at attached screenshot how its typing bar hiding last messages, find a better soloution on it and fix


// JavaScript for Ideology Analyzer Photo Uploader

// Constants
const totalPhotosCount = document.getElementById('totalPhotosCount');
const completedRoundsCount = document.getElementById('completedRoundsCount');
const incompleteRoundsCount = document.getElementById('incompleteRoundsCount');
const completionPercentage = document.getElementById('completionPercentage');
const photoRoundsContainer = document.getElementById('photoRoundsContainer');
const saveAllPhotosBtn = document.getElementById('saveAllPhotosBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const photoEditModal = document.getElementById('photoEditModal');
const photoEditForm = document.getElementById('photoEditForm');
const notification = document.getElementById('notification');

// State
let photoRounds = [];

// Functions
function initializePhotoRounds() {
    for (let i = 1; i <= 10; i++) {
        photoRounds.push({
            round: i,
            photos: []
        });
    }
    renderPhotoRounds();
}

function renderPhotoRounds() {
    photoRoundsContainer.innerHTML = '';
    photoRounds.forEach(round => {
        const roundElement = document.createElement('div');
        roundElement.className = 'photo-round';
        roundElement.innerHTML = `
            <div class="round-header">
                <div class="round-title">
                    <i class="fas fa-images"></i> Round ${round.round}
                </div>
                <div class="round-actions">
                    <button class="photo-action-btn" onclick="uploadPhoto(${round.round})">
                        <i class="fas fa-plus"></i> Add Photo
                    </button>
                </div>
            </div>
            <div class="photo-grid" id="photoGrid${round.round}">
                ${round.photos.map(photo => renderPhotoCard(photo)).join('')}
            </div>
        `;
        photoRoundsContainer.appendChild(roundElement);
    });
    updateStats();
}

function renderPhotoCard(photo) {
    return `
        <div class="photo-card">
            <div class="photo-preview">
                ${photo.src ? `<img src="${photo.src}" alt="${photo.name}" style="width:100%;height:100px;object-fit:cover;border-radius:5px;">` : photo.name || 'No Photo'}
            </div>
            <div class="photo-info">
                <div class="photo-name">${photo.name}</div>
                <div class="photo-ideology ideology-${photo.ideology}">${photo.ideology}</div>
            </div>
            <div class="photo-actions">
                <button class="photo-action-btn" onclick="editPhoto('${photo.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="photo-action-btn delete" onclick="deletePhoto('${photo.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

function addPhoto(roundNumber) {
    const round = photoRounds.find(r => r.round === roundNumber);
    const newPhoto = {
        id: `photo-${Date.now()}`,
        name: '',
        description: '',
        ideology: 'neutral'
    };
    round.photos.push(newPhoto);
    renderPhotoRounds();
}

function editPhoto(photoId) {
    const photo = findPhotoById(photoId);
    if (photo) {
        const form = document.getElementById('photoEditForm');
        if (form) {
            form.dataset.photoId = photoId;
            form.photoName.value = photo.name;
            form.photoDescription.value = photo.description;
            form.photoIdeology.value = photo.ideology;
            photoEditModal.classList.add('active');
        }
    }
}

function deletePhoto(photoId) {
    photoRounds.forEach(round => {
        round.photos = round.photos.filter(photo => photo.id !== photoId);
    });
    renderPhotoRounds();
}

function findPhotoById(photoId) {
    for (const round of photoRounds) {
        const photo = round.photos.find(p => p.id === photoId);
        if (photo) return photo;
    }
    return null;
}

function updateStats() {
    const totalPhotos = photoRounds.reduce((sum, round) => sum + round.photos.length, 0);
    const completedRounds = photoRounds.filter(round => round.photos.length === 3).length;
    const incompleteRounds = photoRounds.length - completedRounds;
    const completionPercent = Math.round((completedRounds / photoRounds.length) * 100);

    totalPhotosCount.textContent = totalPhotos;
    completedRoundsCount.textContent = completedRounds;
    incompleteRoundsCount.textContent = incompleteRounds;
    completionPercentage.textContent = `${completionPercent}%`;
}

function saveAllPhotos() {
    const success = SafeStorage.setItem('ideologyAnalyzerPhotos', JSON.stringify(photoRounds));
    notification.textContent = success ? 'Photos saved successfully!' : 'Photos saved to memory (storage blocked)';
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function resetAll() {
    photoRounds = [];
    initializePhotoRounds();
}

// Fix upload photo functionality
function uploadPhoto(roundNumber) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const round = photoRounds.find(r => r.round === roundNumber);
                const newPhoto = {
                    id: `photo-${Date.now()}`,
                    name: file.name,
                    description: '',
                    ideology: 'neutral',
                    src: e.target.result
                };
                round.photos.push(newPhoto);
                renderPhotoRounds();
            };
            reader.readAsDataURL(file);
        }
    };
    fileInput.click();
}

// Fix modal close issue
function closeModal() {
    photoEditModal.classList.remove('active');
}

document.getElementById('closePhotoModal').addEventListener('click', closeModal);
document.getElementById('cancelPhotoEdit').addEventListener('click', closeModal);

// Event Listeners
saveAllPhotosBtn.addEventListener('click', saveAllPhotos);
resetAllBtn.addEventListener('click', resetAll);

// Photo edit form submission
if (photoEditForm) {
    photoEditForm.addEventListener('submit', event => {
        event.preventDefault();
        const photoId = photoEditForm.dataset.photoId;
        const photo = findPhotoById(photoId);
        if (photo) {
            photo.name = photoEditForm.photoName.value;
            photo.description = photoEditForm.photoDescription.value;
            photo.ideology = photoEditForm.photoIdeology.value;
            renderPhotoRounds();
            photoEditModal.classList.remove('active');
        }
    });
}

// Load saved photos on initialization
function loadSavedPhotos() {
    try {
        const saved = SafeStorage.getItem('ideologyAnalyzerPhotos');
        if (saved) {
            photoRounds = JSON.parse(saved);
            renderPhotoRounds();
        }
    } catch (error) {
        console.error('Error loading saved photos:', error);
    }
}

// Initialize
if (typeof window.consoleCleanLoaded === 'undefined') {
    const script = document.createElement('script');
    script.src = 'js/console-clean.js';
    script.async = false;
    document.head.appendChild(script);
    window.consoleCleanLoaded = true;
}

// Load fixes script
if (typeof window.SafeStorage === 'undefined') {
    const fixesScript = document.createElement('script');
    fixesScript.src = 'js/fixes.js';
    fixesScript.async = false;
    document.head.appendChild(fixesScript);
}

initializePhotoRounds();
loadSavedPhotos();
