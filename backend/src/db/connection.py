from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv
from os import getenv

# carrega variaveis de ambiente
load_dotenv()

# url do banco
db = getenv("DB_URL")

# declara Base
Base = declarative_base()

# cria engine
engine = create_engine(db)

# define a session
Session = sessionmaker(bind=engine)