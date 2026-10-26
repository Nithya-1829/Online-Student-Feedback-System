import Login from './Login';
import { useState, useEffect } from 'react';
import './App.css';
import Admin from './Admin';

function App() {
  const [student, setStudent] = useState(null);
  const [page, setPage] = useState('student');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [rating, setRating] = useState('5');
  const [comments, setComments] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => setMessage('Unable to load courses.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.student_id,
          course_id: courseId,
          rating: Number(rating),
          comments
        })
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setComments('');
        setRating('5');
        setCourseId('');
      }
    } catch {
      setMessage('Unable to submit feedback.');
    }
  };

  
return (
  <>
    {!student ? (
      <Login onLogin={setStudent} />
    ) : (
      <>
        <div className="navigation">
          <span>Welcome, {student.name}</span>

          <button onClick={() => setPage('student')}>
            Student Feedback
          </button>

          <button onClick={() => setPage('admin')}>
            Faculty Dashboard
          </button>

          <button onClick={() => setStudent(null)}>
            Logout
          </button>
        </div>

        {page === 'admin' ? (
          <Admin />
        ) : (
          <div className="container">
            <h1>Student Feedback System</h1>
            <p>Share your feedback to help us improve.</p>

            <form onSubmit={handleSubmit}>
              <label>Select Course</label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                required
              >
                <option value="">Choose a course</option>
                {courses.map(course => (
                  <option
                    key={course.course_id}
                    value={course.course_id}
                  >
                    {course.course_name} — {course.faculty_name}
                  </option>
                ))}
              </select>

              <label>Rating</label>
              <select
                value={rating}
                onChange={e => setRating(e.target.value)}
                required
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>

              <label>Comments</label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Write your feedback..."
                required
              />

              <button type="submit">Submit Feedback</button>
              {message && <p>{message}</p>}
            </form>
          </div>
        )}
      </>
    )}
  </>
);

}

export default App;
