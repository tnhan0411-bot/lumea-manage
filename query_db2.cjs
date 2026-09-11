const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const docSnap = await getDoc(doc(db, 'state', 'global'));
  if (docSnap.exists()) {
    const data = docSnap.data();
    const rooms = data.rooms || [];
    const tenants = data.tenants || [];
    
    const room302 = rooms.find(r => r.number === '302');
    console.log("Room 302:", room302);
    if (room302) {
      const tenant = tenants.find(t => t.id === room302.tenantId);
      console.log("Tenant for Room 302:", tenant);
    }
  } else {
    console.log("No data");
  }
}
run().catch(console.error);
