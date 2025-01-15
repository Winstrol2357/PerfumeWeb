// Function to load all materials from the JSON file
async function loadMaterials(jsonFile) {
    try {
        const response = await fetch(jsonFile);
        let materials = await response.json();
        const materialsList = document.getElementById('materialsList');

        materialsList.innerHTML = ''; // Clear existing items before populating

        const itemCount = materials.length;
        document.getElementById('itemCount').textContent = `Total number of formulas: ${itemCount}`;

        // Sort formulas: by date descending and by name ascending within the same date
        materials.sort((a, b) => {
            if (a.date === b.date) {
                return a.name.localeCompare(b.name); // Alphabetical if dates are the same
            }
            return new Date(b.date) - new Date(a.date); // Newest date first
        });

        materials.forEach((formula, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('material-item');

            // Create HTML structure, including the creation date
            listItem.innerHTML = `
                <div class="material-header" onclick="toggleMaterial(${index})">
                    ${formula.name} <span class="formula-date">${formula.date}</span>
                </div>
                <div class="material-content" id="material-${index}">
                    <p class="formulamargin"><strong>Ingredient Count:</strong> ${formula.ingredient_count}</p>
                    <p class="formulamargin"><strong>Desired Quantity:</strong> ${formula.desired_quantity}</p>
                    <ul>
                        ${formula.materials.map(material => `
                            <li>
                                <div class="attribute-pair"><strong>Material:</strong> ${material.material}</div>
                                <div class="attribute-pair"><strong>Parts:</strong> ${material.parts}</div>
                                <div class="attribute-pair"><strong>Grams:</strong> ${material.grams}g</div>
                                <div class="attribute-pair"><strong>Percentage:</strong> ${material.percentage}%</div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            materialsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading materials:", error);
    }
}

// Function to filter formulas by name
function filterFormulas() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const items = document.querySelectorAll('.material-item');

    items.forEach(item => {
        const text = item.querySelector('.material-header').textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
}

// Function to search for formulas by material name
async function searchByMaterial(materialName, jsonFile) {
    try {
        const response = await fetch(jsonFile);
        const materials = await response.json();
        const materialsList = document.getElementById('materialsList');

        materialsList.innerHTML = ''; // Clear existing items before populating

        // Filter formulas that contain the specified material
        const matchingFormulas = materials.filter(formula =>
            formula.materials.some(material =>
                material.material.toLowerCase().includes(materialName.toLowerCase())
            )
        );

        if (matchingFormulas.length === 0) {
            materialsList.innerHTML = `<li>No formulas found with the material "${materialName}".</li>`;
            return;
        }

        matchingFormulas.forEach((formula, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('material-item');

            // Create HTML structure for each matching formula
            listItem.innerHTML = `
                <div class="material-header" onclick="toggleMaterial(${index})">
                    ${formula.name} <span class="formula-date">${formula.date}</span>
                </div>
                <div class="material-content" id="material-${index}">
                    <p class="formulamargin"><strong>Ingredient Count:</strong> ${formula.ingredient_count}</p>
                    <p class="formulamargin"><strong>Desired Quantity:</strong> ${formula.desired_quantity}</p>
                    <ul>
                        ${formula.materials.map(material => `
                            <li>
                                <div class="attribute-pair"><strong>Material:</strong> ${material.material}</div>
                                <div class="attribute-pair"><strong>Parts:</strong> ${material.parts}</div>
                                <div class="attribute-pair"><strong>Grams:</strong> ${material.grams}g</div>
                                <div class="attribute-pair"><strong>Percentage:</strong> ${material.percentage}%</div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
            materialsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error searching by material:", error);
    }
}

// Function to toggle the visibility of each formula's details
function toggleMaterial(index) {
    const item = document.getElementById(`material-${index}`);
    const allItems = document.querySelectorAll('.material-item');

    // Close all other open sections
    allItems.forEach((materialItem, i) => {
        if (i !== index) {
            materialItem.classList.remove('active');
        }
    });

    // Toggle the clicked section
    const materialItem = item.closest('.material-item');
    materialItem.classList.toggle('active');
}

// Function to toggle the sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    const isActive = sidebar.classList.contains('active');

    // Toggle sidebar state
    document.body.style.overflow = isActive ? 'hidden' : 'auto'; // Prevent scrolling when sidebar is active
}

// Add event listeners for search inputs and initial data load
document.addEventListener('DOMContentLoaded', () => {
    const formulaSearchInput = document.getElementById('searchBox');
    const materialSearchInput = document.getElementById('searchMaterials');

    formulaSearchInput.addEventListener('keyup', filterFormulas);

    materialSearchInput.addEventListener('keyup', () => {
        const materialName = materialSearchInput.value;
        if (materialName.trim()) {
            searchByMaterial(materialName, 'library.json');
        } else {
            loadMaterials('library.json'); // Load all materials if search is cleared
        }
    });

    // Load all materials on initial page load
    loadMaterials('library.json');
});
