const API_BASE = '';
let autoRefreshInterval;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    startAutoRefresh();
});

// Auto-refresh every 30 seconds for live data
function startAutoRefresh() {
    autoRefreshInterval = setInterval(() => {
        refreshLiveData();
    }, 30000); // 30 seconds
}

function refreshAllData() {
    loadAllData();
}

function refreshLiveData() {
    loadCryptoLivePrices();
    loadStockLivePrices();
    loadSummary();
    updateLastRefreshTime();
}

function updateLastRefreshTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        `Last updated: ${now.toLocaleTimeString()}`;
}

async function loadAllData() {
    await Promise.all([
        loadProperties(),
        loadVehicles(),
        loadBankAccounts(),
        loadCryptoHoldings(),
        loadStockHoldings(),
        loadSummary()
    ]);
    updateLastRefreshTime();
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Refresh live data when switching to crypto or stocks
    if (tabName === 'crypto') {
        loadCryptoLivePrices();
    } else if (tabName === 'stocks') {
        loadStockLivePrices();
    }
}

// Modal Management
function showAddPropertyModal() {
    document.getElementById('propertyModal').style.display = 'block';
}

function showAddVehicleModal() {
    document.getElementById('vehicleModal').style.display = 'block';
}

function showAddBankModal() {
    document.getElementById('bankModal').style.display = 'block';
}

function showAddCryptoModal() {
    document.getElementById('cryptoModal').style.display = 'block';
}

