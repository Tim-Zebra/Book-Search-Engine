import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

import { QUERY_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Hooks user data
  const { loading, data } = useQuery(QUERY_ME);

  // Create a hook that loads user data after query as completed
  const [userData, setUserData] = useState(loading ? null : data.me);

  // Sets delete mutation
  const [ removeBook, { error } ] = useMutation(REMOVE_BOOK);

  if(!userData) {
    return null;
  }

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleRemoveBook = async (bookId) => {
    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      // update state of books:
      setUserData(()=>{
        return{
          ...userData,
          savedBooks: data.data.removeBook.savedBooks
        }
      })
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleRemoveBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
