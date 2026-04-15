import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "visitors"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setVisitors(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Visitors Page</h2>

      {visitors.length === 0 ? (
        <p>No visitors yet</p>
      ) : (
        visitors.map((v) => (
          <div key={v.id} style={{
            border: "1px solid #ddd",
            padding: 12,
            marginBottom: 10,
            borderRadius: 10,
            background: "#fff"
          }}>
            <p><b>Name:</b> {v.name}</p>
            <p><b>Phone:</b> {v.phone}</p>
            <p><b>Subject:</b> {v.subject}</p>
            <p><b>Message:</b> {v.message}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Visitors;