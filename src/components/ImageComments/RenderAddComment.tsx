import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase/app';

import Input from '../Input/Input';
import Button from '../Button/Button';
import { firestore } from '../../firebase/init';
import InputModal from '../../containers/login/InputModal';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: '800px',
    margin: 'auto',
  },
  input: {
    display: 'flex',
    width: '100%',
    padding: '10px 20px',

    justifyContent: 'center',

    margin: 'auto',
  },
  button: {
    display: 'flex',
    width: '100%',
    margin: 'auto',
    maxWidth: '300px',

    justifyContent: 'center',
  },
}));

const RenderAddComment = ({
  user,
  contentId,
  threadId,
}: {
  user: Record<string, any>;
  contentId: string;
  threadId: string;
}) => {
  const classes = useStyles();
  const [comment, setComment] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleChange = (event: any) => {
    setComment(event?.target?.value || '');
    setClicked(true);
  };

  useEffect(() => {
    if (user.isSignedIn) setShowLogin(false);
  }, [user]);

  const handleSubmit = async () => {
    if (!user?.uid || !contentId || !threadId) return;
    setDisabled(true);

    const data = {
      author: user.uid || '',
      authorUserName: user.userDoc?.userName || 'ANONYMOUS',
      comment,
      commentHistory: [comment],
      contentId: contentId,
      contentType: 'image',
      date: firebase.firestore.Timestamp.now(),
      likes: 0,
      threadId: threadId,
    };

    await firestore.collection('comments').add(data).catch();

    setComment('');
    setDisabled(false);
  };

  return (
    <div className={classes.root}>
      <InputModal showLogin={showLogin} setShowLogin={setShowLogin} />
      <div className={classes.input}>
        <Input
          type='text'
          onChange={handleChange}
          value={comment}
          label='Add Comment'
          fullWidth
          multiline
          rows='3'
          rowsMax='10'
          onClick={() =>
            user?.isSignedIn ? setClicked(true) : setShowLogin(true)
          }
        />
      </div>
      {clicked && (
        <div className={classes.button}>
          <Button
            size='large'
            fullWidth
            disabled={disabled}
            onClick={handleSubmit}
          >
            Reply
          </Button>
        </div>
      )}
    </div>
  );
};

export default RenderAddComment;
