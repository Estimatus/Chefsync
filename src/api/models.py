# =============================================================================
# Base de datos - SQLAlchemy
# =============================================================================
# SQLAlchemy es el ORM que conecta Python con la base de datos.
# DBModel es la instancia principal que maneja conexiones.

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

# Instancia global de la base de datos. Se importa en app.py y en todos los modelos.
db = SQLAlchemy()


# =============================================================================
# MODELO: Tenant (Empresa/Cuenta)
# =============================================================================
# Cada Tenant representa una empresa o cuenta independiente.
# Todos los datos (usuarios, ingredientes, recetas, etc.) pertenecen a un Tenant.
# Esto permite que múltiples negocios compartan la misma BD separados.

class Tenant(db.Model):
    __tablename__ = "tenant"

    # ID único auto-generado
    id: Mapped[int] = mapped_column(primary_key=True)
    # Nombre del negocio (ej: "Panadería El Sol")
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Slug único para URLs (ej: "panaderia-el-sol")
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    # Tipo de negocio: "general", "restaurant", "bakery", etc.
    business_type: Mapped[str] = mapped_column(String(50), nullable=True, default="general")
    # Plan: "free", "basic", "premium"
    plan: Mapped[str] = mapped_column(String(20), default="free")
    # Si está activo o desactivado
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    # Fecha de creación como string (YYYY-MM-DD HH:MM:SS)
    created_at: Mapped[str] = mapped_column(String(30), nullable=True)

    # =============================================================================
    # RELACIONES CON OTROS MODELOS
    # =============================================================================
    # Un Tenant tiene muchos Usuarios, Ingredientes, Recetas, Clientes, Pedidos y Transacciones
    users: Mapped[List["User"]] = relationship(back_populates="tenant")
    ingredients: Mapped[List["Ingredient"]] = relationship(back_populates="tenant")
    recipes: Mapped[List["Recipe"]] = relationship(back_populates="tenant")
    clients: Mapped[List["Client"]] = relationship(back_populates="tenant")
    orders: Mapped[List["Order"]] = relationship(back_populates="tenant")
    transactions: Mapped[List["Transaction"]] = relationship(back_populates="tenant")

    # =============================================================================
    # SERIALIZE - Convierte el modelo a JSON para enviar al frontend
    # =============================================================================
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "business_type": self.business_type,
            "plan": self.plan,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }


# =============================================================================
# MODELO: User (Usuario)
# =============================================================================
# Representa un usuario que pertenece a un Tenant.
# Puede ser admin del negocio o chef.

class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    # FK al Tenant. Un usuario pertenece a una empresa.
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    # Email único (es el login)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    # Contraseña (en texto plano en este prototype - en producción usar hash)
    password: Mapped[str] = mapped_column(nullable=False)
    # Si está activo. Usuarios inactivos no pueden hacer login.
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    # Rol: "admin" (dueño del negocio) o "chef" (empleado)
    role: Mapped[str] = mapped_column(String(20), default="admin")

    # Relación con Tenant (un usuario pertenece a un Tenant)
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="users")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
        }


# =============================================================================
# MODELO: Ingredient (Insumo/Materia Prima)
# =============================================================================
# Representa un insumo que se usa en las recetas.
# Ejemplos: harina, queso, tinta, tela, etc.
# Lleva control de stock actual y stock mínimo para alertas.

class Ingredient(db.Model):
    __tablename__ = "ingredient"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    # Nombre del insumo (ej: "Harina de trigo")
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Unidad de medida: "kg", "g", "l", "ml", "ud" (unidades)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    # Costo por unidad (ej: 2.50 € por kg)
    cost_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    # Stock actual en inventario
    current_stock: Mapped[float] = mapped_column(Float, default=0.0)
    # Stock mínimo antes de mostrar alerta de "stock bajo"
    min_stock: Mapped[float] = mapped_column(Float, default=5.0)
    # Categoría libre definida por el usuario (ej: "Lácteos", "Proteínas")
    category: Mapped[str] = mapped_column(String(80), nullable=True, default="General")
    # Nombre del proveedor (ej: "Distribuidora ABC")
    supplier: Mapped[str] = mapped_column(String(120), nullable=True)
    # Si está activo. Inactivo = eliminado lógicamente (no se muestra)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    # Relación con Tenant
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="ingredients")
    # Relación con RecipeIngredient (muchos-a-muchos con Recipe)
    recipe_ingredients: Mapped[List["RecipeIngredient"]] = relationship(back_populates="ingredient")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "name": self.name,
            "unit": self.unit,
            "cost_per_unit": self.cost_per_unit,
            "current_stock": self.current_stock,
            "min_stock": self.min_stock,
            "category": self.category,
            "supplier": self.supplier,
            "is_active": self.is_active,
        }


