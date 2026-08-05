from fastapi import FastAPI,UploadFile,File,Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from groq import Groq
from dotenv import load_dotenv
import os,io,json


load_dotenv()
app = FastAPI()


client = Groq(
     api_key = os.getenv("GROQ_API_KEY ")
)


app.add_middleware (
     CORSMiddleware,
     allow_origins = ["*"],
     allow_credentials = True,
     allow_methods = ['*']
)


@app.get("/")
def home():
    return {"message" : "Resume Analyzer API"}

#2.API endpoint
@app.post("/analyze")
async def upload_resume(file: UploadFile = File(...),job_description : str = Form(...)):

#3.Read uploaded PDF
    contents = await file.read()

    pdf = PdfReader(io.BytesIO(contents))

 #4.Extract text   
    resume_text = ""

    for page in pdf.pages:
            page_text = page.extract_text() or ""
            resume_text += page_text + "\n"

#5.Pass it to LLM prompt
    prompt = f"""
     You are a resume analysis assistant.

     Compare the following resume with the job description.

     RESUME:
     {resume_text}

     JOB DESCRIPTION:
     {job_description}

     Return ONLY valid JSON in this format:

     {{
        "match_score": 0,
        "matching_skills": [],
        "missing_skills": [],
        "suggestions": []
    }}

    match_score must be between 0 and 100.
"""

#6.Call the LLM

    response = client.chat.completions.create(
      model= "openai/gpt-oss-120b",
      messages=[
          {
               "role" : "user",
               "content" : prompt
          }
     ]
)


#7.get the LLM response

    result = response.choices[0].message.content

#8.Convert into JSON String 
    analysis = json.loads(result)

    return analysis