async function loadMaterials(jsonFile) {
    try {
        console.log('Fetching collections.json and library.json...');
        const [materialsResponse, formulasResponse] = await Promise.all([
            fetch(jsonFile),
            fetch('./library.json') // Fetch formulas from library.json
        ]);

        if (!materialsResponse.ok || !formulasResponse.ok) {
            throw new Error(`Failed to fetch files: ${materialsResponse.status}, ${formulasResponse.status}`);
        }

        let materials = await materialsResponse.json();
        const formulas = await formulasResponse.json();

        console.log('Fetched materials:', materials);
        console.log('Fetched formulas:', formulas);

        const materialsList = document.getElementById('materialsList');
        const itemCountElement = document.getElementById('itemCount');
        const costCountElement = document.getElementById('costCount');

        // Clear any existing content
        materialsList.innerHTML = '';
        itemCountElement.textContent = '';
        costCountElement.textContent = '';

        const itemCount = materials.length;
        itemCountElement.textContent = `Total number of materials: ${itemCount}`;

        // Calculate total cost
        const totalCost = materials.reduce((sum, material) => sum + parseFloat(material.total_price), 0);
        costCountElement.textContent = `Total money spent: ${totalCost} Ft`;

        // Sort materials by date_added (oldest to newest) for processing usage
        const materialUsage = calculateUsage(formulas);
        const remainingUsage = { ...materialUsage }; // Track remaining usage per material

        const processedMaterials = materials
            .sort((a, b) => new Date(a.date_added) - new Date(b.date_added))
            .map(material => {
                const name = material.name.toLowerCase();
                const totalQuantity = parseFloat(material.total_ml);
                let usedQuantity = 0;

                if (remainingUsage[name]) {
                    // Deduct usage from the current material
                    usedQuantity = Math.min(totalQuantity, remainingUsage[name]);
                    remainingUsage[name] -= usedQuantity;

                    // Ensure remaining usage doesn't go negative
                    if (remainingUsage[name] < 0) {
                        remainingUsage[name] = 0;
                    }
                }

                // Calculate current quantity
                const currentQuantity = (totalQuantity - usedQuantity).toFixed(3);

                return { ...material, currentQuantity };
            });

        // Display materials by newest to oldest
        const sortedMaterials = [...processedMaterials].sort(
            (a, b) => new Date(b.date_added) - new Date(a.date_added)
        );

        sortedMaterials.forEach((material, index) => {
            const name = material.name;
            const dateAdded = material.date_added;
            const link = material.link;
            const totalQuantity = parseFloat(material.total_ml); // Grams
            const currentQuantity = material.currentQuantity;
            const price = parseFloat(material.total_price); // Ft

            const listItem = document.createElement('li');
            listItem.classList.add('material-item');

            listItem.innerHTML = `
                <div class="material-header" onclick="toggleMaterial(${index})">
                    ${name}
                </div>
                <div class="material-content" id="material-${index}">
                    <ul>
                        <li><strong>Date Added:</strong> ${dateAdded}</li>
                        <li><strong>Link:</strong> <a href="${link}" target="_blank">Buy Here</a></li>
                        <li><strong>Total Quantity:</strong> ${totalQuantity} g</li>
                        <li><strong>Current Quantity:</strong> ${currentQuantity} g</li>
                        <li><strong>Price:</strong> ${price} Ft</li>
                    </ul>
                </div>
            `;

            materialsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading materials:", error);
    }
}

function calculateUsage(formulas) {
    const usage = {};

    formulas.forEach(formula => {
        formula.materials.forEach(material => {
            const name = material.material.trim().toLowerCase(); // Normalize name
            const used = parseFloat(material.grams); // Parse usage
            if (!usage[name]) {
                usage[name] = 0;
            }
            usage[name] += used; // Accumulate usage
        });
    });

    return usage;
}

function toggleMaterial(index) {
    const item = document.getElementById(`material-${index}`);
    const allItems = document.querySelectorAll('.material-item');

    allItems.forEach((materialItem, i) => {
        if (i !== index) {
            materialItem.classList.remove('active');
        }
    });

    const materialItem = item.closest('.material-item');
    materialItem.classList.toggle('active'); // Toggle current item
}

// Search bar functionality
function filterMaterials() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const items = document.querySelectorAll('.material-item');

    items.forEach(item => {
        const text = item.querySelector('.material-header').textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
}

// Load the materials on page load
loadMaterials('./collections.json');
