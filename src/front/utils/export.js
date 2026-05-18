export const exportToCSV = (data, filename, headers) => {
    if (!data || data.length === 0) {
        return { success: false, error: 'No hay datos para exportar' };
    }

    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => {
            const key = h.toLowerCase().replace(/ /g, '_');
            const value = row[key] !== undefined ? row[key] : '';
            return typeof value === 'string' ? `"${value}"` : value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    return { success: true };
};

export const exportIngredients = (ingredients) => {
    const data = ingredients.map(ing => ({
        name: ing.name,
        unit: ing.unit,
        cost_per_unit: ing.cost_per_unit,
        current_stock: ing.current_stock,
        supplier: ing.supplier || ''
    }));
    return exportToCSV(data, 'ingredientes', ['Name', 'Unit', 'Cost_per_unit', 'Current_stock', 'Supplier']);
};

export const exportRecipes = (recipes) => {
    const data = recipes.map(rec => ({
        name: rec.name,
        sale_price: rec.sale_price,
        description: rec.description || ''
    }));
    return exportToCSV(data, 'recetas', ['Name', 'Sale_price', 'Description']);
};

export const exportOrders = (orders) => {
    const data = orders.map(ord => ({
        id: ord.id,
        client_name: ord.client_name,
        delivery_date: ord.delivery_date,
        status: ord.status,
        items_count: ord.items?.length || 0
    }));
    return exportToCSV(data, 'pedidos', ['Id', 'Client_name', 'Delivery_date', 'Status', 'Items_count']);
};

export const exportClients = (clients) => {
    return exportToCSV(clients || [], 'clientes', ['Name', 'Email', 'Phone', 'Address']);
};