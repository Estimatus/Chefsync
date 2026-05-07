from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

db = SQLAlchemy()

class User(db.Model):
    """
    Usuarios del sistema.
    El role puede ser 'admin' (gestiona negocio) o 'chef' (solo ve producción).
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    role: Mapped[str] = mapped_column(String(20), default="chef")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active
        }

class Ingredient(db.Model):
    """
    Materia prima / inventario.
    Ejemplo: 'Harina de trigo', unidad='kg', cost_per_unit=1.50 (€ por kg).
    current_stock es lo que hay actualmente en el almacén.
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    cost_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    current_stock: Mapped[float] = mapped_column(Float, default=0.0)
    supplier: Mapped[str] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    recipe_ingredients: Mapped[List["RecipeIngredient"]] = relationship(back_populates="ingredient")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "unit": self.unit,
            "cost_per_unit": self.cost_per_unit,
            "current_stock": self.current_stock,
            "supplier": self.supplier,
            "is_active": self.is_active
        }

class Recipe(db.Model):
    """
    Recetas / Platos que vendemos.
    Ejemplo: 'Lasaña', sale_price=15.00€, margin_threshold=30 (alerta si margen < 30%).
    ingredients contiene la lista de RecipeIngredient con las cantidades exactas.
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    sale_price: Mapped[float] = mapped_column(Float, nullable=False)
    margin_threshold: Mapped[float] = mapped_column(Float, default=30)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    ingredients: Mapped[List["RecipeIngredient"]] = relationship(back_populates="recipe")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "sale_price": self.sale_price,
            "margin_threshold": self.margin_threshold,
            "is_active": self.is_active,
            "ingredients": [item.serialize() for item in self.ingredients]
        }

    def calculate_cost(self):
        """
        Calcula el coste real de la receta sumando (cantidad * coste unitario) de cada ingrediente.
        Esta es la 'joya de la corona' - el escandallo automático.
        """
        total = 0
        for ri in self.ingredients:
            total += ri.quantity_needed * ri.ingredient.cost_per_unit
        return round(total, 2)

    def calculate_margin(self):
        """
        Calcula el margen de beneficio en %.
        Si margen < margin_threshold, el admin recibe una alerta.
        """
        cost = self.calculate_cost()
        if cost == 0 or self.sale_price == 0:
            return 0
        return round(((self.sale_price - cost) / self.sale_price) * 100, 2)

class RecipeIngredient(db.Model):
    """
    Tabla intermedia - Relación N:M entre Recipe e Ingredient.
    Define EXACTAMENTE cuánta cantidad de cada ingrediente lleva una receta.
    Ejemplo: Lasaña -> Harina: 0.2kg, Carne: 0.15kg, Queso: 0.05kg.
    """
    __tablename__ = 'recipe_ingredient'
    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"))
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredient.id"))
    quantity_needed: Mapped[float] = mapped_column(Float, nullable=False)

    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="ingredients")
    ingredient: Mapped["Ingredient"] = relationship("Ingredient", back_populates="recipe_ingredients")

    def serialize(self):
        return {
            "id": self.id,
            "ingredient_id": self.ingredient_id,
            "ingredient_name": self.ingredient.name if self.ingredient else None,
            "quantity_needed": self.quantity_needed,
            "unit": self.ingredient.unit if self.ingredient else None,
            "calculated_cost": round(self.quantity_needed * self.ingredient.cost_per_unit, 2) if self.ingredient else 0
        }

class Client(db.Model):
    """
    Clientes - Empresas o particulares que hacen pedidos.
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    orders: Mapped[List["Order"]] = relationship(back_populates="client")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "is_active": self.is_active
        }

class Order(db.Model):
    """
    Pedidos realizados por clientes.
    delivery_date = fecha de entrega esperada (formato: '2026-05-10').
    status = pending | confirmed | in_production | ready | delivered | cancelled.
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("client.id"), nullable=False)
    delivery_date: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    notes: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[str] = mapped_column(String(20), nullable=False)

    client: Mapped["Client"] = relationship("Client", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order")

    def serialize(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "client_name": self.client.name,
            "delivery_date": self.delivery_date,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at,
            "items": [item.serialize() for item in self.items]
        }

class OrderItem(db.Model):
    """
    Items dentro de un pedido.
    Define qué recetas y cuántas unidades de cada una pide el cliente.
    """
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    recipe: Mapped["Recipe"] = relationship("Recipe")

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "recipe_id": self.recipe_id,
            "recipe_name": self.recipe.name,
            "quantity": self.quantity,
        }