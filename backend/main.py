from fastapi import FastAPI
from gif_router import router

app = FastAPI()
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "API is running!"} 