import { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'
import { BOOK_ADDED } from './subscriptions'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(() => localStorage.getItem('library-user-token'))

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const book = data.data.bookAdded
      window.alert(`New book added: ${book.title} by ${book.author.name}`)
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.removeItem('library-user-token')
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token
          ? <>
              <button onClick={() => setPage('add')}>add book</button>
              <button onClick={() => setPage('recommended')}>recommended</button>
              <button onClick={logout}>logout</button>
            </>
          : <button onClick={() => setPage('login')}>login</button>
        }
      </div>

      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add' && token} />
      <Recommended show={page === 'recommended'} />
      <LoginForm show={page === 'login'} setToken={setToken} setPage={setPage} />
    </div>
  )
}

export default App