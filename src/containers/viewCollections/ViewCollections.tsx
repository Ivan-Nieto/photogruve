import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import useUser from '../../hooks/useUser';

import { getImagesFromList } from '../../firebase/firestore/firestore';
import RenderCollectionButtons from './RenderCollectionButton';
import RenderImageGallery from '../../components/RenderImageGallery/RenderImageGallery';
import RenderCollectionEdit from './RenderCollectionEdit';

const useStyles = makeStyles(() => ({
  root: {
    width: 'calc(100% - 40px)',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    padding: '20px',
    margin: 'auto',
  },
  welcomeMessage: {
    maxWidth: '700px',
    paddingBottom: '40px',
  },
}));

const ViewLists = () => {
  const classes = useStyles();
  const [lists, setLists]: any = useState([]);
  const [activeCollection, setActiveList] = useState(0);
  const [loading, setLoading] = useState(false);

  const [images, setImages]: any = useState(false);
  const [lastEntry, setLastEntry]: any = useState(false);
  const [paginating, setPaginating] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [reRunPagination, setReRunPagination] = useState(-1);

  const user = useUser();

  const updateActiveList = (index: number) => {
    if (paginating || loading) return;
    setActiveList(index);
    setImages([]);
    setLastEntry(false);
    setEndReached(false);
    setReRunPagination(Math.random());
  };

  // Get user collections
  useEffect(() => {
    let mounted = true;
    const getCols = async () => {
      setLoading(true);
      const newLists =
        user?.collections?.map((e: Record<string, any>, index: number) => ({
          ...e,
          onClick: () => updateActiveList(index),
        })) || [];

      setLists(newLists || []);

      if (!newLists || newLists.length === 0) return;

      setPaginating(true);
      const images = await getImagesFromList(newLists[0].images || []);
      if (mounted) {
        setImages(images?.images || []);
        if (images?.images) setLastEntry(images?.images[images?.images?.length - 1]);
        setPaginating(false);
      }

      if (mounted) setLoading(false);
    };

    if (user?.isSignedIn && user?.collections && !loading && !paginating) getCols();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [user]);

  // Paginate
  useEffect(() => {
    let mounted = true;

    if (reRunPagination === -1) return;

    const update = async () => {
      if (!loading && !paginating && !endReached && mounted) {
        setPaginating(true);
        // Get new set of images
        const newImgs = await getImagesFromList(lists[activeCollection].images);

        if (!mounted) return;

        // Add new images to current set
        const newImages = (images || []).concat(newImgs.images || []);
        setImages(newImages);

        // Decide weather or not this is the end of the list
        const newLastEntry = newImgs.images ? newImgs.images[newImgs?.images?.length - 1] : false;
        if (lastEntry && (!newLastEntry || newLastEntry.id === lastEntry.id)) {
          setEndReached(true);
        } else setLastEntry(newLastEntry);

        setPaginating(false);
      }
    };

    if (lists[activeCollection] && lists[activeCollection].images?.length > 0) update();
    else {
      setImages([]);
      setEndReached(true);
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reRunPagination]);

  const addCollection = (newCol: string) => {
    setLists(
      lists.concat([
        {
          name: newCol,
          images: [],
          docId: '',
          onCLick: () => updateActiveList(lists.length),
        },
      ])
    );
  };

  const updateCollection = (config: Record<string, any>) => {
    const newLists = lists;
    newLists[activeCollection] = { ...lists[activeCollection], ...config };
    setLists(newLists);
  };

  const removeCollection = () => {
    const newList = lists;
    newList.splice(activeCollection, 1);
    setLists(newList);
  };

  return (
    <div className={classes.root}>
      <RenderCollectionButtons activeList={activeCollection} addList={addCollection} uid={user.uid} lists={lists} />
      {!loading && (
        <>
          <RenderImageGallery images={images} onEmptyMessage={paginating ? 'Loading...' : 'This collection is empty'} />
          <RenderCollectionEdit
            removeCollection={removeCollection}
            updateCollection={updateCollection}
            activeCollection={lists[activeCollection]}
            images={images}
            user={user}
          />
        </>
      )}
    </div>
  );
};

export default ViewLists;
