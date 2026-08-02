import { useQuery, gql } from '@apollo/client'

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      id
    }
  }
`

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)

  if (!props.show) return null
  if (result.loading) return <div>loading...</div>

  const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>
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
    </div>
  )
}

export default Books