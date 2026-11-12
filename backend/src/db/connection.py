from os import getenv
from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

# carrega variaveis de ambiente
load_dotenv()

# url do banco
# usa um fallback local para que a aplicação possa iniciar mesmo sem variavel de ambiente
# configurada no ambiente de desenvolvimento
db = getenv("DB_URL", "sqlite:///./lanchonete.db")

# declara Base
Base = declarative_base()

# cria engine
engine = create_engine(db)

# define a session
Session = sessionmaker(bind=engine)

Base.metadata.create_all(bind=engine)