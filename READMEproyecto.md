# ChefSync - Sistema de Gestión de Cocina

ChefSync es una aplicación web para la gestión integral de restaurantes. Controla inventarios, recetas, pedidos y clientes de manera eficiente con actualizaciones en tiempo real.

## Características

- **Gestión de Ingredientes**: Control de inventario con alertas de stock bajo, historial de precios
- **Recetas y Escandallos**: Cálculo automático de costes y márgenes
- **Calculadora de Recetas**: Cuántos platos puedes hacer con el stock actual
- **Pedidos**: Seguimiento completo del estado (Pendiente → En Producción → Listo → Entregado)
- **Kitchen Display System (KDS)**: Vista ChefMode optimizada para cocina
- **Clientes**: Base de datos de clientes con información de contacto
- **Estadísticas**: Ingresos, profit, ticket promedio, recetas más vendidas
- **Notificaciones en Tiempo Real**: WebSocket para actualizaciones instantáneas
- **Soporte Offline**: Cola de pedidos cuando no hay conexión
- **Notificaciones Push**: Browser notifications para nuevos pedidos y alertas

## Tecnologías

- **Frontend**: React 18 + Vite + React Router + Socket.IO Client + Chart.js
- **Backend**: Python (Flask) + Flask-SocketIO + Flask-Migrate + Flask-Admin
- **Base de Datos**: PostgreSQL / SQLite (desarrollo)
- **Estilos**: CSS Custom Properties, Bootstrap Icons, diseño oscuro/claro

## Estructura del Proyecto

```
Chefsync/
├── src/
│   ├── front/                  # Aplicación React
│   │   ├── components/
│   │   │   ├── panels/        # Paneles Dashboard (Ingredients, Recipes, Orders, etc.)
│   │   │   ├── modals/        # Modales CRUD (OrderModals, IngredientModals, etc.)
│   │   │   ├── layout/        # DashboardSidebar
│   │   │   ├── shared/        # ToastNotifications, OrderComponents
│   │   │   └── css/           # Estilos parciales (_variables, _modals, etc.)
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useIngredients.js  # CRUD ingredientes
│   │   │   ├── useRecipes.js      # CRUD recetas con ingredientes
│   │   │   ├── useOrders.js       # CRUD pedidos, producción, estados
│   │   │   ├── useClients.js      # CRUD clientes
│   │   │   ├── useSocket.jsx      # Conexión WebSocket
│   │   │   └── useOfflineOrders.jsx # Cola offline
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Panel de administración
│   │   │   └── ChefMode.jsx   # Kitchen Display System
│   │   └── main.jsx
│   ├── api/                    # Backend Python
│   │   ├── models.py           # Modelos SQLAlchemy
│   │   ├── routes/             # Blueprints API
│   │   │   ├── orders.py       # /api/orders
│   │   │   ├── ingredients.py  # /api/ingredients
│   │   │   ├── recipes.py      # /api/recipes
│   │   │   ├── clients.py      # /api/clients
│   │   │   └── users.py       # /api/users
│   │   ├── socket_instance.py  # SocketIO singleton
│   │   ├── socket_utils.py     # Helpers emit WebSocket
│   │   └── commands.py         # Comandos CLI (datos de prueba)
│   └── app.py                  # Configuración Flask
├── package.json
└── requirements.txt
```

## Rutas del Frontend

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing | Página de inicio |
| `/login` | Login | Inicio de sesión |
| `/admin` | Dashboard | Panel de administración |
| `/chef` | ChefMode | Vista de cocina (KDS) |

## Estados de Pedido

| Estado | Descripción |
|--------|-------------|
| pending | Pendiente de confirmación |
| confirmed | Confirmado, esperando producción |
| in_production | En producción (descuenta stock) |
| ready | Listo para entrega |
| delivered | Entregado |
| cancelled | Cancelado (restaura stock) |

## Modelos de Datos

- **User**: Usuarios del sistema (admin, chef)
- **Ingredient**: Ingredientes con stock, coste, proveedor
- **Recipe**: Recetas con precio de venta, categoría
- **RecipeIngredient**: Relación N:M receta-ingrediente con cantidad
- **Client**: Clientes/empresas
- **Order**: Pedidos con estado, fecha entrega
- **OrderItem**: Items del pedido (receta + cantidad)
- **PriceHistory**: Historial de precios ingredientes

## Instalación

### Requisitos Previos
- Node.js >= 20.0.0
- Python >= 3.10
- PostgreSQL (opcional, usa SQLite por defecto)

### Frontend
```bash
cd Chefsync
npm install
npm run start
```

### Backend
```bash
cd Chefsync
pipenv install
cp .env.example .env
pipenv run migrate
pipenv run upgrade
pipenv run start
```

### Datos de Prueba
```bash
pipenv run insert-test-data
```

## Variables de Entorno

Crear archivo `.env` en la raíz:
```
FLASK_APP=src/app.py
FLASK_ENV=development
DATABASE_URL=sqlite:////test.db
BACKEND_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000
SECRET_KEY=your-secret-key
```

## API Endpoints

### Ingredientes
- `GET /api/ingredients` - Listar todos
- `POST /api/ingredients` - Crear nuevo
- `PUT /api/ingredients/:id` - Actualizar
- `DELETE /api/ingredients/:id` - Eliminar
- `GET /api/ingredients/low-stock` - Stock bajo

### Recetas
- `GET /api/recipes` - Listar todas
- `POST /api/recipes` - Crear nueva
- `GET /api/recipes/:id/cost` - Calcular coste
- `POST /api/recipes/:id/ingredients` - Agregar ingrediente
- `GET /api/recipes/alerts` - Margen bajo

### Pedidos
- `GET /api/orders` - Listar todos
- `POST /api/orders` - Crear nuevo
- `PUT /api/orders/:id` - Actualizar estado
- `PUT /api/orders/:id/production` - Iniciar producción
- `POST /api/orders/:id/items` - Agregar item

### Clientes
- `GET /api/clients` - Listar todos
- `POST /api/clients` - Crear nuevo
- `PUT /api/clients/:id` - Actualizar
- `DELETE /api/clients/:id` - Eliminar

## WebSocket Events

| Evento | Descripción |
|--------|-------------|
| new_order | Nuevo pedido creado |
| order_update | Estado de pedido cambiado |
| stock_alert | Stock bajo detectado |

## Roles de Usuario

- **admin**: Acceso completo al Dashboard
- **chef**: Acceso al Modo Chef (Kitchen Display System)

## Arquitectura de Componentes

Los componentes están organizados por tipo:
- `panels/`: Paneles de cada sección del Dashboard (IngredientsPanel, RecipesPanel, OrdersPanel, etc.)
- `modals/`: Modales de creación/edición (OrderModals, IngredientModals, ClientModals, etc.)
- `layout/`: Sidebar, navegación
- `shared/`: Componentes reutilizables (ToastNotifications, OrderComponents)
- `css/`: Estilos parciales (_variables.css, _modals.css, _buttons.css, etc.)

## Custom Hooks

La lógica de negocio está aislada en hooks reutilizables:
- `useIngredients`: CRUD ingredientes, fetching, alertas
- `useRecipes`: CRUD recetas con ingredientes, cálculo de coste/margen
- `useOrders`: CRUD pedidos, producción, cambio de estados
- `useClients`: CRUD clientes
- `useSocket`: Conexión y eventos WebSocket
- `useOfflineOrders`: Cola offline con localStorage
- `usePushNotifications`: Notificaciones del navegador

## Contribuidores

- David Martinez

## Licencia

ISC
