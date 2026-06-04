from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers.medicines import router as medicines_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PharmaLens API",
    description="Medicine price transparency and generic alternative finder",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(medicines_router)

@app.get("/")
def root():
    return {"message": "PharmaLens API is running"}