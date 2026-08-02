import { useState } from "react";
import { useQuery, gql } from "@apollo/client";

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        name
      }
      published
      id
    }
  }
`;

const ALL_GENRES = gql`
  query {
    allBooks {
      genres
    }
  }
`;

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
    fetchPolicy: "network-only",
  });

  const genresResult = useQuery(ALL_GENRES);

  if (!props.show) return null;
  if (booksResult.loading || genresResult.loading) return <div>loading...</div>;

  const books = booksResult.data.allBooks;
  const genres = [
    ...new Set(genresResult.data.allBooks.flatMap((b) => b.genres)),
  ];

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
