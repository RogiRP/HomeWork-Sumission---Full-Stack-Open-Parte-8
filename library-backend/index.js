require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("connected to MongoDB"))
  .catch((error) => console.log("error connecting to MongoDB:", error.message));

const typeDefs = `
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (root, args) => {
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate("author");
      }
      return Book.find({}).populate("author");
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      try {
        let author = await Author.findOne({ name: args.author });
        if (!author) {
          author = new Author({ name: args.author });
          await author.save();
        }
        const book = new Book({ ...args, author: author._id });
        await book.save();
        return Book.findById(book._id).populate("author");
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      try {
        const author = await Author.findOne({ name: args.name });
        if (!author) return null;
        author.born = args.setBornTo;
        return author.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    },
    createUser: async (root, args) => {
      try {
        const user = new User({
          username: args.username,
          favoriteGenre: args.favoriteGenre,
        });
        return user.save();
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const userForToken = { username: user.username, id: user._id };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    console.log("auth header:", auth);
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET,
      );
      console.log("decoded:", decodedToken);
      const currentUser = await User.findById(decodedToken.id);
      console.log("currentUser:", currentUser);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
