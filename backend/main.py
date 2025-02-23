# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import street_view, openai
# Initialize app
app = FastAPI()

# Update CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],  # Update this to match your Vite dev server port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include routers
app.include_router(street_view.router)
app.include_router(openai.router)
