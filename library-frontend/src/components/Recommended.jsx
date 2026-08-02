import { useQuery, gql } from "@apollo/client";

const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`;

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

const Recommended = (props) => {
  const meResult = useQuery(ME, { fetchPolicy: 'network-only' });
  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: meResult.data?.me?.favoriteGenre },
    skip: !meResult.data?.me?.favoriteGenre,
  });

  if (!props.show) return null;
  if (meResult.loading || booksResult.loading) return <div>loading...</div>;

  console.log('me:', meResult.data);
  console.log('books:', booksResult.data);

  const favoriteGenre = meResult.data?.me?.favoriteGenre;
  const books = booksResult.data?.allBooks || [];

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>
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
  );
};

export default Recommended;