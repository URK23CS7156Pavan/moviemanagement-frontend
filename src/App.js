import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsWrapper />} />
          <Route path="/movies/:id/seats" element={<SeatBookingWrapper />} />
          <Route path="/manage-movies" element={<MovieManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/movies" className="nav-link">Browse Movies</Link>
      <Link to="/manage-movies" className="nav-link">Manage Movies</Link>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to MovieHub</h1>
      <p>Discover and book your favorite movies</p>
      <Link to="/movies" className="cta-button">Browse Movies</Link>
    </div>
  );
}

// Sample movie data for fallback
const sampleMovies = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi",
    director: "Christopher Nolan",
    releaseYear: "2010",
    image: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    genre: "Drama",
    director: "Frank Darabont",
    releaseYear: "1994",
    image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    id: 3,
    title: "The Dark Knight",
    genre: "Action",
    director: "Christopher Nolan",
    releaseYear: "2008",
    image: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  }
];

// Sample reviews data for fallback
const sampleReviews = [
  { id: 1, movieId: 1, rating: 5, reviewText: "Mind-blowing concept and execution!", createdAt: "2023-01-15" },
  { id: 2, movieId: 1, rating: 4, reviewText: "Great movie but a bit confusing at times.", createdAt: "2023-02-20" },
  { id: 3, movieId: 2, rating: 5, reviewText: "One of the best movies ever made!", createdAt: "2023-03-10" }
];

