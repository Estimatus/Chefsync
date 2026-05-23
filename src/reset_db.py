from app import app, db
from api.models import Tenant, User
from datetime import datetime

with app.app_context():
    db.drop_all()
    db.create_all()
    t = Tenant(name='Mi negocio', slug='mi-negocio', business_type='general', plan='free', created_at=str(datetime.now()))
    db.session.add(t)
    db.session.commit()
    u = User(tenant_id=t.id, email='admin@chefsync.com', password='admin123', role='admin', is_active=True)
    db.session.add(u)
    db.session.commit()
    print('Listo:', t.id, u.email)