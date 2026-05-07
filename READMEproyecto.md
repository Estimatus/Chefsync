# ChefSync - Sistema de Gestión de Cocina

ChefSync es una aplicación web para la gestión integral de restaurantes. Controla inventarios, recetas, pedidos y clientes de manera eficiente.

## Características

- **Gestión de Ingredientes**: Control de inventario con alertas de stock bajo
- **Recetas y Escandallos**: Cálculo automático de costes y márgenes
- **Pedidos**: Seguimiento completo del estado (pending → in_production → completed → sent)
- **Clientes**: Base de datos de clientes con información de contacto
- **Estadísticas**: Ingresos, ticket promedio, recetas más vendidas, margen por receta
- **Modo Chef**: Vista optimizada para kitchen display

## Tecnologías

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Python (Flask) + SQLAlchemy
- **Estilos**: CSS personalizado con diseño oscuro

## Estructura del Proyecto

```
Chefsync/
├── src/
│   ├── front/              # Aplicación React
│   │   ├── components/     # Componentes reutilizables
│   │   ├── hooks/          # Custom hooks (useGlobalReducer)
│   │   ├── pages/          # Páginas principales
│   │   ├── assets/         # Imágenes y recursos
│   │   ├── store.js        # Estado global
│   │   ├── routes.jsx      # Rutas de React Router
│   │   └── main.jsx        # Punto de entrada
│   ├── api/                # Backend Python
│   │   ├── models.py       # Modelos de base de datos
│   │   ├── routes_main.py  # Endpoints de API
│   │   └── commands.py     # Comandos de CLI
│   └── instance/           # Base de datos SQLite
├── package.json            # Dependencias frontend
├── requirements.txt        # Dependencias backend
└── vite.config.js          # Configuración Vite
```

## Rutas del Frontend

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing | Página de inicio |
| `/login` | Login | Inicio de sesión |
| `/admin` | Dashboard | Panel de administración |
| `/chef` | ChefMode | Vista de cocina (KDS) |
| `/home` | Home | Página demo (legacy) |
| `/demo` | Demo | Página demo (legacy) |

## Installation

### Requisitos Previos
- Node.js >= 20.0.0
- Python >= 3.9

### Frontend
```bash
cd Chefsync
npm install
npm run dev
```

### Backend
```bash
cd Chefsync
pip install -r requirements.txt
python src/api/manage.py run
```

## Variables de Entorno

Crear archivo `.env` en la raíz:
```
VITE_BACKEND_URL=http://localhost:5000
FLASK_APP=src/api
FLASK_ENV=development
DATABASE_URL=sqlite:///instance/chefsync.db
```

## Comandos Útiles

```bash
# Iniciar frontend
npm run dev

# Iniciar backend
python src/api/manage.py run

# Crear base de datos
python src/api/manage.py db upgrade

# Generar datos de prueba
python src/api/manage.py seed
```

## Roles de Usuario

- **admin**: Acceso completo al Dashboard
- **chef**: Acceso al Modo Chef (Kitchen Display System)

## API Endpoints

### Ingredientes
- `GET /api/ingredients` - Listar todos
- `POST /api/ingredients` - Crear nuevo
- `GET /api/ingredients/low-stock` - Stock bajo

### Recetas
- `GET /api/recipes` - Listar todas
- `POST /api/recipes` - Crear nueva
- `GET /api/recipes/alerts` - Margen bajo

### Pedidos
- `GET /api/orders` - Listar todos
- `POST /api/orders` - Crear nuevo
- `PUT /api/orders/:id` - Actualizar estado
- `PUT /api/orders/:id/production` - Iniciar producción

### Clientes
- `GET /api/clients` - Listar todos
- `POST /api/clients` - Crear nuevo

## Contribuidores

- David Martinez

## Licencia

ISC