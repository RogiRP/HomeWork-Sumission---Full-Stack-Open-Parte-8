import { useState } from 'react'
import { useQuery, gql } from '@apollo/client'

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
      id
    }
  }
`

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [selectedGenre, setSelectedGenre] = useState(null)

  if (!props.show) return null
  if (result.loading) return <div>loading...</div>

  const books = result.data.allBooks

  const genres = [...new Set(books.flatMap(b => b.genres))]

  const filteredBooks = selectedGenre
    ? books.filter(b => b.genres.includes(selectedGenre))
    : books

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && <p>in genre <strong>{selectedGenre}</strong></p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map(genre => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>
        ))}
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books