# =============================================================================
# MODELO: PriceHistory (Historial de Precios)
# =============================================================================
# Guarda el historial de cambios de precio de un ingrediente.
# Permite ver cuándo subió/bajó el precio y cuánto era antes.

class PriceHistory(db.Model):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    # ID del ingrediente (sin FK para evitar constraints)
    ingredient_id: Mapped[int] = mapped_column(nullable=False)
    # Nombre del ingrediente al momento del cambio (para referencia)
    ingredient_name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Precio anterior
    old_price: Mapped[float] = mapped_column(Float, nullable=False)
    # Precio nuevo
    new_price: Mapped[float] = mapped_column(Float, nullable=False)
    # Fecha y hora del cambio
    changed_at: Mapped[str] = mapped_column(String(50), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "ingredient_id": self.ingredient_id,
            "ingredient_name": self.ingredient_name,
            "old_price": self.old_price,
            "new_price": self.new_price,
            "changed_at": self.changed_at,
        }


# =============================================================================
# MODELO: Recipe (Receta/Producto)
# =============================================================================
# Representa un producto o receta que vende el negocio.
# Ejemplos: una pizza, una camiseta sublimada, un pastel.
# Cada receta tiene ingredientes asociados con cantidades.

class Recipe(db.Model):
    __tablename__ = "recipe"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    # Nombre de la receta (ej: "Pizza Margarita")
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Descripción opcional
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    # Precio de venta al público
    sale_price: Mapped[float] = mapped_column(Float, nullable=False)
    # Umbral de margen mínimo (%) para alertas. Si el margen baja de esto, se alerta.
    margin_threshold: Mapped[float] = mapped_column(Float, default=30)
    # Categoría (ej: "Pizzas", "Postres", "Camisetas")
    category: Mapped[str] = mapped_column(String(50), nullable=True, default="Sin categoría")
    # Si está activa. Inactiva = eliminada lógicamente.
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    # Relación con Tenant
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="recipes")
    # Lista de RecipeIngredient (ingredientes de esta receta con cantidades)
    ingredients: Mapped[List["RecipeIngredient"]] = relationship(back_populates="recipe")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "name": self.name,
            "description": self.description,
            "sale_price": self.sale_price,
            "margin_threshold": self.margin_threshold,
            "category": self.category,
            "is_active": self.is_active,
            # Incluye los ingredientes con sus costos calculados
            "ingredients": [item.serialize() for item in self.ingredients],
            "ingredients_cost": self.calculate_cost(),
        }

    # =============================================================================
    # CALCULAR COSTO - Suma el costo de todos los ingredientes
    # =============================================================================
    # Recorre cada ingrediente de la receta, multiplica cantidad_needed × costo_unidad
    # y devuelve el total. Ej: 200g harina × 2€/kg + 100g queso × 5€/kg = 0.9€ total
    def calculate_cost(self):
        total = 0
        for ri in self.ingredients:
            total += ri.quantity_needed * ri.ingredient.cost_per_unit
        return round(total, 2)

    # =============================================================================
    # CALCULAR MARGEN - Porcentaje de ganancia
    # =============================================================================
    # Fórmula: (precio_venta - costo) / precio_venta × 100
    # Ej: Si cuesta 8€ y se vende a 10€, el margen es 20%
    def calculate_margin(self):
        cost = self.calculate_cost()
        if cost == 0 or self.sale_price == 0:
            return 0
        return round(((self.sale_price - cost) / self.sale_price) * 100, 2)

    @property
    def ingredients_cost(self):
        # Alias para calculate_cost() - permite acceder como propiedad
        return self.calculate_cost()


# =============================================================================
# MODELO: RecipeIngredient (Ingrediente de Receta)
# =============================================================================
# Tabla de relación muchos-a-muchos entre Recipe e Ingredient.
# Guarda cuánta cantidad de cada ingrediente se necesita en una receta.
# Esta tabla tiene sentido propio (no es solo join table).

