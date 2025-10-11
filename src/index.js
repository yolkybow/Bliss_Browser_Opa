// Import styles
import './styles.css';

// Global state
let currentSection = 'overview';
let currentModalType = null;
let currentEditId = null;
let liveData = {};
let portfolioData = {
    properties: [],
    vehicles: [],
    stocks: [],
    crypto: [],
    bankAccounts: []
};

// WebSocket connection
let ws = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    connectWebSocket();
    loadPortfolioData();
    updateLastUpdated();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            switchSection(section);
        });
    });

    // Modal close on outside click
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            closeModal();
        }
    });
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = function() {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'liveDataUpdate') {
            liveData = data.data;
            updateLiveData();
        }
    };
    
    ws.onclose = function() {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
    };
    
    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');
    
    currentSection = section;
}

function loadPortfolioData() {
    Promise.all([
        fetch('/api/properties').then(r => r.json()),
        fetch('/api/vehicles').then(r => r.json()),
        fetch('/api/stocks').then(r => r.json()),
        fetch('/api/crypto').then(r => r.json()),
        fetch('/api/bank-accounts').then(r => r.json()),
        fetch('/api/portfolio/summary').then(r => r.json())
    ]).then(([properties, vehicles, stocks, crypto, bankAccounts, summary]) => {
        portfolioData = { properties, vehicles, stocks, crypto, bankAccounts };
        updateAllTables();
        updatePortfolioSummary(summary);
    }).catch(error => {
        console.error('Error loading portfolio data:', error);
    });
}

function updateAllTables() {
    updatePropertiesTable();
    updateVehiclesTable();
    updateStocksTable();
    updateCryptoTable();
    updateBankTable();
}

