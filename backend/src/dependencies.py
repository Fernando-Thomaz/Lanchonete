from .db.connection import Session

def get_session():
    session = Session()
    try:
        yield Session
    finally:
        session.close()