class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredient"

    id: Mapped[int] = mapped_column(primary_key=True)
    # FK a Recipe
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"))
    # FK a Ingredient
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredient.id"))
    # Cuánta cantidad se necesita (ej: 0.200 kg de harina)
    quantity_needed: Mapped[float] = mapped_column(Float, nullable=False)

    # Relaciones bidireccionales
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="ingredients")
    ingredient: Mapped["Ingredient"] = relationship("Ingredient", back_populates="recipe_ingredients")

    def serialize(self):
        return {
            "id": self.id,
            "ingredient_id": self.ingredient_id,
            "ingredient_name": self.ingredient.name if self.ingredient else None,
            "quantity_needed": self.quantity_needed,
            "unit": self.ingredient.unit if self.ingredient else None,
            "calculated_cost": round(self.quantity_needed * self.ingredient.cost_per_unit, 2) if self.ingredient else 0,
        }


# =============================================================================
# MODELO: Client (Cliente)
# =============================================================================
# Representa un cliente del negocio.
# Un cliente puede tener varios pedidos asociados.

class Client(db.Model):
    __tablename__ = "client"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    # Nombre del cliente (obligatorio)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Email (opcional)
    email: Mapped[str] = mapped_column(String(120), nullable=True)
    # Teléfono (opcional)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    # Dirección (opcional)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    # Si está activo
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    # Relación con Tenant
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="clients")
    # Relación con Order (un cliente puede tener muchos pedidos)
    orders: Mapped[List["Order"]] = relationship(back_populates="client")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "is_active": self.is_active,
        }


# =============================================================================
# MODELO: Order (Pedido)
# =============================================================================
# Representa un pedido realizado por un cliente.
# Un pedido tiene varios items (OrderItem) y un estado.
# Estados: "pending" (nuevo), "in_production" (en producción), "completed" (entregado), "cancelled" (cancelado)

class Order(db.Model):
    __tablename__ = "order"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    # FK al cliente que hizo el pedido
    client_id: Mapped[int] = mapped_column(ForeignKey("client.id"), nullable=False)
    # Fecha de entrega solicitada (string YYYY-MM-DD)
    delivery_date: Mapped[str] = mapped_column(String(20), nullable=False)
    # Estado del pedido: pending, in_production, completed, cancelled, stock_error
    status: Mapped[str] = mapped_column(String(20), default="pending")
    # Notas adicionales opcionales
    notes: Mapped[str] = mapped_column(String(255), nullable=True)
    # Fecha de creación del pedido
    created_at: Mapped[str] = mapped_column(String(20), nullable=False)

    # Relaciones
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="orders")
    client: Mapped["Client"] = relationship("Client", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "client_id": self.client_id,
            "client_name": self.client.name,  # Nombre del cliente para mostrar
            "delivery_date": self.delivery_date,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at,
            "items": [item.serialize() for item in self.items],  # Lista de items del pedido
        }


# =============================================================================
# MODELO: OrderItem (Item de Pedido)
# =============================================================================
# Representa un producto (receta) dentro de un pedido con una cantidad.
# Ej: 3 pizzas margarita, 2 cafés.

class OrderItem(db.Model):
    __tablename__ = "order_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    # FK al pedido padre
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"), nullable=False)
    # FK a la receta
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"), nullable=False)
    # Cantidad de unidades de esta receta
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relaciones
    order: Mapped[Order] = relationship("Order", back_populates="items")
    recipe: Mapped[Recipe] = relationship("Recipe")

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "recipe_id": self.recipe_id,
            "recipe_name": self.recipe.name,
            "recipe_price": self.recipe.sale_price,
            "recipe_cost": self.recipe.ingredients_cost if hasattr(self.recipe, "ingredients_cost") else 0,
            "quantity": self.quantity,
        }


# =============================================================================
# MODELO: Transaction (Movimiento de Caja)
# =============================================================================
# Registra ingresos y gastos del negocio para control financiero.
# type: "income" (dinero que entra) | "expense" (dinero que sale)
# El flujo de transacciones alimenta el resumen de finanzas (KPIs).

class Transaction(db.Model):
    __tablename__ = "transaction"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    # Tipo: "income" (ingreso) o "expense" (gasto)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    # Monto en número (ej: 150.50)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    # Categoría: "Ventas", "Materiales", "Renta", etc.
    category: Mapped[str] = mapped_column(String(80), nullable=True, default="General")
    # Descripción opcional (ej: "Venta de 10 pizzas")
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    # Fecha del movimiento (YYYY-MM-DD)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    # Fecha y hora de creación en la BD
    created_at: Mapped[str] = mapped_column(String(30), nullable=True)

    # Relación con Tenant
    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="transactions")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "type": self.type,
            "amount": self.amount,
            "category": self.category,
            "description": self.description,
            "date": self.date,
            "created_at": self.created_at,
        }