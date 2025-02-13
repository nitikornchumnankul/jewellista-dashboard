from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import math

app = FastAPI()
# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_data(data):
    if isinstance(data, float):
        if math.isinf(data) or math.isnan(data):
            return None
        return data
    elif isinstance(data, dict):
        return {k: sanitize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    else:
        return data

@app.get("/csv-to-json/")
async def csv_to_json(file_path: str):
    if not file_path.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File is not a CSV")

    try:
        df = pd.read_csv(file_path)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Replace non-finite values with None
        df = df.replace([np.inf, -np.inf], np.nan)
        df = df.where(pd.notnull(df), None)
        
        # Convert to dict and sanitize each value
        json_data = df.to_dict(orient='records')
        sanitized_data = sanitize_data(json_data)
        
        return JSONResponse(content=sanitized_data)

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")