function showAddStockModal() {
    document.getElementById('stockModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Portfolio Summary
async function loadSummary() {
    try {
        const response = await fetch(`${API_BASE}/api/portfolio/summary`);
        const data = await response.json();
        
        document.getElementById('totalValue').textContent = formatCurrency(data.total_value);
        document.getElementById('propertyValue').textContent = formatCurrency(data.property_value);
        document.getElementById('propertyCount').textContent = `${data.property_count} properties`;
        document.getElementById('vehicleValue').textContent = formatCurrency(data.vehicle_value);
        document.getElementById('vehicleCount').textContent = `${data.vehicle_count} vehicles`;
        document.getElementById('bankBalance').textContent = formatCurrency(data.bank_balance);
        document.getElementById('bankCount').textContent = `${data.bank_account_count} accounts`;
        document.getElementById('cryptoValue').textContent = formatCurrency(data.crypto_value);
        document.getElementById('cryptoCount').textContent = `${data.crypto_count} holdings`;
        document.getElementById('stockValue').textContent = formatCurrency(data.stock_value);
        document.getElementById('stockCount').textContent = `${data.stock_count} holdings`;
    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

// Properties
async function loadProperties() {
    try {
        const response = await fetch(`${API_BASE}/api/properties`);
        const properties = await response.json();
        
        const container = document.getElementById('propertiesList');
        if (properties.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏠</div>
                    <h3>No properties yet</h3>
                    <p>Add your first property to start tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = properties.map(prop => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <div>
                        <h3>${prop.name}</h3>
                        <span style="color: #999;">${prop.property_type || 'Property'}</span>
                    </div>
                    <button class="btn btn-delete" onclick="deleteProperty(${prop.id})">Delete</button>
                </div>
                <div class="asset-card-body">
                    ${prop.location ? `<p><strong>Location:</strong> ${prop.location}</p>` : ''}
                    ${prop.purchase_price ? `<p><strong>Purchase Price:</strong> ${formatCurrency(prop.purchase_price)}</p>` : ''}
                    ${prop.current_value ? `<p><strong>Current Value:</strong> ${formatCurrency(prop.current_value)}</p>` : ''}
                    ${prop.purchase_date ? `<p><strong>Purchase Date:</strong> ${prop.purchase_date}</p>` : ''}
                    ${prop.notes ? `<p><strong>Notes:</strong> ${prop.notes}</p>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}

async function addProperty(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/api/properties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('propertyModal');
            event.target.reset();
            loadProperties();
            loadSummary();
        }
    } catch (error) {
        console.error('Error adding property:', error);
    }
}

async function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
        await fetch(`${API_BASE}/api/properties/${id}`, { method: 'DELETE' });
        loadProperties();
        loadSummary();
    } catch (error) {
        console.error('Error deleting property:', error);
    }
}

// Vehicles
async function loadVehicles() {
    try {
        const response = await fetch(`${API_BASE}/api/vehicles`);
        const vehicles = await response.json();
        
        const container = document.getElementById('vehiclesList');
        if (vehicles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🚗</div>
                    <h3>No vehicles yet</h3>
                    <p>Add your first vehicle to start tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = vehicles.map(vehicle => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <div>
                        <h3>${vehicle.name}</h3>
                        <span style="color: #999;">${vehicle.vehicle_type || 'Vehicle'}</span>
                    </div>
                    <button class="btn btn-delete" onclick="deleteVehicle(${vehicle.id})">Delete</button>
                </div>
                <div class="asset-card-body">
                    ${vehicle.make || vehicle.model ? `<p><strong>Make/Model:</strong> ${vehicle.make} ${vehicle.model}</p>` : ''}
                    ${vehicle.year ? `<p><strong>Year:</strong> ${vehicle.year}</p>` : ''}
                    ${vehicle.registration ? `<p><strong>Registration:</strong> ${vehicle.registration}</p>` : ''}
                    ${vehicle.purchase_price ? `<p><strong>Purchase Price:</strong> ${formatCurrency(vehicle.purchase_price)}</p>` : ''}
                    ${vehicle.current_value ? `<p><strong>Current Value:</strong> ${formatCurrency(vehicle.current_value)}</p>` : ''}
                    ${vehicle.notes ? `<p><strong>Notes:</strong> ${vehicle.notes}</p>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading vehicles:', error);
    }
}

async function addVehicle(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/api/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('vehicleModal');
            event.target.reset();
            loadVehicles();
            loadSummary();
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
    }
}

async function deleteVehicle(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
        await fetch(`${API_BASE}/api/vehicles/${id}`, { method: 'DELETE' });
        loadVehicles();
        loadSummary();
    } catch (error) {
        console.error('Error deleting vehicle:', error);
    }
}

// Bank Accounts
async function loadBankAccounts() {
    try {
        const response = await fetch(`${API_BASE}/api/bank-accounts`);
        const accounts = await response.json();
        
        const container = document.getElementById('bankList');
        if (accounts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏦</div>
                    <h3>No bank accounts yet</h3>
                    <p>Add your first bank account to start tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = accounts.map(account => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <div>
                        <h3>${account.bank_name}</h3>
                        <span style="color: #999;">${account.account_type || 'Account'}</span>
                    </div>
                    <button class="btn btn-delete" onclick="deleteBankAccount(${account.id})">Delete</button>
                </div>
                <div class="asset-card-body">
                    ${account.account_number ? `<p><strong>Account:</strong> ****${account.account_number}</p>` : ''}
                    <p><strong>Balance:</strong> <span style="color: #28a745; font-size: 1.3rem; font-weight: 700;">${formatCurrency(account.balance)}</span></p>
                    ${account.notes ? `<p><strong>Notes:</strong> ${account.notes}</p>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bank accounts:', error);
    }
}

async function addBankAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/api/bank-accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('bankModal');
            event.target.reset();
            loadBankAccounts();
            loadSummary();
        }
    } catch (error) {
        console.error('Error adding bank account:', error);
    }
}

async function deleteBankAccount(id) {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
        await fetch(`${API_BASE}/api/bank-accounts/${id}`, { method: 'DELETE' });
        loadBankAccounts();
        loadSummary();
    } catch (error) {
        console.error('Error deleting bank account:', error);
    }
}

// Crypto Holdings
async function loadCryptoHoldings() {
    try {
        const response = await fetch(`${API_BASE}/api/crypto-holdings`);
        const holdings = await response.json();
        
        if (holdings.length > 0) {
            loadCryptoLivePrices();
        } else {
            const container = document.getElementById('cryptoList');
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">₿</div>
                    <h3>No crypto holdings yet</h3>
                    <p>Add your first cryptocurrency to start live tracking</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading crypto holdings:', error);
    }
}

async function loadCryptoLivePrices() {
    try {
        const response = await fetch(`${API_BASE}/api/crypto/live-prices`);
        const holdings = await response.json();
        
        const container = document.getElementById('cryptoList');
        if (holdings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">₿</div>
                    <h3>No crypto holdings yet</h3>
                    <p>Add your first cryptocurrency to start live tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Crypto</th>
                        <th>Amount</th>
                        <th>Current Price</th>
                        <th>Current Value</th>
                        <th>24h Change</th>
                        <th>P/L</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${holdings.map(holding => `
                        <tr>
                            <td><strong>${holding.crypto_symbol}</strong><br><small>${holding.crypto_id}</small></td>
                            <td>${holding.amount.toFixed(8)}</td>
                            <td>${formatCurrency(holding.current_price)}</td>
                            <td><strong>${formatCurrency(holding.current_value)}</strong></td>
                            <td class="${holding.change_24h >= 0 ? 'positive' : 'negative'}">
                                ${holding.change_24h >= 0 ? '▲' : '▼'} ${Math.abs(holding.change_24h).toFixed(2)}%
                            </td>
                            <td class="${holding.profit_loss >= 0 ? 'positive' : 'negative'}">
                                ${formatCurrency(holding.profit_loss)}
                            </td>
                            <td><button class="btn btn-delete" onclick="deleteCrypto(${holding.id})">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading crypto live prices:', error);
    }
}

async function addCrypto(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/api/crypto-holdings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('cryptoModal');
            event.target.reset();
            loadCryptoLivePrices();
            loadSummary();
        }
    } catch (error) {
        console.error('Error adding crypto:', error);
    }
}

async function deleteCrypto(id) {
    if (!confirm('Are you sure you want to delete this crypto holding?')) return;
    
    try {
        await fetch(`${API_BASE}/api/crypto-holdings/${id}`, { method: 'DELETE' });
        loadCryptoLivePrices();
        loadSummary();
    } catch (error) {
        console.error('Error deleting crypto:', error);
    }
}

// Stock Holdings
async function loadStockHoldings() {
    try {
        const response = await fetch(`${API_BASE}/api/stock-holdings`);
        const holdings = await response.json();
        
        if (holdings.length > 0) {
            loadStockLivePrices();
        } else {
            const container = document.getElementById('stocksList');
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📈</div>
                    <h3>No stock holdings yet</h3>
                    <p>Add your first stock to start live tracking</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading stock holdings:', error);
    }
}

async function loadStockLivePrices() {
    try {
        const container = document.getElementById('stocksList');
        container.innerHTML = '<div class="loading">Loading live stock prices...</div>';
        
        const response = await fetch(`${API_BASE}/api/stocks/live-prices`);
        const holdings = await response.json();
        
        if (holdings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📈</div>
                    <h3>No stock holdings yet</h3>
                    <p>Add your first stock to start live tracking</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Stock</th>
                        <th>Shares</th>
                        <th>Current Price</th>
                        <th>Current Value</th>
                        <th>Change</th>
                        <th>P/L</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${holdings.map(holding => `
                        <tr>
                            <td><strong>${holding.ticker}</strong><br><small>${holding.name}</small></td>
                            <td>${holding.shares}</td>
                            <td>${formatCurrency(holding.current_price)}</td>
                            <td><strong>${formatCurrency(holding.current_value)}</strong></td>
                            <td class="${holding.change_percent >= 0 ? 'positive' : 'negative'}">
                                ${holding.change_percent >= 0 ? '▲' : '▼'} ${Math.abs(holding.change_percent).toFixed(2)}%
                            </td>
                            <td class="${holding.profit_loss >= 0 ? 'positive' : 'negative'}">
                                ${formatCurrency(holding.profit_loss)}
                            </td>
                            <td><button class="btn btn-delete" onclick="deleteStock(${holding.id})">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading stock live prices:', error);
        document.getElementById('stocksList').innerHTML = '<div class="empty-state"><p>Error loading stock prices</p></div>';
    }
}

async function addStock(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/api/stock-holdings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('stockModal');
            event.target.reset();
            loadStockLivePrices();
            loadSummary();
        }
    } catch (error) {
        console.error('Error adding stock:', error);
    }
}

async function deleteStock(id) {
    if (!confirm('Are you sure you want to delete this stock holding?')) return;
    
    try {
        await fetch(`${API_BASE}/api/stock-holdings/${id}`, { method: 'DELETE' });
        loadStockLivePrices();
        loadSummary();
    } catch (error) {
        console.error('Error deleting stock:', error);
    }
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}
