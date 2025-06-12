from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from gif_router import router as gif_router
from conversation_router import router as conversation_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gif_router)
app.include_router(conversation_router)

@app.get("/")
def read_root():
    return {"message": "API is running!"} 