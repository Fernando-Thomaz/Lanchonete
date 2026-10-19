from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv
from os import getenv

load_dotenv()

db = getenv("DB_URL")

Base = declarative_base()

engine = create_engine(db)

Session = sessionmaker(bind=engine)