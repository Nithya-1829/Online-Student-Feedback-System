
import { useEffect, useState } from 'react';

function Admin() {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/admin/feedback')
      .then(res => {
        if (!res.ok) throw new Error('Unable to load feedback');
        return res.json();
      })
      .then(data => setFeedback(data))
      .catch(() => setError('Unable to load feedback.'));
  }, []);

  return (
    <div className="container">
      <h1>Faculty Admin Dashboard</h1>
      <p>Submitted student feedback</p>

      {error && <p>{error}</p>}

      {feedback.length === 0 && !error && (
        <p>No feedback submitted yet.</p>
      )}

      {feedback.map(item => (
        <div key={item.feedback_id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            margin: '12px 0',
            borderRadius: '8px'
          }}>
          <h3>{item.course_name}</h3>
          <p><b>Student:</b> {item.student_name}</p>
          <p><b>Faculty:</b> {item.faculty_name}</p>
          <p><b>Rating:</b> {item.rating}/5</p>
          <p><b>Comments:</b> {item.comments}</p>
          <small>{new Date(item.submitted_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default Admin;
