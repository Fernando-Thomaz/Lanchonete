from .db.connection import Session

# funcao de controlar session
def get_session():
    session = Session()
    try:
        yield session
    finally:
        session.close()