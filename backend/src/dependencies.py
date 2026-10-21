from .db.connection import Session

# funcao de controlar session
def get_session():
    session = Session()
    try:
        yield Session
    finally:
        session.close()