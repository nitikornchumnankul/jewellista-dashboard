from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel as PydanticBaseModel
from typing import Callable, Awaitable
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import StrOutputParser
import urllib.parse
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = os.getenv("DB_PORT")

if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT]):
    raise ValueError("One or more database environment variables are missing!")

encoded_password = urllib.parse.quote(DB_PASSWORD)
DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is required in .env")

# Initialize FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Fetch database data
try:
    engine = create_engine(DATABASE_URL)
    
    # ตรวจสอบชื่อคอลัมน์ที่มีในตาราง
    with engine.connect() as conn:
        # ดึงรายชื่อคอลัมน์จากตาราง orders
        columns_query = text("""
            SELECT column_name 
            FROM information_schema.columns
            WHERE table_name = 'orders'
            ORDER BY ordinal_position
        """)
        columns = [row[0] for row in conn.execute(columns_query).fetchall()]
        print("คอลัมน์ในตาราง orders:", columns)
        
        order_date_column = None
        order_week_column = None
        order_quantity_column = None
        
        # ค้นหาชื่อคอลัมน์ที่อาจมี prefix หรือ suffix พิเศษ
        for col in columns:
            if 'order_date' in col.lower():
                order_date_column = col
            if 'order_week' in col.lower():
                order_week_column = col
            if 'order_quantity' in col.lower():
                order_quantity_column = col
        
        print(f"ค้นพบคอลัมน์: order_date = {order_date_column}, order_week = {order_week_column}, order_quantity = {order_quantity_column}")
        
        if not all([order_date_column, order_quantity_column]):
            raise ValueError("ไม่พบคอลัมน์ที่จำเป็น (order_date หรือ order_quantity)")
        
        total_orders = conn.execute(text("SELECT COUNT(*) FROM orders")).scalar() or 0
        
        # Daily order quantities
        daily_orders_query = f"""
            SELECT "{order_date_column}"::date as date, 
                  SUM(CAST("{order_quantity_column}" AS NUMERIC))::float as total
            FROM orders 
            GROUP BY "{order_date_column}"::date 
            ORDER BY "{order_date_column}"::date
        """
        daily_orders = conn.execute(text(daily_orders_query)).fetchall()
        
        # Weekly order quantities
        if order_week_column:
            weekly_orders_query = f"""
                SELECT "{order_week_column}", 
                      SUM(CAST("{order_quantity_column}" AS NUMERIC))::float as total
                FROM orders 
                GROUP BY "{order_week_column}"
                ORDER BY "{order_week_column}"
            """
            weekly_orders = conn.execute(text(weekly_orders_query)).fetchall()
        else:
            # หากไม่มีคอลัมน์ order_week ให้ใช้ date_trunc แทน
            weekly_orders_query = f"""
                SELECT DATE_TRUNC('week', "{order_date_column}"::date)::date as week, 
                      SUM(CAST("{order_quantity_column}" AS NUMERIC))::float as total
                FROM orders 
                GROUP BY DATE_TRUNC('week', "{order_date_column}"::date)
                ORDER BY DATE_TRUNC('week', "{order_date_column}"::date)
            """
            weekly_orders = conn.execute(text(weekly_orders_query)).fetchall()
        
        # Day with maximum orders
        max_order_day_query = f"""
            SELECT "{order_date_column}"::date, 
                  SUM(CAST("{order_quantity_column}" AS NUMERIC))::float as total
            FROM orders 
            GROUP BY "{order_date_column}"::date
            ORDER BY total DESC
            LIMIT 1
        """
        max_order_day = conn.execute(text(max_order_day_query)).fetchone()

    db_summary = f"""จำนวนออเดอร์ทั้งหมด: {total_orders} รายการ
วันที่มีออเดอร์มากที่สุด: {max_order_day[0] if max_order_day else 'ไม่มีข้อมูล'} จำนวน {max_order_day[1] if max_order_day else 0} ชิ้น"""
    daily_orders_str = str([(str(row[0]), row[1]) for row in daily_orders])
    weekly_orders_str = str([(str(row[0]) if hasattr(row[0], '__str__') else row[0], row[1]) for row in weekly_orders])

except Exception as e:
    print(f"Error loading DB: {e}")
    db_summary = "ไม่มีข้อมูลในฐานข้อมูล"
    daily_orders = []
    weekly_orders = []
    daily_orders_str = "[]"
    weekly_orders_str = "[]"

