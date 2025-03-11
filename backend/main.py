import uvicorn
import os
from app.api.routes import app

if __name__ == "__main__":
    # Configuration du serveur de développement
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"Starting Museum Active Learning API on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port) 