import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [form, setForm] = useState({
    title: '',
    genre: '',
    director: '',
    releaseYear: '',
    image: ''  // added image field
  });
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch movies on initial load
  useEffect(() => {
    axios.get('http://localhost:8080/api/movies')
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.error('Error fetching movies:', error);
      });
  }, []);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    // Fetch available seats for the selected movie
    axios.get(`http://localhost:8080/api/movies/${movie.id}/seats`)
      .then((response) => {
        setAvailableSeats(response.data);
      })
      .catch((error) => {
        console.error('Error fetching seats:', error);
      });
  };

  const handleReviewSubmit = (movieId, rating, review) => {
    const reviewData = { rating, reviewText: review };
    axios.post(`http://localhost:8080/api/movies/${movieId}/reviews`, reviewData)
      .then(() => {
        alert('Review added successfully!');
        setSelectedMovie(null); // Reset selected movie
      })
      .catch((error) => {
        console.error('Error adding review:', error);
      });
  };

  const handleSeatSelection = (seatId) => {
    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((id) => id !== seatId)
        : [...prevSeats, seatId]
    );
  };

  const handleBookNow = () => {
    if (selectedSeats.length > 0) {
      axios.post(`http://localhost:8080/api/movies/${selectedMovie.id}/book`, { seats: selectedSeats })
        .then(() => {
          alert('Booking successful!');
          setSelectedMovie(null);
          setSelectedSeats([]);
        })
        .catch((error) => {
          console.error('Error booking seats:', error);
        });
    } else {
      alert('Please select at least one seat.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleMovieFormSubmit = (e) => {
    e.preventDefault();
    if (selectedMovie) {
      axios.put(`http://localhost:8080/api/movies/${selectedMovie.id}`, form)
        .then(() => {
          alert('Movie updated successfully!');
          setMovies((prevMovies) =>
            prevMovies.map((movie) =>
              movie.id === selectedMovie.id ? { ...movie, ...form } : movie
            )
          );
          setSelectedMovie(null);
          setForm({ title: '', genre: '', director: '', releaseYear: '', image: '' });
        })
        .catch((error) => {
          console.error('Error updating movie:', error);
        });
    } else {
      axios.post('http://localhost:8080/api/movies', form)
        .then((response) => {
          alert('Movie added successfully!');
          setMovies((prevMovies) => [...prevMovies, response.data]);
          setForm({ title: '', genre: '', director: '', releaseYear: '', image: '' });
        })
        .catch((error) => {
          console.error('Error adding movie:', error);
        });
    }
  };

  return (
    <div className="App">
      <h1>🎬 Movie Management</h1>

      {/* Movie List */}
      <div>
        <h2>Movies</h2>
        <ul>
          {movies.map((movie) => (
            <li key={movie.id} onClick={() => handleMovieClick(movie)}>
              <img src={movie.image} alt={movie.title} className="movie-image" />
              <strong>{movie.title}</strong> ({movie.releaseYear})
            </li>
          ))}
        </ul>
      </div>

      {/* Movie Form */}
      <div>
        <h3>{selectedMovie ? 'Edit Movie' : 'Add Movie'}</h3>
        <form onSubmit={handleMovieFormSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={form.genre}
            onChange={handleChange}
          />
          <input
            type="text"
            name="director"
            placeholder="Director"
            value={form.director}
            onChange={handleChange}
          />
          <input
            type="number"
            name="releaseYear"
            placeholder="Release Year"
            value={form.releaseYear}
            onChange={handleChange}
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={form.image}
            onChange={handleChange}
          />
          <button type="submit">
            {selectedMovie ? 'Update Movie' : 'Add Movie'}
          </button>
        </form>
      </div>

      {/* Movie Details and Seat Booking Modal */}
      {selectedMovie && (
        <div className="movie-modal">
          <h3>{selectedMovie.title}</h3>
          <img src={selectedMovie.image} alt={selectedMovie.title} className="movie-image-modal" />
          <div>
            <h4>Leave a Review</h4>
            <ReviewForm movie={selectedMovie} handleReviewSubmit={handleReviewSubmit} />
          </div>
          <div>
            <h4>Select Seats</h4>
            <div className="seats-container">
              {availableSeats.map((seat) => (
                <div
                  key={seat.id}
                  className={`seat ${seat.available ? 'available' : 'unavailable'} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                  onClick={() => seat.available && handleSeatSelection(seat.id)}
                >
                  {seat.available ? 'Available' : 'Not Available'}
                </div>
              ))}
            </div>
            <button onClick={handleBookNow} disabled={selectedSeats.length === 0}>
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ReviewForm = ({ movie, handleReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  return (
    <div>
      <label>Rating: </label>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= rating ? 'gold' : 'gray' }}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write your review here..."
      />
      <button onClick={() => handleReviewSubmit(movie.id, rating, review)}>
        Submit Review
      </button>
    </div>
  );
};

export default App;