# Pipe class for handling AI processing
class Pipe:
    class Valves(PydanticBaseModel):
        # Replace gemini_model with openai_model
        openai_model: str = "gpt-3.5-turbo"

    def __init__(self):
        self.valves = self.Valves()

    async def pipe(self, body: dict, __event_emitter__: Callable[[dict], Awaitable[None]] = None) -> dict:
        print("Processing request...")
        
        # Replace Gemini with OpenAI
        openai_model = ChatOpenAI(
            model=self.valves.openai_model,
            openai_api_key=OPENAI_API_KEY,
            temperature=0.1  # ปรับให้พอดี ไม่มากไป ไม่น้อยไป
        )

        # Normal chat prompt
        chat_prompt = PromptTemplate.from_template("""
คุณเป็น AI ผู้ช่วยวิเคราะห์ข้อมูลออเดอร์ที่มีบุคลิกเป็นกันเอง สนุกสนาน และเข้าถึงง่าย

ข้อมูลสรุป: {db_summary}

คำถาม: {question}

สิ่งสำคัญ: คุณต้องตอบคำถามโดยใช้ข้อมูลจากฐานข้อมูลเท่านั้น อย่าแต่งข้อมูลขึ้นมาเอง
แต่ให้ตอบด้วยรูปแบบภาษาที่เป็นธรรมชาติ ไม่จำเป็นต้องเป็นทางการมากนัก
คุณสามารถใช้อีโมจิหรือสำนวนที่สนุกได้ แต่ข้อมูลต้องถูกต้อง ตรงประเด็น และมาจากฐานข้อมูลจริง
""")
        
        # Graph prompt
        graph_prompt = PromptTemplate.from_template("""
คุณเป็น AI ผู้ช่วยวิเคราะห์ข้อมูลออเดอร์ที่มีบุคลิกเป็นกันเอง สนุกสนาน และเข้าถึงง่าย

ข้อมูลรายวัน: {daily_orders}
ข้อมูลรายสัปดาห์: {weekly_orders}
ข้อมูลสรุป: {db_summary}

คำถาม: {question}

สิ่งสำคัญ: คุณต้องตอบคำถามโดยใช้ข้อมูลจากฐานข้อมูลเท่านั้น อย่าแต่งข้อมูลขึ้นมาเอง
แต่ให้ตอบด้วยรูปแบบภาษาที่เป็นธรรมชาติ ไม่จำเป็นต้องเป็นทางการมากนัก

ถ้าเกี่ยวกับแนวโน้มหรือการเปรียบเทียบให้สร้าง JSON สำหรับกราฟในรูปแบบนี้:
```json
{
  "labels": ["วันที่หรือสัปดาห์ที่มีในข้อมูลจริง"],
  "data": [จำนวนออเดอร์ที่มีในข้อมูลจริง]
}
```
ตรวจสอบให้มั่นใจว่าคุณใช้เฉพาะข้อมูลที่มีใน daily_orders หรือ weekly_orders เท่านั้น
ถ้าข้อมูลไม่เพียงพอให้บอกว่า "ข้อมูลไม่พอพล็อตกราฟ"
""")

        messages = body.get("messages", [])
        if messages:
            question = messages[-1]["content"]
            try:
                print(f"Question: {question}")
                if "กราฟ" in question.lower() or "plot" in question.lower():
                    chain = graph_prompt | openai_model | StrOutputParser()
                    response = chain.invoke({
                        "question": question,
                        "db_summary": db_summary,
                        "daily_orders": daily_orders_str,
                        "weekly_orders": weekly_orders_str
                    })
                else:
                    chain = chat_prompt | openai_model | StrOutputParser()
                    response = chain.invoke({
                        "question": question,
                        "db_summary": db_summary
                    })
                body["messages"].append({"role": "assistant", "content": response})
            except Exception as e:
                body["messages"].append({"role": "assistant", "content": f"ขอโทษครับ มีปัญหาในการประมวลผล: {str(e)}"})
        else:
            body["messages"].append({"role": "assistant", "content": "สวัสดีครับ! มีอะไรให้ช่วยเกี่ยวกับข้อมูลออเดอร์ไหมครับ?"})

        return body

class ChatRequest(PydanticBaseModel):
    messages: list[dict]

async def dummy_emitter(event: dict):
    print(f"Event: {event}")

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    pipe = Pipe()
    result = await pipe.pipe(request.model_dump(), __event_emitter__=dummy_emitter)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)