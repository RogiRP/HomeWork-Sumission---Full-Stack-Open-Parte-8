import { useQuery, useMutation, gql } from '@apollo/client'
import { useState } from 'react'
import Select from 'react-select'

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

  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [born, setBorn] = useState('')

  if (!props.show) return null
  if (result.loading) return <div>loading...</div>

  const authors = result.data.allAuthors

  const authorOptions = authors.map((a) => ({
    value: a.name,
    label: a.name
  }))

  const submit = async (event) => {
    event.preventDefault()
    const bornYear = parseInt(born)
    if (!selectedAuthor) {
      alert('Please select an author')
      return
    }
    if (isNaN(bornYear) || bornYear < 1000 || bornYear > new Date().getFullYear()) {
      alert('Please enter a valid birth year')
      return
    }
    await editAuthor({ variables: { name: selectedAuthor.value, setBornTo: bornYear } })
    setSelectedAuthor(null)
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
        <Select
          value={selectedAuthor}
          onChange={setSelectedAuthor}
          options={authorOptions}
          placeholder="select author..."
        />
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