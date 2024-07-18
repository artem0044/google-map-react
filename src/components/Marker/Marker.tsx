
import React, { useState, useCallback, useRef } from 'react';
import styles from './Marker.module.css';

interface Props {
  index: number,
  lat: number,
  lng: number,
  children?: JSX.Element,
  draggable?: boolean,
  onClick?: () => void
}

const Marker: React.FC<Props> = ({ index, children, onClick }) => {

  return (
     children ?? <div onClick={onClick} className={styles.marker}>{index}</div>
  )
}

export default Marker;
