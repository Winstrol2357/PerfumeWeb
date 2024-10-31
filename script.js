async function loadMaterials(jsonFile) {
    try {
        const response = await fetch(jsonFile);
        let materials = await response.json();
        const materialsList = document.getElementById('materialsList');

        materialsList.innerHTML = ''; // Clear existing items before populating

        // Sort materials by name in alphabetical order
        materials.sort((a, b) => a.name.localeCompare(b.name));

        materials.forEach((material, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('material-item');

            // Adjust fields based on which ones are available
            const imageSrc = material.image || material.picture || '';
            const background = material.background || material.background_info || '';
            const blendsWith = material.blendsWith || material.blends_well_with || [];

            listItem.innerHTML = `
                <div class="material-header" onclick="toggleMaterial(${index})">
                    ${material.name}
                </div>
                <div class="material-content" id="material-${index}">
                    <img src="${imageSrc}" alt="${material.name}">
                    <p class="textmargin"><strong>Info:</strong> ${background}</p>
                    <p class="textmargin"><strong>Usage in Perfumes:</strong> ${material.usage}</p>
                    <p class="textmargin"><strong>Blends well with:</strong> ${blendsWith.join(', ')}</p>
                </div>
            `;

            materialsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading materials:", error);
    }
}

// Function to filter by material name
function filterMaterials() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const items = document.querySelectorAll('.material-item');

    items.forEach(item => {
        const text = item.querySelector('.material-header').textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
}

// Function to filter by "blends well with" property
function filterBlendMaterials() {
    const blendQuery = document.getElementById('blendSearchBox').value.toLowerCase();
    const items = document.querySelectorAll('.material-item');

    items.forEach(item => {
        const blendsText = item.querySelector('.material-content p:nth-of-type(3)').textContent.toLowerCase();
        item.style.display = blendsText.includes(blendQuery) ? '' : 'none';
    });
}

function toggleMaterial(index) {
    const item = document.getElementById(`material-${index}`);
    const materialItem = item.closest('.material-item');

    // Toggle the 'active' class to control CSS
    materialItem.classList.toggle('active');
}


