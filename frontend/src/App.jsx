import { useState } from 'react'
import "./App.css"

function App() {
     const [file,setFile] = useState(null);
     const [jobDescription,setJobDescription] = useState("");
     const [analysis,setAnalysis] = useState(null);

     const analyzeResume = async ()=>{
        if(!file){
          alert("Upload a Resume!")
          return
        }

        if(!jobDescription.trim()){
          alert("Please enter a job description")
        }

        const formData = new FormData()

        formData.append("file",file)
        formData.append("job_description",jobDescription)

        const response = await fetch(
          "http://127.0.0.1:8000/analyze",
          {
            method : "POST",
            body: formData
          }
        )

        const data = await response.json();

        setAnalysis(data);
     }

  return (
    <div className= "container">
   <h1>AI Resume Analyzer</h1>
   <h3>Upload Resume</h3>

   <input
    type='file'
    accept='.pdf'
    onChange={(e) => setFile(e.target.files[0])}
   />

   <h3>Job Description</h3>

<textarea
  rows = "10"
  cols= "60"
  placeholder='Paste the job description here...'
  value={jobDescription}
  onChange={(e)=> setJobDescription(e.target.value)}
  spellCheck = "false"
/>

<br/>
<br/>

<button onClick={analyzeResume} >
  Analyze Resume
</button>


{analysis && (
  <div>
    <h2>Analysis Result</h2>

    <h2>Match Score</h2>
    <p>{analysis.match_score}%</p>

    <h3>Matching Skills</h3>
    <ul>
      {analysis.matching_skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>

    <h3>Missing Skills</h3>
    <ul>
    {analysis.missing_skills.map((skill, index) => (
        <li key={index}>{skill}</li>
      ))}
    </ul>

    <h3>What to improve</h3>
    <ul>
      {analysis.suggestions.map((suggestion,index)=>(
        <li key={index}>{suggestion}</li>
      ))}
    </ul>
    </div>
)}
   </div>
  )
}

export default App
