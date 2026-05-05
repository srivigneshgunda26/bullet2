const API_URL = '/api/generate-bullets'; // Backend endpoint

const form = document.getElementById('bulletForm');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const bulletsContainer = document.getElementById('bullets');
const copyBtn = document.getElementById('copyBtn');
const errorDiv = document.getElementById('error');
const roleInput = document.getElementById('role');
const experienceInput = document.getElementById('experience');

// Character counter
const experienceCounter = document.createElement('div');
experienceCounter.className = 'char-counter';
experienceInput.parentNode.appendChild(experienceCounter);

experienceInput.addEventListener('input', () => {
    const length = experienceInput.value.length;
    experienceCounter.textContent = `${length} characters`;
    experienceCounter.style.color = length < 50 ? '#ff6b6b' : length > 500 ? '#ff6b6b' : '#6b7280';
});

// Load history on page load
window.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const role = roleInput.value;
    const experience = experienceInput.value;
    
    // Show loading
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    try {
        // Generate bullets using OpenRouter API
        const bullets = await generateBulletsWithAI(role, experience);
        
        // Save to history
        saveToHistory(role, experience, bullets);
        
        // Display results
        displayBullets(bullets);
        loading.classList.add('hidden');
        results.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('hidden');
        errorDiv.textContent = 'Error: ' + error.message;
        errorDiv.classList.remove('hidden');
    }
});

async function generateBulletsWithAI(role, experience) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role,
                experience
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.bullets;

    } catch (error) {
        throw error;
    }
}

function displayBullets(bullets) {
    bulletsContainer.innerHTML = '';
    bullets.forEach((bullet, index) => {
        const bulletDiv = document.createElement('div');
        bulletDiv.className = 'bullet-item';
        
        const bulletText = document.createElement('span');
        bulletText.className = 'bullet-text';
        bulletText.textContent = '• ' + bullet;
        
        const bulletActions = document.createElement('div');
        bulletActions.className = 'bullet-actions';
        
        // Copy individual bullet button
        const copyIndividualBtn = document.createElement('button');
        copyIndividualBtn.className = 'bullet-action-btn';
        copyIndividualBtn.innerHTML = '📋';
        copyIndividualBtn.title = 'Copy this bullet';
        copyIndividualBtn.onclick = (e) => {
            e.stopPropagation();
            copyToBullet('• ' + bullet, copyIndividualBtn);
        };
        
        // Favorite button
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'bullet-action-btn favorite-btn';
        favoriteBtn.innerHTML = '⭐';
        favoriteBtn.title = 'Add to favorites';
        favoriteBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(bullet, favoriteBtn);
        };
        
        bulletActions.appendChild(copyIndividualBtn);
        bulletActions.appendChild(favoriteBtn);
        
        bulletDiv.appendChild(bulletText);
        bulletDiv.appendChild(bulletActions);
        bulletsContainer.appendChild(bulletDiv);
    });
}

function copyToBullet(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✓';
        button.style.background = '#10b981';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 1500);
    });
}

function toggleFavorite(bullet, button) {
    let favorites = JSON.parse(localStorage.getItem('favoriteBullets') || '[]');
    const index = favorites.indexOf(bullet);
    
    if (index > -1) {
        favorites.splice(index, 1);
        button.style.color = '#6b7280';
        showToast('Removed from favorites');
    } else {
        favorites.push(bullet);
        button.style.color = '#fbbf24';
        showToast('Added to favorites');
    }
    
    localStorage.setItem('favoriteBullets', JSON.stringify(favorites));
}

function saveToHistory(role, experience, bullets) {
    let history = JSON.parse(localStorage.getItem('bulletHistory') || '[]');
    
    const entry = {
        id: Date.now(),
        role,
        experience,
        bullets,
        timestamp: new Date().toISOString()
    };
    
    history.unshift(entry);
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('bulletHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('bulletHistory') || '[]');
    const historyContainer = document.getElementById('history');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No history yet. Generate your first bullets!</p>';
        return;
    }
    
    historyContainer.innerHTML = '';
    history.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        historyItem.innerHTML = `
            <div class="history-header">
                <strong>${entry.role}</strong>
                <span class="history-date">${dateStr}</span>
            </div>
            <div class="history-bullets">
                ${entry.bullets.map(b => `<div class="history-bullet">• ${b}</div>`).join('')}
            </div>
            <button class="history-load-btn" onclick="loadFromHistory(${entry.id})">Load</button>
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

window.loadFromHistory = function(id) {
    const history = JSON.parse(localStorage.getItem('bulletHistory') || '[]');
    const entry = history.find(e => e.id === id);
    
    if (entry) {
        roleInput.value = entry.role;
        experienceInput.value = entry.experience;
        displayBullets(entry.bullets);
        results.classList.remove('hidden');
        
        // Scroll to form
        document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
        showToast('Loaded from history');
    }
};

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Copy all bullets
copyBtn.addEventListener('click', () => {
    const bullets = Array.from(document.querySelectorAll('.bullet-text'))
        .map(el => el.textContent)
        .join('\n');
    
    navigator.clipboard.writeText(bullets).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#10b981';
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    });
});

// Export to PDF
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const bullets = Array.from(document.querySelectorAll('.bullet-text'))
        .map(el => el.textContent)
        .join('\n');
    
    const role = roleInput.value;
    
    // Create a simple text file (PDF generation requires external library)
    const content = `Resume Bullets - ${role}\n\n${bullets}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-bullets-${role.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Exported as text file');
});

// Export to Word (simple text format)
document.getElementById('exportWordBtn').addEventListener('click', () => {
    const bullets = Array.from(document.querySelectorAll('.bullet-text'))
        .map(el => el.textContent)
        .join('\n');
    
    const role = roleInput.value;
    
    const content = `Resume Bullets - ${role}\n\n${bullets}`;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-bullets-${role.replace(/\s+/g, '-').toLowerCase()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Exported as Word document');
});

// Clear history
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('bulletHistory');
        loadHistory();
        showToast('History cleared');
    }
});