function updatePropertiesTable() {
    const tbody = document.getElementById('propertiesTable');
    tbody.innerHTML = '';
    
    portfolioData.properties.forEach(property => {
        const row = document.createElement('tr');
        const gainLoss = property.current_value - property.purchase_price;
        const gainLossPercent = property.purchase_price > 0 ? (gainLoss / property.purchase_price) * 100 : 0;
        
        row.innerHTML = `
            <td>${property.name}</td>
            <td>${property.address || 'N/A'}</td>
            <td>${property.property_type || 'N/A'}</td>
            <td>$${formatNumber(property.purchase_price)}</td>
            <td>$${formatNumber(property.current_value)}</td>
            <td class="${gainLoss >= 0 ? 'gain' : 'loss'}">
                ${gainLoss >= 0 ? '+' : ''}$${formatNumber(gainLoss)} (${gainLossPercent >= 0 ? '+' : ''}${formatNumber(gainLossPercent)}%)
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editItem('property', ${property.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('property', ${property.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateVehiclesTable() {
    const tbody = document.getElementById('vehiclesTable');
    tbody.innerHTML = '';
    
    portfolioData.vehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        const gainLoss = vehicle.current_value - vehicle.purchase_price;
        const gainLossPercent = vehicle.purchase_price > 0 ? (gainLoss / vehicle.purchase_price) * 100 : 0;
        
        row.innerHTML = `
            <td>${vehicle.make} ${vehicle.model}</td>
            <td>${vehicle.year || 'N/A'}</td>
            <td>$${formatNumber(vehicle.purchase_price)}</td>
            <td>$${formatNumber(vehicle.current_value)}</td>
            <td>${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' mi' : 'N/A'}</td>
            <td>${vehicle.condition || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editItem('vehicle', ${vehicle.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('vehicle', ${vehicle.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStocksTable() {
    const tbody = document.getElementById('stocksTable');
    tbody.innerHTML = '';
    
    portfolioData.stocks.forEach(stock => {
        const row = document.createElement('tr');
        const currentPrice = liveData.stocks[stock.symbol] || 0;
        const currentValue = currentPrice * stock.quantity;
        const gainLoss = currentValue - (stock.purchase_price * stock.quantity);
        const gainLossPercent = stock.purchase_price > 0 ? (gainLoss / (stock.purchase_price * stock.quantity)) * 100 : 0;
        
        row.innerHTML = `
            <td>
                <strong>${stock.symbol}</strong>
                <span class="real-time-indicator">Live</span>
            </td>
            <td>${stock.quantity}</td>
            <td>$${formatNumber(stock.purchase_price)}</td>
            <td>$${formatNumber(currentPrice)}</td>
            <td>$${formatNumber(currentValue)}</td>
            <td class="${gainLoss >= 0 ? 'gain' : 'loss'}">
                ${gainLoss >= 0 ? '+' : ''}$${formatNumber(gainLoss)}
            </td>
            <td class="${gainLoss >= 0 ? 'gain' : 'loss'}">
                ${gainLossPercent >= 0 ? '+' : ''}${formatNumber(gainLossPercent)}%
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editItem('stock', ${stock.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('stock', ${stock.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateCryptoTable() {
    const tbody = document.getElementById('cryptoTable');
    tbody.innerHTML = '';
    
    portfolioData.crypto.forEach(crypto => {
        const row = document.createElement('tr');
        const currentPrice = liveData.crypto[crypto.symbol] || 0;
        const currentValue = currentPrice * crypto.quantity;
        const gainLoss = currentValue - (crypto.purchase_price * crypto.quantity);
        const gainLossPercent = crypto.purchase_price > 0 ? (gainLoss / (crypto.purchase_price * crypto.quantity)) * 100 : 0;
        
        row.innerHTML = `
            <td>
                <strong>${crypto.symbol.toUpperCase()}</strong>
                <span class="real-time-indicator">Live</span>
            </td>
            <td>${crypto.quantity}</td>
            <td>$${formatNumber(crypto.purchase_price)}</td>
            <td>$${formatNumber(currentPrice)}</td>
            <td>$${formatNumber(currentValue)}</td>
            <td class="${gainLoss >= 0 ? 'gain' : 'loss'}">
                ${gainLoss >= 0 ? '+' : ''}$${formatNumber(gainLoss)}
            </td>
            <td class="${gainLoss >= 0 ? 'gain' : 'loss'}">
                ${gainLossPercent >= 0 ? '+' : ''}${formatNumber(gainLossPercent)}%
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editItem('crypto', ${crypto.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('crypto', ${crypto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateBankTable() {
    const tbody = document.getElementById('bankTable');
    tbody.innerHTML = '';
    
    portfolioData.bankAccounts.forEach(account => {
        const row = document.createElement('tr');
        const currentBalance = liveData.bankBalances[account.id] || account.current_balance || 0;
        
        row.innerHTML = `
            <td>${account.bank_name}</td>
            <td>${account.account_type || 'N/A'}</td>
            <td>${account.account_number ? '****' + account.account_number.slice(-4) : 'N/A'}</td>
            <td>
                <strong>$${formatNumber(currentBalance)}</strong>
                <span class="real-time-indicator">Live</span>
            </td>
            <td>${account.last_updated ? new Date(account.last_updated).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editItem('bank', ${account.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('bank', ${account.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePortfolioSummary(summary) {
    document.getElementById('totalValue').textContent = `$${formatNumber(summary.total)}`;
    document.getElementById('propertiesValue').textContent = `$${formatNumber(summary.properties)}`;
    document.getElementById('vehiclesValue').textContent = `$${formatNumber(summary.vehicles)}`;
    document.getElementById('stocksValue').textContent = `$${formatNumber(summary.stocks)}`;
    document.getElementById('cryptoValue').textContent = `$${formatNumber(summary.crypto)}`;
    document.getElementById('bankValue').textContent = `$${formatNumber(summary.bank)}`;
}

function updateLiveData() {
    // Update the last updated timestamp
    updateLastUpdated();
    
    // Reload data to get updated values
    loadPortfolioData();
}

function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
}

function openModal(type, id = null) {
    currentModalType = type;
    currentEditId = id;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalForm = document.getElementById('modalForm');
    
    modalTitle.textContent = id ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    // Clear form
    modalForm.innerHTML = '';
    
    // Generate form fields based on type
    const fields = getFormFields(type);
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        label.setAttribute('for', field.name);
        
        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 3;
        } else if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                input.appendChild(optionElement);
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }
        
        input.id = field.name;
        input.name = field.name;
        input.required = field.required;
        input.value = field.value || '';
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        modalForm.appendChild(formGroup);
    });
    
    // If editing, populate with existing data
    if (id) {
        const item = portfolioData[type + 's'].find(item => item.id === id);
        if (item) {
            fields.forEach(field => {
                const input = document.getElementById(field.name);
                if (input && item[field.name] !== undefined) {
                    input.value = item[field.name];
                }
            });
        }
    }
    
    modal.style.display = 'block';
}

function getFormFields(type) {
    const fields = {
        property: [
            { name: 'name', label: 'Property Name', type: 'text', required: true },
            { name: 'address', label: 'Address', type: 'text' },
            { name: 'property_type', label: 'Property Type', type: 'select', options: [
                { value: 'house', text: 'House' },
                { value: 'apartment', text: 'Apartment' },
                { value: 'condo', text: 'Condo' },
                { value: 'commercial', text: 'Commercial' },
                { value: 'land', text: 'Land' }
            ] },
            { name: 'purchase_price', label: 'Purchase Price', type: 'number', required: true, step: '0.01' },
            { name: 'current_value', label: 'Current Value', type: 'number', required: true, step: '0.01' },
            { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
            { name: 'notes', label: 'Notes', type: 'textarea' }
        ],
        vehicle: [
            { name: 'make', label: 'Make', type: 'text', required: true },
            { name: 'model', label: 'Model', type: 'text', required: true },
            { name: 'year', label: 'Year', type: 'number', min: '1900', max: new Date().getFullYear() + 1 },
            { name: 'purchase_price', label: 'Purchase Price', type: 'number', required: true, step: '0.01' },
            { name: 'current_value', label: 'Current Value', type: 'number', required: true, step: '0.01' },
            { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
            { name: 'mileage', label: 'Mileage', type: 'number' },
            { name: 'condition', label: 'Condition', type: 'select', options: [
                { value: 'excellent', text: 'Excellent' },
                { value: 'good', text: 'Good' },
                { value: 'fair', text: 'Fair' },
                { value: 'poor', text: 'Poor' }
            ] },
            { name: 'notes', label: 'Notes', type: 'textarea' }
        ],
        stock: [
            { name: 'symbol', label: 'Stock Symbol', type: 'text', required: true, placeholder: 'e.g., AAPL' },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true, step: '0.0001' },
            { name: 'purchase_price', label: 'Purchase Price per Share', type: 'number', required: true, step: '0.01' },
            { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
            { name: 'notes', label: 'Notes', type: 'textarea' }
        ],
        crypto: [
            { name: 'symbol', label: 'Crypto Symbol', type: 'text', required: true, placeholder: 'e.g., bitcoin' },
            { name: 'quantity', label: 'Quantity', type: 'number', required: true, step: '0.00000001' },
            { name: 'purchase_price', label: 'Purchase Price per Unit', type: 'number', required: true, step: '0.01' },
            { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
            { name: 'notes', label: 'Notes', type: 'textarea' }
        ],
        bank: [
            { name: 'bank_name', label: 'Bank Name', type: 'text', required: true },
            { name: 'account_type', label: 'Account Type', type: 'select', options: [
                { value: 'checking', text: 'Checking' },
                { value: 'savings', text: 'Savings' },
                { value: 'investment', text: 'Investment' },
                { value: 'credit', text: 'Credit Card' }
            ] },
            { name: 'account_number', label: 'Account Number (last 4 digits)', type: 'text', placeholder: '1234' },
            { name: 'current_balance', label: 'Current Balance', type: 'number', step: '0.01' },
            { name: 'notes', label: 'Notes', type: 'textarea' }
        ]
    };
    
    return fields[type] || [];
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentModalType = null;
    currentEditId = null;
}

function saveItem() {
    const form = document.getElementById('modalForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    const numericFields = ['purchase_price', 'current_value', 'quantity', 'year', 'mileage', 'current_balance'];
    numericFields.forEach(field => {
        if (data[field]) {
            data[field] = parseFloat(data[field]);
        }
    });
    
    const url = currentEditId ? 
        `/api/${currentModalType}s/${currentEditId}` : 
        `/api/${currentModalType}s`;
    
    const method = currentEditId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            closeModal();
            loadPortfolioData();
        }
    })
    .catch(error => {
        console.error('Error saving item:', error);
        alert('Error saving item. Please try again.');
    });
}

function editItem(type, id) {
    openModal(type, id);
}

function deleteItem(type, id) {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
        fetch(`/api/${type}s/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                alert('Error: ' + result.error);
            } else {
                loadPortfolioData();
            }
        })
        .catch(error => {
            console.error('Error deleting item:', error);
            alert('Error deleting item. Please try again.');
        });
    }
}

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Make functions globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.saveItem = saveItem;
window.editItem = editItem;
window.deleteItem = deleteItem;