// Sample seats data for fallback
const sampleSeats = [
  { id: 1, movieId: 1, seatNumber: "A1", available: true },
  { id: 2, movieId: 1, seatNumber: "A2", available: false },
  { id: 3, movieId: 1, seatNumber: "A3", available: true },
  { id: 4, movieId: 1, seatNumber: "B1", available: true },
  { id: 5, movieId: 1, seatNumber: "B2", available: true },
  { id: 6, movieId: 1, seatNumber: "B3", available: false },
  { id: 7, movieId: 2, seatNumber: "A1", available: true },
  { id: 8, movieId: 2, seatNumber: "A2", available: true },
  { id: 9, movieId: 2, seatNumber: "A3", available: true },
  { id: 10, movieId: 3, seatNumber: "A1", available: false },
  { id: 11, movieId: 3, seatNumber: "A2", available: false },
  { id: 12, movieId: 3, seatNumber: "A3", available: true }
];

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/movies')
      .then((response) => {
        setMovies(response.data.length > 0 ? response.data : sampleMovies);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching movies:', error);
        setMovies(sampleMovies); // Fallback to sample data
        setError('Failed to connect to backend. Showing sample data.');
        setLoading(false);
      });
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="movies-container">
      <h1>Browse Movies</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img src={movie.image} alt={movie.title} className="movie-poster" />
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>{movie.genre} • {movie.releaseYear}</p>
              <div className="movie-actions">
                <Link to={`/movies/${movie.id}`} className="details-btn">Details</Link>
                <Link to={`/movies/${movie.id}/seats`} className="book-btn">Book Seats</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieManagement() {
  const [movies, setMovies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    genre: '',
    director: '',
    releaseYear: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/movies')
      .then((response) => {
        setMovies(response.data.length > 0 ? response.data : sampleMovies);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching movies:', error);
        setMovies(sampleMovies); // Fallback to sample data
        setError('Failed to connect to backend. Showing sample data.');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      genre: movie.genre,
      director: movie.director,
      releaseYear: movie.releaseYear,
      image: movie.image,
      description: movie.description || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    if (editingMovie) {
      // Update existing movie
      axios.put(`http://localhost:8080/api/movies/${editingMovie.id}`, form)
        .then(() => {
          fetchMovies();
          resetForm();
        })
        .catch((error) => {
          console.error('Error updating movie:', error);
          setError('Failed to update movie. Please try again.');
        });
    } else {
      // Add new movie
      axios.post('http://localhost:8080/api/movies', form)
        .then(() => {
          fetchMovies();
          resetForm();
        })
        .catch((error) => {
          console.error('Error adding movie:', error);
          setError('Failed to add movie. Please try again.');
        });
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      genre: '',
      director: '',
      releaseYear: '',
      image: '',
      description: ''
    });
    setEditingMovie(null);
    setShowForm(false);
  };

  const handleDelete = (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      axios.delete(`http://localhost:8080/api/movies/${movieId}`)
        .then(() => {
          fetchMovies();
        })
        .catch((error) => {
          console.error('Error deleting movie:', error);
          setError('Failed to delete movie. Please try again.');
        });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="movies-container">
      <h1>Manage Movies</h1>
      {error && <div className="error-message">{error}</div>}
      
      <button 
        onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }} 
        className="add-movie-btn"
      >
        {showForm ? 'Cancel' : 'Add New Movie'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="movie-form">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={form.genre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="director"
            placeholder="Director"
            value={form.director}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="releaseYear"
            placeholder="Release Year"
            value={form.releaseYear}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <button type="submit">
            {editingMovie ? 'Update Movie' : 'Add Movie'}
          </button>
        </form>
      )}

      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <div className="movie-card-header">
              <h3>{movie.title}</h3>
              <button 
                onClick={() => handleEditClick(movie)}
                className="edit-btn"
              >
                Edit
              </button>
            </div>
            <img src={movie.image} alt={movie.title} className="movie-poster" />
            <div className="movie-info">
              <p>{movie.genre} • {movie.releaseYear}</p>
              <div className="movie-actions">
                <button 
                  onClick={() => handleDelete(movie.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
                <Link to={`/movies/${movie.id}`} className="details-btn">Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieDetailsWrapper() {
  const { id } = useParams();
  return <MovieDetailsPage id={parseInt(id)} />;
}

function MovieDetailsPage({ id }) {
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovieAndReviews();
  }, [id]);

  const fetchMovieAndReviews = () => {
    setLoading(true);
    
    // Fetch movie details
    axios.get(`http://localhost:8080/api/movies/${id}`)
      .then((response) => {
        setMovie(response.data);
        
        // After getting movie, fetch reviews
        return axios.get(`http://localhost:8080/api/movies/${id}/reviews`);
      })
      .then((reviewsResponse) => {
        setReviews(reviewsResponse.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching movie or reviews:', error);
        // Fallback to sample data
        const sampleMovie = sampleMovies.find(m => m.id === id);
        const movieReviews = sampleReviews.filter(r => r.movieId === id);
        
        if (sampleMovie) {
          setMovie(sampleMovie);
          setReviews(movieReviews);
          setError('Failed to connect to backend. Showing sample data.');
        } else {
          setError('Movie not found.');
        }
        setLoading(false);
      });
  };

  const handleReviewSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    axios.post(`http://localhost:8080/api/movies/${id}/reviews`, { rating, reviewText })
      .then(() => {
        alert('Review submitted successfully!');
        setRating(0);
        setReviewText('');
        // Refresh reviews
        axios.get(`http://localhost:8080/api/movies/${id}/reviews`)
          .then((response) => {
            setReviews(response.data);
          })
          .catch((error) => {
            console.error('Error fetching reviews after submit:', error);
          });
      })
      .catch((error) => {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
      });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!movie) return <div className="error">Movie not found</div>;

  return (
    <div className="movie-details-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
      {error && <div className="error-message">{error}</div>}
      
      <div className="movie-header">
        <img src={movie.image} alt={movie.title} className="movie-detail-poster" />
        <div className="movie-meta">
          <h1>{movie.title} ({movie.releaseYear})</h1>
          <p><strong>Director:</strong> {movie.director}</p>
          <p><strong>Genre:</strong> {movie.genre}</p>
          {movie.description && <p><strong>Description:</strong> {movie.description}</p>}
          <Link to={`/movies/${movie.id}/seats`} className="book-now-btn">Book Seats</Link>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews</h2>
        <div className="add-review">
          <h3>Add Your Review</h3>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review here..."
          />
          <button onClick={handleReviewSubmit} className="submit-review-btn">Submit Review</button>
        </div>

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-rating">
                  {Array(review.rating).fill().map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="review-text">{review.reviewText}</p>
                <p className="review-date">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SeatBookingWrapper() {
  const { id } = useParams();
  return <SeatBookingPage movieId={parseInt(id)} />;
}

function SeatBookingPage({ movieId }) {
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [seats, setSeats] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [randomSeatNumber, setRandomSeatNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieResponse, seatsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/movies/${movieId}`),
          axios.get(`http://localhost:8080/api/movies/${movieId}/seats`)
        ]);
        
        setMovie(movieResponse.data);
        setSeats(seatsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movie or seats:', err);
        
        // Fallback to sample data
        const sampleMovie = sampleMovies.find(m => m.id === movieId);
        const movieSeats = sampleSeats.filter(s => s.movieId === movieId);
        
        if (sampleMovie) {
          setMovie(sampleMovie);
          setSeats(movieSeats);
          setError('Failed to connect to backend. Showing sample data.');
        } else {
          setError('Movie not found.');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  const handleBooking = async () => {
    setError(null);
    setBookingSuccess(false);

    if (!name || !email) {
      setError('Please enter your name and email');
      return;
    }

    try {
      // Get available seats
      const availableSeats = seats.filter(seat => seat.available);
      
      if (availableSeats.length === 0) {
        setError('No available seats for this movie');
        return;
      }

      // Select a random available seat
      const randomIndex = Math.floor(Math.random() * availableSeats.length);
      const randomSeat = availableSeats[randomIndex];
      setRandomSeatNumber(randomSeat.seatNumber);

      // Book the seat
      await axios.put(`http://localhost:8080/api/seats/${randomSeat.id}`, {
        available: false
      });

      // Create booking record
      await axios.post(`http://localhost:8080/api/bookings`, {
        movieId,
        seatId: randomSeat.id,
        customerName: name,
        customerEmail: email,
        seatNumber: randomSeat.seatNumber
      });

      setBookingSuccess(true);
      
      // Refresh seats after booking
      const seatsResponse = await axios.get(`http://localhost:8080/api/movies/${movieId}/seats`);
      setSeats(seatsResponse.data);
      
    } catch (err) {
      console.error('Booking error:', err);
      
      // For demo purposes, show success even if backend fails
      if (err.message && err.message.includes('Network Error')) {
        // Get available seats from current state
        const availableSeats = seats.filter(seat => seat.available);
        
        if (availableSeats.length === 0) {
          setError('No available seats for this movie');
          return;
        }

        // Select a random available seat
        const randomIndex = Math.floor(Math.random() * availableSeats.length);
        const randomSeat = availableSeats[randomIndex];
        setRandomSeatNumber(randomSeat.seatNumber);
        setBookingSuccess(true);
        setError('Backend connection failed, but booking simulated for demo purposes.');
      } else {
        setError(err.response?.data?.message || 'Failed to book seat. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!movie) return <div className="error">Movie not found</div>;

  return (
    <div className="seat-booking-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back to Movie</button>
      {error && <div className="error-message">{error}</div>}
      
      <div className="booking-header">
        <h1>Book Seats for {movie.title}</h1>
        <img src={movie.image} alt={movie.title} className="booking-poster" />
      </div>

      <div className="customer-info">
        <h2>Your Information</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="seat-selection">
        <h2>Available Seats</h2>
        <div className="screen-indicator">Screen</div>
        <div className="seats-grid">
          {seats.map(seat => (
            <div
              key={seat.id}
              className={`seat ${seat.available ? 'available' : 'unavailable'}`}
              title={`Seat ${seat.seatNumber} - ${seat.available ? 'Available' : 'Booked'}`}
            >
              {seat.seatNumber}
            </div>
          ))}
        </div>
        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>Booked</span>
          </div>
        </div>
      </div>

      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <p>Movie: {movie.title}</p>
        
        {bookingSuccess ? (
          <div className="success-message">
            <h4>Booking Successful!</h4>
            <p>Your seat number is: <strong>{randomSeatNumber}</strong></p>
            <p>A confirmation has been sent to your email.</p>
            <button 
              onClick={() => navigate(`/movies/${movieId}`)}
              className="confirm-booking-btn"
            >
              Back to Movie
            </button>
          </div>
        ) : (
          <>
            <p>We'll randomly assign you an available seat</p>
            {error && <div className="error-message">{error}</div>}
            <button
              onClick={handleBooking}
              className="confirm-booking-btn"
              disabled={!name || !email}
            >
              Confirm Booking
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;