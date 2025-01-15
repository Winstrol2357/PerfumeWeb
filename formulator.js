let materials = [];
let totalParts = 0;

// Load materials from localStorage when the page loads
function loadFromLocalStorage() {
    const savedMaterials = localStorage.getItem('materials');
    const savedTotalParts = localStorage.getItem('totalParts');

    if (savedMaterials) {
        materials = JSON.parse(savedMaterials);
        totalParts = parseFloat(savedTotalParts) || 0;
        updateUI();
        toggleDownloadButton();
    }
}

// Save materials to localStorage
function saveToLocalStorage() {
    localStorage.setItem('materials', JSON.stringify(materials));
    localStorage.setItem('totalParts', totalParts.toString());
}

function addMaterial() {
    const material = document.getElementById('material').value;
    const parts = parseFloat(document.getElementById('percentage').value);
    const desiredQuantity = parseFloat(document.getElementById('desired-quantity').value || 10); // Default to 10 grams

    if (material && parts && parts > 0) {
        if (totalParts + parts <= 1000) { 
            totalParts += parts;
            const grams = ((desiredQuantity * parts) / 1000).toFixed(3); 
            const percentage = ((parts / 1000) * 100).toFixed(1); 
            materials.push({ material, parts, grams, percentage });
            saveToLocalStorage(); // Save the updated materials to localStorage
            updateUI();
            toggleDownloadButton();
        } else {
            alert("Total parts cannot exceed 1000");
        }
    }
}

function updateUI() {
    const progressElement = document.getElementById('progress');
    const materialListElement = document.getElementById('material-list');
    const percentageDisplay = document.getElementById('percentage-display');
    const ingredientCount = document.getElementById('ingredientCount');

    const totalPercentage = ((totalParts / 1000) * 100).toFixed(1);
    progressElement.style.width = `${totalPercentage}%`;

    if (totalParts < 1000) {
        progressElement.className = 'progress green';
    } else if (totalParts === 1000) {
        progressElement.className = 'progress max-green';
    } else {
        progressElement.className = 'progress red';
    }

    percentageDisplay.textContent = `${totalPercentage}% (${totalParts} parts)`;

    materialListElement.innerHTML = '';
    materials.forEach(material => {
        const div = document.createElement('div');
        div.textContent = `${material.material}: ${material.parts} parts (${material.grams}g, ${material.percentage}%)`;
        
        const editButton = document.createElement('button');
        editButton.textContent = "Edit";
        editButton.onclick = () => editMaterial(materials.indexOf(material));
        div.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removeMaterial(materials.indexOf(material));
        div.appendChild(removeButton);

        materialListElement.appendChild(div);
    });

    ingredientCount.textContent = `Ingredients used: ${materials.length}`;
}

function updateQuantities() {
    const desiredQuantity = parseFloat(document.getElementById('desired-quantity').value || 10);
    materials.forEach(material => {
        material.grams = ((desiredQuantity * material.parts) / 1000).toFixed(3);
    });
    saveToLocalStorage(); // Save changes to localStorage
    updateUI();
}

function toggleDownloadButton() {
    const Btn = document.getElementById('save-to-library-btn');
    Btn.disabled = materials.length === 0;
}

function editMaterial(index) {
    const newParts = prompt("Enter new parts:", materials[index].parts);
    if (newParts !== null && !isNaN(newParts) && newParts > 0) {
        const oldParts = materials[index].parts;
        const desiredQuantity = parseFloat(document.getElementById('desired-quantity').value || 10);

        if (totalParts - oldParts + parseFloat(newParts) <= 1000) {
            totalParts = totalParts - oldParts + parseFloat(newParts);
            materials[index].parts = parseFloat(newParts);
            materials[index].grams = ((desiredQuantity * newParts) / 1000).toFixed(3);
            materials[index].percentage = ((newParts / 1000) * 100).toFixed(1);
            saveToLocalStorage(); // Save changes to localStorage
            updateUI();
            toggleDownloadButton();
        } else {
            alert("Total parts cannot exceed 1000");
        }
    }
}

function removeMaterial(index) {
    totalParts -= materials[index].parts;
    materials.splice(index, 1);
    saveToLocalStorage(); // Save changes to localStorage
    updateUI();
    toggleDownloadButton();
}

// Clear localStorage when needed (optional)
function clearLocalStorage() {
    localStorage.removeItem('materials');
    localStorage.removeItem('totalParts');
    materials = [];
    totalParts = 0;
    updateUI();
    toggleDownloadButton();
}

// Initialize the page by loading data from localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});

function clearBoard() {
    // Reset materials and total parts
    materials = [];
    totalParts = 0;

    // Clear localStorage to remove persisted data
    localStorage.removeItem('materials');
    localStorage.removeItem('totalParts');

    // Update the UI to reflect the cleared state
    updateUI();
    toggleDownloadButton();
}
