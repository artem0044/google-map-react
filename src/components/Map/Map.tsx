import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import GoogleMapReact from 'google-map-react';
import { collection, addDoc, serverTimestamp, doc, getDocs, deleteDoc, getDoc, } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import styles from './Map.module.css'
import Marker from '../Marker/Marker';
import { ClickEventValue, } from 'google-map-react';
import useSupercluster from 'use-supercluster';

export interface MarkerInterface {
  location: {
    lat: number,
    lng: number,
  }
  id: string,
  timeStamp: number,
  index: number
}

const Map: React.FC = () => {
  const [markers, setMarkers] = useState<Array<MarkerInterface>>([]);
  const indexNumber = useRef(1);
  const mapRef = useRef();

  const points = markers.map(marker => ({
    type: "Feature",
    properties: { cluster: false, markerId: marker.id, index: marker.index, timeStamp: marker.timeStamp },
    geometry: {
      type: "Point",
      coordinates: [
        marker.location.lng,
        marker.location.lat
      ]
    }
  }));

  useEffect(() => {
    const fetch = async () => {
      const docsCollection = collection(db, 'quests');
      const snapshot = await getDocs(docsCollection);
      const docsData: MarkerInterface[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as MarkerInterface));
      setMarkers(docsData);
    }

    fetch();
  }, []);

  const onMapClick = useCallback(async (e: ClickEventValue) => {
    const docRef = await addDoc(collection(db, 'quests'), {
      location: {
        lat: e.lat,
        lng: e.lng
      },
      timestamp: serverTimestamp(),
      index: indexNumber.current,
    });

    const doc = await getDoc(docRef);
    const newMarker = {
      ...doc.data(),
      id: docRef.id,
    } as MarkerInterface;

    setMarkers((current) => [...current, newMarker]);
    indexNumber.current += 1;
  }, [markers]
  );

  const deleteDocumentByDocRef = async (id: string) => {
    const docRef = doc(db, 'quests', id);
    await deleteDoc(docRef);
  };

  const deleteMarker = useCallback(async (id: string) => {
    await deleteDocumentByDocRef(id);
    setMarkers((current) => current.filter(marker => marker.id !== id));
  }, []);

  const [bounds, setBounds] = useState<null | number[]>(null);
  const [zoom, setZoom] = useState(10);

  const { clusters } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  const removeAllMarkers = useCallback(async () => {
    const docsCollection = collection(db, 'quests');
    const snapshot = await getDocs(docsCollection);
    snapshot.docs.forEach((doc) => {
      deleteDocumentByDocRef(doc.id);
    });

    setMarkers([]);
  }, []);

  const removeAllMarkersButton = useMemo(() => {
    const buttonElement = document.createElement("button");
    buttonElement.className = styles.removeAllMarkersButton;
    buttonElement.innerText = 'remove all';
    return buttonElement;
  }, []);

  const onGoogleApiLoadedHandler = useCallback(
    (context: any) => {
      mapRef.current = context.map;
      context.map.controls[context.maps.ControlPosition.LEFT_BOTTOM].push(removeAllMarkersButton);
    },
    [removeAllMarkersButton],
  );

  useEffect(() => {
    removeAllMarkersButton.disabled = !markers.length;
  }, [removeAllMarkersButton, markers]);

  useEffect(() => {
    removeAllMarkersButton.addEventListener("click", removeAllMarkers);

    return () => {
      removeAllMarkersButton.removeEventListener("click", removeAllMarkers);
    }
  }, [removeAllMarkersButton, removeAllMarkers]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyDTohQ3VzEFIRtJO4AbkGd9WM_gCg2--Nc" }}
        defaultCenter={{ lat: 22.54992, lng: 0 }}
        defaultZoom={3}
        yesIWantToUseGoogleMapApiInternals
        onClick={onMapClick}
        onGoogleApiLoaded={onGoogleApiLoadedHandler}
        onChange={({ zoom, bounds }) => {
          setZoom(zoom);
          setBounds([
            bounds.nw.lng,
            bounds.se.lat,
            bounds.se.lng,
            bounds.nw.lat
          ]);
        }}
      >
        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount
          } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                draggable
                index={cluster.properties.index}
                key={`cluster-${cluster.id}`}
                lat={latitude}
                lng={longitude}
              >
                <div
                  className={styles["cluster-marker"]}
                  style={{
                    width: `${10 + (pointCount / points.length) * 20}px`,
                    height: `${10 + (pointCount / points.length) * 20}px`
                  }}
                  onClick={() => { }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <Marker onClick={() => deleteMarker(cluster.properties.markerId)} lat={latitude} lng={longitude} key={cluster.properties.markerId} index={cluster.properties.index} />
          );
        })}
      </GoogleMapReact>
    </div >
  );
};

export default Map;
