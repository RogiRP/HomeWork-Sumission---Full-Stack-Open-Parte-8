import { useQuery, useMutation, gql } from '@apollo/client'
import { useState } from 'react'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      id
    }
  }
`

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  if (!props.show) return null
  if (result.loading) return <div>loading...</div>

  const authors = result.data.allAuthors

  const submit = async (event) => {
    event.preventDefault()
    const bornYear = parseInt(born)
    if (isNaN(bornYear) || bornYear < 1000 || bornYear > new Date().getFullYear()) {
      alert('Please enter a valid birth year')
      return
    }
    await editAuthor({ variables: { name, setBornTo: bornYear } })
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            <option value="">select author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
            min="1000"
            max={new Date().getFullYear()}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors