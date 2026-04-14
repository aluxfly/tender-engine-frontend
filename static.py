from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def index():
    with open('index.html', 'r', encoding='utf-8') as f:
        return HTMLResponse(content=f.read())

@app.get("/projects", response_class=HTMLResponse)
async def projects():
    with open('projects.html', 'r', encoding='utf-8') as f:
        return HTMLResponse(content=f.read())

@app.get("/project-detail", response_class=HTMLResponse)
async def project_detail():
    with open('project-detail.html', 'r', encoding='utf-8') as f:
        return HTMLResponse(content=f.read())

@app.get("/bid", response_class=HTMLResponse)
async def bid():
    with open('bid.html', 'r', encoding='utf-8') as f:
        return HTMLResponse(content=f.read())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
