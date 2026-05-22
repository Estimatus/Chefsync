from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

db = SQLAlchemy()


class Tenant(db.Model):
    __tablename__ = "tenant"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    business_type: Mapped[str] = mapped_column(String(50), nullable=True, default="general")
    plan: Mapped[str] = mapped_column(String(20), default="free")
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[str] = mapped_column(String(30), nullable=True)

    users: Mapped[List["User"]] = relationship(back_populates="tenant")
    ingredients: Mapped[List["Ingredient"]] = relationship(back_populates="tenant")
    recipes: Mapped[List["Recipe"]] = relationship(back_populates="tenant")
    clients: Mapped[List["Client"]] = relationship(back_populates="tenant")
    orders: Mapped[List["Order"]] = relationship(back_populates="tenant")

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


class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    role: Mapped[str] = mapped_column(String(20), default="admin")

    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="users")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
        }


class Ingredient(db.Model):
    """
    Insumo / materia prima / material.
    Genérico para cualquier tipo de negocio:
    - Cocina: harina, aceite, proteínas
    - Estampados: tela, tinta, papel transfer
    - Artesanías: hilo, madera, pintura
    category: categoría libre definida por el negocio
    min_stock: umbral mínimo personalizado por insumo
    """
    __tablename__ = "ingredient"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    cost_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    current_stock: Mapped[float] = mapped_column(Float, default=0.0)
    min_stock: Mapped[float] = mapped_column(Float, default=5.0)
    category: Mapped[str] = mapped_column(String(80), nullable=True, default="General")
    supplier: Mapped[str] = mapped_column(String(120), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="ingredients")
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


class PriceHistory(db.Model):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    ingredient_id: Mapped[int] = mapped_column(nullable=False)
    ingredient_name: Mapped[str] = mapped_column(String(120), nullable=False)
    old_price: Mapped[float] = mapped_column(Float, nullable=False)
    new_price: Mapped[float] = mapped_column(Float, nullable=False)
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


class Recipe(db.Model):
    """
    Producto / receta / servicio que el negocio vende.
    Genérico: puede ser un plato, una prenda, una artesanía, etc.
    """
    __tablename__ = "recipe"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    sale_price: Mapped[float] = mapped_column(Float, nullable=False)
    margin_threshold: Mapped[float] = mapped_column(Float, default=30)
    category: Mapped[str] = mapped_column(String(50), nullable=True, default="Sin categoría")
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="recipes")
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
            "ingredients": [item.serialize() for item in self.ingredients],
            "ingredients_cost": self.calculate_cost(),
        }

    def calculate_cost(self):
        total = 0
        for ri in self.ingredients:
            total += ri.quantity_needed * ri.ingredient.cost_per_unit
        return round(total, 2)

    def calculate_margin(self):
        cost = self.calculate_cost()
        if cost == 0 or self.sale_price == 0:
            return 0
        return round(((self.sale_price - cost) / self.sale_price) * 100, 2)

    @property
    def ingredients_cost(self):
        return self.calculate_cost()


class RecipeIngredient(db.Model):
    __tablename__ = "recipe_ingredient"

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
            "calculated_cost": round(self.quantity_needed * self.ingredient.cost_per_unit, 2) if self.ingredient else 0,
        }


class Client(db.Model):
    __tablename__ = "client"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)

    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="clients")
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


class Order(db.Model):
    __tablename__ = "order"

    id: Mapped[int] = mapped_column(primary_key=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(ForeignKey("tenant.id"), nullable=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("client.id"), nullable=False)
    delivery_date: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    notes: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[str] = mapped_column(String(20), nullable=False)

    tenant: Mapped[Optional["Tenant"]] = relationship("Tenant", back_populates="orders")
    client: Mapped["Client"] = relationship("Client", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order")

    def serialize(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "client_id": self.client_id,
            "client_name": self.client.name,
            "delivery_date": self.delivery_date,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at,
            "items": [item.serialize() for item in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_item"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

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