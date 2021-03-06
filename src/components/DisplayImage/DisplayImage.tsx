import React, { useState, useEffect } from 'react';
import { useTheme, Theme, makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { useSpring, animated as a } from 'react-spring';

import ImageOverlayTop from './ImageOverlayTop';
import ImageOverlayBottom from './ImageOverlayBottom';
import { Image } from './DisplayImage.types';
import useUser from '../../hooks/useUser';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    background: 'grey',
    border: `1px solid ${theme.palette.grey[200]}`,
    margin: 0,
    padding: 0,
    borderRadius: '7px',
    boxShadow: `0px 10px 15px -5px ${theme.palette.grey[200]}`,
    transition: 'box-shadow 0.5s',
    willChange: 'transform',
    display: 'block',
  },
  container: {
    overflow: 'hidden',
    willChange: 'transform',
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLarge: {
    width: '680px',
    height: '400px',

    overflow: 'hidden',
    willChange: 'transform',
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSmall: {
    width: '510px',
    height: '300px',

    overflow: 'hidden',
    willChange: 'transform',
    display: 'flex',

    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    display: 'flex',

    flex: 1,
    top: 0,
    zIndex: 1,

    position: 'absolute',
    width: '100%',
  },
  overlayBottom: {
    zIndex: 1,
    bottom: 0,

    position: 'absolute',
    width: '100%',
  },
}));

interface DisplayImageProps {
  size?: 'small' | 'large';
  image: Image;
  ownsImage?: boolean;
}

const DisplayImage = ({ size, image }: DisplayImageProps) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const user = useUser();
  const [url, setUrl] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [ownsImage, setOwnsImage] = useState(false);

  const trans = (x: any, y: any, s: any) => `scale(${s})`;
  const [props, setProps] = useSpring(() => ({ xys: [0, 0, 1], config: { mass: 1, tension: 210, friction: 20 } }));
  const [overlayProps, setOverlayProps] = useSpring(() => ({ opacity: 0 }));

  useEffect(() => {
    if (user?.uid === image?.author) setOwnsImage(true);

    const portraitLarge = image?.thumbUrl?.portrait;
    const portraitSmall = image?.thumbUrl?.portrait;
    const landscapeLarge = image?.thumbUrl?.landscape;
    const landscapeSmall = image?.thumbUrl?.landscape;

    const defaultImage = portraitSmall || portraitLarge || landscapeLarge || landscapeSmall;

    switch (size) {
      case 'large':
        setUrl(portraitLarge || defaultImage);
        break;
      case 'small':
        setUrl(portraitSmall || defaultImage);
        break;
      default:
        setUrl(defaultImage);
    }
  }, [size, setUrl, image, user]);

  const mouseOver = () => {
    setOverlayProps({ opacity: 1 });
    setProps({ xys: [0, 0, 1] });
  };
  const mouseLeave = () => {
    setOverlayProps({ opacity: 0 });
    setProps({ xys: [0, 0, 0.99] });
  };

  const handleClick = () => {
    const win = window.open(`/view-image?id=${image.id}`);
    win?.focus();
  };

  return (
    <div className={size === 'small' ? classes.containerSmall : classes.containerLarge} onMouseMove={mouseOver} onMouseLeave={mouseLeave}>
      {loaded && (
        <a.div className={classes.overlay} style={overlayProps}>
          <ImageOverlayTop image={image} ownsImage={Boolean(ownsImage)} user={user} />
        </a.div>
      )}

      <a.img
        onClick={handleClick}
        alt={image?.description || ''}
        onLoad={() => setLoaded(true)}
        src={url}
        className={classes.card}
        // @ts-ignore
        style={{ transform: props?.xys?.interpolate(trans) }}
      />

      {loaded && (
        <a.div className={classes.overlayBottom} style={overlayProps}>
          <ImageOverlayBottom image={image} ownsImage={Boolean(ownsImage)} user={user} />
        </a.div>
      )}

      {!loaded && <Skeleton animation='wave' variant='rect' width={size === 'small' ? 300 : 680} height={size === 'small' ? 200 : 400} />}
    </div>
  );
};

export default DisplayImage;
