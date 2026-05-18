# ChefSync

<div align="center">
  <h1>🍳 ChefSync</h1>
  <p><strong>Sistema operativo integral para Dark Kitchens, Meal Preps y Restaurantes modernos.</strong></p>

  ![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
</div>

---

## El Problema

La rentabilidad de una cocina profesional se esconde en los márgenes. Pero la mayoria de cocinas operan con:

- Hojas de calculo desincronizadas entre cocina y oficina
- Ingredientes que caducan sin visibilidad del stock
- Escandallos calculados "a ojo" que destruyen la rentabilidad
- Perdida de pedidos por caídas de conexión

## La Solucion

ChefSync unifica inventario, escandallos y pedidos en tiempo real a través de WebSockets. Interfaz oscura profesional que cualquier reclutador o Tech Lead puede ver y entender en 10 segundos.

## Características Principales

| Categoría | Descripción |
|-----------|-------------|
| **Dashboard Analítico** | Métricas en vivo: ingresos, beneficios netos, ticket promedio, margen por receta |
| **Motor de Escandallos** | Cálculo algorítmico del coste real por plato basado en precio actual de materia prima |
| **Inventario en Cascada** | Al marcar "En Producción", deduce automáticamente gramos/ml de cada ingrediente |
| **Kitchen Display System** | Modo Chef optimizado para pantallas de cocina, actualización via WebSocket sin recargar |
| **Resiliencia Offline** | Cola de pedidos con localStorage para que la cocina nunca se detenga |
| **Notificaciones Push** | Browser notifications para nuevos pedidos y alertas de stock bajo |

## Stack Tecnológico

<details>
<summary><b>Haz clic para expandir la arquitectura completa</b></summary>

**Frontend:** React 18 + Vite, React Router, Context API / Custom Hooks, Socket.IO Client, Chart.js

**Backend:** Python 3.10, Flask, Flask-SocketIO (event-driven), SQLAlchemy ORM

**Base de Datos:** PostgreSQL (producción) / SQLite (desarrollo)

</details>

## Estructura del Proyecto

<details>
<summary><b>Haz clic para expandir la estructura de carpetas</b></summary>

```
Chefsync/
├── src/
│   ├── front/
│   │   ├── components/
│   │   │   ├── panels/
│   │   │   ├── modals/
│   │   │   ├── layout/
│   │   │   ├── shared/
│   │   │   └── css/
│   │   ├── hooks/
│   │   └── pages/
│   └── api/
│       ├── models.py
│       ├── routes/
│       └── commands.py
├── package.json
└── requirements.txt
```

</details>

## Instalación

<details>
<summary><b>Haz clic para expandir las instrucciones de instalación</b></summary>

**Requisitos:** Node.js >= 20.0.0, Python >= 3.10

**1. Backend (Terminal 1)**
```bash
cd Chefsync
pipenv install
cp .env.example .env
pipenv run migrate && pipenv run upgrade
pipenv run insert-test-data
pipenv run start
```

**2. Frontend (Terminal 2)**
```bash
cd Chefsync
npm install
npm run start
```

</details>

## API Endpoints

<details>
<summary><b>Haz clic para expandir la documentación de la API</b></summary>

### Ingredientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/ingredients | Listar todos |
| POST | /api/ingredients | Crear nuevo |
| PUT | /api/ingredients/:id | Actualizar |
| DELETE | /api/ingredients/:id | Eliminar |
| GET | /api/ingredients/low-stock | Stock bajo |

### Recetas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/recipes | Listar todas |
| POST | /api/recipes | Crear nueva |
| GET | /api/recipes/:id/cost | Calcular coste |
| GET | /api/recipes/alerts | Margen bajo |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/orders | Listar todos |
| POST | /api/orders | Crear nuevo |
| PUT | /api/orders/:id | Actualizar estado |
| PUT | /api/orders/:id/production | Iniciar producción |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/clients | Listar todos |
| POST | /api/clients | Crear nuevo |
| PUT | /api/clients/:id | Actualizar |

</details>

## WebSocket Events

| Evento | Trigger |
|--------|---------|
| new_order | Cliente crea un pedido |
| order_update | Se cambia estado de pedido |
| stock_alert | Ingrediente cae bajo umbral |

## Estados de Pedido

```
pending → confirmed → in_production → ready → delivered
                                          ↓
                                      cancelled (restaura stock)
```

## Contribuidor

David Martinez

## Licencia

ISC